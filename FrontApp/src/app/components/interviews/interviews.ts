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
  
  displayedColumns: string[] = ['candidate', 'date', 'time', 'type', 'evaluator','actions'];

  interviews = [
    {
      candidate: 'Abir Omezine',
      date: '2025-06-16',
      time: '10:00',
      type: 'Technique',
      evaluator: 'Mr. Salah',
    },
    {
      candidate: 'Maya Kefi',
      date: '2020-07-01',
      time: '11:00',
      type: 'RH',
      evaluator: 'Mme. Yosra',
    }
  ];

   get dataSource() {
    return this.searchDate
      ? this.interviews.filter(i => i.date.includes(this.searchDate))
      : this.interviews;
  }

  editInterview(interview: any) {
    console.log('Edit interview:', interview);
    // Logic to navigate or open edit modal
  }

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

 

  ngOnInit(): void {}


}