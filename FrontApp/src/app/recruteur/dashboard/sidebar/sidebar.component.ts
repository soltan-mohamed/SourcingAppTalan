// sidebar.component.ts
import { NgClass, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/service/auth.service';
/*import { AttendanceChartComponent } from '@shared/components/attendance-chart/attendance-chart.component';
import { ChartCard1Component } from '@shared/components/chart-card1/chart-card1.component';
import { ChartCard4Component } from '@shared/components/chart-card4/chart-card4.component';
import { EmpStatusComponent } from '@shared/components/emp-status/emp-status.component';
import { EmpStatus1Component } from '@shared/components/emp-status1/emp-status1.component';
import { ScheduleCardComponent } from '@shared/components/schedule-card/schedule-card.component';*/
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgScrollbar } from 'ngx-scrollbar';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
    imports: [
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatIconModule,
    NgApexchartsModule,
    RouterLink,
    NgClass,
    NgIf

  ],
})
export class SidebarComponent {
  @Input() activeItem: string = 'home';
  @Input() isAuthenticated: boolean = true;
  @Input() userName: string = 'Anouar Khemeja';
  @Input() userRole: string = 'Recruteur';
  
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() activeItemChange = new EventEmitter<string>();

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.logoutEvent.emit();
  }

  setActiveItem(item: string) {
    this.activeItem = item;
    this.activeItemChange.emit(item);
  }
}