import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup , Validators} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { User } from 'app/models/user';
import { UsersService } from 'app/services/users-service';
import { InterviewService } from 'app/services/interview-service';
import { Evaluation } from 'app/models/evaluation';

@Component({
  selector: 'app-add-interview-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatInputModule,
    MatSelectModule, 
    MatButtonModule
  ],
  templateUrl: './add-interview.html',
  styleUrls: ['./add-interview.scss']
})
export class AddInterviewComponent {

  newInterviewForm!: FormGroup;
  isSubmitting : boolean = false;
  users : User[] = [];

  constructor(
    private snackBar : MatSnackBar,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddInterviewComponent>,
    private usersService : UsersService,
    private interviewService : InterviewService,
    @Inject(MAT_DIALOG_DATA) public recrutementId: number
  ) {}

  ngOnInit() : void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.newInterviewForm = this.formBuilder.group({
      date: ['', [ Validators.required ]],
      type: ['', [Validators.required ]],
      evaluator: [0, [Validators.required ]],
    });
  }

  save() {
    if (this.newInterviewForm.valid) {
      const newInterview : any= {
        description : "",
        date : this.newInterviewForm.get('date')!.value,
        type : this.newInterviewForm.get('type')!.value,
        statut : "SCHEDULED",
        evaluateur_id : Number(this.newInterviewForm.get('evaluator')!.value),
        recrutement_id : this.recrutementId
      }
      console.log("Interview  : ", newInterview);
      // this.dialogRef.close(this.interview);

      this.interviewService.CreateNewInterview(newInterview)
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            this.snackBar.open(
              'Success creating new interview',
              'Close',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              }
            );
            this.dialogRef.close(response);
          },
          error: (error: any) => {
            this.isSubmitting = false;
            console.error('Error creating recrutement:', error);

            this.snackBar.open(
              'Failed to create new interview: ' + (error.error?.message || 'Unknown error'),
              'Close',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              }
            );
          }
      });
    }
  }

  getUsersByRole(role : string): void {
    this.usersService.getAllUsersByRole(role).subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error("An internal server error has occurred !");
      }
    });
  }

  onTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    let role : string = "" ;
    if(selectedValue === "RH") {
      role = "RECRUTEUR";
    }
    else if (selectedValue === "MANAGERIAL") {
      role = "MANAGER";
    }
    else if (selectedValue === "TECHNIQUE") {
      role = "EVALUATEUR";
    }
    this.getUsersByRole(role);
  }

}