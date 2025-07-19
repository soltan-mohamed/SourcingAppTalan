import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgScrollbar } from 'ngx-scrollbar';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CreateCandidat } from '../create-candidat/create-candidat';
import { CandidatesService } from 'app/services/candidates-service';
import { Candidate } from 'app/models/candidate';

interface CandidateTableData extends Omit<Candidate, 'skills'> {
  fullName: string;
  skills: string;
}

@Component({
  selector: 'app-candidates',
  standalone: true,
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
  styleUrls: ['./candidates.scss']
})
export class Candidates implements OnInit, OnDestroy {
  candidates: CandidateTableData[] = [];
  private candidatesSubscription: Subscription = new Subscription();
  isRefreshing = false;

  candidateColumnDefinitions = [
    { def: 'fullName', label: 'Name', type: 'text' },
    { def: 'telephone', label: 'Phone', type: 'phone' },
    { def: 'email', label: 'Email', type: 'email' },
    { def: 'position', label: 'Position', type: 'text' },
    { def: 'statut', label: 'Status', type: 'text' },
    { def: 'type', label: 'Type', type: 'text' },
    { def: 'cv', label: 'CV', type: 'file' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];

  constructor(
    private dialog: MatDialog,
    private candidateService: CandidatesService,
  ) {}

  ngOnInit(): void {
    this.setupCandidatesSubscription();
    this.loadCandidates();
  }

  ngOnDestroy(): void {
    this.candidatesSubscription.unsubscribe();
  }

  private setupCandidatesSubscription(): void {
    this.candidatesSubscription = this.candidateService.candidates$.subscribe({
      next: (data: Candidate[]) => {
        this.candidates = this.transformCandidates(data);
      },
      error: (err: any) => {
        console.error('Error receiving candidates:', err);
      }
    });
  }

  private transformCandidates(data: Candidate[]): CandidateTableData[] {
    return data.map(candidate => {
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
  }

  loadCandidates(): void {
    this.isRefreshing = true;
    this.candidateService.getAllCandidates().subscribe({
      next: () => {
        this.isRefreshing = false;
      },
      error: (err: any) => {
        console.error('Error loading candidates:', err);
        this.isRefreshing = false;
      }
    });
  }

  refreshCandidates(): void {
    this.loadCandidates();
  }

  openAddCandidate(): void {
    const dialogRef = this.dialog.open(CreateCandidat, {
      width: '800px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshCandidates();
      }
    });
  }

  testCvUpload(): void {
    console.log('Testing CV upload functionality...');
    console.log('Current candidates:', this.candidates);
    
    const candidatesWithCv = this.candidates.filter(c => c.cv);
    const candidatesWithoutCv = this.candidates.filter(c => !c.cv);
    
    console.log(`Candidates with CV: ${candidatesWithCv.length}`);
    console.log(`Candidates without CV: ${candidatesWithoutCv.length}`);
    
    candidatesWithCv.forEach(c => {
      console.log(`${c.fullName} has CV: ${c.cv}`);
    });
  }
}