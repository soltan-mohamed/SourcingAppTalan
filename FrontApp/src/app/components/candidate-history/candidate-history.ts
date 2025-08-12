import { Component, OnInit, Inject,OnDestroy, ViewChildren, QueryList, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatherModule } from 'angular-feather';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddInterviewComponent } from '../interviews/add-interview/add-interview';
import { CandidatesService } from 'app/services/candidates-service';
import { Candidate } from 'app/models/candidate';
import { Recrutement } from 'app/models/recrutement';
import { Evaluation } from 'app/models/evaluation';
import { EvaluationStatus } from 'app/models/EvaluationStatus';
import { EvaluationStatusList } from 'app/models/EvaluationStatus';
import { InterviewService } from 'app/services/interview-service';
import { Subscription } from 'rxjs';
import { InterviewStateService } from 'app/services/interview-state';
import { EmailTemplate } from '../email-template/email-template';
// Flat node interface for the tree
interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  data: Recrutement | Evaluation;
}

@Component({
  selector: 'app-candidate-history',
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    FeatherModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './candidate-history.html',
  styleUrl: './candidate-history.scss'
})
export class CandidateHistory implements OnInit ,OnDestroy, AfterViewInit{
  private updateSubscription!: Subscription;
  recruitementData: Recrutement[] = [];
  loading = false;
  editingEval! : Evaluation;
  defaultEvalDesc = "No interview notes are available ...";
  evaluationStatus = EvaluationStatusList;
  treeControls: FlatTreeControl<FlatNode>[] = [];
  dataSources: MatTreeFlatDataSource<Recrutement | Evaluation, FlatNode>[] = [];
  private highlightedEvaluationId?: number;

  @ViewChildren('evaluationCard', { read: ElementRef }) evaluationCards!: QueryList<ElementRef>;
  
  // Tree control setup
  private _transformer = (node: Recrutement | Evaluation, level: number): FlatNode => {
    // Recrutement node
    if ('evaluations' in node) {
      const recruitment = node as Recrutement;
      return {
        expandable: !!recruitment.evaluations,
        name: `Position : ${recruitment.position}`,
        level: level,
        data: recruitment,
      };
    } else {
      // Evaluation node
      const evaluation = node as Evaluation;
      return {
        expandable: false,
        name: `${evaluation.type} - ${evaluation.statut}`,
        level: level,
        data: evaluation,
      };
    }
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => {
      if ('evaluations' in node) {
        return (node as Recrutement).evaluations || [];
      }
      return [];
    }
  );

  hasChild = (_: number, node: FlatNode) => node.expandable;

  constructor(
    private dialogRef: MatDialogRef<CandidateHistory>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Candidate & { highlightEvaluationId?: number },
    private candidatesService: CandidatesService,
    private interviewService: InterviewService,
     private interviewStateService: InterviewStateService
    
  ) {
    this.highlightedEvaluationId = this.data.highlightEvaluationId;
  }
  
  toggleDropdown(event: Event, evalData : Evaluation) {
    event.stopPropagation();
    
    // If clicking on the same evaluation that's already open, close it
    if (this.editingEval && this.editingEval.id === evalData.id && this.editingEval.editing) {
      this.closeDropdown();
      return;
    }
    
    // Close any currently open dropdown
    if (this.editingEval && this.editingEval.editing) {
      this.editingEval.editing = false;
    }
    
    // Open the new dropdown
    this.editingEval = evalData;
    this.editingEval.editing = true;
    
    // Set dropdown position
    this.setDropdownPosition(evalData);
  }
  
  setDropdownPosition(evalData: Evaluation) {
    // Set all dropdowns to open upward for better UX
    evalData.dropdownPosition = 'up';
  }
  
