
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface Post {
  image: string;
  title: string;
  timeAgo: string;
  description: string;
}

@Component({
    selector: 'app-latest-post',
    imports: [MatIconModule],
    templateUrl: './latest-post.component.html',
    styleUrl: './latest-post.component.scss'
})
export class LatestPostComponent {
  @Input() posts: Post[] = [];
}
