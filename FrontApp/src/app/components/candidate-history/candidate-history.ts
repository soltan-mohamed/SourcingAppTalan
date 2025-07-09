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

type EvaluationStatus = 'pending' | 'passed' | 'failed' | 'in-progress' | 'scheduled' | 'KO' | 'accepted';

interface RecrutementEvaluation {
  candidate?: CandidateT;
  poste?: string;
  evaluations?: Evaluation[];
}

interface Evaluation {
  id: string;
  type?: string;
  status: EvaluationStatus ;
  date?: Date;
  score?: number;
  notes?: string;
  evaluator?: string;
  editing : boolean;
}

interface CandidateT {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactDate: Date;
  recruiter: {
    name: string;
    email: string;
  };
  currentStatus: EvaluationStatus;
  position: string;
  evaluationHistory?: Evaluation[];
}

// Flat node interface for the tree
interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  data: RecrutementEvaluation | Evaluation;
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
  candidate: CandidateT | null = null;
  recruitementData: RecrutementEvaluation[] = [];
  loading = false;
  editingEval! : Evaluation;

  availableStatuses : EvaluationStatus[] = ['accepted' ,  'scheduled' , 'KO'];

  // Tree control setup
  private _transformer = (node: RecrutementEvaluation | Evaluation, level: number): FlatNode => {
    // RecrutementEvaluation node
    if ('evaluations' in node) {
      const recruitment = node as RecrutementEvaluation;
      return {
        expandable: !!recruitment.evaluations && recruitment.evaluations.length > 0,
        name: `Position : ${recruitment.poste}`,
        level: level,
        data: recruitment,
      };
    } else {
      // Evaluation node
      const evaluation = node as Evaluation;
      return {
        expandable: false,
        name: `${evaluation.type} - ${evaluation.status}`,
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
        return (node as RecrutementEvaluation).evaluations || [];
      }
      return [];
    }
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

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
      .flatMap(item => item.evaluations)
      .find(evaluation => evaluation!.id === String(eval_id));  
    if (evalu) {
      evalu.status = newStatus;
      console.log("Updated evaluation ! ");
      console.log("evalu : ",evalu);
    // candidate.candidate.currentStatus = newStatus;
    }
    
    // Close the dropdown
    this.closeDropdown();    
    // Optional: Emit an event or call a service to save the change
    // this.onStatusChange.emit({
    //   node: this.node,
    //   oldStatus: this.node.data.status,
    //   newStatus: newStatus
    // });
  }

  onClose(): void {
    this.dialogRef.close();
  }
  
  ngOnInit(): void {
    console.log("Received history data : ", this.data);
    this.loadCandidateData();
  }


  getEvaluationIndex(evaluation: Evaluation | RecrutementEvaluation): number {
    if ('status' in evaluation && 'id' in evaluation) {
      const ev = evaluation as Evaluation;
      if (!this.candidate?.evaluationHistory) return 1;
      
      const index = this.candidate.evaluationHistory.findIndex(e => e.id === ev.id);
      return index >= 0 ? index + 1 : 1;
    }
    
    return 1;
  }

  private loadCandidateData(): void {
    this.loading = true;

    // Simulate API call
    setTimeout(() => {
      this.recruitementData = [{
        candidate: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '22 561 242',
          contactDate: new Date('2024-01-15'),
          recruiter: {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com'
          },
          currentStatus: 'passed',
          position: 'Senior Frontend Developer'
        },
        poste: "Senior Software Engineer",
        evaluations: [
          {
            id: '1',
            type: 'HR',
            status: 'passed',
            date: new Date('2024-01-16'),
            evaluator: 'Sarah Johnson',
            notes: 'Good communication skills, relevant experience',
            editing: false
          },
          {
            id: '2',
            type: 'HR',
            status: 'passed',
            date: new Date('2024-01-20'),
            score: 85,
            evaluator: 'Mike Chen',
            notes: 'Cultural fit confirmed, salary expectations aligned',
            editing: false
          },
          {
            id: '3',
            type: 'Coding Challenge',
            status: 'scheduled',
            date: new Date('2024-01-25'),
            score: 92,
            evaluator: 'Tech Team',
            notes: 'Excellent problem-solving skills, clean code structure',
            editing: false
          },
          {
            id: '4',
            type: 'Technical',
            status: 'KO',
            date: new Date('2024-01-30'),
            evaluator: 'Lead Developer',
            notes: 'Scheduled for system design discussion',
            editing: false
          }
        ]
      }];

      // Set the data source with an array containing our recruitment data
      this.dataSource.data = this.recruitementData;

      this.candidate = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '22 561 242',
        contactDate: new Date('2024-01-15'),
        recruiter: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com'
        },
        currentStatus: 'passed',
        position: 'Senior Frontend Developer',
        evaluationHistory: [
          {
            id: '1',
            type: 'Initial Screening',
            status: 'passed',
            date: new Date('2024-01-16'),
            evaluator: 'Sarah Johnson',
            notes: 'Good communication skills, relevant experience',
            editing: false

          },
          {
            id: '2',
            type: 'HR Interview',
            status: 'passed',
            date: new Date('2024-01-20'),
            score: 85,
            evaluator: 'Mike Chen',
            notes: 'Cultural fit confirmed, salary expectations aligned',
            editing: false

          },
          {
            id: '3',
            type: 'Coding Challenge',
            status: 'scheduled',
            date: new Date('2024-01-25'),
            score: 92,
            evaluator: 'Tech Team',
            notes: 'Excellent problem-solving skills, clean code structure',
            editing: false,

          },
          {
            id: '4',
            type: 'Technical Interview',
            status: 'in-progress',
            date: new Date('2024-01-30'),
            evaluator: 'Lead Developer',
            notes: 'Scheduled for system design discussion',
            editing: false
          },
          {
            id: '5',
            type: 'Final Interview',
            status: 'pending',
            evaluator: 'CTO',
            editing: false

          }
        ]
      };

      this.loading = false;
    }, 1000);
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

  openNewInterview() {

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
   addInterview() {
    const dialogRef = this.dialog.open(AddInterviewComponent,{
      panelClass: 'add-interview-dialog-panel'
    });
  }
}