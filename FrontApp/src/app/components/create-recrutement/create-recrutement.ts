import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UsersService } from 'app/services/users-service';
import { User } from 'app/models/user';
import { Candidate } from 'app/models/candidate';
import { RecrutementService } from 'app/services/recrutement-service';
import { CandidatesService } from 'app/services/candidates-service';


@Component({
  selector: 'app-create-recrutement',
  imports: [ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './create-recrutement.html',
  styleUrl: './create-recrutement.scss'
})
export class CreateRecrutement implements OnInit {

  users : User[] = [];

  recrutementForm!: FormGroup;
  
  isSubmitting: boolean = false;

  errorMessage : string = "" ;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar : MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Candidate,
    private dialogRef: MatDialogRef<CreateRecrutement>,
    private usersService : UsersService,
    private recrutementService : RecrutementService,
    private candidateService : CandidatesService
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllManagers();
  }

  initializeForm(): void {
    this.recrutementForm = this.formBuilder.group({
      poste: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ'-\s]+$/), Validators.minLength(2) ]],
      manager: ['', [Validators.required ]],
    });
  }


  onSubmit(): void {
     if (this.recrutementForm.valid) {
      this.isSubmitting = true;
      
      const formData = {
        position: this.recrutementForm.get('poste')?.value,
        demandeur_id: this.recrutementForm.get('manager')?.value.id,
        candidate_id : this.data.id,
      };     

      console.log('Submitting candidate: ...', formData);

      this.recrutementService.CreateNewRecrutement(formData)
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            this.candidateService.updateCandidate(this.data.id,formData)
              .subscribe({
                error: (error: any) => {
                  console.error('Error updating candidate:', error);
                }
              });
            this.snackBar.open(
              'Success creating new recrutement',
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
              'Failed to create new recrutement: ' + (error.error?.message || 'Unknown error'),
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
    //   this.recrutementForm.markAllAsTouched();
    }
  }

  closeForm(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.recrutementForm.reset();
    this.isSubmitting = false;
  }
  
  getAllManagers(): void {
    this.usersService.getAllUsersByRole("MANAGER").subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        this.errorMessage = "An internal server error has occurred !";
      }
    });
  }
}