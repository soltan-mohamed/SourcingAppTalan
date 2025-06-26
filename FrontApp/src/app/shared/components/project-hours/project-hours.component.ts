import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-project-hours',
    imports: [CommonModule],
    templateUrl: './project-hours.component.html',
    styleUrl: './project-hours.component.scss'
})
export class ProjectHoursComponent {
  // Sample data
  completedHours: number = 3487;
  expectedHours: number = 10000;

  // Data for progress bars
  progressBars = [
    { color: 'bg-red', percentage: 33 },
    { color: 'bg-blue', percentage: 25 },
    { color: 'bg-amber', percentage: 12 },
    { color: 'bg-purple', percentage: 10 },
    { color: 'bg-green', percentage: 7 },
    { color: 'bg-cyan', percentage: 13 },
  ];

  // Projects data
  projects = [
    { name: 'Angular website', completed: 33, color: 'col-red' },
    { name: 'Shopping App', completed: 25, color: 'col-blue' },
    { name: 'ERP system', completed: 12, color: 'col-amber' },
    { name: 'React recruteur panel', completed: 10, color: 'col-purple' },
    { name: 'Api Integration', completed: 7, color: 'col-green' },
    { name: 'Email Marketing', completed: 13, color: 'col-cyan' },
  ];
}
