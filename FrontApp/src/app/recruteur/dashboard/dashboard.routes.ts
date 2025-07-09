import { Route } from '@angular/router';
import { MainComponent } from './main/main.component';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CandidateListComponent } from '../dashboard/candidates/list/list.component';
import { AddCandidateComponent } from '../dashboard/candidates/add/add.component';
import { AddRecruitmentComponent } from './candidates/recrutement/add.component';
import { CandidateHistoryComponent } from './candidates/history/candidate-history.component';

export const DASHBOARD_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'sidebar',
    component: SidebarComponent
  },
  {
    path: 'candidates',
    children: [
      {
        path: 'list',
        component: CandidateListComponent
      },
      {
        path: 'add',
        component: AddCandidateComponent
      },
            {
        path: 'recrutement',
        component: AddRecruitmentComponent
      },
                  {
        path: 'history',
        component: CandidateHistoryComponent
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      }
    ]
  },
  { 
    path: '**',
    component: Page404Component 
  }
];