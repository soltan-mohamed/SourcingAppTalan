import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatherModule } from 'angular-feather';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddInterviewComponent } from './add-interview/add-interview';
import { EditInterviewComponent } from './edit-interview/edit-interview';
import { Evaluation } from 'app/models/evaluation';
import { InterviewService } from 'app/services/interview-service';
import { AuthService } from '@core/service/auth.service';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule,
          MatTableModule, 
          MatIconModule, 
          MatInputModule, 
          FormsModule,
          MatTooltipModule,
          FeatherModule,
        MatDialogModule],
  templateUrl: './interviews.html',
  styleUrls: ['./interviews.scss']
})
export class InterviewsComponent implements OnInit {
  
   searchDate: string = '';
  
  displayedColumns: string[] = ['candidate', 'date', 'time', 'type','position','evaluator','days left','actions'];

  interviews: Evaluation[] = [];


   get dataSource() {
    return this.searchDate
      ? this.interviews.filter(i => i.date.includes(this.searchDate))
      : this.interviews;
  }

  // Removed duplicate editInterview function

  constructor(private dialog: MatDialog,private interviewService: InterviewService,private authService: AuthService) {}
  addInterview() {
  const dialogRef = this.dialog.open(AddInterviewComponent,{
    panelClass: 'add-interview-dialog-panel'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.interviews.push(result);
    }
  });
}
  calculateDaysLeft(date: Date): number {
  const today = new Date();
  const interviewDate = new Date(date);
  const timeDiff = interviewDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  editInterview(interview: any): void {
  const dialogRef = this.dialog.open(EditInterviewComponent, {
    width: '500px',
    data: { interview } // pass the current interview
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Update your interviews list with the edited data if needed
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
        this.interviews = interviews.filter(interview => 
          interview.statut === 'SCHEDULED' // Vous pouvez conserver ce filtre côté client si besoin
        );
      },
      error: (err) => {
        // L'erreur 500 ne devrait plus se produire.
        // Vous pourriez avoir une erreur 401/403 si le token n'est pas valide ou manquant.
        console.error('Error fetching my interviews:', err);
      }
    });
  }
}



