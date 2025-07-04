// app/candidates/list/list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AddCandidateComponent } from '../add/add.component';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { CandidateService } from '../../../../core/service/candidate.service';
import { Candidate, Statut } from '../../../../core/models/candidate.model';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { InitialsPipe } from '@core/pipes/initials.pipe';

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
    MatMenuModule,
    MatProgressSpinnerModule,
    NgScrollbarModule,
    TableCardComponent,
    MatDialogModule,
    InitialsPipe
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

  constructor(
    private dialog: MatDialog,
    private candidateService: CandidateService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  get statuses(): Statut[] {
    return Object.values(Statut);
  }

  loadCandidates(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.candidateService.getAllCandidates()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (candidates) => {
          this.candidates = candidates;
        },
        error: (err) => {
          console.error('Error loading candidates:', err);
          this.showError('Failed to load candidates. Please try again.');
        }
      });
  }

  // Add this method to get the responsable name consistently
  getResponsableDisplay(responsable: any): string {
    // Use the same logic as in your add component
    return responsable?.name || responsable?.fullName || 'No responsable';
  }

  // Rest of your methods remain the same...
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
          console.error('Error deleting candidate:', err);
          this.showError('Failed to delete candidate. Please try again.');
        }
      });
    }
  }

  openAddCandidate(): void {
    const dialogRef = this.dialog.open(AddCandidateComponent, {
      width: '800px',
      maxHeight: '90vh'
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

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}