import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

export interface Task {
  name: string;
  status: string;
  statusClass: string;
  manager: string;
  progress: number;
  progressBarClass: string;
}

export interface Employee {
  name: string;
  imgUrl: string;
  tasks: Task[];
}

@Component({
    selector: 'app-emp-task-tab',
    imports: [MatTabsModule, NgClass],
    templateUrl: './emp-task-tab.component.html',
    styleUrl: './emp-task-tab.component.scss'
})
export class EmpTaskTabComponent {
  @Input() employees: Employee[] = [];
}
