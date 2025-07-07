import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-candidates',
  imports: [
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

  candidates : Candidate[] = [];
  private candidatesSubscription: Subscription = new Subscription();

  constructor(
    private dialog: MatDialog,
    private candidateService : CandidatesService,
  ) {}

  ngOnInit(): void {
    this.candidatesSubscription = this.candidateService.candidates$.subscribe({
      next: (data) => {
        this.candidates = data.map(candidate => ({
          ...candidate,
          name: `${candidate.prenom} ${candidate.nom.toUpperCase()}`
        }));
        console.log('Candidates updated:', data);
      },
      error: (err) => {
        console.error('Error receiving candidates:', err);
      }
    });

    this.loadCandidates();
  }
  
  candidateColumnDefinitions = [
    { def: 'name', label: 'Name', type: 'text' },
    { def: 'telephone', label: 'Phone', type: 'phone' },
    { def: 'email', label: 'Email', type: 'email' },
    { def: 'position', label: 'Position', type: 'text' },
    //{ def: 'dateOfAdmission', label: 'Date', type: 'date' },
    { def: 'statut', label: 'Status', type: 'text' },
    { def: 'cv', label: 'CV', type: 'file' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];

  openAddCandidate(): void {
    const dialogRef = this.dialog.open(CreateCandidat, {
      width: '800px',
      disableClose: false
    });

    // dialogRef.afterClosed().subscribe((result: Publication) => {
    //   if (result) {
    //     // Reload publications from server after adding a new one
    //     setTimeout(() => this.loadUserPublications(), 1000);
    //   }
    // });
  }

  loadCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (data) => {
        console.log('Candidates loaded successfully');
      },
      error: (err) => {
        console.error('Error fetching candidates:', err);
      }
    });
  }


}
