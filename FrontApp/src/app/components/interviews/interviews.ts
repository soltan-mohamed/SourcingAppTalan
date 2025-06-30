import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatherModule } from 'angular-feather';
import { Edit, Plus } from 'angular-feather/icons'; 

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule,
          MatTableModule, 
          MatIconModule, 
          MatInputModule, 
          FormsModule,
          MatTooltipModule,
          FeatherModule],
  templateUrl: './interviews.html',
  styleUrls: ['./interviews.scss']
})
export class InterviewsComponent implements OnInit {
  
   searchDate: string = '';
  
  displayedColumns: string[] = ['candidate', 'date', 'time', 'type', 'evaluator','actions'];

  interviews = [
    {
      candidate: 'Abir Omezine',
      date: '2025-07-01',
      time: '10:00',
      type: 'Technique',
      evaluator: 'Mr. Salah',
    },
    {
      candidate: 'Maya Kefi',
      date: '2025-07-01',
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

  addInterview() {
  console.log('Navigate to add interview or open modal');
  // You can navigate to a new route or open a dialog here
}

  constructor() {}

  ngOnInit(): void {}
}