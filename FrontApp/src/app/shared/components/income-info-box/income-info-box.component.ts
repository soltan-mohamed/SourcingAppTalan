import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-income-info-box',
    imports: [MatCardModule, CommonModule],
    templateUrl: './income-info-box.component.html',
    styleUrl: './income-info-box.component.scss'
})
export class IncomeInfoBoxComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() value: string | number = '';
  @Input() valueClass: string = ''; // e.g., 'text-info' or 'text-danger'
  @Input() progress: number = 0; // Progress percentage
  @Input() progressClass: string = ''; // e.g., 'l-bg-purple'
  @Input() change: string = ''; // Change percentage or value
}