  closeDropdown() {
    if (this.editingEval) {
      this.editingEval.editing = false;
      this.editingEval = null as any; // Reset reference
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close dropdown when clicking outside
    if (this.editingEval && this.editingEval.editing) {
      const target = event.target as HTMLElement;
      
      // Check if click is inside any dropdown-related element
      const clickedInsideDropdown = target.closest('.status-dropdown-section') || 
                                   target.closest('.status-dropdown-menu') ||
                                   target.closest('.status-dropdown-badge');
      
      if (!clickedInsideDropdown) {
        this.closeDropdown();
      }
    }
  }

  saveDescription(evalu : Evaluation) {

    const updatedEval = {
      statut: evalu.statut,
      description: evalu.description,
      type: evalu.type,
      date: evalu.date,
    };

    this.interviewService.updateEvaluation(evalu.id, updatedEval).subscribe({
      next: (res) => {
        console.log("✅ Evaluation description updated successfully ");
        
      },
      error: (err) => {
        console.error("❌ Error while updating status description", err);
      }
    });

    evalu.editingText = !evalu.editingText;

  }

  
  changeStatus(newStatus: EvaluationStatus, eval_id: number) {
    const evalu = this.recruitementData
      .flatMap(item => item.evaluations || [])
      .find(evaluation => evaluation && String(evaluation.id) === String(eval_id));

    if (evalu) {
      const updatedEval = {
        statut: newStatus,
        description: evalu.description,
        type: evalu.type,
        date: evalu.date,
      };
      
      this.interviewService.updateEvaluation(evalu.id, updatedEval).subscribe({
        next: (res) => {
          console.log("✅ Statut de l'évaluation mis à jour dans le backend.");
          evalu.statut = newStatus;
          
          const allEvaluations = this.recruitementData
            .flatMap(item => item.evaluations || [])
            .filter(e => !!e.date);

          const lastEvaluation = allEvaluations
            .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())[0];

          const isLastEvaluation = lastEvaluation?.id === evalu.id;
          if (isLastEvaluation) {

            let updatedCandidate ;

            if(newStatus === 'ACCEPTED' && lastEvaluation.type === 'MANAGERIAL') {
              updatedCandidate = {
                statut: 'RECRUITED'
              };            
            }
            else {
              updatedCandidate = {
                statut: newStatus
              };
            }

            this.candidatesService.updateCandidate(this.data.id, updatedCandidate).subscribe({
              next: () => {
                this.data.statut = newStatus;
                console.log("✅ Statut du candidat mis à jour !");
                
                if (newStatus === 'VIVIER') {
                  this.dialogRef.close({ statusChanged: true });
                }
              },
              error: (err) => {
                console.error("❌ Erreur lors de la mise à jour du statut candidat", err);
              }
            });
          }
        },
        error: (err) => {
          console.error("❌ Erreur lors de la mise à jour du statut de l'évaluation :", err);
        }
      });
    }
    this.closeDropdown();
  }


  onClose(): void {
    this.dialogRef.close();
  }
  
