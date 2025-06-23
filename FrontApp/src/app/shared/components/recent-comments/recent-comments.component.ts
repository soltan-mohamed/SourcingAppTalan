
import { Component, Input } from '@angular/core';

interface Comment {
  name: string;
  message: string;
  timestamp: string;
  imgSrc: string;
  colorClass: string;
}

@Component({
    selector: 'app-recent-comments',
    imports: [],
    templateUrl: './recent-comments.component.html',
    styleUrl: './recent-comments.component.scss'
})
export class RecentCommentsComponent {
  @Input() comments: Comment[] = [];
}
