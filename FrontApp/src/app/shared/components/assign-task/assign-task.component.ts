import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

interface Task {
  userImage: string;
  userName: string;
  taskDetails: string;
  status: string;
  statusClass: string;
  manager: string;
  progress: number;
  progressClass: string;
}

@Component({
  selector: 'app-assign-task',
  imports: [MatTableModule, CommonModule],
  templateUrl: './assign-task.component.html',
  styleUrl: './assign-task.component.scss',
})
export class AssignTaskComponent {
  @Input() tasks: Task[] = [];
}
