import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CandidateHistory } from '../candidate-history/candidate-history';
import { CandidatesService } from 'app/services/candidates-service';
import { Candidate } from 'app/models/candidate';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { HttpClient } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EXPERIENCE_RANGES, ExperienceRange } from 'app/models/search-params';

interface CandidateTableData extends Omit<Candidate, 'skills'> {
  fullName: string;
  skills: string[];
  skillsDisplay: string;
  matchPercentage?: number;
}

interface SearchCriteria {
  key: string;
  label: string;
  icon: string;
}

interface SearchParams {
  searchText?: string;
  searchCriteria?: string[];
  minExperience?: number;
  maxExperience?: number;
}

const SEARCH_CRITERIA: SearchCriteria[] = [
  { key: 'name', label: 'Name', icon: 'person' },
  { key: 'email', label: 'Email', icon: 'email' },
  { key: 'phone', label: 'Phone', icon: 'phone' },
  { key: 'position', label: 'Position', icon: 'work' },
  { key: 'skills', label: 'Skills', icon: 'code' }
];

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
    MatMenuModule,
    MatTooltipModule,
    NgScrollbarModule,
    TableCardComponent,
    MatProgressBarModule
  ],
})
export class VivierCandidatesComponent implements OnInit, OnDestroy {
  candidates: CandidateTableData[] = [];
  filteredCandidates: CandidateTableData[] = [];
  allCandidates: CandidateTableData[] = [];
  private candidatesSubscription: Subscription = new Subscription();
  
  // Search functionality
  searchForm: FormGroup;
  searchCriteria = SEARCH_CRITERIA;
  selectedCriteria: string[] = ['name', 'email', 'phone', 'position', 'skills'];
  experienceRanges: ExperienceRange[] = EXPERIENCE_RANGES;
  
  // State management
  isRefreshing = false;
  isMatching = false;
  isSearching = false;
  searchQuery = '';
  matchingApiUrl = 'http://localhost:5000/match';

candidateColumnDefinitions = [
  { def: 'fullName', label: 'Name', type: 'text' },
  { 
    def: 'matchPercentage', 
    label: 'Match %', 
    type: 'progress',
    styles: (value: number) => this.getMatchPercentageStyle(value)
  },
  { def: 'skillsDisplay', label: 'Skills', type: 'text' },
  { def: 'experiencePeriod', label: 'Years of Experience', type: 'experience' },
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
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchText: [''],
      experienceRange: ['']
    });
  }

  ngOnInit(): void {
    this.loadVivierCandidates();
    this.setupSearchSubscription();
  }

  private setupSearchSubscription(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.performSearch();
      });
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
        this.allCandidates = [...this.candidates];
        this.filteredCandidates = [...this.candidates];
        this.isRefreshing = false;
      },
      error: (err) => {
        console.error('Error fetching vivier candidates:', err);
        this.isRefreshing = false;
      }
    });
  }

  // Search functionality methods
  performSearch(): void {
    this.isSearching = true;
    const searchParams = this.buildSearchParams();
    
    if (this.hasActiveFilters()) {
      this.candidateService.searchVivierCandidates(searchParams).subscribe({
        next: (data: Candidate[]) => {
          const transformedData = this.transformVivierCandidates(data);
          this.filteredCandidates = transformedData;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Vivier search error:', error);
          this.filteredCandidates = [...this.allCandidates];
          this.isSearching = false;
        }
      });
    } else {
      this.filteredCandidates = [...this.allCandidates];
      this.isSearching = false;
    }
  }

  private buildSearchParams(): SearchParams {
    const formValue = this.searchForm.value;
    let searchParams: SearchParams = {
      searchText: formValue.searchText || undefined,
      searchCriteria: this.selectedCriteria.length > 0 ? this.selectedCriteria : undefined
    };

    // Handle experience range
    if (formValue.experienceRange) {
      const selectedRange = this.experienceRanges.find(r => r.label === formValue.experienceRange);
      if (selectedRange) {
        // Special handling for 0-1 years case
        if (selectedRange.min === 0 && selectedRange.max === 1) {
          searchParams.minExperience = 0;
          searchParams.maxExperience = 1;
        } else {
          if (selectedRange.min !== undefined) {
            searchParams.minExperience = selectedRange.min;
          }
          if (selectedRange.max !== undefined && selectedRange.max !== 999) {
            searchParams.maxExperience = selectedRange.max;
          }
        }
      }
    }

    return searchParams;
  }

  hasActiveFilters(): boolean {
    const formValue = this.searchForm.value;
    return !!(formValue.searchText || formValue.experienceRange);
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.filteredCandidates = [...this.allCandidates];
  }

  clearFormField(fieldName: string): void {
    this.searchForm.get(fieldName)?.setValue('');
  }

  // Search criteria management
  toggleSearchCriteria(criteriaKey: string): void {
    const index = this.selectedCriteria.indexOf(criteriaKey);
    if (index > -1) {
      this.selectedCriteria.splice(index, 1);
    } else {
      this.selectedCriteria.push(criteriaKey);
    }
    this.performSearch();
  }

  isCriteriaSelected(criteriaKey: string): boolean {
    return this.selectedCriteria.includes(criteriaKey);
  }

  selectAllCriteria(): void {
    this.selectedCriteria = this.searchCriteria.map(c => c.key);
    this.performSearch();
  }

  clearAllCriteria(): void {
    this.selectedCriteria = [];
    this.performSearch();
  }

  // Helper methods for template
  getCurrentSearchPlaceholder(): string {
    if (this.selectedCriteria.length === 0) {
      return 'Please select search criteria first';
    }
    const criteriaLabels = this.selectedCriteria
      .map(key => this.searchCriteria.find(c => c.key === key)?.label)
      .filter(Boolean);
    return `Search in: ${criteriaLabels.join(', ')}`;
  }

  getSelectedCriteriaLabels(): string {
    return this.selectedCriteria
      .map(key => this.searchCriteria.find(c => c.key === key)?.label)
      .filter(Boolean)
      .join(', ');
  }

  getCriteriaLabel(key: string): string {
    return this.searchCriteria.find(c => c.key === key)?.label || '';
  }

  getCriteriaIcon(key: string): string {
    return this.searchCriteria.find(c => c.key === key)?.icon || '';
  }

  getCurrentSearchText(): string {
    return this.searchForm.get('searchText')?.value || '';
  }

  getCurrentExperienceRange(): string {
    return this.searchForm.get('experienceRange')?.value || '';
  }

  private transformVivierCandidates(data: Candidate[]): CandidateTableData[] {
    return data.map(candidate => ({
      ...candidate,
      fullName: `${candidate.prenom} ${candidate.nom.toUpperCase()}`,
      skills: candidate.skills || [],
      skillsDisplay: this.formatSkills(candidate.skills),
      type: this.getLastEvaluationType(candidate),
      matchPercentage: 0
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