import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { FeatherModule } from 'angular-feather';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { AddInterviewComponent } from './add-interview/add-interview';
import { EditInterviewComponent } from './edit-interview/edit-interview';
import { CandidateHistory } from '../candidate-history/candidate-history';
import { Evaluation } from 'app/models/evaluation';
import { Candidate } from 'app/models/candidate';
import { InterviewService } from 'app/services/interview-service';
import { CandidatesService } from 'app/services/candidates-service';
import { AuthService } from '@core/service/auth.service';
import { InterviewStateService } from 'app/services/interview-state';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, 
    MatIconModule, 
    MatInputModule, 
    FormsModule,
    MatTooltipModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule,
    FeatherModule,
    MatDialogModule
  ],
  templateUrl: './interviews.html',
  styleUrls: ['./interviews.scss']
})
export class InterviewsComponent implements OnInit {
  
  searchDate: string = '';
  searchCandidate: string = '';
  selectedType: string = '';
  selectedDaysLeftStatus: string = '';
  
  displayedColumns: string[] = ['candidate', 'date', 'time', 'type','position','evaluator','days left','actions'];
  selection = new SelectionModel<Evaluation>(true, []);
  interviews: Evaluation[] = [];

  get dataSource() {
    let filteredInterviews = this.interviews;
    
    // Search by candidate name (nom, prenom, or fullName)
    if (this.searchCandidate && this.searchCandidate.trim()) {
      const searchTerm = this.searchCandidate.toLowerCase().trim();
      console.log('Searching for candidate:', searchTerm);
      console.log('Total interviews to search:', this.interviews.length);
      
      filteredInterviews = filteredInterviews.filter(i => {
        // Get the candidate name using the same logic as the template
        const candidateDisplayName = i.recrutement?.candidate?.fullName || 
                                     (i as any).candidateName || 
                                     (i as any).candidate?.fullName || 
                                     ((i as any).candidate?.nom && (i as any).candidate?.prenom ? 
                                      `${(i as any).candidate.nom} ${(i as any).candidate.prenom}` : null) || '';
        
        console.log('Checking candidate:', candidateDisplayName);
        
        if (!candidateDisplayName || candidateDisplayName === 'N/A') {
          return false;
        }
        
        const candidateFullName = candidateDisplayName.toLowerCase();
        
        // Split fullName to extract potential nom and prenom
        const nameParts = candidateFullName.split(' ').filter((part: string) => part.length > 0);
        let firstName = '';
        let lastName = '';
        
        if (nameParts.length >= 2) {
          // Assume first part is prenom, last part is nom
          firstName = nameParts[0]; // prenom
          lastName = nameParts[nameParts.length - 1]; // nom
        }
        
        // Search in fullName and name parts
        const matches = candidateFullName.includes(searchTerm) ||
               firstName.includes(searchTerm) ||
               lastName.includes(searchTerm) ||
               nameParts.some((part: string) => part.includes(searchTerm)) ||
               // Check if search term matches any combination of name parts
               (firstName && lastName && 
                `${firstName} ${lastName}`.includes(searchTerm)) ||
               (firstName && lastName && 
                `${lastName} ${firstName}`.includes(searchTerm));
        
        if (matches) {
          console.log('Match found for:', candidateDisplayName, 'with parts:', { firstName, lastName });
        }
        
        return matches;
      });
      
      console.log(`Candidate search results: ${filteredInterviews.length} matches found`);
    }
    
    // Search by date (flexible date matching)
    if (this.searchDate && this.searchDate.trim()) {
      const searchDateTerm = this.searchDate.trim();
      filteredInterviews = filteredInterviews.filter(i => {
        if (!i.date) return false;
        
        const interviewDate = new Date(i.date);
        const dateString = interviewDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const formattedDate = this.formatDate(interviewDate); // DD/MM/YYYY format
        
        return dateString.includes(searchDateTerm) ||
               formattedDate.includes(searchDateTerm) ||
               i.date.toString().includes(searchDateTerm);
      });
    }
    
    // Search by interview type
    if (this.selectedType && this.selectedType.trim()) {
      filteredInterviews = filteredInterviews.filter(i => {
        if (!i.type) return false;
        
        // Case-insensitive comparison
        const interviewType = i.type.toLowerCase();
        const selectedType = this.selectedType.toLowerCase();
        
        return interviewType === selectedType ||
               interviewType.includes(selectedType) ||
               selectedType.includes(interviewType);
      });
    }
    
    // Search by days left status (color)
    if (this.selectedDaysLeftStatus && this.selectedDaysLeftStatus.trim()) {
      filteredInterviews = filteredInterviews.filter(i => {
        if (!i.date) return false;
        
        const colorStatus = this.getDaysLeftColorStatus(i.date);
        return colorStatus === this.selectedDaysLeftStatus;
      });
    }
    
    return filteredInterviews;
  }

