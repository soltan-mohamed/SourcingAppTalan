import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    selector: 'app-top-performer',
    imports: [
        MatTabsModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        MatProgressBarModule,
    ],
    templateUrl: './top-performer.component.html',
    styleUrl: './top-performer.component.scss'
})
export class TopPerformerComponent {
  // Different datasets for each tab
  weekPerformers = [
    {
      photo: 'assets/images/user/user1.jpg',
      name: 'Alice Johnson',
      id: 5001,
      standard: '5th Class',
      percentage: '88.68%',
      rank: '1st Rank',
    },
    {
      photo: 'assets/images/user/user2.jpg',
      name: 'Ethan Williams',
      id: 5002,
      standard: '6th Class',
      percentage: '92.42%',
      rank: '1st Rank',
    },
    {
      photo: 'assets/images/user/user7.jpg',
      name: 'Mia Thompson',
      id: 5003,
      standard: '7th Class',
      percentage: '89.34%',
      rank: '1st Rank',
    },
    {
      photo: 'assets/images/user/user8.jpg',
      name: 'Oliver Martinez',
      id: 5004,
      standard: '8th Class',
      percentage: '78.91%',
      rank: '1st Rank',
    },
  ];

  monthPerformers = [
    {
      photo: 'assets/images/user/user3.jpg',
      name: 'Sophia Brown',
      id: 6001,
      standard: '4th Class',
      percentage: '97.00%',
      rank: '1st Rank',
    },
    {
      photo: 'assets/images/user/user4.jpg',
      name: 'Liam Davis',
      id: 6002,
      standard: '5th Class',
      percentage: '96.80%',
      rank: '1st Rank',
    },
    {
      photo: 'assets/images/user/user9.jpg',
      name: 'Emma Wilson',
      id: 6003,
      standard: '6th Class',
      percentage: '95.55%',
      rank: '1st Rank',
    },
    {
      photo: 'assets/images/user/user10.jpg',
      name: 'James Smith',
      id: 6004,
      standard: '7th Class',
      percentage: '92.34%',
      rank: '1st Rank',
    },
  ];

  yearPerformers = [
    {
      photo: 'assets/images/user/user5.jpg',
      name: 'Isabella Garcia',
      id: 7001,
      standard: '8th Class',
      percentage: '99.50%',
      rank: '1st Rank',
    },
    {
      photo: 'assets/images/user/user6.jpg',
      name: 'Michael Johnson',
      id: 7002,
      standard: '9th Class',
      percentage: '99.10%',
      rank: '1st Rank',
    },
    {
      photo: 'assets/images/user/user11.jpg',
      name: 'Ava Lee',
      id: 7003,
      standard: '10th Class',
      percentage: '98.75%',
      rank: '1st Rank',
    },
    {
      photo: 'assets/images/user/user5.jpg',
      name: 'Daniel Rodriguez',
      id: 7004,
      standard: '9th Class',
      percentage: '97.88%',
      rank: '1st Rank',
    },
  ];
  // Data displayed in the table (default to Week's data)
  displayedPerformers = this.weekPerformers;

  // Table columns
  displayedColumns: string[] = [
    'photo',
    'name',
    'standard',
    'percentage',
    'rank',
  ];

  // Handle tab change to load corresponding data
  onTabChange(index: number) {
    switch (index) {
      case 0: // Week tab
        this.displayedPerformers = this.weekPerformers;
        break;
      case 1: // Month tab
        this.displayedPerformers = this.monthPerformers;
        break;
      case 2: // Year tab
        this.displayedPerformers = this.yearPerformers;
        break;
    }
  }
}
