
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-statistic-card2',
    imports: [MatCardModule, MatIconModule],
    templateUrl: './statistic-card2.component.html',
    styleUrl: './statistic-card2.component.scss'
})
export class StatisticCard2Component {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() description: string = '';
  @Input() img: string = '';
  @Input() arrowIcon: string = '';
}
