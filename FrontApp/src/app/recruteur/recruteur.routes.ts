import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { MainComponent } from './dashboard/main/main.component';
import { SidebarComponent } from './dashboard/sidebar/sidebar.component';

export const RECRUTEUR_ROUTE: Route[] = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        children: [
          {
            path: 'main',
            component: MainComponent 
          },
                    {
            path: 'sidebar',
            component: SidebarComponent 
          }
        ]
      },
      { 
        path: '',
        redirectTo: 'dashboard/main',
        pathMatch: 'full'
      }
    ]
  },
  { path: '**', component: Page404Component }
];

