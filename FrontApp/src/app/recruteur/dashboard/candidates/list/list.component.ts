import { Component, OnInit } from '@angular/core';
import { CandidateService } from '../../../../core/service/candidate.service';
import { Candidate, Statut } from '../../../../core/models/candidate.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddCandidateComponent } from '../add/add.component';
import { AuthService } from '@core/service/auth.service';

import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
//import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { MatTableModule } from '@angular/material/table';
//import { InitialsPipe } from '@core/pipes/initials.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { AddRecruitmentComponent } from '../recrutement/add.component';
import { Role } from '@core/models/role';
import { CandidateHistoryComponent } from '../history/candidate-history.component';

@Component({
  selector: 'app-candidate-list',
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
    MatOptionModule, 
    ScrollingModule,
    SidebarComponent

  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CandidateListComponent implements OnInit {
    Role = Role;

  candidates: Candidate[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  activeStatusFilter: Statut | null = null;
  displayedColumns: string[] = ['name', 'email', 'telephone', 'status', 'cv', 'actions'];

  constructor(
    private dialog: MatDialog,
    private candidateService: CandidateService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {}

  ngOnInit() {
    console.log('Initializing CandidateListComponent');
    this.loadCandidates();
  }

  activeSidebarItem = 'candidates';
  

  onSidebarItemChange(item: string) {
    this.activeSidebarItem = item;
  }

  loadCandidates() {
    this.isLoading = true;
    this.errorMessage = '';
    this.candidateService.getAllCandidates().subscribe({
      next: (candidates) => {
        this.candidates = candidates;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading candidates:', err);
        this.errorMessage = err.message || 'Failed to load candidates';
        this.isLoading = false;
      }
    });
  }

/*isEditable(candidate: Candidate): boolean {
  const currentUser = this.authService.currentUserValue;
  if (!currentUser) return false;
  
  return this.authService.hasRole(Role.RECRUTEUR_MANAGER) ||
         candidate.responsable?.id === currentUser.id;
}*/

isEditable(candidate: Candidate): boolean {
  return true; 
}

/*isDeleteable(candidate: Candidate): boolean {
  return true; 
}*/

isDeleteable(candidate: Candidate): boolean {
  return candidate.isDeleteable || 
         this.authService.hasRole(Role.RECRUTEUR_MANAGER);
}

  get currentUser() {
    return this.authService.currentUserValue;
  }

  getResponsableDisplay(responsable: any): string {
    return responsable?.name || responsable?.fullName || 'No responsable';
  }

  get statuses(): Statut[] {
    return this.candidateService.getStatuses();
  }

  applySearch(): void {
    if (this.searchQuery.trim()) {
      this.loadCandidates();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadCandidates();
  }

  filterByStatus(status: Statut): void {
    this.activeStatusFilter = status;
    this.loadCandidates();
  }

  clearStatusFilter(): void {
    this.activeStatusFilter = null;
    this.loadCandidates();
  }

  viewCandidate(id: number): void {
    console.log('View candidate:', id);
  }

  editCandidate(id: number): void {
    const candidate = this.candidates.find(c => c.id === id);
    if (!candidate) return;

    if (!this.isEditable(candidate)) {
      this.showError('You are not authorized to edit this candidate');
      return;
    }

    const dialogRef = this.dialog.open(AddCandidateComponent, {
      width: '800px',
      data: { candidate }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccess('Candidate updated successfully');
        this.loadCandidates();
      }
    });
  }

  deleteCandidate(id: number): void {
    const candidate = this.candidates.find(c => c.id === id);
    if (!candidate) return;

    if (!this.isDeleteable(candidate)) {
      this.showError('You are not authorized to delete this candidate');
      return;
    }

    if (confirm('Are you sure you want to delete this candidate?')) {
      this.candidateService.deleteCandidate(id).subscribe({
        next: () => {
          this.showSuccess('Candidate deleted successfully');
          this.loadCandidates();
        },
        error: (err) => {
          this.showError(err.message || 'Failed to delete candidate');
        }
      });
    }
  }

  openAddCandidate(): void {
    const dialogRef = this.dialog.open(AddCandidateComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccess('Candidate added successfully');
        this.loadCandidates();
      }
    });
  }

  downloadCv(cvPath: string): void {
    if (cvPath) {
      window.open(cvPath, '_blank');
    } else {
      this.showError('No CV available for this candidate');
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

openAddRecruitmentDialog(candidate: Candidate): void {
  const dialogRef = this.dialog.open(AddRecruitmentComponent, {
    width: '500px',
    data: { candidate }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
    }
  });
}

startRecruitmentProcess(candidate: Candidate): void {
  const dialogRef = this.dialog.open(AddRecruitmentComponent, {
    width: '500px',
    data: { candidate }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.showSuccess('Recruitment process started successfully');

    }
  });
}
viewCandidateHistory(id: number): void {
  const dialogRef = this.dialog.open(CandidateHistoryComponent, {
    width: '800px',
    data: { candidateId: id }
  });
}
}