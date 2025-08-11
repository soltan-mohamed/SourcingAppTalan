import { Component, OnInit, OnDestroy } from '@angular/core';
import { InterviewService } from 'app/services/interview-service';
import { CommonModule } from '@angular/common';
import { Candidate } from 'app/models/candidate';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CandidateHistory } from '../candidate-history/candidate-history';
import { MatCardModule } from '@angular/material/card';
import { CandidatesService } from 'app/services/candidates-service';
import { InterviewStateService } from 'app/services/interview-state';
import { Subscription } from 'rxjs';
import { Evaluation } from 'app/models/evaluation';
interface InterviewView {
  id: number;
  type: string;
  date: string;
  position: string;
  lieuEvaluation: string;
  fullName: string;
  evaluatorName: string;
  candidateId: number;
  status: string;
  isExpanded: boolean;
}
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnDestroy {

  isLoading : boolean = false;
  error: string | null = null;
  candidates : Candidate[] = [];
  todayInterviews: InterviewView[] = []; // SCHEDULED interviews for "My Interviews"
  inProgressInterviews: InterviewView[] = []; // IN_PROGRESS interviews for "To Review"
  reviewCandidates: Candidate[] = []; // Candidates with IN_PROGRESS and CONTACTED status for "To Review"
  displayedColumns = ['fullName', 'status', 'type', 'date']
  candidateDisplayedColumns = ['name', 'status', 'position', 'type']
  
  private interviewUpdateSubscription: Subscription = new Subscription();
  
  constructor(
    private interviewService : InterviewService ,
    private candidateService : CandidatesService,
    private interviewStateService: InterviewStateService,
    private dialog : MatDialog,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.setupInterviewUpdateListener();
    this.loadTodayInterviews();
    this.loadReviewCandidates();
  }
   loadTodayInterviews(): void {
    this.isLoading = true;
    this.error = null;
    
    this.interviewService.getMyInterviews().subscribe({
      next: (evaluations: any[]) => {
         console.log('--- RAW INTERVIEW DATA FROM API ---', JSON.stringify(evaluations, null, 2));
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
      
          // Filter today's interviews (both SCHEDULED and IN_PROGRESS)
          const todaysEvaluations = evaluations.filter((evaluation: any) => {
            if (!evaluation.date) return false;
            const interviewDate = new Date(evaluation.date);
            return interviewDate >= todayStart && interviewDate <= todayEnd && 
                   (evaluation.statut === 'SCHEDULED' || evaluation.statut === 'IN_PROGRESS');
          });

          // Map all today's interviews
          const mappedInterviews = todaysEvaluations.map(evaluation => {
            
            console.log("--- PLEASE EXPAND AND INSPECT THIS RAW EVALUATION OBJECT ---");
            console.log(evaluation);

            let location = evaluation.lieuEvaluation;
        
            if (!location || location === 'Location TBD' || location.trim() === '') {
              location = evaluation.lieu || 
                        evaluation.location || 
                        evaluation.recrutement?.location ||
                        'Remote/Virtual'; 
            }
                     
            return {
              id: evaluation.id,
              type: evaluation.type,
              date: evaluation.date,
              position: evaluation.position || evaluation.recrutement?.poste || 'Position TBD',
              lieuEvaluation: location,
              fullName: evaluation.candidateName || 
                       evaluation.recrutement?.candidat?.fullName ||
                       'Unknown Candidate',
              evaluatorName: evaluation.evaluatorName || 
                            evaluation.evaluateur?.fullName || 
                            'Unknown Evaluator',
              candidateId: evaluation.idCandidate,
              status: evaluation.statut || 'SCHEDULED',
              isExpanded: false
            };
          });
          
          // Separate interviews by status
          this.todayInterviews = mappedInterviews.filter(interview => interview.status === 'SCHEDULED');
          this.inProgressInterviews = mappedInterviews.filter(interview => interview.status === 'IN_PROGRESS');
          
          console.log('SCHEDULED interviews for My Interviews:', this.todayInterviews);
          console.log('IN_PROGRESS interviews for To Review:', this.inProgressInterviews);
          
          this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading interviews:', err);
        this.error = 'Failed to load interviews';
        this.isLoading = false;
      }
    });
  }

  loadReviewCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (candidates: Candidate[]) => {
        // Filter candidates with IN_PROGRESS and CONTACTED status
        this.reviewCandidates = candidates.filter(candidate => 
          candidate.statut === 'IN_PROGRESS' || candidate.statut === 'CONTACTED'
        ).map(candidate => {
          // Add computed fields for display
          const name = `${candidate.prenom} ${candidate.nom.toUpperCase()}`;
          let type = 'Not yet';
          let position = 'Not available';
          
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
                    type = 'Not yet';
                }
              }
            }
          }

          return {
            ...candidate,
            name,
            type,
            position
          };
        });
        
        console.log('Review candidates loaded:', this.reviewCandidates);
      },
      error: (err) => {
        console.error('Error loading review candidates:', err);
      }
    });
  }
  toggleInterview(interview: InterviewView, event: MouseEvent): void {
    event.stopPropagation(); // Prevents the openCandidateHistory from firing
    interview.isExpanded = !interview.isExpanded;
  }
  openCandidateHistory(interview: InterviewView): void {
    // Only open if the card is expanded, or remove this check if you want any click to open it
    if (!interview.isExpanded) {
        // Optionally, you could expand the card instead of doing nothing
        // interview.isExpanded = true;
        return;
    }
    
    if (!interview.candidateId) {
      console.error('Cannot open history: Candidate ID is missing from the interview object.');
      return;
    }

    this.candidateService.fetchCandidateByIdWithComputedStatus(interview.candidateId).subscribe({
      next: (candidate: Candidate) => {
        const dialogData = {
          ...candidate,
          highlightEvaluationId: interview.id
        };

        this.dialog.open(CandidateHistory, {
          panelClass: 'add-interview-dialog-panel',
          width: '90vw',
          maxWidth: '120vw',
          maxHeight: '90vh',
          data: dialogData,
        });
      },
      error: (err) => {
        console.error(`Failed to load details for candidate with id ${interview.candidateId}`, err);
      }
    });
  }
   getTimeRange(dateString: string): string {
    const startTime = new Date(dateString);
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // Add 1 hour
    
    const start = startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    // const end = endTime.toLocaleTimeString('en-US', { 
    //   hour: 'numeric', 
    //   minute: '2-digit',
    //   hour12: true 
    // });
    
    return `${start} `;
  }
  
  setupInterviewUpdateListener(): void {
    this.interviewUpdateSubscription = this.interviewStateService.interviewUpdated$.subscribe(
      (updatedEvaluation) => {
        console.log('🔄 Dashboard received interview update notification:', updatedEvaluation);
        
        // Handle real-time interview status updates
        this.handleInterviewStatusUpdate(updatedEvaluation);
        
        // Also reload data to ensure consistency
        console.log('📅 Refreshing today\'s interviews after status update');
        this.loadTodayInterviews();
        
        // Reload review candidates as their status might have changed
        console.log('👥 Refreshing review candidates after status update');
        this.loadReviewCandidates();
        
        console.log('✅ Interview lists and candidates updated');
      }
    );
  }

  handleInterviewStatusUpdate(updatedEvaluation: any): void {
    if (!updatedEvaluation || !updatedEvaluation.id) {
      console.warn('⚠️ No evaluation ID found in interview update');
      return;
    }

    const evaluationId = updatedEvaluation.id;
    const newStatus = updatedEvaluation.statut;
    
    console.log(`🔄 Handling real-time status update for interview ${evaluationId}: ${newStatus}`);

    // Find the interview in both arrays
    let foundInScheduled = false;
    let foundInProgress = false;
    let interviewToMove = null;

    // Check if it exists in scheduled interviews
    const scheduledIndex = this.todayInterviews.findIndex(interview => interview.id === evaluationId);
    if (scheduledIndex >= 0) {
      foundInScheduled = true;
      interviewToMove = { ...this.todayInterviews[scheduledIndex] };
      interviewToMove.status = newStatus; // Update the status
    }

    // Check if it exists in in-progress interviews
    const inProgressIndex = this.inProgressInterviews.findIndex(interview => interview.id === evaluationId);
    if (inProgressIndex >= 0) {
      foundInProgress = true;
      if (!interviewToMove) {
        interviewToMove = { ...this.inProgressInterviews[inProgressIndex] };
        interviewToMove.status = newStatus; // Update the status
      }
    }

    if (!interviewToMove) {
      console.warn(`⚠️ Interview ${evaluationId} not found in current dashboard data`);
      return;
    }

    // Handle status transitions
    if (newStatus === 'IN_PROGRESS') {
      // Move from scheduled to in-progress
      if (foundInScheduled) {
        console.log(`➡️ Moving interview ${evaluationId} from SCHEDULED to IN_PROGRESS`);
        // Remove from scheduled
        this.todayInterviews = this.todayInterviews.filter(interview => interview.id !== evaluationId);
        // Add to in-progress (avoid duplicates)
        if (!foundInProgress) {
          this.inProgressInterviews = [...this.inProgressInterviews, interviewToMove];
        }
      } else if (foundInProgress) {
        // Just update the status in in-progress array
        console.log(`🔄 Updating interview ${evaluationId} status in IN_PROGRESS list`);
        this.inProgressInterviews = this.inProgressInterviews.map(interview => 
          interview.id === evaluationId ? { ...interview, status: newStatus } : interview
        );
      }
    } else if (newStatus === 'SCHEDULED') {
      // Move from in-progress to scheduled
      if (foundInProgress) {
        console.log(`⬅️ Moving interview ${evaluationId} from IN_PROGRESS to SCHEDULED`);
        // Remove from in-progress
        this.inProgressInterviews = this.inProgressInterviews.filter(interview => interview.id !== evaluationId);
        // Add to scheduled (avoid duplicates)
        if (!foundInScheduled) {
          this.todayInterviews = [...this.todayInterviews, interviewToMove];
        }
      } else if (foundInScheduled) {
        // Just update the status in scheduled array
        console.log(`🔄 Updating interview ${evaluationId} status in SCHEDULED list`);
        this.todayInterviews = this.todayInterviews.map(interview => 
          interview.id === evaluationId ? { ...interview, status: newStatus } : interview
        );
      }
    } else {
      // For other statuses (COMPLETED, CANCELLED, etc.), remove from both arrays
      console.log(`❌ Removing interview ${evaluationId} from dashboard (status: ${newStatus})`);
      this.todayInterviews = this.todayInterviews.filter(interview => interview.id !== evaluationId);
      this.inProgressInterviews = this.inProgressInterviews.filter(interview => interview.id !== evaluationId);
    }

    console.log(`✅ Updated arrays - Scheduled: ${this.todayInterviews.length}, In-Progress: ${this.inProgressInterviews.length}`);
  }

  ngOnDestroy(): void {
    this.interviewUpdateSubscription.unsubscribe();
  }

  // Method to get status color class for interviews
  getInterviewStatusClass(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'status-scheduled';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  // Method to get status display text
  getInterviewStatusText(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  // Method to get status icon
  getInterviewStatusIcon(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'schedule';
      case 'IN_PROGRESS':
        return 'play_circle';
      case 'COMPLETED':
        return 'check_circle';
      case 'CANCELLED':
        return 'cancel';
      default:
        return 'help';
    }
  }
  
  openHistory(row: any): void {
    // Use computed status to ensure the latest interview status is reflected
    this.candidateService.fetchCandidateByIdWithComputedStatus(row.id).subscribe({
      next: (candidate: Candidate) => {
        const dialogRef = this.dialog.open(CandidateHistory, {
          width: '90vw',       
          maxWidth: 'none',
          disableClose: false,
          data: candidate 
        });
      },
      error: (err) => {
        console.error(`Failed to load details for candidate with id ${row.id}`, err);
        // Fallback to original data if fetch fails
        const dialogRef = this.dialog.open(CandidateHistory, {
          width: '90vw',       
          maxWidth: 'none',
          disableClose: false,
          data: row 
        });
      }
    });
  
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result?.statusChanged && this.refreshCallback) {
    //     this.refreshCallback();
    //   }
    // });
  }

  // Method to open interview history from To Review section  
  openInterviewHistory(interview: InterviewView): void {
    if (!interview.candidateId) {
      console.error('Cannot open history: Candidate ID is missing from the interview object.');
      return;
    }

    this.candidateService.fetchCandidateByIdWithComputedStatus(interview.candidateId).subscribe({
      next: (candidate: Candidate) => {
        const dialogData = {
          ...candidate,
          highlightEvaluationId: interview.id
        };

        this.dialog.open(CandidateHistory, {
          panelClass: 'add-interview-dialog-panel',
          width: '90vw',
          maxWidth: '120vw',
          maxHeight: '90vh',
          data: dialogData,
        });
      },
      error: (err) => {
        console.error(`Failed to load details for candidate with id ${interview.candidateId}`, err);
      }
    });
  }

  // Method to open candidate history from review candidates table
  openCandidateHistoryFromTable(candidate: Candidate): void {
    // Fetch the latest candidate data with computed status
    this.candidateService.fetchCandidateByIdWithComputedStatus(candidate.id).subscribe({
      next: (updatedCandidate: Candidate) => {
        this.dialog.open(CandidateHistory, {
          panelClass: 'add-interview-dialog-panel',
          width: '90vw',
          maxWidth: '120vw',
          maxHeight: '90vh',
          data: updatedCandidate,
        });
      },
      error: (err) => {
        console.error(`Failed to load details for candidate with id ${candidate.id}`, err);
        // Fallback to using the existing candidate data
        this.dialog.open(CandidateHistory, {
          panelClass: 'add-interview-dialog-panel',
          width: '90vw',
          maxWidth: '120vw',
          maxHeight: '90vh',
          data: candidate,
        });
      }
    });
  }

}
