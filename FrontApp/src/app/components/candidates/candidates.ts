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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateCandidat } from '../create-candidat/create-candidat';
import { CandidatesService } from 'app/services/candidates-service';
import { Candidate } from 'app/models/candidate';
import { UsersService } from 'app/services/users-service';
import { User } from 'app/models/user';
import { InterviewStateService } from 'app/services/interview-state';
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
    MatCheckboxModule,
    MatTooltipModule
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
  isDownloadingPDF = false;
  isDownloadingExcel = false;
  
  private candidatesSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  private interviewUpdateSubscription: Subscription = new Subscription();
  currentUser : any;

  constructor(
    private dialog: MatDialog,
    private candidateService : CandidatesService,
    private userService : UsersService,
    private interviewStateService: InterviewStateService,
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
    this.setupInterviewUpdateListener();
    
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
              let candidateStatus = candidate.statut; // Start with the stored status
              
              if (candidate.recrutements?.length > 0) {
                const allRecrutements = candidate.recrutements
                    .flatMap(r => r || [])
                    .filter(r => r.date)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const lastRecrutement = allRecrutements[0];

                if (lastRecrutement) {
                  position = lastRecrutement.position;
                  
                  const allEvaluations = lastRecrutement.evaluations
                    .flatMap(r => r || [])
                    .filter(e => e.date) // On garde uniquement celles avec une date
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  // Check if any interview is currently IN_PROGRESS
                  const hasInProgressInterview = allEvaluations.some(evaluation => evaluation.statut === 'IN_PROGRESS');
                  const hasScheduledInterview = allEvaluations.some(evaluation => evaluation.statut === 'SCHEDULED');
                  
                  if (hasInProgressInterview) {
                    candidateStatus = 'IN_PROGRESS';
                  } else if (hasScheduledInterview && candidateStatus !== 'IN_PROGRESS') {
                    // Only update to SCHEDULED if no in-progress interviews and current status allows it
                    if (candidateStatus === 'CONTACTED' || candidateStatus === 'SCHEDULED') {
                      candidateStatus = 'SCHEDULED';
                    }
                  }

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
              }

              return {
                ...candidate,
                name,
                type,
                statut: candidateStatus, // Use the computed status instead of candidate.statut
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

  setupInterviewUpdateListener(): void {
    this.interviewUpdateSubscription = this.interviewStateService.interviewUpdated$.subscribe(
      (updatedEvaluation) => {
        console.log('🔄 Candidates component received interview update notification:', updatedEvaluation);
        
        // Handle candidate status synchronization with interview status
        this.handleCandidateStatusSync(updatedEvaluation);
        
        // When an interview status changes, we need to refresh the candidates list
        // because candidate statuses might be affected by their interview statuses
        if (this.hasActiveFilters()) {
          console.log('📋 Refreshing candidates with current filters after interview update');
          this.performSearch();
        } else {
          console.log('📋 Refreshing all candidates after interview update');
          this.loadCandidates();
        }
      }
    );
  }

  handleCandidateStatusSync(updatedEvaluation: any): void {
    if (!updatedEvaluation || !updatedEvaluation.idCandidate) {
      console.warn('⚠️ No candidate ID found in interview update, skipping status sync');
      return;
    }

    const candidateId = updatedEvaluation.idCandidate;
    const interviewStatus = updatedEvaluation.statut;
    
    console.log(`🔄 Syncing candidate ${candidateId} status based on interview status: ${interviewStatus}`);

    // First, fetch the latest candidate data from the server to ensure we have accurate information
    this.candidateService.fetchCandidateById(candidateId).subscribe({
      next: (candidate) => {
        this.determineAndUpdateCandidateStatus(candidate, interviewStatus);
      },
      error: (error) => {
        console.error(`❌ Failed to fetch candidate ${candidateId} for status sync:`, error);
        // Fallback to refreshing the entire list
        if (this.hasActiveFilters()) {
          this.performSearch();
        } else {
          this.loadCandidates();
        }
      }
    });
  }

  determineAndUpdateCandidateStatus(candidate: any, triggeredByInterviewStatus: string): void {
    if (!candidate || !candidate.recrutements?.length) {
      console.log(`ℹ️ Candidate ${candidate?.id} has no recruitments, keeping original status`);
      return;
    }

    console.log(`🔍 Analyzing all interviews for candidate ${candidate.id}`);

    // Get all evaluations across all recruitments
    const allEvaluations = candidate.recrutements
      .flatMap((r: any) => r?.evaluations || [])
      .filter((e: any) => e?.date) // Only consider evaluations with dates
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!allEvaluations.length) {
      console.log(`ℹ️ Candidate ${candidate.id} has no evaluations, keeping original status`);
      return;
    }

    // Check the current status of all interviews
    const hasInProgressInterview = allEvaluations.some((e: any) => e.statut === 'IN_PROGRESS');
    const hasScheduledInterview = allEvaluations.some((e: any) => e.statut === 'SCHEDULED');
    const allCompletedOrCancelled = allEvaluations.every((e: any) => 
      e.statut === 'COMPLETED' || e.statut === 'CANCELLED' || e.statut === 'REJECTED' || e.statut === 'ACCEPTED'
    );

    let newCandidateStatus = candidate.statut; // Start with current status

    // Determine the correct candidate status based on interview states
    if (hasInProgressInterview) {
      // If any interview is in progress, candidate should be IN_PROGRESS
      newCandidateStatus = 'IN_PROGRESS';
    } else if (hasScheduledInterview) {
      // If no interviews are in progress but some are scheduled
      // Update to SCHEDULED only if current status allows it
      if (candidate.statut === 'CONTACTED' || candidate.statut === 'IN_PROGRESS' || candidate.statut === 'SCHEDULED') {
        newCandidateStatus = 'SCHEDULED';
      }
    } else if (allCompletedOrCancelled && candidate.statut === 'IN_PROGRESS') {
      // If all interviews are completed/cancelled and candidate was IN_PROGRESS
      // Revert to CONTACTED (they can be contacted for new opportunities)
      newCandidateStatus = 'CONTACTED';
    }

    console.log(`� Interview analysis for candidate ${candidate.id}:`);
    console.log(`   - Has IN_PROGRESS interviews: ${hasInProgressInterview}`);
    console.log(`   - Has SCHEDULED interviews: ${hasScheduledInterview}`);
    console.log(`   - All completed/cancelled: ${allCompletedOrCancelled}`);
    console.log(`   - Current status: ${candidate.statut}`);
    console.log(`   - Proposed new status: ${newCandidateStatus}`);
    console.log(`   - Triggered by interview status: ${triggeredByInterviewStatus}`);

    // Only update if the status actually needs to change
    if (newCandidateStatus !== candidate.statut) {
      console.log(`✅ Updating candidate ${candidate.id} database status from ${candidate.statut} to ${newCandidateStatus}`);
      
      const candidateUpdate = {
        statut: newCandidateStatus
      };

      this.candidateService.updateCandidate(candidate.id, candidateUpdate).subscribe({
        next: (updatedCandidate) => {
          console.log(`✅ Successfully updated candidate ${candidate.id} database status to ${newCandidateStatus}`);
          
          // Refresh the candidates list to reflect the database changes
          if (this.hasActiveFilters()) {
            this.performSearch();
          } else {
            this.loadCandidates();
          }
        },
        error: (error) => {
          console.error(`❌ Failed to update candidate ${candidate.id} database status:`, error);
          // If update fails, still refresh the list to show current server state
          if (this.hasActiveFilters()) {
            this.performSearch();
          } else {
            this.loadCandidates();
          }
        }
      });
    } else {
      console.log(`ℹ️ Candidate ${candidate.id} database status already matches expected status: ${newCandidateStatus}`);
    }
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
    this.interviewUpdateSubscription.unsubscribe();
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
      'VIVIER': 'Vivier',
      'pending': 'Pending',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'interview': 'Interview',
      'shortlisted': 'Shortlisted',
      'onhold': 'On Hold',
      'withdrawn': 'Withdrawn'
    };
    return statusMap[status?.toLowerCase()] || statusMap[status] || status || 'Unknown';
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

  // Download methods
  downloadPDF(): void {
    console.log('Downloading PDF...');
    this.isDownloadingPDF = true;
    
    try {
      // Dynamic import to reduce bundle size - load both libraries together
      Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]).then(([jsPDFModule, autoTableModule]) => {
        console.log('Both PDF libraries loaded successfully');
        
        try {
          // Use the default export and explicitly import autoTable
          const jsPDF = jsPDFModule.default;
          const autoTable = autoTableModule.default;
          
          const doc = new jsPDF();
          
          // Set up colors
          const primaryColor = [63, 81, 181]; // Material Blue
          const secondaryColor = [156, 172, 183]; // Light Gray
          const accentColor = [139, 195, 74]; // Light Green
          
          // Add header background
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(0, 0, 210, 45, 'F');
          
          // Add company logo
          // Create an image element to load the logo
          const logoImg = new Image();
          logoImg.onload = () => {
            // Add the logo to the PDF
            doc.addImage(logoImg, 'PNG', 14, 8, 30, 15);
            
            // Continue with the rest of the PDF generation
            this.completePDFGeneration(doc, autoTable, primaryColor, secondaryColor, accentColor);
          };
          logoImg.onerror = () => {
            // If logo fails to load, continue without it - add placeholder text
            doc.setFillColor(255, 255, 255);
            doc.rect(14, 8, 30, 15, 'F');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('TALAN', 16, 18);
            
            console.warn('Logo failed to load, continuing with text placeholder');
            this.completePDFGeneration(doc, autoTable, primaryColor, secondaryColor, accentColor);
          };
          logoImg.src = 'assets/images/talan-logo2.png';
        } catch (tableError: any) {
          console.error('Error creating PDF table:', tableError);
          this.isDownloadingPDF = false;
          alert(`Error creating PDF table: ${tableError?.message || 'Unknown error'}`);
        }
      }).catch((importError: any) => {
        console.error('Error importing PDF libraries:', importError);
        this.isDownloadingPDF = false;
        alert(`Error loading PDF libraries: ${importError?.message || 'Please try again.'}`);
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      this.isDownloadingPDF = false;
      alert(`Error generating PDF: ${error?.message || 'Please make sure the required libraries are installed.'}`);
    }
  }

  downloadExcel(): void {
    console.log('Downloading Excel...');
    this.isDownloadingExcel = true;
    
    try {
      // Dynamic import to reduce bundle size
      import('xlsx').then((XLSX) => {
        // Prepare data for Excel
        const data = this.candidates.map((candidate: any) => ({
          'Name': candidate.name || `${candidate.prenom} ${candidate.nom}`,
          'Phone': candidate.telephone || '',
          'Email': candidate.email || '',
          'Position': candidate.position || 'Not available',
          'Years of Experience': candidate.experiencePeriod || '',
          'Status': candidate.statut || '',
          'Type': candidate.type || 'Not yet',
          'Date Created': candidate.dateCreation ? new Date(candidate.dateCreation).toLocaleDateString() : '',
          'Recruiter': candidate.responsable ? 
            candidate.responsable.fullName || 'Unknown' : 'Not assigned'
        }));
        
        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        
        // Set column widths
        const columnWidths = [
          { wch: 25 }, // Name
          { wch: 15 }, // Phone
          { wch: 30 }, // Email
          { wch: 20 }, // Position
          { wch: 20 }, // Experience
          { wch: 15 }, // Status
          { wch: 10 }, // Type
          { wch: 15 }, // Date Created
          { wch: 20 }  // Responsible
        ];
        
        worksheet['!cols'] = columnWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
        
        // Save the Excel file
        const fileName = `candidates_list_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        console.log('Excel file downloaded successfully');
        this.isDownloadingExcel = false;
      }).catch((error) => {
        console.error('Error importing XLSX:', error);
        this.isDownloadingExcel = false;
        alert('Error loading Excel library. Please try again.');
      });
    } catch (error) {
      console.error('Error generating Excel file:', error);
      this.isDownloadingExcel = false;
      alert('Error generating Excel file. Please make sure the required libraries are installed.');
    }
  }

  private completePDFGeneration(doc: any, autoTable: any, primaryColor: number[], secondaryColor: number[], accentColor: number[]): void {
    // Add title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CANDIDATES REPORT', 60, 20);
    
    // Add subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprehensive List of All Candidates', 60, 30);
    
    // Add generation info
    doc.setFontSize(10);
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated on: ${currentDate}`, 60, 38);
    
    // Add decorative line
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(2);
    doc.line(14, 50, 196, 50);
    
    // Add summary statistics
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY STATISTICS', 14, 65);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Candidates: ${this.candidates.length}`, 14, 75);
    
    // Calculate status distribution
    const statusStats = this.candidates.reduce((acc: any, candidate: any) => {
      const status = candidate.statut || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    let yPos = 82;
    Object.entries(statusStats).forEach(([status, count]: [string, any]) => {
      doc.text(`${this.getStatusDisplayName(status)}: ${count}`, 14, yPos);
      yPos += 7;
    });
    
    // Prepare table data
    const headers = [
      'Name', 'Phone', 'Email', 'Position', 'Experience', 'Status', 'Type', 'Recruiter'
    ];
    
    const data = this.candidates.map((candidate: any) => [
      candidate.name || `${candidate.prenom} ${candidate.nom}`,
      candidate.telephone || '',
      candidate.email || '',
      candidate.position || 'Not available',
      candidate.experiencePeriod || '',
      this.getStatusDisplayName(candidate.statut) || '',
      candidate.type || 'Not yet',
      candidate.responsable ? 
        candidate.responsable.fullName || 'Unknown' : 'Not assigned'
    ]);
    
    console.log('Table data prepared, adding table...');
    
    // Calculate table start position
    const tableStartY = Math.max(yPos + 15, 110);
    
    // Use autoTable function directly
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: tableStartY,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: primaryColor as [number, number, number],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [60, 60, 60]
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'left' }, // Name
        1: { cellWidth: 20, halign: 'center' }, // Phone
        2: { cellWidth: 30, halign: 'left' }, // Email
        3: { cellWidth: 22, halign: 'left' }, // Position
        4: { cellWidth: 25, halign: 'center' }, // Experience
        5: { cellWidth: 19, halign: 'center' }, // Status
        6: { cellWidth: 16, halign: 'center' }, // Type
        7: { cellWidth: 20, halign: 'left' }  // Recruiter
      },
      margin: { left: 14, right: 14 },
      pageBreak: 'auto',
      tableWidth: 'auto',
      didDrawPage: (data: any) => {
        // Add footer to each page
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
        
        // Footer line
        doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setLineWidth(0.5);
        doc.line(14, pageHeight - 20, 196, pageHeight - 20);
        
        // Footer text
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Talan - HR Management System', 14, pageHeight - 12);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, 196, pageHeight - 12, { align: 'right' });
        doc.text(`Generated on ${currentDate}`, 105, pageHeight - 12, { align: 'center' });
      }
    });
    
    console.log('Table added successfully, saving PDF...');
    
    // Save the PDF
    const fileName = `candidates_list_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('PDF downloaded successfully');
    this.isDownloadingPDF = false;
  }

}