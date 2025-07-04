import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexYAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexLegend,
  ApexMarkers,
  ApexGrid,
  ApexTitleSubtitle,
  ApexFill,
  ApexResponsive,
  ApexTheme,
  ApexNonAxisChartSeries,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';

//import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
//import { StatisticCard2Component } from '@shared/components/statistic-card2/statistic-card2.component';
import { MatCardModule } from '@angular/material/card';
/*import { AttendanceChartComponent } from '@shared/components/attendance-chart/attendance-chart.component';
import { ChartCard4Component } from '@shared/components/chart-card4/chart-card4.component';
import { EventCardComponent } from '@shared/components/event-card/event-card.component';
import { ScheduleCardComponent } from '@shared/components/schedule-card/schedule-card.component';
import { EmpStatusComponent } from '@shared/components/emp-status/emp-status.component';
import { ChartCard1Component } from '@shared/components/chart-card1/chart-card1.component';
import { EmpStatus1Component } from '@shared/components/emp-status1/emp-status1.component';*/
import { AuthService } from '@core';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
export type chartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  legend: ApexLegend;
  markers: ApexMarkers;
  grid: ApexGrid;
  title: ApexTitleSubtitle;
  colors: string[];
  responsive: ApexResponsive[];
  labels: string[];
  theme: ApexTheme;
  series2: ApexNonAxisChartSeries;
};

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    SidebarComponent, // Add this import

    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatIconModule,
    NgApexchartsModule,
    NgScrollbar,
    TableCardComponent,

    /*AttendanceChartComponent,
    ChartCard4Component,
    ScheduleCardComponent,
    EmpStatusComponent,
    EmpStatus1Component,
    ChartCard1Component,*/


  ],
})
export class MainComponent implements OnInit {

  role : string = "";
  sideBarOpened: boolean = true; // Set to true to keep sidebar open by default
  activeItem: string = 'home';
  currentUser: any;
  isAuthenticated: boolean = true;

  @ViewChild('chart') chart!: ChartComponent;
  public performanceRateChartOptions!: Partial<chartOptions>;

  title2 = 'Admission chart';
  subtitle2 = 'New admission in the last 5 years in Talan';

  breadscrums = [
    {
      title: 'Dashboad',
      items: [],
      active: 'Dashboard 1',
    },
  ];
  constructor(private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.chart3();

        const currentUrl = this.router.url;
    if (currentUrl.includes('/home/list')) {
      this.activeItem = 'home';
    } else if (currentUrl.includes('/home/my-account')) {
      this.activeItem = 'manage-accounts';
    } else if (currentUrl.includes('/home/my-publications')) {
      this.activeItem = 'my-publications';
    } else {
      this.activeItem = 'home';
    }
  }

    logout() {
    this.authService.logout();
  }

  // Add this method to your MainComponent class
setActiveItem(item: string) {
  this.activeItem = item;
}

  // Events
  events = [
    {
      day: 'Tuesday',
      date: 4,
      month: 'Jan',
      title: 'Science Fair',
      timeStart: '11:00 AM',
      timeEnd: '12:30 PM',
      status: 'Today',
    },
    {
      day: 'Friday',
      date: 12,
      month: 'Jan',
      title: 'Guest Speaker',
      timeStart: '11:00 AM',
      timeEnd: '12:30 PM',
      status: 'In 8 days',
    },
    {
      day: 'Sunday',
      date: 18,
      month: 'Jan',
      title: 'Art Exhibition Opening',
      timeStart: '01:00 PM',
      timeEnd: '02:30 PM',
      status: 'In 11 days',
    },
  ];

