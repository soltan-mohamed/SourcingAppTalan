import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { NgScrollbar } from 'ngx-scrollbar';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { MatIcon } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateCandidat } from '../create-candidat/create-candidat';
import { CandidatesService } from 'app/services/candidates-service';
import { Candidate } from 'app/models/candidate';
import { UsersService } from 'app/services/users-service';
import { User } from 'app/models/user';
import { SearchParams, EXPERIENCE_RANGES, ExperienceRange, SEARCH_CRITERIA, SearchCriteria } from 'app/models/search-params';

@Component({
  selector: 'app-candidates',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    NgScrollbar,
    TableCardComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  templateUrl: './candidates.html',
  styleUrl: './candidates.scss'
})
export class Candidates implements OnInit, OnDestroy {

  candidates : Candidate[] = [];
  allStatuses: string[] = [];
  experienceRanges: ExperienceRange[] = EXPERIENCE_RANGES;
  searchCriteria: SearchCriteria[] = SEARCH_CRITERIA;
  selectedCriteria: string[] = ['name', 'email', 'phone', 'position'];
  searchForm: FormGroup;
  isSearching = false;
  
  private candidatesSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  currentUser : any;

  constructor(
    private dialog: MatDialog,
    private candidateService : CandidatesService,
    private userService : UsersService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchText: [''],
      statut: [''],
      experienceRange: ['']
    });
  }

   ngOnInit(): void {
    this.loadStatuses();
    this.setupSearchListener();
    
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        
        // Now that we have the user, we can safely subscribe to candidates
        this.candidatesSubscription = this.candidateService.candidates$.subscribe({
          next: (data) => {
            this.candidates = data.map(candidate => {
              const name= `${candidate.prenom} ${candidate.nom.toUpperCase()}`;

              let editable : boolean = false; // Default to false
              let hirable : boolean = false; // Default to false
              
              // Add a null check for currentUser
              if (this.currentUser && candidate.responsable) {
                editable = this.currentUser.id === candidate.responsable.id || this.isUserManager(candidate.responsable);
              }
              
              hirable = this.isHirable(candidate);
              let type = 'Not yet'; // Default type
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
                  .filter(e => e.date) // On garde uniquement celles avec une date
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
                      type = 'Not yet';
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

        // It's also good practice to load candidates after setting up the subscription
        this.loadCandidates();
      },
      error: (error) => {
        console.error('Failed to fetch current user:', error);
      }
    });
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
    // Only CONTACTED and VIVIER candidates can have new recruitments
    const candidateStatus = candidate?.statut as string;
    
    // First check: Only allow recruitment for CONTACTED or VIVIER status
    if (candidateStatus !== 'CONTACTED' && candidateStatus !== 'VIVIER') {
      return false;
    }

    // For CONTACTED and VIVIER candidates, check if they have existing recruitments
    if (!candidate.recrutements || candidate.recrutements.length === 0) {
      // No recruitments exist, they can be hired
      return true;
    }

    const allRecrutements = candidate.recrutements
        .flatMap(r => r || [])
        .filter(r => r.date)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const lastRecrutement = allRecrutements[0];

    // If no recruitment found, they can be hired
    if (!lastRecrutement) {
      return true;
    }

    // If last recruitment was not successful (NOT_RECRUITED), they can be hired again
    if (lastRecrutement?.statut === 'NOT_RECRUITED') {
      return true;
    }

    // If last recruitment is still ongoing (no final status), don't allow new recruitment
    if (!lastRecrutement.statut || lastRecrutement.statut === 'IN_PROGRESS') {
      return false;
    }

    // If they were recruited successfully, don't allow new recruitment
    if (lastRecrutement.statut === 'RECRUITED') {
      return false;
    }

    // Default case: allow hiring since they have CONTACTED or VIVIER status
    return true;
  }

  // New search methods
  loadStatuses(): void {
    this.candidateService.getAllStatuses().subscribe({
      next: (statuses) => {
        this.allStatuses = statuses;
      },
      error: (error) => {
        console.error('Error loading statuses:', error);
      }
    });
  }

  setupSearchListener(): void {
    this.searchSubscription = this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.performSearch();
      });
  }

  performSearch(): void {
    this.isSearching = true;
    const formValue = this.searchForm.value;
    
    let searchParams: SearchParams = {
      searchText: formValue.searchText || undefined,
      statut: formValue.statut || undefined,
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
          if (selectedRange.max !== undefined) {
            searchParams.maxExperience = selectedRange.max;
          }
        }
      }
    }

    // Remove undefined values, but keep 0 values for experience
    Object.keys(searchParams).forEach(key => {
      const value = searchParams[key as keyof SearchParams];
      if (value === undefined) {
        delete searchParams[key as keyof SearchParams];
      }
    });

    console.log('Search params being sent:', searchParams); // For debugging

    this.candidateService.searchCandidates(searchParams).subscribe({
      next: () => {
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isSearching = false;
      }
    });
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.loadCandidates();
  }

  refreshCandidates(): void {
     console.log('Refreshing candidates list...');
    if (this.hasActiveFilters()) {
      this.performSearch();
    } else {
      this.loadCandidates();
    }
  }

  public hasActiveFilters(): boolean {
    const formValue = this.searchForm.value;
    return !!(formValue.searchText || formValue.statut || formValue.experienceRange);
  }

  ngOnDestroy(): void {
    this.candidatesSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  // Helper methods for status handling
  getStatusDisplayName(status: string): string {
    const statusMap: { [key: string]: string } = {
      'CONTACTED': 'Contacted',
      'SCHEDULED': 'Scheduled',
      'CANCELLED': 'Cancelled',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected',
      'IN_PROGRESS': 'In Progress',
      'VIVIER': 'Vivier'
    };
    return statusMap[status] || status;
  }

  getStatusCount(status: string): number {
    return this.candidates.filter(candidate => candidate.statut === status).length;
  }

  // Method to get all current candidates for counting (including filtered results)
  getAllCandidatesForCounting(): Candidate[] {
    return this.candidateService.currentCandidates;
  }

  // Get unique statuses from current filtered results
  getUniqueStatuses(): string[] {
    const statuses = this.candidates.map(candidate => candidate.statut);
    return [...new Set(statuses)].sort();
  }

  // Quick filter methods for easy access
  filterByStatus(status: string): void {
    this.searchForm.patchValue({ statut: status });
  }

  filterByExperience(experienceRange: string): void {
    this.searchForm.patchValue({ experienceRange: experienceRange });
  }

  // Search criteria management
  toggleSearchCriteria(criteriaKey: string): void {
    const index = this.selectedCriteria.indexOf(criteriaKey);
    if (index > -1) {
      this.selectedCriteria.splice(index, 1);
    } else {
      this.selectedCriteria.push(criteriaKey);
    }
    
    // Trigger search if there's text in the search box
    if (this.searchForm.get('searchText')?.value) {
      this.performSearch();
    }
  }

  isCriteriaSelected(criteriaKey: string): boolean {
    return this.selectedCriteria.includes(criteriaKey);
  }

  selectAllCriteria(): void {
    this.selectedCriteria = [...this.searchCriteria.map(c => c.key)];
    if (this.searchForm.get('searchText')?.value) {
      this.performSearch();
    }
  }

  clearAllCriteria(): void {
    this.selectedCriteria = [];
    if (this.searchForm.get('searchText')?.value) {
      this.performSearch();
    }
  }

  getSelectedCriteriaLabels(): string {
    if (this.selectedCriteria.length === this.searchCriteria.length) {
      return 'All fields';
    }
    return this.selectedCriteria
      .map(key => this.searchCriteria.find(c => c.key === key)?.label)
      .filter(Boolean)
      .join(', ');
  }

  getCurrentSearchPlaceholder(): string {
    if (this.selectedCriteria.length === 0) {
      return 'Select search criteria first...';
    }
    if (this.selectedCriteria.length === 1) {
      const criteria = this.searchCriteria.find(c => c.key === this.selectedCriteria[0]);
      return criteria?.placeholder || 'Search candidates...';
    }
    return `Search by ${this.getSelectedCriteriaLabels().toLowerCase()}...`;
  }

  getCriteriaLabel(criteriaKey: string): string {
    const criteria = this.searchCriteria.find(c => c.key === criteriaKey);
    return criteria?.label || '';
  }

  getCriteriaIcon(criteriaKey: string): string {
    const criteria = this.searchCriteria.find(c => c.key === criteriaKey);
    return criteria?.icon || '';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'ACCEPTED': 'bg-green-500',
      'REJECTED': 'bg-red-500',
      'SCHEDULED': 'bg-orange-500',
      'VIVIER': 'bg-blue-500',
      'CANCELLED': 'bg-yellow-500',
      'CONTACTED': 'bg-purple-500',
      'IN_PROGRESS': 'bg-indigo-500'
    };
    return statusClasses[status] || 'bg-slate-500';
  }

  getCurrentStatusValue(): string {
    return this.searchForm.get('statut')?.value || '';
  }

  getCurrentSearchText(): string {
    return this.searchForm.get('searchText')?.value || '';
  }

  getCurrentExperienceRange(): string {
    return this.searchForm.get('experienceRange')?.value || '';
  }

  clearFormField(fieldName: string): void {
    this.searchForm.get(fieldName)?.setValue('');
  }

}