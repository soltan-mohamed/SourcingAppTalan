
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-noticeboard',
    imports: [MatCardModule],
    templateUrl: './noticeboard.component.html',
    styleUrl: './noticeboard.component.scss'
})
export class NoticeboardComponent {
  notices = [
    {
      title: 'Annual Sports Day Announcement',
      author: 'Emily Johnson',
      image: 'assets/images/user/user1.jpg',
    },
    {
      title: 'Midterm Exam Schedule Released',
      author: 'Michael Smith',
      image: 'assets/images/user/user5.jpg',
    },
    {
      title: 'Parent-Teacher Meeting Reminder',
      author: 'Sarah Brown',
      image: 'assets/images/user/user7.jpg',
    },
    {
      title: 'Library Renovation Notice',
      author: 'David Wilson',
      image: 'assets/images/user/user8.jpg',
    },
    {
      title: 'Field Trip to Science Museum',
      author: 'Laura Martinez',
      image: 'assets/images/user/user9.jpg',
    },
    {
      title: 'New Extracurricular Activities Available',
      author: 'Chris Taylor',
      image: 'assets/images/user/user10.jpg',
    },
    {
      title: 'End of Year Award Ceremony Details',
      author: 'Sophia Garcia',
      image: 'assets/images/user/user11.jpg',
    },
  ];
}
