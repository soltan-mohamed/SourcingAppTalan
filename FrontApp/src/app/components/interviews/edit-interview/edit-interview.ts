import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSelectModule } from '@angular/material/select'; // ✅ Required for <mat-select> and <mat-option>
import { User } from 'app/models/user';
import { UsersService } from 'app/services/users-service';
import { MatDialogActions } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Role } from 'app/models/role';
import { MatDialogModule } from '@angular/material/dialog';



@Component({
  selector: 'app-edit-interview',
  templateUrl: './edit-interview.html',
  styleUrls: ['./edit-interview.scss'],
  imports: [MatDialogModule,CommonModule,ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, FormsModule, MatSelectModule]
})
export class EditInterviewComponent {

  interviewForm!: FormGroup;
  evaluators:User[] = [];
  dialog: any;
interview: any={};

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditInterviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UsersService // Assuming you have a UserService to fetch evaluators
  ) {}
  ngOnInit(): void {
    this.loadEvaluators();
    const interviewData=this.data.interview;
     const interviewDate = interviewData?.date ? new Date(interviewData.date) : null;
    const dateValue = interviewDate ? interviewDate.toISOString().split('T')[0] : '';
    const timeValue = interviewDate ? interviewDate.toTimeString().substring(0, 5) : '';
    this.interviewForm = this.fb.group({
      
      // Champs modifiables
      date: [dateValue, Validators.required],
      time: [timeValue, Validators.required],
      'evaluator*': [interviewData?.evaluateur?.id || null, Validators.required],

      // Champs affichés mais non modifiables
     candidateName: [{ value: interviewData?.candidateName || '', disabled: true }],
    type: [{ value: interviewData?.type || '', disabled: true }],
    position: [{ value: interviewData?.position || '', disabled: true }],
    });

  }
  

  loadEvaluators(): void {
  const interviewType = this.data.interview?.type?.toLowerCase(); // "rh", "technique", "managerial"

  this.userService.getAllUsersByRole('EVALUATEUR').subscribe((users: User[]) => {
    this.evaluators = users.filter(user =>
  user.role === Role[interviewType.toUpperCase() as keyof typeof Role]
);
  });
}

  

  onSubmit() {
    if (this.interviewForm.valid) {
      this.dialogRef.close(this.interviewForm.value);
    }
  }

     save(): void {
    if (this.interviewForm.valid) {
      // ✅ CORRECTION N°2 : Transformer les données avant de les renvoyer
      const formValues = this.interviewForm.getRawValue();

      const resultToReturn = {
        date: formValues.date,
        time: formValues.time,
        // Créer une propriété propre 'evaluatorId' que le composant parent pourra utiliser
        evaluatorId: formValues['evaluator*'],
        // Inclure les autres champs si nécessaire
        position: formValues.position,
        type: formValues.type,
        candidateName: formValues.candidateName
      };

      this.dialogRef.close(resultToReturn); // Renvoyer l'objet de données nettoyé
    } else {
      // Optionnel : dire à l'utilisateur pourquoi ça ne marche pas
      console.error("Le formulaire est invalide.", this.interviewForm.errors);
      // Marquer tous les champs comme "touchés" pour afficher les erreurs de validation s'il y en a
      this.interviewForm.markAllAsTouched(); 
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  editInterview(interview: any) {
  const dialogRef = this.dialog.open(EditInterviewComponent, {
    width: '500px',
    data: interview
  })
}
 close(): void {
    this.dialogRef.close();
  }
}


