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
    const dateString = interviewData?.date; 
   let dateValue = '';
    let timeValue = '';
    if (dateString && dateString.includes('T')) {
       const parts = dateString.split('T');
      dateValue = parts[0]; // "2025-08-22"
      timeValue = parts[1].substring(0, 5); // "09:30"
    }
    
    else {
      console.error("The incoming date format is not what we expect:", dateString);
    }
     console.log(`DISPLAYING: Date='${dateValue}', Time='${timeValue}'`);
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
  const interviewType = this.data.interview?.type?.toUpperCase(); // "rh", "technique", "managerial"
  if (!interviewType) {
    console.warn("Interview type is not defined. Cannot filter evaluators.");
    this.evaluators = []; // Set evaluators to an empty array to prevent further errors.
    return; // Exit the function early.
  }
  let role = "";
  if (interviewType === "RH") {
    role = "RECRUTEUR";
  } else if (interviewType === "MANAGERIAL") {
    role = "MANAGER";
  } else if (interviewType === "TECHNIQUE") {
    role = "EVALUATEUR";
  } else {
    console.warn("Type d'entretien inconnu :", interviewType);
    return;
  }
 this.userService.getAllUsersByRole(role).subscribe({
    next: (users: User[]) => {
      this.evaluators = users;
    },
    error: (error) => {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    }
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
       const combinedDateTime = `${formValues.date}T${formValues.time}`;
      const resultToReturn = {
         date: combinedDateTime, 
        // Créer une propriété propre 'evaluatorId' que le composant parent pourra utiliser
        evaluatorId: formValues['evaluator*'],
        // Inclure les autres champs si nécessaire
        position:this.data.interview.position,
        type:this.data.interview.type,
        candidateName:this.data.interview.candidateName,
        description: this.data.interview.description,
         statut: this.data.interview.statut,
         id: this.data.interview.id
      };
       console.log(`[DEBUG 4] PAYLOAD SENT TO BACKEND:`, JSON.stringify(resultToReturn));
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

  toUTC(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}

}


