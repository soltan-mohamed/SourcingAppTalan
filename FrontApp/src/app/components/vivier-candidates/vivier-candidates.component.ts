import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CandidateHistory } from '../candidate-history/candidate-history';
import { CandidatesService } from 'app/services/candidates-service';
import { Candidate } from 'app/models/candidate';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { HttpClient } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface CandidateTableData extends Omit<Candidate, 'skills'> {
  fullName: string;
  skills: string[];
  skillsDisplay: string;
  matchPercentage?: number;
}

@Component({
  selector: 'app-vivier-candidates',
  templateUrl: './vivier-candidates.component.html',
  styleUrls: ['./vivier-candidates.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatInputModule,
    MatSelectModule, 
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    NgScrollbarModule,
    TableCardComponent,
    MatProgressBarModule
  ],
})
export class VivierCandidatesComponent implements OnInit, OnDestroy {
  candidates: CandidateTableData[] = [];
  filteredCandidates: CandidateTableData[] = [];
  private candidatesSubscription: Subscription = new Subscription();
  isRefreshing = false;
  isMatching = false;
  searchQuery = '';
  matchingApiUrl = 'http://localhost:5000/match'; // Your Flask API URL

candidateColumnDefinitions = [
  { def: 'fullName', label: 'Name', type: 'text' },
  { 
    def: 'matchPercentage', 
    label: 'Match %', 
    type: 'progress',
    styles: (value: number) => this.getMatchPercentageStyle(value)
  },
  { def: 'skillsDisplay', label: 'Skills', type: 'text' },
  { def: 'telephone', label: 'Phone', type: 'phone' },
  { def: 'email', label: 'Email', type: 'email' },
  { def: 'position', label: 'Position', type: 'text' },
  { def: 'statut', label: 'Status', type: 'text' },
  { def: 'type', label: 'Type', type: 'text' },
  { def: 'cv', label: 'CV', type: 'file' },
  { def: 'actions', label: 'Actions', type: 'actionBtn' },
];

getMatchPercentageStyle(value: number) {
  if (value >= 80) return 'text-green-600 font-medium';
  if (value >= 50) return 'text-amber-500';
  return 'text-red-500';
}

  constructor(
    private dialog: MatDialog,
    private candidateService: CandidatesService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadVivierCandidates();
  }

  ngOnDestroy(): void {
    if (this.candidatesSubscription) {
      this.candidatesSubscription.unsubscribe();
    }
  }

  loadVivierCandidates(): void {
    this.isRefreshing = true;
    this.candidateService.getVivierCandidates().subscribe({
      next: (data: Candidate[]) => {
        this.candidates = this.transformVivierCandidates(data);
        this.filteredCandidates = [...this.candidates];
        this.isRefreshing = false;
      },
      error: (err) => {
        console.error('Error fetching vivier candidates:', err);
        this.isRefreshing = false;
      }
    });
  }

  private transformVivierCandidates(data: Candidate[]): CandidateTableData[] {
    return data.map(candidate => ({
      ...candidate,
      fullName: `${candidate.prenom} ${candidate.nom.toUpperCase()}`,
      skills: candidate.skills || [],
      skillsDisplay: this.formatSkills(candidate.skills),
      type: this.getLastEvaluationType(candidate),
      matchPercentage: 0 // Initialize match percentage
    }));
  }

  private getLastEvaluationType(candidate: Candidate): string {
    if (!candidate.recrutements?.length) return '-';
    
    const lastEval = candidate.recrutements
      .flatMap(r => r.evaluations || [])
      .filter(e => e.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastEval) return '-';

    switch (lastEval.type?.toLowerCase()) {
      case 'rh': return 'RH';
      case 'technique': return 'TECHNIQUE';
      case 'managerial': return 'MANAGERIAL';
      default: return '-';
    }
  }

  private formatSkills(skills: string[] | undefined): string {
    if (!skills || !skills.length) return 'No skills listed';
    const maxVisible = 3;
    if (skills.length <= maxVisible) return skills.join(', ');
    return `${skills.slice(0, maxVisible).join(', ')} +${skills.length - maxVisible} more`;
  }

findMatches(): void {
  if (!this.searchQuery.trim()) {
    this.filteredCandidates = [...this.candidates];
    return;
  }

  this.isMatching = true;
  
  const candidatesForMatching = this.candidates.map(c => ({
    id: c.id,
    prenom: c.prenom,
    nom: c.nom,
    skills: c.skills
  }));

  this.http.post(this.matchingApiUrl, {
    requirements: this.searchQuery,
    candidates: candidatesForMatching
  }).subscribe({
    next: (response: any) => {
      const matches = response.matches || [];
      
      // Update both candidates and filteredCandidates arrays
      this.candidates = this.candidates.map(candidate => {
        const match = matches.find((m: any) => m.id === candidate.id);
        return {
          ...candidate,
          matchPercentage: match ? match.match_percentage : 0
        };
      });
      
      // Now update filteredCandidates with the sorted results
      this.filteredCandidates = [...this.candidates]
        .sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      
      this.isMatching = false;
    },
    error: (err) => {
      console.error('Matching error:', err);
      this.isMatching = false;
    }
  });
}

  refreshCandidates(): void {
    this.loadVivierCandidates();
  }

  openHistory(row: any): void {
    const dialogRef = this.dialog.open(CandidateHistory, {
      width: '90vw',       
      maxWidth: 'none',
      disableClose: false,
      data: row 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshCandidates();
      }
    });
  }
}