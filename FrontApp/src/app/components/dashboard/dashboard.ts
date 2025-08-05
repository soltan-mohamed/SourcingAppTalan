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
        // Filter interviews for today only
         console.log('Raw data from InterviewService:', evaluations); 
         
         // Debug: Show the structure of the first evaluation if available
         if (evaluations.length > 0) {
           console.log('First evaluation complete structure:', JSON.stringify(evaluations[0], null, 2));
           console.log('Available keys in first evaluation:', Object.keys(evaluations[0]));
         }
        
            // 1. Define today's date range
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
         // 2. Filter the evaluations into a NEW array
      const filteredEvaluations = evaluations.filter((evaluation: any) => {
        if (!evaluation.date) return false;
        const interviewDate = new Date(evaluation.date);
        const isToday = interviewDate >= todayStart && interviewDate <= todayEnd;
        const isScheduled = evaluation.statut === 'SCHEDULED';
        return isToday && isScheduled;
      });
      
      console.log('Number of interviews after filtering:', filteredEvaluations.length);
         // 3. Map the NEW filtered array to the view model
         filteredEvaluations.forEach(ev => {
  if (!ev.recrutement || !ev.recrutement.candidat) {
    console.warn(`⚠️ Missing candidat in evaluation ID ${ev.id}`);
  }
});
      const mappedInterviews = filteredEvaluations
      
      .map(evaluation => {
        // Debug the evaluation structure to find location field
        console.log('Processing evaluation:', {
          id: evaluation.id,
          lieuEvaluation: evaluation.lieuEvaluation,
          lieu: evaluation.lieu,
          location: evaluation.location,
          fullEvaluation: evaluation
        });
        
        // Try different possible field names for location
        // If lieuEvaluation is "Location TBD", try other fields
        let location = evaluation.lieuEvaluation;
        
        if (!location || location === 'Location TBD' || location.trim() === '') {
          location = evaluation.lieu || 
                    evaluation.location || 
                    evaluation.recrutement?.location ||
                    'Remote/Virtual'; // Default to Remote instead of TBD
        }
        
        return {
          id: evaluation.id,
          type: evaluation.type,
          date: evaluation.date,
          position: evaluation.position || evaluation.recrutement?.poste || 'Position TBD',
          lieuEvaluation: location,
          fullName: evaluation.candidateName || 
                   evaluation.recrutement?.candidate?.fullName || 
                   evaluation.recrutement?.candidat?.fullName ||
                   'Unknown Candidate',
          evaluatorName: evaluation.evaluatorName || 
                        evaluation.evaluateur?.fullName || 
                        'Unknown Evaluator',
          candidateId: evaluation.candidateId || evaluation.recrutement?.candidate?.id
        };
      });
      console.log('Mapped interviews:', mappedInterviews);
      
      
          // 4. Do ONE final assignment to the property bound to the view.
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
  openCandidateHistory(interview: InterviewView): void {
    try {
      // 1. Call the method directly and store the returned Candidate object.
      const candidate=this.candidateService.getCandidateById(interview.candidateId);
      
       if (candidate) {
        // --- Inside this 'if' block, TypeScript now knows `candidate` is a valid `Candidate` ---
        
        const dialogData = {
          ...candidate,
          highlightEvaluationId: interview.id
        };
        
        this.dialog.open(CandidateHistory, {
          panelClass: 'add-interview-dialog-panel',
          width: 'auto',
          maxWidth: '80vw',
          maxHeight: '90vh',
          data: dialogData,
        });

      } else {
        // 3. Handle the case where no candidate was found.
        console.error(`Candidate with id ${interview.candidateId} not found.`);
        // You could also show a user-friendly error message here using a snackbar or another dialog.
      }

    } catch (err: any) {
      // 4. If the method throws an error, catch it here.
      console.error(`Failed to load candidate with id ${interview.candidateId}`, err);
    }
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
