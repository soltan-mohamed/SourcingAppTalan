// chart-card4.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'app-chart-card4',
    imports: [NgxChartsModule, MatCardModule, CommonModule, BaseChartDirective],
    templateUrl: './chart-card4.component.html',
    styleUrls: ['./chart-card4.component.scss']
})
export class ChartCard4Component implements OnInit {
  @Input() maleCount: number = 0;
  @Input() femaleCount: number = 0;

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };

  // public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartType: ChartConfiguration<'doughnut'>['type'] = 'doughnut';

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Male Condidates', 'Female Condidates'],
    datasets: [
      {
        data: [this.maleCount, this.femaleCount],
        backgroundColor: ['#4F58D2', '#EDBE27'],
        borderWidth: 0,
        borderRadius: 5,
        spacing: 5,
      },
    ],
  };

  ngOnInit() {
    // Update chart data if inputs change
    this.doughnutChartData.datasets[0].data = [
      this.maleCount,
      this.femaleCount,
    ];
  }
}