  // Helper method to format date as DD/MM/YYYY
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Helper method to get days left color status
  private getDaysLeftColorStatus(date: string): string {
    const daysLeft = this.calculateDaysLeftNumber(date);
    
    if (daysLeft > 10) {
      return 'green';
    } else if (daysLeft >= 5) {
      return 'orange';
    } else {
      return 'red';
    }
  }

  // Helper method to calculate days left as number
  private calculateDaysLeftNumber(date: string): number {
    const interviewDate = new Date(date);
    const today = new Date();
    const timeDiff = interviewDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  constructor(
    private dialog: MatDialog,
    private interviewService: InterviewService,
    private candidatesService: CandidatesService,
    private authService: AuthService, 
    private interviewStateService: InterviewStateService
  ) {}

  // Method to add a new interview
  addInterview(): void {
    const dialogRef = this.dialog.open(AddInterviewComponent, {
      panelClass: 'add-interview-dialog-panel',
      width: '600px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.interviews.push(result);
        console.log('New interview added:', result);
      }
    });
  }

  // Method to search interviews (triggers dataSource getter)
  searchInterviews(): void {
    // The search is already handled by the dataSource getter
    // This method can be used for additional search logic if needed
    console.log('Searching interviews with filters:', {
      searchCandidate: this.searchCandidate,
      searchDate: this.searchDate,
      selectedType: this.selectedType,
      selectedDaysLeftStatus: this.selectedDaysLeftStatus
    });
    
    // Debug: show available candidates in interviews
    if (this.searchCandidate && this.searchCandidate.trim()) {
      console.log('Available candidates in interviews:');
      this.interviews.forEach((interview, index) => {
        const candidateName = interview.recrutement?.candidate?.fullName || 
                             (interview as any).candidateName || 
                             (interview as any).candidate?.fullName || 'N/A';
        console.log(`${index + 1}. ${candidateName}`);
      });
    }
    
    const filteredCount = this.dataSource.length;
    const totalCount = this.interviews.length;
    
    console.log(`Search results: ${filteredCount} of ${totalCount} interviews found`);
  }

  // Method to clear all search filters
  clearSearch(): void {
    this.searchCandidate = '';
    this.searchDate = '';
    this.selectedType = '';
    this.selectedDaysLeftStatus = '';
    
    console.log('Search filters cleared');
    console.log(`Showing all ${this.interviews.length} interviews`);
  }

  // Method to get color for interview type chips
  getTypeColor(type: string): string {
    switch (type) {
      case 'Technical':
        return 'primary';
      case 'HR':
        return 'accent';
      case 'Final':
        return 'warn';
      default:
        return 'primary';
    }
  }

  // Method to get CSS class for days left styling
  getDaysLeftClass(date: string | Date): string {
    const daysLeft = this.calculateDaysLeftNumber(typeof date === 'string' ? date : date.toISOString());
    
    if (daysLeft > 10) {
      return 'days-green'; // More than 10 days - green
    } else if (daysLeft >= 5) {
      return 'days-orange'; // 5-10 days - orange
    } else {
      return 'days-red'; // Less than 5 days - red
    }
  }

