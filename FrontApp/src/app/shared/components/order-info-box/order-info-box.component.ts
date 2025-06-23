import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-order-info-box',
    imports: [MatCardModule, CommonModule],
    templateUrl: './order-info-box.component.html',
    styleUrl: './order-info-box.component.scss'
})
export class OrderInfoBoxComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() percentageText: string = '';
  @Input() iconClass: string = '';
  @Input() bgClass: string = '';
}