  private chart3() {
    this.performanceRateChartOptions = {
      series: [
        {
          name: 'Condidates',
          data: [40, 20, 30, 36, 24, 19],
        },
      ],
      chart: {
        height: 360,
        type: 'line',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2,
        },
        foreColor: '#9aa0ac',
        toolbar: {
          show: false,
        },
      },
      colors: ['#51E298'],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: 'smooth',
      },
      markers: {
        size: 1,
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      xaxis: {
        categories: ['2000', '2021', '2022', '2023', '2024', '2025'],
        title: {
          text: 'Year',
        },
      },
      yaxis: {
        title: {
          text: 'Condidates',
        },
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

  examList = [
    {
      title: 'Eval 1',
      dateRange: '24-06-2025 | 28-07-2025',
      statusClass: 'colorStyle1',
    },
    {
      title: 'Eval 2',
      dateRange: '30-07-2025 | 15-08-2025',
      statusClass: 'colorStyle2',
    },
    {
      title: 'Eval 3',
      dateRange: '20-08-2025 | 10-09-2025',
      statusClass: 'colorStyle3',
    },
    
  ];

  // Sport Achievements start
  sportData = [
    {
      id: 1,
      name: 'Ahmed Youssef',
      assignedCoach: 'Manager 1',
      email: 'test@gmail.com',
      date: '12/05/2022',
      sportName: 'Front-End Developer',
      img: 'assets/images/user/user1.jpg',
    },
    {
      id: 2,
      name: 'Sarah Al Zahrani',
      assignedCoach: 'Manager 2',
      email: 'test@gmail.com',
      date: '12/05/2022',
      sportName: 'Software Engineer	',
      img: 'assets/images/user/user2.jpg',
    },
    {
      id: 3,
      name: 'Khaled Hassan	',
      assignedCoach: 'Manager 3',
      email: 'test@gmail.com',
      date: '12/05/2022',
      sportName: 'Systems Analyst',
      img: 'assets/images/user/user3.jpg',
    },
    {
      id: 4,
      name: 'Mona Al Omari',
      assignedCoach: 'Manager 4',
      email: 'test@gmail.com',
      date: '12/05/2023',
      sportName: 'Cybersecurity Specialist',
      img: 'assets/images/user/user4.jpg',
    },
    {
      id: 5,
      name: 'Youssef Al Qasemi',
      assignedCoach: 'Manager 5',
      email: 'test@gmail.com',
      date: '12/05/2023',
      sportName: 'Database Administrator',
      img: 'assets/images/user/user5.jpg',
    },
    {
      id: 6,
      name: 'Leila Ben Sassi',
      assignedCoach: 'Manager 6',
      email: 'test@gmail.com',
      date: '12/05/2024',
      sportName: 'Mobile App Developer',
      img: 'assets/images/user/user8.jpg',
    },
    // Add more items as needed
  ];

  sportColumnDefinitions = [
    { def: 'name', label: 'Condidate Name', type: 'text' },
    { def: 'assignedCoach', label: 'Assigned Manager', type: 'text' },
    { def: 'date', label: 'Date', type: 'date' },
    { def: 'sportName', label: 'Function', type: 'text' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];

  // Sport Achievements end

  // New Student List start

  studentData = [
    {
      id: 1,
      name: 'Mohamed Soltan',
      phone: '+21655201869',
      address: 'soltan.mohamed@esprit.tn',
      branch: 'IT',
      dateOfAdmission: '12-06-2025',
      img: 'assets/images/user/user8.jpg',
      feesReceipt: 'download link',
    },
    {
      id: 2,
      name: 'Ons Trabelsi',
      phone: '+21698123456	',
      address: 'ons.trabelsi@gmail.com',
      branch: 'AI',
      dateOfAdmission: '10-05-2025',
      img: 'assets/images/user/user2.jpg',
      feesReceipt: 'download link',
    },
    {
      id: 3,
      name: 'Ahmed Salhi',
      phone: '+21620345678',
      address: 'ahmed.salhi@gmail.com',
      branch: 'IT Support',
      dateOfAdmission: '10-05-2025',
      img: 'assets/images/user/user3.jpg',
      feesReceipt: 'download link',
    },
    {
      id: 4,
      name: 'Seifeddine Gharbi	',
      phone: '+21652987654	',
      address: '	seif.gharbi@gmail.com',
      branch: 'Data Science	',
      dateOfAdmission: '12-06-2025',
      img: 'assets/images/user/user4.jpg',
      feesReceipt: 'download link',
    },
    {
      id: 5,
      name: 'Nour Ben Aissa',
      phone: '+21629456123',
      address: 'nour.aissa@gmail.com',
      branch: 'Web Development',
      dateOfAdmission: '10-06-2025',
      img: 'assets/images/user/user6.jpg',
      feesReceipt: 'download link',
    },
    {
      id: 6,
      name: 'Youssef Kacem',
      phone: '+21623789012',
      address: 'youssef.kacem@gmail.com',
      branch: 'Cybersecurity	',
      dateOfAdmission: '12-06-2025',
      img: 'assets/images/user/user7.jpg',
      feesReceipt: 'download link',
    },
    {
      id: 7,
      name: 'Rania Jaziri	',
      phone: '+21655112334',
      address: 'rania.jaziri@gmail.com',
      branch: 'Cloud Computing',
      dateOfAdmission: '10-06-2025',
      img: 'assets/images/user/user8.jpg',
      feesReceipt: 'download link',
    },
  ];

  studentColumnDefinitions = [
    { def: 'name', label: 'Condidate Name', type: 'text' },
    { def: 'phone', label: 'Phone', type: 'phone' },
    { def: 'address', label: 'Email', type: 'address' },
    { def: 'branch', label: 'Branch', type: 'text' },
    { def: 'dateOfAdmission', label: 'Date', type: 'date' },
    { def: 'feesReceipt', label: 'CV', type: 'file' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];


  
  // New Student List start
}
