import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-appointment-card',
    imports: [MatCardModule],
    templateUrl: './appointment-card.component.html',
    styleUrl: './appointment-card.component.scss'
})
export class AppointmentCardComponent {
  @Input() totalAppointments: number = 0;
  @Input() completed: number = 0;
  @Input() upcoming: number = 0;
}
