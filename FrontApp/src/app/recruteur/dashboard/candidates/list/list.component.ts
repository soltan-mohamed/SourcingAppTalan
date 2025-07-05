import { Component, OnInit } from '@angular/core';
import { CandidateService } from '../../../../core/service/candidate.service';
import { Candidate, Statut } from '../../../../core/models/candidate.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddCandidateComponent } from '../add/add.component';
import { AuthService } from '@core/service/auth.service';

import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgScrollbarModule } from 'ngx-scrollbar/public-api';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { MatTableModule } from '@angular/material/table';
import { InitialsPipe } from '@core/pipes/initials.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,  // <-- Add this line
    MatButtonModule,
    MatInputModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TableCardComponent,
    MatDialogModule,
    MatTableModule,
    InitialsPipe,
        MatSelectModule,  // <-- Add this line
    MatOptionModule, 
    ScrollingModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CandidateListComponent implements OnInit {
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
  
  // Verify authentication state
  console.log('Initial Auth State:', {
    isAuthenticated: this.authService.isAuthenticated(),
    currentUser: this.authService.currentUserValue,
    token: this.authService.token
  });

  this.loadCandidates();
}

loadCandidates() {
  this.isLoading = true;
  this.candidateService.getAllCandidates().subscribe({
    next: (candidates) => {
      this.candidates = candidates;
      this.isLoading = false;
      
      // Debug first candidate
      if (candidates.length > 0) {
        console.log('First candidate:', candidates[0]);
        console.log('First candidate editable:', this.isEditable(candidates[0]));
      }
    },
    error: (err) => {
      console.error('Error loading candidates:', err);
      this.isLoading = false;
    }
  });
}



isEditable(candidate: Candidate): boolean {
  // TEMPORARY OVERRIDE - FOR TESTING ONLY
  //console.log('FORCE EDITABLE TRUE - DEBUG MODE');
  return true;
}

// In your component class
isDeleteable(candidate: Candidate): boolean {
  console.log('Checking deletable:', {
    user: this.currentUser?.id,
    responsable: candidate.responsable?.id,
    equal: this.currentUser?.id === candidate.responsable?.id
  });
  return this.isEditable(candidate); // Or custom delete logic
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
    this.loadCandidates();
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
    console.log('Edit candidate:', id);
  }

  deleteCandidate(id: number): void {
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
}