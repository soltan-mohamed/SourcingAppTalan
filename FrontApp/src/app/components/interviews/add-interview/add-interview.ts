import { ChangeDetectionStrategy,Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup , Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {MatTimepickerModule} from '@angular/material/timepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { User } from 'app/models/user';
import { UsersService } from 'app/services/users-service';
import { InterviewService } from 'app/services/interview-service';
import { Evaluation } from 'app/models/evaluation';
import { fifteenMinuteStepValidator } from '@shared/dateValidator';

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
    MatButtonModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-interview.html',
  styleUrls: ['./add-interview.scss']
})
export class AddInterviewComponent {

  newInterviewForm!: FormGroup;
  isSubmitting : boolean = false;
  users : User[] = [];

  selectedTime!: string; 
  selectedDate! : string;

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
      selectedDate: ['', [Validators.required]],
      selectedTime: ['', [Validators.required]], 
      date: ["", [Validators.required]],
      type: ['', [Validators.required ]],
      evaluator: [0, [Validators.required ]],
      lieuEvaluation : ['' , [Validators.required]]
    });

    this.newInterviewForm.get('selectedDate')?.valueChanges.subscribe(() => {
      this.updateCombinedDateTime();
    });

    this.newInterviewForm.get('selectedTime')?.valueChanges.subscribe(() => {
      this.updateCombinedDateTime();
    });
  }

  save() {
    if (this.newInterviewForm.valid) {
      const newInterview : any= {
        description : "",
        date : this.newInterviewForm.get('date')!.value,
        type : this.newInterviewForm.get('type')!.value,
        lieuEvaluation : this.newInterviewForm.get('lieuEvaluation')!.value,
        statut : "SCHEDULED",
        evaluateur_id : Number(this.newInterviewForm.get('evaluator')!.value),
        recrutement_id : this.recrutementId
      }

      console.log("New interview : ", newInterview);

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
            this.dialogRef.close('success');
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

  updateCombinedDateTime(): void {
    const dateValue = this.newInterviewForm.get('selectedDate')?.value;
    const timeValue = this.newInterviewForm.get('selectedTime')?.value;

    if (dateValue && timeValue) {
      const combinedDate = this.combineDateAndTime(dateValue, timeValue);

      const pad = (n: number) => n.toString().padStart(2, '0');
      const isoString = `${combinedDate?.getFullYear()}-${pad(combinedDate!.getMonth() + 1)}-${pad(combinedDate!.getDate())}T${pad(combinedDate!.getHours())}:${pad(combinedDate!.getMinutes())}:${pad(combinedDate!.getSeconds())}`;

      this.newInterviewForm.get('date')?.setValue(isoString, { emitEvent: false });
    }
  }

  combineDateAndTime(dateValue: any, timeValue: any): Date | null {
    if (!dateValue || !timeValue) return null;

    const baseDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const timeDate = timeValue instanceof Date ? timeValue : new Date(timeValue);
    
    const hours = timeDate.getHours();
    const minutes = timeDate.getMinutes();
    
    const result = new Date(baseDate);
    result.setHours(hours, minutes, 0, 0);
    
    return result;
  }

  combinedDateTime(): Date | null {
    if (!this.selectedDate || !this.selectedTime) return null;

    const parsedDate = new Date(this.selectedTime!);
    const hours = parsedDate.getHours()
    const minutes = parsedDate.getMinutes()
    const result = new Date(this.selectedDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  toLocalDateTimeString(date: Date | null): string {
    return date? date.toISOString().slice(0, 19) : "";
  }



}