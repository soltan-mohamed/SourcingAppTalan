import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-small-card-chart',
    imports: [
        MatCardModule,
        NgApexchartsModule,
        MatIconModule,
    ],
    templateUrl: './small-card-chart.component.html',
    styleUrl: './small-card-chart.component.scss'
})
export class SmallCardChartComponent implements OnInit {
  // Input properties for dynamic content
  @Input() title: string = '';
  @Input() amount: string = '';
  @Input() percentageChange: string = '';
  @Input() profitData: number[] = [];
  @Input() chartCategories: string[] = [];

  // Chart options
  smallChart5Options: any;

  constructor() {}

  ngOnInit(): void {
    // Initialize the chart with dynamic data
    this.initChart();
  }

  // Function to initialize the chart with dynamic options
  private initChart() {
    this.smallChart5Options = {
      colors: ['#4b6dff'],
      series: [
        {
          name: 'Profit',
          data: this.profitData, // Dynamic data for the chart
        },
      ],
      chart: {
        height: 90,
        type: 'bar',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          columnWidth: '50%',
        },
      },
      xaxis: {
        categories: this.chartCategories, // Dynamic categories
        position: 'top',
        tooltip: {
          enabled: true,
          offsetY: -35,
        },
      },
      legend: {
        show: false,
      },
      yaxis: {
        show: false,
      },
      tooltip: {
        theme: 'dark',
      },
    };
  }
}
