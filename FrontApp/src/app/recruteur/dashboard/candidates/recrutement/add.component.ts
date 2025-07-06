// add.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecruitmentService } from '@core/service/recruitment.service';
import { UserService } from '@core/service/user.service';
import { Candidate } from '@core/models/candidate.model';
import { User } from '@core/models/user';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-recruitment-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddRecruitmentComponent implements OnInit {
  recruitmentForm: FormGroup;
  isLoading = false;
  managers: User[] = [];
  isFetchingManagers = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddRecruitmentComponent>,
    private recruitmentService: RecruitmentService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { candidate: Candidate }
  ) {
    this.recruitmentForm = this.fb.group({
      position: ['', [Validators.required, Validators.maxLength(100)]],
      managerId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchManagers();
  }

  fetchManagers(): void {
    this.isFetchingManagers = true;
    this.userService.getManagers().subscribe({
      next: (managers) => {
        this.managers = managers;
        this.isFetchingManagers = false;
      },
      error: (err) => {
        this.isFetchingManagers = false;
        this.snackBar.open(
          'Failed to load managers. Please try again later.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  onSubmit(): void {
    if (this.recruitmentForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { position, managerId } = this.recruitmentForm.value;

    this.recruitmentService.createRecruitment(this.data.candidate.id!, position, managerId)
      .subscribe({
        next: () => {
          this.snackBar.open('Recruitment process started successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(
            err.error?.message || 'Failed to start recruitment process',
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}