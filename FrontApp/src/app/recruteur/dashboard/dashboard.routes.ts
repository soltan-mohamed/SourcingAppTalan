import { Route } from '@angular/router';
import { MainComponent } from './main/main.component';
//import { Dashboard2Component } from './dashboard2/dashboard2.component';
//import { DashboardComponent as StudentDashboard } from 'app/student/dashboard/dashboard.component';
//import { DashboardComponent } from 'app/teacher/dashboard/dashboard.component';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { SidebarComponent } from './sidebar/sidebar.component';
export const DASHBOARD_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'main',
    component: MainComponent,
  },

    {
    path: 'sidebar',
    component: SidebarComponent,
  },


  { path: '**', component: Page404Component },
];
