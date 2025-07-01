import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSelectModule } from '@angular/material/select'; // ✅ Required for <mat-select> and <mat-option>



@Component({
  selector: 'app-edit-interview',
  templateUrl: './edit-interview.html',
  styleUrls: ['./edit-interview.scss'],
  imports: [ReactiveFormsModule,MatInputModule,MatFormFieldModule, MatButtonModule,FormsModule,MatSelectModule]
})
export class EditInterviewComponent {

  interviewForm!: FormGroup;
  dialog: any;
interview: any={};

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditInterviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit(): void {
    this.interviewForm = this.fb.group({
      date: [this.data.interview?.date || '', Validators.required],
      time: [this.data.interview?.time || '', Validators.required],
      type: [this.data.interview?.type || '', Validators.required],
      evaluator: [this.data.interview?.evaluator || '', Validators.required],
      position: [this.data.interview?.position || '', Validators.required]
    });
  }

  onSubmit() {
    if (this.interviewForm.valid) {
      this.dialogRef.close(this.interviewForm.value);
    }
  }

    save(): void {
    if (this.interviewForm.valid) {
      this.dialogRef.close(this.interviewForm.value); // return updated data
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


