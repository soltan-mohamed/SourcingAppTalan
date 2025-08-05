import { Component, OnInit } from '@angular/core';
import { InterviewService } from 'app/services/interview-service';
import { CommonModule } from '@angular/common';
import { Evaluation } from 'app/models/evaluation'; // Adjust path as needed
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CandidateHistory } from 'app/components/candidate-history/candidate-history';
import { CandidatesService } from 'app/services/candidates-service';
import { Candidate } from 'app/models/candidate';

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
    MatDialogModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class Dashboard {
  loading: boolean = false;
  error: string | null = null;
  todayInterviews:  InterviewView[] = [];
  constructor(
    private interviewService : InterviewService,
    private dialog: MatDialog,
    private candidatesService: CandidatesService
  ) {}

  ngOnInit() : void {
    this.loadTodayInterviews();
  }
  loadTodayInterviews(): void {
    this.loading = true;
    this.error = null;
    
    this.interviewService.getMyInterviews().subscribe({
      next: (evaluations: any[]) => {
        // Filter interviews for today only
         console.log('Raw data from InterviewService:', evaluations); 
        
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
      
      .map(evaluation => ({
        id: evaluation.id,
        type: evaluation.type,
        date: evaluation.date,
        position: evaluation.position || 'Position TBD',
        lieuEvaluation: evaluation.lieuEvaluation || 'Location TBD',
        fullName: evaluation.candidateName || 'Unknown Candidate',
        evaluatorName: evaluation.evaluatorName || 'Unknown Evaluator',
        candidateId: evaluation.candidateId
      }));
      console.log('Mapped interviews:', mappedInterviews);
      
      
          // 4. Do ONE final assignment to the property bound to the view.
      this.todayInterviews = mappedInterviews;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading interviews:', err);
        this.error = 'Failed to load interviews';
        this.loading = false;
      }
    });
  }

   openCandidateHistory(interview: InterviewView): void {
    try {
      // 1. Call the method directly and store the returned Candidate object.
      const candidate=this.candidatesService.getCandidateById(interview.candidateId);
      
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
}