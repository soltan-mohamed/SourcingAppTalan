import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-statistic-card1',
    imports: [MatCardModule, CommonModule],
    templateUrl: './statistic-card1.component.html',
    styleUrl: './statistic-card1.component.scss'
})
export class StatisticCard1Component {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() percentage: string | number = '';
  @Input() increase: boolean = true;
  @Input() imageUrl: string = '';
}
