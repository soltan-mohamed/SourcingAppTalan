import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'app-info-box1',
    imports: [MatProgressBarModule, NgClass],
    templateUrl: './info-box1.component.html',
    styleUrl: './info-box1.component.scss'
})
export class InfoBox1Component {
  @Input() cardClass: string = '';
  @Input() iconClass: string = '';
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() progressValue: number = 0;
  @Input() progressClass: string = '';
  @Input() percentageChange: number = 0;
}
