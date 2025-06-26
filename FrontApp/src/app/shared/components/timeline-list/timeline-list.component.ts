
import { Component, Input } from '@angular/core';

export interface TimelineItem {
  image: string;
  title: string;
  timeAgo: string;
}

@Component({
    selector: 'app-timeline-list',
    imports: [],
    templateUrl: './timeline-list.component.html',
    styleUrl: './timeline-list.component.scss'
})
export class TimelineListComponent {
  @Input() timelineItems: TimelineItem[] = [];
}
