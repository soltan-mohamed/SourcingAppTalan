import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EvaluationService } from '@core/service/evaluation.service';
import { UserService } from '@core/service/user.service';
import { TypeEvaluation, Statut } from '@core/models/evaluation.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { Role } from '@core/models/role';
import { AuthService } from '@core/service/auth.service';
import { User } from '@core/models/user';
import { Evaluation } from '@core/models/evaluation.model';

@Component({
  selector: 'app-edit-evaluation',
  templateUrl: './edit-evaluation.component.html',
  styleUrls: ['./edit-evaluation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class EditEvaluationComponent implements OnInit {
  evaluationForm: FormGroup;
  evaluators: User[] = [];
  evaluationTypes = Object.values(TypeEvaluation);
  statusOptions = Object.values(Statut);
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditEvaluationComponent>,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { evaluation: Evaluation }
  ) {
    this.evaluationForm = this.fb.group({
      type: [data.evaluation.type, Validators.required],
      description: [data.evaluation.description],
      date: [data.evaluation.date ? new Date(data.evaluation.date) : null, Validators.required],
      evaluateurId: [data.evaluation.evaluateur?.id, Validators.required],
      statut: [data.evaluation.statut, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvaluators();
  }

  loadEvaluators(): void {
    this.userService.getEvaluators().subscribe({
      next: (users) => {
        this.evaluators = users.filter(user => 
          user.roles?.includes(Role.EVALUATEUR)
        );
      },
      error: (err) => {
        console.error('Error loading evaluators:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.evaluationForm.valid) {
      this.loading = true;
      const evaluationData = {
        type: this.evaluationForm.value.type,
        description: this.evaluationForm.value.description,
        date: this.evaluationForm.value.date,
        evaluateur: { id: this.evaluationForm.value.evaluateurId },
        statut: this.evaluationForm.value.statut
      };

      const evaluationId = this.data.evaluation.id;
      if (evaluationId === undefined) {
        this.snackBar.open('Invalid evaluation ID', 'Close', { duration: 3000 });
        this.loading = false;
        return;
      }

      this.evaluationService.updateEvaluation(evaluationId, evaluationData).subscribe({
        next: (response) => {
          this.snackBar.open('Evaluation updated successfully', 'Close', {
            duration: 3000
          });
          this.dialogRef.close(response);
        },
        error: (err) => {
          console.error('Error:', err);
          this.snackBar.open('Failed to update evaluation', 'Close', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  Role = Role;

  get currentUser() {
    return this.authService.currentUserValue;
  }

  isRecruteurManager(): boolean {
    return this.authService.hasRole(Role.RECRUTEUR_MANAGER);
  }
}