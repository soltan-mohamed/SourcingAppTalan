import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import {
  ApexChart,
  ApexFill,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type chartOptions = {
  series: any[];
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
};

@Component({
    selector: 'app-attendance-chart',
    imports: [
        MatCardModule,
        NgApexchartsModule,
        MatCardModule,
        MatButtonModule,
        MatSelectModule,
    ],
    templateUrl: './attendance-chart.component.html',
    styleUrl: './attendance-chart.component.scss'
})
export class AttendanceChartComponent {
  public attendanceChartOptions!: Partial<chartOptions>;
  classValue: 'class1' | 'class2' | 'class3' = 'class1';

  data = {
    class1: [
      { name: 'Accepted', data: [80, 70, 90, 60, 85] },
      { name: 'Refused', data: [20, 30, 10, 40, 15] },
    ],
    class2: [
      { name: 'Accepted', data: [75, 80, 70, 65, 85] },
      { name: 'Refused', data: [25, 20, 30, 35, 15] },
    ],
    class3: [
      { name: 'Accepted', data: [90, 85, 80, 75, 95] },
      { name: 'Refused', data: [10, 15, 20, 25, 5] },
    ],
  };

  constructor() {
    this.initializeChart();
  }

  public initializeChart() {
    this.attendanceChartOptions = {
      series: this.data[this.classValue],
      chart: {
        type: 'bar',
        height: 300,
        stacked: true,
        toolbar: {
          show: false,
        },
        foreColor: '#9aa0ac',
      },
      xaxis: {
        categories: ['2021', '2022', '2023', '2024', '2025'],
      },
      yaxis: {
        max: 100,
        labels: {
          formatter: (value) => `${value}%`,
        },
      },
      fill: {
        colors: ['#6DA344', '#95B873'],
      },
      tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: '50%',
        },
      },
    };
  }

  updateChart() {
    this.attendanceChartOptions.series = this.data[this.classValue];
  }
}
