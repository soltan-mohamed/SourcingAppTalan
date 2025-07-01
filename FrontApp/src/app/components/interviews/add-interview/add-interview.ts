import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-interview-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2>Add Interview</h2>
    <form class="dialog-form" (ngSubmit)="save()">
      <input [(ngModel)]="interview.candidate" name="candidate" placeholder="Candidate" required />
      <input [(ngModel)]="interview.date" name="date" type="date" required />
      <input [(ngModel)]="interview.time" name="time" type="time" required />

      <mat-select [(ngModel)]="interview.type" name="type" placeholder="Type" required>
        <mat-option value="Technique">Technique</mat-option>
        <mat-option value="RH">RH</mat-option>
        <mat-option value="Managerial">Managerial</mat-option>
      </mat-select>

      <input [(ngModel)]="interview.evaluator" name="evaluator" placeholder="Evaluator" required />

      <div class="dialog-actions">
        <button mat-button type="submit">Save</button>
        <button mat-button (click)="dialogRef.close()">Cancel</button>
      </div>
    </form>
  `,
  styleUrls: ['./add-interview.scss']
})
export class AddInterviewComponent {
  interview = {
    candidate: '',
    date: '',
    time: '',
    type: '',
    evaluator: ''
  };

  constructor(public dialogRef: MatDialogRef<AddInterviewComponent>) {}

  save() {
    if (this.interview.candidate && this.interview.date) {
      this.dialogRef.close(this.interview);
    }
  }
}
