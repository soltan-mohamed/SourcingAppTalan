import { Component, OnInit, Inject,OnDestroy } from '@angular/core';
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
export class CandidateHistory implements OnInit ,OnDestroy{
  private updateSubscription!: Subscription;
  recruitementData: Recrutement[] = [];
  loading = false;
  editingEval! : Evaluation;
  defaultEvalDesc = "No interview notes are available ...";
  evaluationStatus = EvaluationStatusList;
  treeControls: FlatTreeControl<FlatNode>[] = [];
  dataSources: MatTreeFlatDataSource<Recrutement | Evaluation, FlatNode>[] = [];
  
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
    @Inject(MAT_DIALOG_DATA) public data: Candidate,
    private candidatesService: CandidatesService,
    private interviewService: InterviewService,
     private interviewStateService: InterviewStateService
    
  ) {}
  
  toggleDropdown(event: Event, evalData : Evaluation) {
    event.stopPropagation();
    this.editingEval = evalData
    this.editingEval.editing = true;
  }
  
  closeDropdown() {
    this.editingEval.editing = false;
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
            const updatedCandidate = {
              statut: newStatus
            };

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

  ngOnDestroy(): void {
    // Très important pour éviter les fuites de mémoire !
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private updateLocalEvaluation(updatedEval: Evaluation): void {
    // Parcourir les recrutements pour trouver la bonne évaluation et la remplacer
    if (this.data && this.data.recrutements) {
      for (const recrutement of this.data.recrutements) {
        if (recrutement.evaluations) {
          const index = recrutement.evaluations.findIndex(e => e.id === updatedEval.id);
          if (index > -1) {
            // Remplacer l'évaluation obsolète par la nouvelle
            recrutement.evaluations[index] = updatedEval;
            console.log('Local evaluation updated in CandidateHistory.');
            // Forcer la mise à jour de l'arbre si nécessaire
            this.loadCandidateData(); // Solution simple pour rafraîchir la vue de l'arbre
            break; 
          }
        }
      }
    }
  }

  private loadCandidateData(): void {
    this.loading = true;

    setTimeout(() => {
      this.recruitementData = this.data.recrutements || [];
      
      this.treeControls = [];
      this.dataSources = [];
      
      this.recruitementData.forEach((recruitment, index) => {

        recruitment.evaluations?.forEach(e => {
          if(!e.description) {
            e.description = this.defaultEvalDesc;
          }
          e.editingText = false;
        });

        const treeControl = new FlatTreeControl<FlatNode>(
          node => node.level,
          node => node.expandable
        );
        
        const dataSource = new MatTreeFlatDataSource<Recrutement | Evaluation, FlatNode>(treeControl, this.treeFlattener);
        dataSource.data = [recruitment];
        
        this.treeControls.push(treeControl);
        this.dataSources.push(dataSource);
      });      
      this.loading = false;
    }, 400);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'CONTACTED': 'bg-blue-100 text-blue-800',
      'CANCELLED': 'bg-yellow-100 text-indigo-800',
      'ACCEPTED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'VIVIER': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'SCHEDULED': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      if (result === 'success') {
        this.data.statut = 'SCHEDULED';
      }
    });
  }

  editDescription(evalu : Evaluation) : void {
    evalu.editingText = !evalu.editingText;
    if (evalu.description === this.defaultEvalDesc) {
      evalu.description = "";
    }
  }
}