import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EvaluationService } from '@core/service/evaluation.service';
import { User } from '@core/models/user';
import { UserService } from '@core/service/user.service';
import { TypeEvaluation } from '@core/models/evaluation.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CandidateHistoryComponent } from '../history/candidate-history.component';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-add-evaluation',
  templateUrl: './add-evaluation.component.html',
  styleUrls: ['./add-evaluation.component.scss'],
      standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
   // TableCardComponent,
    MatTableModule,
   // InitialsPipe,
    MatSelectModule,
    MatInputModule, 
    ScrollingModule,
    MatTreeModule,
    ReactiveFormsModule,
        MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule

]
})
export class AddEvaluationComponent implements OnInit {
  evaluationForm: FormGroup;
  evaluators: User[] = [];
  evaluationTypes = Object.values(TypeEvaluation);
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEvaluationComponent>,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { recrutementId: number }
  ) {
    this.evaluationForm = this.fb.group({
      type: ['', Validators.required],
      description: [''],
      date: [new Date(), Validators.required],
      evaluateurId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvaluators();
  }

  loadEvaluators(): void {
    this.userService.getEvaluators().subscribe({
      next: (users) => {
        this.evaluators = users;
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
        ...this.evaluationForm.value
      };

      this.evaluationService.createEvaluation(this.data.recrutementId, evaluationData).subscribe({
        next: (response) => {
          this.snackBar.open('Evaluation created successfully', 'Close', {
            duration: 3000
          });
          this.dialogRef.close(response);
        },
        error: (err) => {
          console.error('Error creating evaluation:', err);
          this.snackBar.open('Failed to create evaluation', 'Close', {
            duration: 3000
          });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}