  // Method to delete an interview
  deleteInterview(interview: Evaluation): void {
    if (confirm('Are you sure you want to delete this interview?')) {
      // Since deleteEvaluation method doesn't exist, we'll implement it locally
      // or you can add the method to the service
      console.log('Delete functionality needs to be implemented in the service');
      
      // For now, just remove from local array
      this.interviews = this.interviews.filter(i => i.id !== interview.id);
      console.log('Interview removed from local list');
      
      // TODO: Add actual delete API call when service method is available
      // this.interviewService.deleteEvaluation(interview.id).subscribe({
      //   next: () => {
      //     this.interviews = this.interviews.filter(i => i.id !== interview.id);
      //     console.log('Interview deleted successfully');
      //   },
      //   error: (err: any) => {
      //     console.error('Failed to delete interview:', err);
      //   }
      // });
    }
  }

  // Method to view interview details
  viewDetails(interview: Evaluation): void {
    console.log('Clicked View Details for interview:', interview);
    
    // Extract the candidate name using the same logic as the template
    const candidateDisplayName = interview.recrutement?.candidate?.fullName || 
                                 (interview as any).candidateName || 
                                 (interview as any).candidate?.fullName || 
                                 ((interview as any).candidate?.nom && (interview as any).candidate?.prenom ? 
                                  `${(interview as any).candidate.nom} ${(interview as any).candidate.prenom}` : null);
    
    console.log('Candidate display name from template logic:', candidateDisplayName);
    
    if (candidateDisplayName && candidateDisplayName !== 'N/A') {
      // Fetch all candidates to find the complete candidate data
      console.log('Fetching all candidates to find:', candidateDisplayName);
      this.candidatesService.getAllCandidates().subscribe({
        next: (candidates) => {
          console.log('Total candidates fetched:', candidates.length);
          console.log('First few candidates:', candidates.slice(0, 3).map(c => ({ id: c.id, nom: c.nom, prenom: c.prenom })));
          
          // Try multiple matching strategies
          let foundCandidate = candidates.find(c => {
            const fullName = `${c.prenom} ${c.nom}`;
            return fullName === candidateDisplayName ||
                   fullName.toLowerCase() === candidateDisplayName.toLowerCase() ||
                   (c.nom === candidateDisplayName.split(' ')[0] && c.prenom === candidateDisplayName.split(' ')[1]);
          });
          
          if (!foundCandidate) {
            // Try partial matching
            foundCandidate = candidates.find(c => {
              const fullName = `${c.prenom} ${c.nom}`.toLowerCase();
              const searchName = candidateDisplayName.toLowerCase();
              return fullName.includes(searchName) || searchName.includes(fullName);
            });
          }
          
          if (foundCandidate) {
            console.log('Found candidate:', foundCandidate);
            this.openCandidateHistoryDialog(foundCandidate);
          } else {
            console.log('Candidate not found in list. Available candidates:');
            candidates.forEach((c, index) => {
              if (index < 10) { // Show first 10 for debugging
                console.log(`${index}: ${c.prenom} ${c.nom} (ID: ${c.id})`);
              }
            });
            alert(`Candidate "${candidateDisplayName}" not found in the candidates list. This might be a data synchronization issue.`);
          }
        },
        error: (error) => {
          console.error('Error fetching candidates:', error);
          alert('Failed to load candidate information. Please try again.');
        }
      });
    } else {
      // Enhanced debugging for missing candidate info
      console.log('No candidate information found in interview');
      console.log('Interview structure:', {
        id: interview.id,
        recrutement: interview.recrutement,
        hasRecrutement: !!interview.recrutement,
        hasCandidate: !!interview.recrutement?.candidate,
        candidateId: interview.recrutement?.candidate?.id,
        candidateFullName: interview.recrutement?.candidate?.fullName,
        fullInterviewData: interview
      });
      alert('No candidate information available for this interview.');
    }
  }

