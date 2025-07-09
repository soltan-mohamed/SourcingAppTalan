import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CandidateService } from '@core/service/candidate.service';
import { RecruitmentService } from '@core/service/recruitment.service';
import { Candidate } from '@core/models/candidate.model';
import { Recruitment } from '@core/models/recruitment.model';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTree, MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { Evaluation } from '../../../../core/models/evaluation.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

interface RecruitmentNode {
  name: string;
  data: Recruitment;
  children?: EvaluationNode[];
}

interface EvaluationNode {
  name: string;
  data: Evaluation;
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  data: any;
}

@Component({
  selector: 'app-candidate-history',
  templateUrl: './candidate-history.component.html',
  styleUrls: ['./candidate-history.component.scss'],
    standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
   // TableCardComponent,
    MatTableModule,
   // InitialsPipe,
    MatSelectModule,
    MatIconModule, 
    ScrollingModule,
    SidebarComponent,
    CandidateHistoryComponent,
    MatTree,
    MatTreeModule,

  ],
})
export class CandidateHistoryComponent implements OnInit {
  candidate: Candidate | null = null;
  loading = false;
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  private _transformer = (node: RecruitmentNode | EvaluationNode, level: number) => {
    return {
      expandable: 'children' in node && Array.isArray((node as RecruitmentNode).children) && (node as RecruitmentNode).children!.length > 0,
      name: node.name,
      level: level,
      data: node.data
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => ('children' in node ? (node as RecruitmentNode).children : undefined)
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private dialogRef: MatDialogRef<CandidateHistoryComponent>,
    private candidateService: CandidateService,
    private recruitmentService: RecruitmentService,
    @Inject(MAT_DIALOG_DATA) public data: { candidateId: number }
  ) {}

  ngOnInit(): void {
    this.loadCandidateHistory();
  }

  loadCandidateHistory(): void {
    this.loading = true;
    this.candidateService.getCandidateById(this.data.candidateId).subscribe({
      next: (candidate) => {
        this.candidate = candidate;
        this.loadRecruitments(candidate.id!);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading candidate:', err);
      }
    });
  }

  loadRecruitments(candidateId: number): void {
    this.recruitmentService.getRecruitmentsByCandidate(candidateId).subscribe({
      next: (recruitments) => {
        const treeData: RecruitmentNode[] = recruitments.map(rec => ({
          name: `Recruitment for ${rec.position}`,
          data: rec,
          children: rec.evaluations?.map(evalItem => ({
            name: `${evalItem.type} Evaluation`,
            data: evalItem
          })) || []
        }));
        
        this.dataSource.data = treeData;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading recruitments:', err);
      }
    });
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  onClose(): void {
    this.dialogRef.close();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONTACTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}