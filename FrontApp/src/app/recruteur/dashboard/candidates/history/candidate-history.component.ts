import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CandidateService } from '@core/service/candidate.service';
import { RecruitmentService } from '@core/service/recruitment.service';
import { Candidate } from '@core/models/candidate.model';
import { Recruitment } from '@core/models/recruitment.model';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource, MatTreeModule } from '@angular/material/tree';
import { Evaluation } from '@core/models/evaluation.model';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { EvaluationService } from '@core/service/evaluation.service';
import { Role } from '@core/models/role';
import { AuthService } from '@core/service/auth.service';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog.component';
import { User } from '@core/models/user';
import { UserService } from '@core/service/user.service';

interface RecruitmentNode {
  expandable: boolean;
  name: string;
  level: number;
  data: Recruitment;
  type: 'recruitment';
  children?: EvaluationNode[];
  evaluationsLoaded?: boolean;
}

interface EvaluationNode {
  expandable: boolean;
  name: string;
  level: number;
  data: Evaluation;
  type: 'evaluation';
}

type TreeNode = RecruitmentNode | EvaluationNode;

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  data: Recruitment | Evaluation;
  type: 'recruitment' | 'evaluation';
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
    MatTableModule,
    MatSelectModule,
    ScrollingModule,
    SidebarComponent,
    AddEvaluationComponent,
    MatTooltipModule,
    ConfirmDialogComponent,
       MatDialogModule,
    MatButtonModule,
    MatTreeModule
  ],
})
export class CandidateHistoryComponent implements OnInit {
  candidate: Candidate | null = null;
  loading = false;
  
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  private _transformer = (node: TreeNode, level: number) => {
    return {
      expandable: node.type === 'recruitment',
      name: node.name,
      level: level,
      data: node.data,
      type: node.type
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.type === 'recruitment' ? (node as RecruitmentNode).children || [] : []
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private dialogRef: MatDialogRef<CandidateHistoryComponent>,
    private candidateService: CandidateService,
    private recruitmentService: RecruitmentService,
    private evaluationService: EvaluationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public authService: AuthService,
    public userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { candidateId: number }
  ) {}

evaluators: User[] = [];


  ngOnInit(): void {
      this.loadEvaluators();

    this.loadCandidateHistory();
  }
loadEvaluators() {
  this.userService.getEvaluators().subscribe(users => {
    this.evaluators = users;
  });
}

getEvaluatorName(evaluateurId: number): string {
  const evaluator = this.evaluators.find(u => u.id === evaluateurId);
  return evaluator ? evaluator.fullName : 'Unknown';
}
  hasChild = (_: number, node: FlatNode) => node.expandable;

  isEvaluationNode(_: number, node: FlatNode): boolean {
    return node.type === 'evaluation';
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
        const treeData: TreeNode[] = recruitments.map(rec => ({
          expandable: true,
          name: `Recruitment for ${rec.position}`,
          level: 0,
          data: rec,
          type: 'recruitment',
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

  onNodeToggle(node: FlatNode): void {
    if (node.type === 'recruitment' && this.treeControl.isExpanded(node)) {
      const parentNode = this.findNodeInTreeData(node);
      if (parentNode && !parentNode.evaluationsLoaded) {
        this.loadEvaluationsForRecruitment(parentNode);
      }
    }
  }

  private findNodeInTreeData(node: FlatNode): RecruitmentNode | null {
    const treeData = this.dataSource.data;
    for (const rootNode of treeData) {
      if (rootNode.data.id === node.data.id && rootNode.type === 'recruitment') {
        return rootNode as RecruitmentNode;
      }
    }
    return null;
  }

private loadEvaluationsForRecruitment(node: RecruitmentNode): void {
  this.evaluationService.getEvaluationsByRecruitment(node.data.id).subscribe({
    next: (evaluations) => {
      console.log('Evaluations data:', evaluations); // Add this line

      node.children = evaluations.map(evalItem => ({
        expandable: false,
        name: `${evalItem.type} Evaluation`,
        level: 1,
        data: {
          ...evalItem,
          // Ensure evaluateur is undefined if not present, not null
          evaluateur: evalItem.evaluateur ?? undefined
        },
        type: 'evaluation'
      }));
      node.evaluationsLoaded = true;
      
      this.dataSource.data = [...this.dataSource.data];
      this.treeControl.expand(this.treeControl.dataNodes.find(n => 
        n.data.id === node.data.id && n.type === 'recruitment'
      )!);
    },
    error: (err) => {
      console.error('Error loading evaluations:', err);
    }
  });
}

  // UI Helper Methods
  getStatusColor(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'CONTACTED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getRoleNames(roles: Role[]): string {
  if (!roles || roles.length === 0) return '';
  return roles.map((role: Role | string) => {
    switch(role) {
      case Role.EVALUATEUR: return 'Evaluator';
      case Role.RECRUTEUR: return 'Recruiter';
      case Role.RECRUTEUR_MANAGER: return 'Recruiter Manager';
      case Role.MANAGER: return 'Manager';
      default: return String(role);
    }
  }).join(', ');
}

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

  // Action Methods
  refreshData(): void {
    this.loadCandidateHistory();
  }

  openAddEvaluationDialog(recruitmentId: number): void {
    if (!recruitmentId) {
      this.snackBar.open('No recruitment process selected', 'Close', { duration: 3000 });
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

  // Permission Methods
canAddEvaluation(recruitment: Recruitment): boolean {
  const currentUser = this.authService.currentUserValue;
  
  if (!currentUser) {
    console.warn('No current user found');
    return false;
  }

  // Debug output to verify values
  console.log('Current User:', {
    id: currentUser.id,
    email: currentUser.email
  });
  console.log('Recruiter:', {
    id: recruitment.recruteur?.id,
    email: recruitment.recruteur?.email
  });

  // Check if user is RECRUTEUR_MANAGER
  if (this.authService.hasRole(Role.RECRUTEUR_MANAGER)) {
    return true;
  }

  // Compare recruiter ID with current user ID (both numbers)
  return this.authService.hasRole(Role.RECRUTEUR) && 
         recruitment.recruteur?.id === currentUser.id;
}

  canDeleteRecruitment(recruitment: Recruitment): boolean {
    return this.canAddEvaluation(recruitment);
  }

  canManageEvaluation(evaluation: Evaluation): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    return this.authService.hasRole(Role.RECRUTEUR_MANAGER) ||
           (evaluation.evaluateur?.id === currentUser.id);
  }



  // Delete Methods
  confirmDeleteRecruitment(id: number): void {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Recruitment Process',
        message: 'Are you sure you want to delete this recruitment process?'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.recruitmentService.deleteRecruitment(id).subscribe({
          next: () => {
            this.snackBar.open('Recruitment process deleted', 'Close', { duration: 3000 });
            this.loadCandidateHistory();
          },
          error: (err) => {
            this.snackBar.open('Error deleting recruitment process', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  confirmDeleteEvaluation(id: number): void {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Evaluation',
        message: 'Are you sure you want to delete this evaluation?'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.evaluationService.deleteEvaluation(id).subscribe({
          next: () => {
            this.snackBar.open('Evaluation deleted', 'Close', { duration: 3000 });
            this.loadCandidateHistory();
          },
          error: (err) => {
            this.snackBar.open('Error deleting evaluation', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  // Evaluation Helpers
  getEvaluationIcon(type: string): string {
    switch(type) {
      case 'RH': return 'people';
      case 'MANAGERIAL': return 'leaderboard';
      case 'TECHNIQUE': return 'code';
      default: return 'assignment';
    }
  }

  getEvaluationIconColor(type: string): string {
    switch(type) {
      case 'RH': return 'text-purple-500';
      case 'MANAGERIAL': return 'text-blue-500';
      case 'TECHNIQUE': return 'text-green-500';
      default: return 'text-gray-500';
    }
  }

  openEditEvaluationDialog(evaluation: Evaluation): void {
    const dialogRef = this.dialog.open(AddEvaluationComponent, {
      width: '500px',
      data: { 
        recrutementId: evaluation.recrutement?.id,
        evaluation: evaluation
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCandidateHistory();
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  Role = Role;
}