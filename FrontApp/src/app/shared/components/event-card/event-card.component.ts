import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Event {
  day: string;
  date: number;
  month: string;
  title: string;
  timeStart: string;
  timeEnd: string;
  status?: string;
}

@Component({
    selector: 'app-event-card',
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
    templateUrl: './event-card.component.html',
    styleUrl: './event-card.component.scss'
})
export class EventCardComponent {
  @Input() events: Event[] = [];
  @Input() maxEvents: number = 3;
  @Input() showViewMore: boolean = true;
}
