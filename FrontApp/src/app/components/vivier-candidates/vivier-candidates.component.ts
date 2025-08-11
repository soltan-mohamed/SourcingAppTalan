import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  position: string;
  type: string;
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
  
  // Component state
  isComponentInitialized = false;
  
  // State management
  isRefreshing = false;
  isMatching = false;
  isSearching = false;
  isDownloadingPDF = false;
  isDownloadingExcel = false;
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
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      searchText: [''],
      experienceRange: ['']
    });
  }

  ngOnInit(): void {
    console.log('VivierCandidatesComponent initialized - loading candidates...');
    this.isComponentInitialized = false;
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
    console.log('Loading vivier candidates...');
    this.isRefreshing = true;
    this.candidateService.getVivierCandidates().subscribe({
      next: (data: Candidate[]) => {
        console.log('Vivier candidates loaded:', data.length, 'candidates');
        this.candidates = this.transformVivierCandidates(data);
        this.allCandidates = [...this.candidates];
        this.filteredCandidates = [...this.candidates];
        this.isRefreshing = false;
        this.isComponentInitialized = true;
        
        // Force change detection to update the UI
        this.cdr.detectChanges();
        
        // Add a small delay and trigger another change detection
        setTimeout(() => {
          this.cdr.markForCheck();
        }, 100);
      },
      error: (err) => {
        console.error('Error fetching vivier candidates:', err);
        this.isRefreshing = false;
        this.isComponentInitialized = true;
        this.cdr.detectChanges();
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
          this.cdr.detectChanges(); // Force UI update
        },
        error: (error) => {
          console.error('Vivier search error:', error);
          this.filteredCandidates = [...this.allCandidates];
          this.isSearching = false;
          this.cdr.detectChanges(); // Force UI update
        }
      });
    } else {
      // No active filters - show all candidates
      this.filteredCandidates = [...this.allCandidates];
      this.isSearching = false;
      this.cdr.detectChanges(); // Force UI update
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
    const hasSearchText = formValue.searchText && formValue.searchText.trim().length > 0;
    const hasExperienceFilter = formValue.experienceRange && formValue.experienceRange.trim().length > 0;
    return hasSearchText || hasExperienceFilter;
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.searchQuery = ''; // Also clear AI search query
    this.clearMatchPercentages(); // Reset match percentages
    this.filteredCandidates = [...this.allCandidates];
    this.cdr.detectChanges(); // Force UI update
  }

  clearFormField(fieldName: string): void {
    this.searchForm.get(fieldName)?.setValue('');
    // Trigger search to update results immediately
    this.performSearch();
  }

  clearAISearch(): void {
    this.searchQuery = '';
    this.clearMatchPercentages();
    this.filteredCandidates = [...this.allCandidates];
    this.cdr.detectChanges();
  }

  onAISearchInput(event: any): void {
    // Update searchQuery when user types
    this.searchQuery = event.target.value;
    console.log('AI search query updated:', this.searchQuery);
  }

  private clearMatchPercentages(): void {
    // Reset match percentages to 0 for all candidates
    this.candidates = this.candidates.map(candidate => ({
      ...candidate,
      matchPercentage: 0
    }));
    this.allCandidates = [...this.candidates];
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

  getAISearchSummary(): string {
    const parts: string[] = [];
    
    if (this.searchQuery && this.searchQuery.trim()) {
      parts.push(`AI Requirements: "${this.searchQuery}"`);
    }
    
    const additionalSearchText = this.getCurrentSearchText();
    if (additionalSearchText) {
      parts.push(`Text Search: "${additionalSearchText}"`);
    }
    
    const experienceRange = this.getCurrentExperienceRange();
    if (experienceRange) {
      parts.push(`Experience: ${experienceRange}`);
    }
    
    if (this.selectedCriteria.length > 0 && this.selectedCriteria.length < this.searchCriteria.length) {
      parts.push(`Search Fields: ${this.getSelectedCriteriaLabels()}`);
    }
    
    // Add match results info if AI search was performed
    if (this.searchQuery && this.searchQuery.trim()) {
      const matchedCount = this.filteredCandidates.length;
      const totalCount = this.allCandidates.length;
      parts.push(`Matches: ${matchedCount}/${totalCount} candidates`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'No search criteria applied';
  }

  hasAIMatches(): boolean {
    return !!(this.searchQuery && this.searchQuery.trim().length > 0 && this.filteredCandidates.length === 0);
  }

  isAISearchActive(): boolean {
    return !!(this.searchQuery && this.searchQuery.trim().length > 0);
  }

  getNoMatchesMessage(): string {
    if (this.hasAIMatches()) {
      return `No candidates match your AI requirements: "${this.searchQuery}". Try adjusting your search criteria or requirements.`;
    }
    return '';
  }

  private transformVivierCandidates(data: Candidate[]): CandidateTableData[] {
    return data.map(candidate => ({
      ...candidate,
      fullName: `${candidate.prenom} ${candidate.nom.toUpperCase()}`,
      skills: candidate.skills || [],
      skillsDisplay: this.formatSkills(candidate.skills),
      position: this.getLatestRecruitmentPosition(candidate),
      type: this.getLastEvaluationType(candidate),
      matchPercentage: 0
    }));
  }

  private getLatestRecruitmentPosition(candidate: Candidate): string {
    if (!candidate.recrutements?.length) return 'Not Available';
    
    // Get the most recent recruitment based on date
    const latestRecruitment = candidate.recrutements
      .filter(r => r.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return latestRecruitment?.position || 'Not Available';
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
  console.log('findMatches() called with searchQuery:', this.searchQuery);
  
  if (!this.searchQuery || !this.searchQuery.trim()) {
    console.log('No search query provided - resetting to all candidates');
    this.clearMatchPercentages();
    this.filteredCandidates = [...this.allCandidates];
    this.cdr.detectChanges();
    return;
  }

  console.log('Starting AI matching for query:', this.searchQuery);
  this.isMatching = true;
  this.cdr.detectChanges();
  
  // Get current form values for additional criteria
  const formValue = this.searchForm.value;
  const additionalSearchText = formValue.searchText || '';
  const experienceRange = formValue.experienceRange || '';
  
  // Build enhanced search parameters
  const searchParams = this.buildSearchParams();
  
  const candidatesForMatching = this.candidates.map(c => ({
    id: c.id,
    prenom: c.prenom,
    nom: c.nom,
    skills: c.skills,
    experiencePeriod: typeof c.experiencePeriod === 'string' ? parseFloat(c.experiencePeriod) || 0 : (c.experiencePeriod || 0),
    email: c.email,
    telephone: c.telephone,
    position: c.position
  }));

  console.log('Sending candidates for matching:', candidatesForMatching.length);
  console.log('API URL:', this.matchingApiUrl);

  // Enhanced request body with additional criteria
  const requestBody = {
    requirements: this.searchQuery,
    candidates: candidatesForMatching,
    include_details: true,
    // Additional search criteria
    additional_criteria: {
      search_text: additionalSearchText,
      search_criteria: this.selectedCriteria,
      experience_requirements: {
        min_experience: searchParams.minExperience,
        max_experience: searchParams.maxExperience,
        experience_range_label: experienceRange
      },
      search_fields: this.selectedCriteria.length > 0 ? this.selectedCriteria : ['name', 'email', 'phone', 'position', 'skills']
    }
  };

  console.log('Enhanced request body with additional criteria:', requestBody);

  this.http.post(this.matchingApiUrl, requestBody).subscribe({
    next: (response: any) => {
      console.log('AI matching response received:', response);
      const matches = response.matches || [];
      
      if (matches.length === 0) {
        console.warn('No matches returned from AI service');
      }
      
      // Update both candidates and filteredCandidates arrays
      this.candidates = this.candidates.map(candidate => {
        const match = matches.find((m: any) => m.id === candidate.id);
        const matchPercentage = match ? match.match_percentage : 0;
        console.log(`Candidate ${candidate.fullName}: ${matchPercentage}% match`);
        return {
          ...candidate,
          matchPercentage: matchPercentage
        };
      });
      
      // Update allCandidates as well to maintain consistency
      this.allCandidates = [...this.candidates];
      
      // Filter candidates based on additional criteria if any, then sort by match percentage
      let resultCandidates = [...this.candidates];
      
      // Apply experience filter if specified
      if (searchParams.minExperience !== undefined || searchParams.maxExperience !== undefined) {
        resultCandidates = resultCandidates.filter(candidate => {
          const experienceValue = candidate.experiencePeriod || 0;
          // Convert experience to number if it's a string
          const experience = typeof experienceValue === 'string' ? parseFloat(experienceValue) || 0 : experienceValue;
          const meetsMin = searchParams.minExperience === undefined || experience >= searchParams.minExperience;
          const meetsMax = searchParams.maxExperience === undefined || experience <= searchParams.maxExperience;
          return meetsMin && meetsMax;
        });
      }
      
      // Apply text search filter if specified
      if (additionalSearchText && additionalSearchText.trim()) {
        const searchText = additionalSearchText.toLowerCase().trim();
        resultCandidates = resultCandidates.filter(candidate => {
          return this.selectedCriteria.some(criteria => {
            switch (criteria) {
              case 'name':
                return candidate.fullName?.toLowerCase().includes(searchText);
              case 'email':
                return candidate.email?.toLowerCase().includes(searchText);
              case 'phone':
                return candidate.telephone?.toLowerCase().includes(searchText);
              case 'position':
                return candidate.position?.toLowerCase().includes(searchText);
              case 'skills':
                return candidate.skills?.some(skill => skill.toLowerCase().includes(searchText));
              default:
                return false;
            }
          });
        });
      }
      
      // Sort by match percentage (highest first)
      this.filteredCandidates = resultCandidates
        .filter(candidate => candidate.matchPercentage && candidate.matchPercentage > 0) // Only show candidates with actual matches
        .sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      
      this.isMatching = false;
      this.cdr.detectChanges();
      
      console.log('AI matching completed with additional criteria. Results updated.');
      console.log(`Filtered to ${this.filteredCandidates.length} candidates with matches from ${this.candidates.length} total`);
      
      // Log how many candidates had 0% match
      const zeroMatchCount = resultCandidates.filter(c => !c.matchPercentage || c.matchPercentage === 0).length;
      console.log(`${zeroMatchCount} candidates had 0% match and were filtered out`);
    },
    error: (err) => {
      console.error('AI matching error:', err);
      console.error('Error details:', {
        status: err.status,
        statusText: err.statusText,
        message: err.message,
        url: err.url
      });
      
      this.isMatching = false;
      this.cdr.detectChanges();
      
      // Show error message or fallback behavior
      if (err.status === 0) {
        console.error('AI service is not reachable. Please make sure the AI service is running on port 5000.');
        alert('AI service is not available. Please make sure the AI service is running.');
      } else {
        console.error('AI service error:', err.error);
        alert(`AI service error: ${err.error?.error || 'Unknown error'}`);
      }
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

  // Download methods
  downloadPDF(): void {
    console.log('Downloading Vivier Candidates PDF...');
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
          doc.rect(0, 0, 210, 50, 'F');
          
          // Add company logo
          // Create an image element to load the logo
          const logoImg = new Image();
          logoImg.onload = () => {
            try {
              // Add the logo to the PDF with better positioning and size
              doc.addImage(logoImg, 'PNG', 15, 12, 25, 16);
              
              console.log('Logo loaded and added successfully');
            } catch (logoError: any) {
              console.warn('Error adding logo image:', logoError);
              // Add text placeholder if image fails
              this.addLogoPlaceholder(doc, primaryColor);
            }
            
            // Continue with the rest of the PDF generation
            this.completePDFGeneration(doc, autoTable, primaryColor, secondaryColor, accentColor);
          };
          logoImg.onerror = () => {
            console.warn('Logo failed to load, trying alternative logo...');
            // Try alternative logo
            const logoImg2 = new Image();
            logoImg2.onload = () => {
              try {
                // Add the alternative logo to the PDF
                doc.addImage(logoImg2, 'PNG', 15, 12, 25, 16);
                console.log('Alternative logo loaded and added successfully');
              } catch (logoError: any) {
                console.warn('Error adding alternative logo image:', logoError);
                this.addLogoPlaceholder(doc, primaryColor);
              }
              this.completePDFGeneration(doc, autoTable, primaryColor, secondaryColor, accentColor);
            };
            logoImg2.onerror = () => {
              console.warn('Alternative logo also failed, adding text placeholder');
              this.addLogoPlaceholder(doc, primaryColor);
              this.completePDFGeneration(doc, autoTable, primaryColor, secondaryColor, accentColor);
            };
            logoImg2.src = 'assets/images/talan-logo1.png';
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
    console.log('Downloading Vivier Candidates Excel...');
    this.isDownloadingExcel = true;
    
    try {
      // Dynamic import to reduce bundle size
      import('xlsx').then((XLSX) => {
        // Prepare data for Excel
        const data = this.filteredCandidates.map((candidate: any) => ({
          'Name': candidate.fullName || `${candidate.prenom} ${candidate.nom}`,
          'Match %': candidate.matchPercentage ? `${candidate.matchPercentage}%` : '0%',
          'Skills': candidate.skillsDisplay || 'No skills listed',
          'Years of Experience': candidate.experiencePeriod || '',
          'Phone': candidate.telephone || '',
          'Email': candidate.email || '',
          'Position': candidate.position || 'Not available',
          'Status': candidate.statut || '',
          'Type': candidate.type || '-',
          'Date Created': candidate.dateCreation ? new Date(candidate.dateCreation).toLocaleDateString() : '',
          'Recruiter': candidate.responsable ? 
            candidate.responsable.fullName || 'Unknown' : 'Not assigned'
        }));
        
        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        
        // Set column widths
        const columnWidths = [
          { wch: 20 }, // Name
          { wch: 10 }, // Match %
          { wch: 15 }, // Skills
          { wch: 20 }, // Experience
          { wch: 10 }, // Phone
          { wch: 30 }, // Email
          { wch: 20 }, // Position
          { wch: 15 }, // Status
          { wch: 10 }, // Type
          { wch: 15 }, // Date Created
          { wch: 20 }  // Responsible
        ];
        
        worksheet['!cols'] = columnWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vivier Candidates');
        
        // Save the Excel file
        const fileName = `vivier_candidates_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    doc.text('VIVIER CANDIDATES REPORT', 65, 20);
    
    // Add subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Talent Pool - Available Candidates', 65, 30);
    
    // Add generation info
    doc.setFontSize(10);
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated on: ${currentDate}`, 65, 40);
    
    // Add decorative line
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(2);
    doc.line(14, 55, 196, 55);
    
    // Add summary statistics
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY STATISTICS', 14, 70);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Vivier Candidates: ${this.filteredCandidates.length}`, 14, 80);
    
    // Calculate status distribution for vivier candidates
    const statusStats = this.filteredCandidates.reduce((acc: any, candidate: any) => {
      const status = candidate.statut || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    let yPos = 87;
    Object.entries(statusStats).forEach(([status, count]: [string, any]) => {
      doc.text(`${this.getStatusDisplayName(status)}: ${count}`, 14, yPos);
      yPos += 7;
    });
    
    // Add AI search info if active
    if (this.isAISearchActive()) {
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('AI MATCHING RESULTS', 14, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Search Query: "${this.searchQuery}"`, 14, yPos);
      yPos += 7;
      
      // Show match percentage distribution
      const highMatches = this.filteredCandidates.filter(c => (c.matchPercentage || 0) >= 80).length;
      const mediumMatches = this.filteredCandidates.filter(c => (c.matchPercentage || 0) >= 50 && (c.matchPercentage || 0) < 80).length;
      const lowMatches = this.filteredCandidates.filter(c => (c.matchPercentage || 0) > 0 && (c.matchPercentage || 0) < 50).length;
      
      doc.text(`High Match (≥80%): ${highMatches}`, 14, yPos);
      yPos += 7;
      doc.text(`Medium Match (50-79%): ${mediumMatches}`, 14, yPos);
      yPos += 7;
      doc.text(`Low Match (1-49%): ${lowMatches}`, 14, yPos);
      yPos += 7;
    }
    
    // Prepare table data
    const headers = [
      'Name', 'Match %', 'Skills', 'Experience', 'Phone', 'Email', 'Position', 'Status'
    ];
    
    const data = this.filteredCandidates.map((candidate: any) => [
      candidate.fullName || `${candidate.prenom} ${candidate.nom}`,
      candidate.matchPercentage ? `${candidate.matchPercentage}%` : '0%',
      this.truncateText(candidate.skillsDisplay || 'No skills', 25),
      candidate.experiencePeriod || '',
      candidate.telephone || '',
      candidate.email || '',
      this.truncateText(candidate.position || 'Not available', 20),
      this.getStatusDisplayName(candidate.statut) || ''
    ]);
    
    console.log('Table data prepared, adding table...');
    
    // Calculate table start position
    const tableStartY = Math.max(yPos + 15, 120);
    
    // Use autoTable function directly - same style as candidates component
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: tableStartY,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: primaryColor as [number, number, number],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        minCellHeight: 10
      },
      bodyStyles: {
        textColor: [60, 60, 60],
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { cellWidth: 24, halign: 'left', overflow: 'linebreak' }, // Name
        1: { cellWidth: 20, halign: 'center' }, // Match %
        2: { cellWidth: 22, halign: 'left', overflow: 'linebreak' }, // Skills
        3: { cellWidth: 18, halign: 'center' }, // Experience
        4: { cellWidth: 22, halign: 'center', overflow: 'linebreak' }, // Phone
        5: { cellWidth: 35, halign: 'left', overflow: 'linebreak' }, // Email
        6: { cellWidth: 25, halign: 'left', overflow: 'linebreak' }, // Position
        7: { cellWidth: 20, halign: 'center' } // Status
      },
      margin: { left: 14, right: 14 },
      pageBreak: 'auto',
      tableWidth: 'wrap',
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
    const fileName = `vivier_candidates_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('PDF downloaded successfully');
    this.isDownloadingPDF = false;
  }

  private addLogoPlaceholder(doc: any, primaryColor: number[]): void {
    // Add a styled background for the text placeholder
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 10, 20, 20, 2, 2, 'F');
    
    // Add border
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.roundedRect(15, 10, 20, 20, 2, 2, 'S');
    
    // Add company name
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TALAN', 25, 18, { align: 'center' });
    
    // Add subtitle
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('HR System', 25, 23, { align: 'center' });
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }

  // Helper method for status handling (similar to candidates component)
  private getStatusDisplayName(status: string): string {
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
}