import { Component, OnInit } from '@angular/core';
import { InterviewService } from 'app/services/interview-service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  constructor(
    private interviewService : InterviewService
  ) {}

  ngOnInit() : void {
    
  }

}
