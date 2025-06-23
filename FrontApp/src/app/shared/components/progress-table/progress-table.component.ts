import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBar } from '@angular/material/progress-bar';

export interface SubjectProgress {
  subject: string;
  progress: number;
  duration: string;
}

@Component({
  selector: 'app-progress-table',
  imports: [MatCardModule, MatButtonModule, MatTableModule, MatProgressBar],
  templateUrl: './progress-table.component.html',
  styleUrl: './progress-table.component.scss',
})
export class ProgressTableComponent {
  @Input() subjects: SubjectProgress[] = [];
}
