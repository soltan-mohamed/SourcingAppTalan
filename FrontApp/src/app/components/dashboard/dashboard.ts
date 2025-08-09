import { Component, OnInit } from '@angular/core';
import { InterviewService } from 'app/services/interview-service';
import { CommonModule } from '@angular/common';
import { Candidate } from 'app/models/candidate';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CandidateHistory } from '../candidate-history/candidate-history';

import { MatCardModule } from '@angular/material/card';
import { CandidatesService } from 'app/services/candidates-service';
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
export class Dashboard {

  isLoading : boolean = false;
  error: string | null = null;
  candidates : Candidate[] = [];
   todayInterviews:  InterviewView[] = [];
  displayedColumns = ['fullName', 'status', 'evaluationType', 'date']
  constructor(
    private interviewService : InterviewService ,
    private candidateService : CandidatesService,
    private dialog : MatDialog,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
     this.loadTodayInterviews();
    this.candidateService.getAllContactedAndInProgressCandidates().subscribe({
      next: (data) => {
        console.log('In-progress and contacted Candidates loaded successfully', data);

        this.candidates = data.map(candidate => {

          let evaluationType: string = "Not yet";
          let date: string = candidate.statut === 'CONTACTED' ? candidate.dateCreation : "";

          const sortedRecrutements = (candidate.recrutements || [])
            .filter(r => r.date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          if (sortedRecrutements.length > 0) {
            const lastRecrutement = sortedRecrutements[0];

            const sortedEvaluations = (lastRecrutement.evaluations || [])
              .filter(e => e.date)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            if (sortedEvaluations.length > 0) {
              evaluationType = sortedEvaluations[0].type;
              date = sortedEvaluations[0].date;
            }
            else {
              date =  candidate.dateCreation ;
            }
          }
          else {
            date =  candidate.dateCreation ;
          }


          return {
            ...candidate,
            fullName: candidate.nom.toUpperCase() + ' ' + candidate.prenom,
            date,
            evaluationType
          };
        });
        this.isLoading = false;
        console.log('Final enriched candidates:', this.candidates);
      },
      error: (err) => {
        console.error('Error fetching candidates:', err);
        this.isLoading = false;
      }
    });
        this.isLoading = true;

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
      
          const filteredEvaluations = evaluations.filter((evaluation: any) => {
            if (!evaluation.date) return false;
            const interviewDate = new Date(evaluation.date);
            return interviewDate >= todayStart && interviewDate <= todayEnd && evaluation.statut === 'SCHEDULED';
          });
      
          const mappedInterviews = filteredEvaluations.map(evaluation => {
            
            // --- THIS IS THE CRUCIAL DEBUGGING STEP ---
            // This will print the full, interactive structure of the evaluation object.
            console.log("--- PLEASE EXPAND AND INSPECT THIS RAW EVALUATION OBJECT ---");
            console.log(evaluation);
            // --- END DEBUGGING STEP ---

            let location = evaluation.lieuEvaluation;
        
            if (!location || location === 'Location TBD' || location.trim() === '') {
              location = evaluation.lieu || 
                        evaluation.location || 
                        evaluation.recrutement?.location ||
                        'Remote/Virtual'; 
            }
            
            // We will now use the correct path discovered from the log above.
            // Based on typical structures, it's very likely to be this:
          

            // This log helps confirm if our final guess is right.                      
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
              candidateId: evaluation.idCandidate, // Assign the ID we found.
              isExpanded: false
            };
          });
          
          console.log('Mapped interviews (after processing):', mappedInterviews);
          
          this.todayInterviews = mappedInterviews;
          this.isLoading  = false;
      },
      error: (err) => {
        console.error('Error loading interviews:', err);
        this.error = 'Failed to load interviews';
        this.isLoading  = false;
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

    this.candidateService.fetchCandidateById(interview.candidateId).subscribe({
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
  openHistory(row: any): void {

    const dialogRef = this.dialog.open(CandidateHistory, {
      width: '90vw',       
      maxWidth: 'none',
      disableClose: false,
      data: row 
    });
  
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result?.statusChanged && this.refreshCallback) {
    //     this.refreshCallback();
    //   }
    // });
  }

}
