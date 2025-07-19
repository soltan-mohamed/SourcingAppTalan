import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { NgScrollbar } from 'ngx-scrollbar';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { MatIcon } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateCandidat } from '../create-candidat/create-candidat';
import { CandidatesService } from 'app/services/candidates-service';
import { Candidate } from 'app/models/candidate';

interface CandidateTableData extends Omit<Candidate, 'skills'> {
  fullName: string;
  skills: string;
}

@Component({
  selector: 'app-candidates',
  imports: [
    CommonModule,
    MatCardModule,
    NgScrollbar,
    TableCardComponent,
    MatIcon,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './candidates.html',
  styleUrl: './candidates.scss'
})
export class Candidates implements OnInit, OnDestroy {

  candidates: CandidateTableData[] = [];
  private candidatesSubscription: Subscription = new Subscription();
  isRefreshing = false;

  constructor(
    private dialog: MatDialog,
    private candidateService : CandidatesService,
  ) {}

  ngOnInit(): void {

    this.candidatesSubscription = this.candidateService.candidates$.subscribe({
      next: (data : Candidate[]) => {
    console.log('Candidates received:', data);
        this.candidates = data.map(candidate => {
  const fullName = `${candidate.prenom} ${candidate.nom.toUpperCase()}`;
  let type = '-';

  if (candidate.recrutements?.length > 0) {
    const allEvaluations = candidate.recrutements
      .flatMap(r => r.evaluations || [])
      .filter(e => e.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastEval = allEvaluations[0];

    if (lastEval) {
      switch (lastEval.type?.toLowerCase()) {
        case 'rh':
          type = 'RH';
          break;
        case 'technique':
          type = 'TECHNIQUE';
          break;
        case 'managerial':
          type = 'MANAGERIAL';
          break;
        default:
          type = '-';
      }
    }
  }

  return {
    ...candidate,
    fullName,
    skills: candidate.skills ? candidate.skills.join(', ') : 'No skills',
    type,
    statut: candidate.statut
  };
});

        console.log('Candidates updated:', data);
      },
      error: (err) => {
        console.error('Error receiving candidates:', err);
      }
    });

    this.loadCandidates();
  }

  ngOnDestroy(): void {
    if (this.candidatesSubscription) {
      this.candidatesSubscription.unsubscribe();
    }
  }

  patchFormValues(candidate: Candidate): void {
  }

  getCurrentUser(): void {
  }

  refreshCandidates(): void {
    console.log('Refreshing candidates data...');
    this.isRefreshing = true;
    
    // Force reload all candidates data from the backend
    this.candidateService.refreshCandidates().subscribe({
      next: (data) => {
        console.log('Candidates data refreshed successfully:', data);
        console.log(`Refreshed ${data.length} candidates with complete recruitment and evaluation data`);
        this.isRefreshing = false;
        
        // The subscription will automatically update the candidates array
        // Also manually update to ensure the latest data is displayed
        this.candidates = data.map(candidate => {
          const fullName = `${candidate.prenom} ${candidate.nom.toUpperCase()}`;
          let type = '-';

          if (candidate.recrutements?.length > 0) {
            const allEvaluations = candidate.recrutements
              .flatMap(r => r.evaluations || [])
              .filter(e => e.date)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const lastEval = allEvaluations[0];

            if (lastEval) {
              switch (lastEval.type?.toLowerCase()) {
                case 'rh':
                  type = 'RH';
                  break;
                case 'technique':
                  type = 'TECHNIQUE';
                  break;
                case 'managerial':
                  type = 'MANAGERIAL';
                  break;
                default:
                  type = '-';
              }
            }
          }

          return {
            ...candidate,
            fullName,
            skills: candidate.skills ? candidate.skills.join(', ') : 'No skills',
            type,
            statut: candidate.statut
          };
        });
        
        // Log recruitment and evaluation data for debugging
        this.candidates.forEach(candidate => {
          if (candidate.recrutements?.length > 0) {
            console.log(`${candidate.fullName} has ${candidate.recrutements.length} recruitment(s)`);
            candidate.recrutements.forEach((recruitment, index) => {
              console.log(`  Recruitment ${index + 1}: ${recruitment.position || 'N/A'} with ${recruitment.evaluations?.length || 0} evaluations`);
            });
          }
        });
      },
      error: (err) => {
        console.error('Error refreshing candidates:', err);
        this.isRefreshing = false;
      }
    });
  }
  
  candidateColumnDefinitions = [
    { def: 'fullName', label: 'Name', type: 'text' },
    { def: 'telephone', label: 'Phone', type: 'phone' },
    { def: 'email', label: 'Email', type: 'email' },

    { def: 'position', label: 'Position', type: 'text' },
    { def: 'statut', label: 'Status', type: 'text' },
    { def: 'type', label: 'type', type: 'text' },
    { def: 'cv', label: 'CV', type: 'file' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];

  openAddCandidate(): void {
    const dialogRef = this.dialog.open(CreateCandidat, {
      width: '800px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload candidates after adding a new one
        this.loadCandidates();
      }
    });
  }

loadCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (data) => {
        // Transform the data to match the table expectations
        this.candidates = data.map(candidate => ({
          ...candidate,
          fullName: `${candidate.prenom} ${candidate.nom}`
        })) as unknown as CandidateTableData[];
        console.log('Candidates loaded successfully:', this.candidates);
        // Log CV information for debugging
        this.candidates.forEach(candidate => {
          console.log(`Candidate ${candidate.fullName}: CV = ${candidate.cv || 'No CV'}`);
        });
      },
      error: (err) => {
        console.error('Error fetching candidates:', err);
      }
    });
  }

  // Test method to check if CV upload is working
  testCvUpload(): void {
    console.log('Testing CV upload functionality...');
    console.log('Current candidates:', this.candidates);
    
    // Check if any candidates have CV files
    const candidatesWithCv = this.candidates.filter(c => c.cv);
    const candidatesWithoutCv = this.candidates.filter(c => !c.cv);
    
    console.log(`Candidates with CV: ${candidatesWithCv.length}`);
    console.log(`Candidates without CV: ${candidatesWithoutCv.length}`);
    
    candidatesWithCv.forEach(c => {
      console.log(`${c.fullName} has CV: ${c.cv}`);
    });
  }


}
