import { Route } from '@angular/router';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { AuthGuard } from '../app/core/guard/auth.guard';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { Page404Component } from './authentication/page404/page404.component';
//import { Role } from '../app/models/role';
//import { Home } from './components/home/home';
//import { Candidates } from './components/candidates/candidates';
import { Home } from './components/home/home';
import { Candidates } from './components/candidates/candidates';
import { InterviewsComponent } from './components/interviews/interviews';
export const APP_ROUTE: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },

{
  path: 'recruteur',
  canActivate: [AuthGuard],
  data: {
    role: 'RECRUTEUR'  // Use string literal to ensure exact match
  },
  loadChildren: () =>
    import('./recruteur/recruteur.routes').then((m) => m.RECRUTEUR_ROUTE),
},
      // ... autres routes
    ],
  },
  /*{
    path: 'home',
    component: Home,
    children : [
      {path : 'list-candidates', component : Candidates }
    ]
  },*/
  {
    path: 'home',
    component: Home,
    children : [
      {path : 'list-candidates', component : Candidates },
      { path: 'my-interviews', component: InterviewsComponent }

    ]
  },
  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
  },
  { path: '**', component: Page404Component },
];