  // Helper method to open candidate history dialog directly in interviews component
  private openCandidateHistoryDialog(candidateData: any): void {
    const dialogRef = this.dialog.open(CandidateHistory, {
      width: '95vw',
      maxWidth: '1400px',
      height: '90vh',
      maxHeight: '900px',
      disableClose: false,
      panelClass: 'candidate-history-dialog',
      data: candidateData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Candidate history dialog closed');
      if (result?.statusChanged) {
        // Refresh interviews if the candidate status changed
        this.loadInterviews();
      }
    });
  }

  calculateDaysLeft(date: string | Date): string {
    const today = new Date();
    const interviewDate = new Date(date);
    const timeDiff = interviewDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysLeft === 0) {
      return 'Today';
    } else if (daysLeft < 0) {
      return `${Math.abs(daysLeft)} days ago`;
    } else {
      return `${daysLeft} days`;
    }
  }

  editInterview(interview: any): void {
  const dialogRef = this.dialog.open(EditInterviewComponent, {
    width: '500px',
    data: { interview } // pass the current interview
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Update your interviews list with the edited data if needed
       console.log("Payload received from dialog, sending to service:", result);

      // 2. Préparer l'objet DTO pour la mise à jour
  //     const updatePayload = {
  //       id: interview.id,
  //      date: new Date(`${result.date}T${result.time}:00`).toISOString(),
  //       evaluateur_id: result.evaluatorId ,
  //       type: result.type,
  // description: result.description ?? '',
  // statut: interview.statut ?? 'SCHEDULED',
  // position: result.position
  //     };
      // 3. Appeler le service pour sauvegarder
      const updatePayload = {
  evaluateurId: result.evaluatorId,
  date: new Date(result.date).toISOString(),
  description: result.description,
  type: result.type,
  statut: result.statut
};
      this.interviewService.updateEvaluation(interview.id, updatePayload).subscribe({
        next: (updatedInterview) => {
          // 4. Mettre à jour la liste locale pour un affichage immédiat
          const index = this.interviews.findIndex(i => i.id === interview.id);
          if (index > -1) {
            // Remplacer l'ancien objet par celui retourné par le backend
            this.interviews[index] = updatedInterview;
            // Forcer la détection de changement si le dataSource ne se met pas à jour
            this.interviews = [...this.interviews]; 
          }
          console.log('Interview updated successfully!', updatedInterview);
          this.interviewStateService.notifyInterviewUpdated(updatedInterview);
          console.log("🔁 Backend response:", updatedInterview);

          // 5. (IMPORTANT) Notifier les autres composants du changement (voir Étape 3)
        },
        
        error: (err) => {
          console.error('Failed to update interview', err);
        }
      });
    }
    
  });
}

 

  ngOnInit(): void {
     this.loadInterviews();
}
 loadInterviews(): void {
 console.log("Loading interviews for the authenticated user...");

    this.interviewService.getMyInterviews().subscribe({ // ✅ APPEL DE LA BONNE MÉTHODE
      next: (interviews) => {
        console.log("Interviews received:", interviews);
        console.log("Number of interviews:", interviews.length);
        
        if (interviews.length > 0) {
          console.log("First interview structure:", interviews[0]);
          console.log("First interview recrutement:", interviews[0].recrutement);
          console.log("First interview candidate:", interviews[0].recrutement?.candidate);
        }
        
        this.interviews = interviews.filter(interview => 
          interview.statut === 'SCHEDULED' // Vous pouvez conserver ce filtre côté client si besoin
        );
        
        console.log("Filtered interviews count:", this.interviews.length);
        
        // Debug each interview to see what data is available
        this.interviews.forEach((interview, index) => {
          console.log(`Interview ${index}:`, {
            id: interview.id,
            type: interview.type,
            date: interview.date,
            recrutement: interview.recrutement,
            candidateId: interview.recrutement?.candidate?.id,
            candidateFullName: interview.recrutement?.candidate?.fullName,
            evaluateur: interview.evaluateur,
            fullObject: interview
          });
        });
      },
      error: (err) => {
        // L'erreur 500 ne devrait plus se produire.
        // Vous pourriez avoir une erreur 401/403 si le token n'est pas valide ou manquant.
        console.error('Error fetching my interviews:', err);
      }
    });
  }
}



