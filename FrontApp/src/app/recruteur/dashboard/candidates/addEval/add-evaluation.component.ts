import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EvaluationService } from '@core/service/evaluation.service';
import { User } from '@core/models/user';
import { UserService } from '@core/service/user.service';
import { TypeEvaluation } from '@core/models/evaluation.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role } from '@core/models/role';
import { AuthService } from '@core/service/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-evaluation',
  templateUrl: './add-evaluation.component.html',
  styleUrls: ['./add-evaluation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class AddEvaluationComponent implements OnInit {
  evaluationForm: FormGroup;
  evaluators: User[] = [];
  evaluationTypes = Object.values(TypeEvaluation);
  loading = false;
  isEvaluatorLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEvaluationComponent>,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { recrutementId: number }
  ) {
    this.evaluationForm = this.fb.group({
      type: ['', Validators.required],
      description: ['not evaluated yet'],
      date: [new Date(), Validators.required],
      evaluateurId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvaluatorsBasedOnType();
    
    // Listen for type changes
    this.evaluationForm.get('type')?.valueChanges.subscribe(() => {
      this.loadEvaluatorsBasedOnType();
    });
  }

  loadEvaluatorsBasedOnType(): void {
    const selectedType = this.evaluationForm.get('type')?.value;
    
    if (!selectedType) {
      this.evaluators = [];
      return;
    }

    this.isEvaluatorLoading = true;
    let userObservable: Observable<User[]>;
    
    switch(selectedType) {
      case TypeEvaluation.RH:
        userObservable = this.userService.getRecruiters();
        break;
      case TypeEvaluation.MANAGERIAL:
        userObservable = this.userService.getManagers();
        break;
      case TypeEvaluation.TECHNIQUE:
        userObservable = this.userService.getEvaluators();
        break;
      default:
        this.isEvaluatorLoading = false;
        return;
    }

    userObservable.subscribe({
      next: (users) => {
        this.evaluators = users;
        this.isEvaluatorLoading = false;
        // Reset evaluator selection when type changes
        this.evaluationForm.get('evaluateurId')?.setValue('');
      },
      error: (err) => {
        console.error('Error loading evaluators:', err);
        this.isEvaluatorLoading = false;
        this.snackBar.open('Failed to load evaluators', 'Close', {
          duration: 3000
        });
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
        evaluateurId: this.evaluationForm.value.evaluateurId
      };

      this.evaluationService.createEvaluation(this.data.recrutementId, evaluationData).subscribe({
        next: (response) => {
          this.snackBar.open('Evaluation created successfully', 'Close', {
            duration: 3000
          });
          this.dialogRef.close(response);
        },
        error: (err) => {
          console.error('Error:', err);
          this.snackBar.open('Failed to create evaluation', 'Close', {
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

  get currentUser() {
    return this.authService.currentUserValue;
  }

  isRecruteurManager(): boolean {
    return this.authService.hasRole(Role.RECRUTEUR_MANAGER);
  }
}