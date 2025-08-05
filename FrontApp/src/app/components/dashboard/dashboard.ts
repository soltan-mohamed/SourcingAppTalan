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
  candidates : Candidate[] = [];
  displayedColumns = ['fullName', 'status', 'evaluationType', 'date']
  constructor(
    private interviewService : InterviewService ,
    private candidateService : CandidatesService,
    private dialog : MatDialog,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

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
