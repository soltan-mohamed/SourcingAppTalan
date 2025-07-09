import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { AddEvaluationComponent } from '../addEval/add-evaluation.component';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatTooltipModule } from '@angular/material/tooltip'; // Add this import
import { EvaluationService } from '@core/service/evaluation.service';



interface RecruitmentNode {
  name: string;
  data: Recruitment;
  children?: EvaluationNode[];
  evaluationsLoaded?: boolean;
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
    AddEvaluationComponent,
        MatTooltipModule,


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
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
        private evaluationService: EvaluationService,

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
    this.loading = true;
    this.recruitmentService.getRecruitmentsByCandidate(candidateId).subscribe({
      next: (recruitments) => {
        const treeData: RecruitmentNode[] = recruitments.map(rec => ({
          name: `Recruitment for ${rec.position}`,
          data: rec,
          children: [],
          evaluationsLoaded: false
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

    // Handle node expansion
  onNodeToggle(node: FlatNode): void {
    if (node.expandable) {
      if (this.treeControl.isExpanded(node)) {
        // Node is being expanded
        const parentNode = this.findParentNode(node);
        if (parentNode && !parentNode.evaluationsLoaded) {
          this.loadEvaluationsForRecruitment(parentNode);
        }
      }
    }
  }

    // Find the parent node in the flat tree structure
  private findParentNode(node: FlatNode): RecruitmentNode | null {
    const nodeIndex = this.treeControl.dataNodes.indexOf(node);
    
    for (let i = nodeIndex - 1; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < node.level) {
        // Find the corresponding node in the original tree data
        return this.findNodeInTreeData(currentNode);
      }
    }
    return null;
  }

    // Find the corresponding node in the original tree data
  private findNodeInTreeData(node: FlatNode): RecruitmentNode | null {
    const treeData = this.dataSource.data;
    for (const rootNode of treeData) {
      if (rootNode.data.id === node.data.id) {
        // Ensure we only return RecruitmentNode, not EvaluationNode
        if ('children' in rootNode) {
          return rootNode;
        }
      }
    }
    return null;
  }

    // Load evaluations for a specific recruitment
  private loadEvaluationsForRecruitment(node: RecruitmentNode): void {
    this.evaluationService.getEvaluationsByRecruitment(node.data.id).subscribe({
      next: (evaluations) => {
        node.children = evaluations.map(evalItem => ({
          name: `${evalItem.type} Evaluation`,
          data: evalItem
        }));
        node.evaluationsLoaded = true;
        
        // Update the data source
        this.dataSource.data = [...this.dataSource.data];
        
        // Expand the node after loading
        const flatNode = this.findFlatNode(node);
        if (flatNode && !this.treeControl.isExpanded(flatNode)) {
          this.treeControl.expand(flatNode);
        }
      },
      error: (err) => {
        console.error('Error loading evaluations:', err);
      }
    });
  }

  // Find the corresponding flat node
  private findFlatNode(node: RecruitmentNode): FlatNode | null {
    const flatNodes = this.treeControl.dataNodes;
    for (const flatNode of flatNodes) {
      if (flatNode.data.id === node.data.id) {
        return flatNode;
      }
    }
    return null;
  }

  // Load evaluations for a specific recruitment


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

  openAddEvaluationDialog(recruitmentId: number): void {
    if (!recruitmentId) {
      this.snackBar.open('No recruitment process selected', 'Close', {
        duration: 3000
      });
      return;
    }

    const dialogRef = this.dialog.open(AddEvaluationComponent, {
      width: '500px',
      data: { recrutementId: recruitmentId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCandidateHistory();
      }
    });
  }

  formatDateTime(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}