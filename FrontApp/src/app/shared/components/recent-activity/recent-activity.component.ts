
import { Component, Input } from '@angular/core';

interface Activity {
  timestamp: string;
  message: string;
  statusClass: string;
}

@Component({
    selector: 'app-recent-activity',
    imports: [],
    templateUrl: './recent-activity.component.html',
    styleUrl: './recent-activity.component.scss'
})
export class RecentActivityComponent {
  @Input() activities: Activity[] = [];
}
