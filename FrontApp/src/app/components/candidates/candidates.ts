import { Component, OnInit } from '@angular/core';
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
export class Candidates {

  candidates: CandidateTableData[] = [];
  private candidatesSubscription: Subscription = new Subscription();

  constructor(
    private dialog: MatDialog,
    private candidateService : CandidatesService,
  ) {}

  ngOnInit(): void {

    this.candidatesSubscription = this.candidateService.candidates$.subscribe({
      next: (data : Candidate[]) => {
    console.log('Candidates received:', data);
        this.candidates = data.map(candidate => {
  const name = `${candidate.prenom} ${candidate.nom.toUpperCase()}`;
  let type = '-';

  if (candidate.recrutements?.length > 0) {
    const allEvaluations = candidate.recrutements
      .flatMap(r => r.evaluations || [])
      .filter(e => e.date) // On garde uniquement celles avec une date
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
    name,
    type,
    statut: candidate.statut // 👈 s'assurer qu'on garde bien statut
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

  patchFormValues(candidate: Candidate): void {
  }

  getCurrentUser(): void {
  }
  
  candidateColumnDefinitions = [
    { def: 'fullName', label: 'Name', type: 'text' },
    { def: 'telephone', label: 'Phone', type: 'phone' },
    { def: 'email', label: 'Email', type: 'email' },
    { def: 'skills', label: 'Skills', type: 'text' },

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
          fullName: `${candidate.prenom} ${candidate.nom}`,
          skills: candidate.skills ? candidate.skills.join(', ') : 'No skills'
        })) as CandidateTableData[];
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
