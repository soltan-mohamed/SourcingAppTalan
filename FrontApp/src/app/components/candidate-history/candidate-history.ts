import { Component, OnInit, Inject } from '@angular/core';
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

import { Candidate } from 'app/models/candidate';
import { Recrutement } from 'app/models/recrutement';
import { Evaluation } from 'app/models/evaluation';

type EvaluationStatus = 'pending' | 'passed' | 'failed' | 'in-progress' | 'scheduled' | 'KO' | 'accepted';


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
    MatDialogModule
  ],
  templateUrl: './candidate-history.html',
  styleUrl: './candidate-history.scss'
})
export class CandidateHistory implements OnInit {
  recruitementData: Recrutement[] = [];
  loading = false;
  editingEval! : Evaluation;
  availableStatuses : EvaluationStatus[] = ['accepted' ,  'scheduled' , 'KO'];


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
    
  ) {}
  
  toggleDropdown(event: Event, evalData : Evaluation) {
    event.stopPropagation();
    this.editingEval = evalData
    this.editingEval.editing = true;
  }
  
  closeDropdown() {
    this.editingEval.editing = false;
  }
  
  changeStatus(newStatus: EvaluationStatus, eval_id : number) {
    const evalu = this.recruitementData
      .flatMap(item => item.evaluations || [])
      .find(evaluation => evaluation && String(evaluation.id) === String(eval_id));  
    if (evalu) {
      evalu.statut = newStatus;
      console.log("Updated evaluation ! ");
      console.log("evalu : ",evalu);
    }

    this.closeDropdown();    
  }

  onClose(): void {
    this.dialogRef.close();
  }
  
  ngOnInit(): void {
    console.log("Received history data : ", this.data);
    this.loadCandidateData();
  }

  private loadCandidateData(): void {
    this.loading = true;

    setTimeout(() => {
      this.recruitementData = this.data.recrutements || [];
      
      this.treeControls = [];
      this.dataSources = [];
      
      this.recruitementData.forEach((recruitment, index) => {

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
      'applied': 'bg-gray-100 text-gray-800',
      'screening': 'bg-blue-100 text-blue-800',
      'interview': 'bg-yellow-100 text-yellow-800',
      'technical': 'bg-purple-100 text-purple-800',
      'final': 'bg-indigo-100 text-indigo-800',
      'accepted': 'bg-green-100 text-green-800',
      'KO': 'bg-red-100 text-red-800',
      'withdrawn': 'bg-gray-100 text-gray-800',
      'pending': 'bg-gray-100 text-gray-600',
      'passed': 'bg-green-100 text-green-700',
      'failed': 'bg-red-100 text-red-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'scheduled': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'scheduled': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'accepted': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'passed': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'KO': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      'in-progress': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
    };
    return icons[status] || icons['pending'];
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
      data: { recruitment: recruitment }
    });
  }
}