  ngOnInit(): void {
    console.log("Received history data : ", this.data);
    this.loadCandidateData();
    this.updateSubscription = this.interviewStateService.interviewUpdated$.subscribe(
      (updatedEvaluation: Evaluation) => {
        console.log('CandidateHistory received an update notification for evaluation ID:', updatedEvaluation.id);
        this.updateLocalEvaluation(updatedEvaluation);
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.highlightedEvaluationId) {
      this.evaluationCards.changes.subscribe(() => {
        this.scrollToEvaluation(this.highlightedEvaluationId!);
      });
      setTimeout(() => this.scrollToEvaluation(this.highlightedEvaluationId!), 500);
    }
  }

  private scrollToEvaluation(id: number) {
    const cardElement = this.evaluationCards.find(
      (card) => card.nativeElement.id === `eval-${id}`
    );
    if (cardElement) {
      cardElement.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  ngOnDestroy(): void {
    // Très important pour éviter les fuites de mémoire !
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private updateLocalEvaluation(updatedEval: Evaluation): void {
    console.log('🔄 CandidateHistory updating local evaluation:', updatedEval);
    
    // Parcourir les recrutements pour trouver la bonne évaluation et la remplacer
    if (this.data && this.data.recrutements) {
      let evaluationFound = false;
      
      for (const recrutement of this.data.recrutements) {
        if (recrutement.evaluations) {
          const index = recrutement.evaluations.findIndex(e => e.id === updatedEval.id);
          if (index > -1) {
            const oldStatus = recrutement.evaluations[index].statut;
            const newStatus = updatedEval.statut;
            
            // Remplacer l'évaluation obsolète par la nouvelle
            recrutement.evaluations[index] = updatedEval;
            evaluationFound = true;
            
            console.log(`✅ Evaluation ${updatedEval.id} updated: ${oldStatus} → ${newStatus}`);
            
            // Add a visual highlight to the updated evaluation
            if (updatedEval.isHighlighted !== undefined) {
              updatedEval.isHighlighted = true;
              
              // Remove highlight after a few seconds
              setTimeout(() => {
                if (updatedEval.isHighlighted) {
                  updatedEval.isHighlighted = false;
                }
              }, 3000);
            }
            
            // Forcer la mise à jour de l'arbre si nécessaire
            this.loadCandidateData(); // Solution simple pour rafraîchir la vue de l'arbre
            break; 
          }
        }
      }
      
      if (!evaluationFound) {
        console.log('⚠️ Evaluation not found in candidate history data');
      }
    } else {
      console.log('⚠️ No recruitment data available for update');
    }
  }

  private loadCandidateData(): void {
    this.loading = true;
    setTimeout(() => {
      this.recruitementData = this.data.recrutements || [];
      
      this.treeControls = [];
      this.dataSources = [];
      
      this.recruitementData.forEach((recruitment, index) => {
        let shouldExpand = false;
        recruitment.evaluations?.forEach(e => {
          if(!e.description) {
            e.description = this.defaultEvalDesc;
          }
          e.editingText = false;
          if (this.highlightedEvaluationId && e.id === this.highlightedEvaluationId) {
            e.isHighlighted = true;
            shouldExpand = true;
          }
        });
        const treeControl = new FlatTreeControl<FlatNode>(
          node => node.level,
          node => node.expandable
        );
        
        const dataSource = new MatTreeFlatDataSource<Recrutement | Evaluation, FlatNode>(treeControl, this.treeFlattener);
        dataSource.data = [recruitment];
        
        this.treeControls.push(treeControl);
        this.dataSources.push(dataSource);
        if (shouldExpand) {
          const rootNode = dataSource.data[0];
          const flatNode = this.treeFlattener.flattenNodes([rootNode])[0];
          treeControl.expand(flatNode);
        }
      });      
      this.loading = false;
    }, 400);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'CONTACTED': 'status-contacted',
      'CANCELLED': 'status-cancelled',
      'ACCEPTED': 'status-accepted',
      'REJECTED': 'status-rejected',
      'VIVIER': 'status-vivier',
      'IN_PROGRESS': 'status-in-progress',
      'SCHEDULED': 'status-scheduled'
    };
    return colors[status] || 'status-vivier';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'SCHEDULED': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 
      'ACCEPTED': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'REJECTED': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', 
      'IN_PROGRESS': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'CANCELLED': 'M6 18L18 6M6 6l12 12',
      'VIVIER': 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z'
    };
    return icons[status] || icons['IN_PROGRESS'];
  }

  formatContactTime(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Time';
      }

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // use true for 12-hour format (AM/PM)
      });
    } catch (error) {
      return 'Invalid Time';
    }
  }


  formatContactDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } 
    catch (error) {
        return 'Invalid Date';
    }
  }


  getDataSourceForRecruitment(recruitment: Recrutement): MatTreeFlatDataSource<Recrutement | Evaluation, FlatNode> {
    const index = this.recruitementData.findIndex(r => r.id === recruitment.id);
    return this.dataSources[index] || new MatTreeFlatDataSource<Recrutement | Evaluation, FlatNode>(
      new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable), 
      this.treeFlattener
    );
  }

  getEvaluationIndex(evaluation: Evaluation | Recrutement, recruitment: Recrutement): number {
    if ('statut' in evaluation && 'id' in evaluation) {
      const ev = evaluation as Evaluation;
      if (!recruitment.evaluations) return 1;

      const index = recruitment.evaluations.findIndex(e => e.id === ev.id);
      return index >= 0 ? index + 1 : 1;
    }
    
    return 1;
  }

  openNewInterview(recruitment?: Recrutement) {
    const dialogRef = this.dialog.open(AddInterviewComponent, {
      panelClass: 'add-interview-dialog-panel',
      width: '30vw',
      maxWidth: 'none',
      data: recruitment!.id
    });

        
    dialogRef.afterClosed().subscribe(result => {
      if (result.success === true && this.data && recruitment) {

        this.data.statut = 'SCHEDULED';

        recruitment.evaluations.push(result.evaluation);

        this.loadCandidateData();



        
      }
    });
   
  }

  editDescription(evalu : Evaluation) : void {
    evalu.editingText = !evalu.editingText;
    if (evalu.description === this.defaultEvalDesc) {
      evalu.description = "";
    }
  }

  openEmailTemplate(recrutement : any, evaluation : Evaluation, candidate : Candidate) : void {

    const emailTemplateData = {
      ...recrutement,
      evaluation,
      candidate
    }

    delete emailTemplateData.evaluations

    console.log("Email Template Data  ", emailTemplateData);

    const emailDialogRef = this.dialog.open(EmailTemplate, {
      panelClass: 'add-interview-dialog-panel',
      width: '30vw',
      // height: '80vw',
      maxWidth: 'none',
      data: emailTemplateData
    });

  }
    deleteEvaluation(evaluationId: number, recruitmentId: number): void {
    const isConfirmed = window.confirm('Are you sure you want to delete this evaluation? This action cannot be undone.');

    if (isConfirmed) {
      this.interviewService.deleteEvaluation(evaluationId).subscribe({
        next: () => {
          console.log(`✅ Evaluation ${evaluationId} deleted successfully.`);

          // First, remove the evaluation from the local UI data
          const recruitment = this.recruitementData.find(r => r.id === recruitmentId);
          if (recruitment && recruitment.evaluations) {
            recruitment.evaluations = recruitment.evaluations.filter(e => e.id !== evaluationId);
          }
          
          // Refresh the tree view to show the evaluation has been removed
          this.loadCandidateData();

          // --- START: NEW LOGIC TO UPDATE CANDIDATE STATUS ---

          // 1. Get all remaining evaluations from all recruitments
          const allRemainingEvaluations = this.recruitementData
                .flatMap(r => r.evaluations || [])
                .filter(e => e && e.date); // Ensure we only consider evaluations with a date

          let newCandidateStatus: string;

          if (allRemainingEvaluations.length > 0) {
            // 2. If evaluations remain, find the new latest one by sorting by date
            const latestEvaluation = allRemainingEvaluations
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            
            newCandidateStatus = latestEvaluation.statut;
            console.log(`New latest evaluation found. Setting candidate status to: ${newCandidateStatus}`);

          } else {
            // 3. If no evaluations are left, default the status to 'IN_PROGRESS'
            newCandidateStatus = 'IN_PROGRESS';
            console.log('No evaluations left. Setting candidate status to IN_PROGRESS.');
          }

          // 4. Call the service to update the candidate's status in the backend
          const updatedCandidate = { statut: newCandidateStatus };
          this.candidatesService.updateCandidate(this.data.id, updatedCandidate).subscribe({
              next: () => {
                // 5. Update the local data to refresh the UI instantly
                this.data.statut = newCandidateStatus as any;
                console.log(`✅ Candidate status updated successfully to ${newCandidateStatus}.`);
              },
              error: (err) => {
                console.error("❌ Failed to update candidate status after deletion.", err);
              }
          });
          // --- END: NEW LOGIC ---

        },
        error: (err) => {
          console.error("❌ Error while deleting evaluation", err);
        }
      });
    }
  }
}