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
import { UsersService } from 'app/services/users-service';
import { User } from 'app/models/user';

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

  candidates : Candidate[] = [];
  private candidatesSubscription: Subscription = new Subscription();
  currentUser : any;

  constructor(
    private dialog: MatDialog,
    private candidateService : CandidatesService,
    private userService : UsersService
  ) {}

  ngOnInit(): void {

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        // console.log('Current user:', user);
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Failed to fetch current user:', error);
      }
    });


    this.candidatesSubscription = this.candidateService.candidates$.subscribe({
      next: (data) => {
        this.candidates = data.map(candidate => {
          const name= `${candidate.prenom} ${candidate.nom.toUpperCase()}`;

          let editable : boolean;
          editable = this.currentUser.id === candidate.responsable.id || this.isUserManager(candidate.responsable);
          let hirable = this.isHirable(candidate);
          let type = '-';
          let position = 'Not available';
          if (candidate.recrutements?.length > 0) {
            const allRecrutements = candidate.recrutements
                .flatMap(r => r || [])
                .filter(r => r.date)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastRecrutement = allRecrutements[0];

            if (lastRecrutement) {
              position = lastRecrutement.position;
            }

            const allEvaluations = lastRecrutement.evaluations
              .flatMap(r => r || [])
              .filter(e => e.date)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const lastEval = allEvaluations[0];

            if (lastEval) {
              switch (lastEval.type?.toLowerCase()) {
                case 'rh':
                  type = 'RH';
                  break;
                case 'technique':
                  type = 'TECH';
                  break;
                case 'managerial':
                  type = 'MNGRL';
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
            statut: candidate.statut,
            position : position,
            editable,
            hirable
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
  
  candidateColumnDefinitions = [
    { def: 'name', label: 'Name', type: 'text' },
    { def: 'telephone', label: 'Phone', type: 'phone' },
    { def: 'email', label: 'Email', type: 'email' },
    { def: 'position', label: 'Position', type: 'text' },
    { def: 'experiencePeriod', label: 'Years of Experience', type: 'experience' }, // New column
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


  }

  loadCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (data) => {
        console.log('Candidates loaded successfully', data);
      },
      error: (err) => {
        console.error('Error fetching candidates:', err);
      }
    });
  }

  isUserManager(user : any) : boolean {
    return user.roles.includes("MANAGER") ? true : false;
  }

  isHirable(candidate : Candidate) : boolean {
    
    if (candidate.statut === 'CONTACTED') return true;

    const allRecrutements = candidate.recrutements
        .flatMap(r => r || [])
        .filter(r => r.date)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastRecrutement = allRecrutements[0];

    if (lastRecrutement.statut === "'NOT_RECRUITED'") {
      return true;
    }

    return false;
  }


}