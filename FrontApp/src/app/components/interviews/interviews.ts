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

  interviews = [
    {
      candidate: 'Abir Omezine',
      date: '2025-08-16',
      time: '10:00',
      position: 'ai Engineer',
      type: 'RH',
      evaluator: 'Anouar Khemeja',
    },
    {
      candidate: 'Maya Kefi',
      date: '2025-09-01',
      time: '11:00',
      position: 'java developer',
      type: 'managerial',
      evaluator: 'Safouane Chabchoub',
    }
  ];

   get dataSource() {
    return this.searchDate
      ? this.interviews.filter(i => i.date.includes(this.searchDate))
      : this.interviews;
  }

  // Removed duplicate editInterview function

  constructor(private dialog: MatDialog) {}
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

 

  ngOnInit(): void {}


}