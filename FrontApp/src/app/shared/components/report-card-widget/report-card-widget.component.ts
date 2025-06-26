import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-report-card-widget',
    imports: [],
    templateUrl: './report-card-widget.component.html',
    styleUrl: './report-card-widget.component.scss'
})
export class ReportCardWidgetComponent {
  @Input() todayCount: number = 0;
  @Input() weekCount: number = 0;
  @Input() monthCount: number = 0;
  @Input() progressPercentage: number = 0;
  @Input() progressColor: string = 'orange';
  @Input() heading: string = 'Patient Report';
}
