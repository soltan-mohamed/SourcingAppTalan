import { Route } from '@angular/router';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { AuthGuard } from '../app/core/guard/auth.guard';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { Page404Component } from './authentication/page404/page404.component';
import { Role } from '../app/models/role';

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
          role: Role.Recruteur,
        },
        loadChildren: () =>
          import('./recruteur/recruteur.routes').then((m) => m.RECRUTEUR_ROUTE),
      },
     /* {
        path: 'teacher',
        canActivate: [AuthGuard],
        data: {
          role: Role.Evaluateur,
        },
        loadChildren: () =>
          import('./teacher/teacher.routes').then((m) => m.TEACHER_ROUTE),
      },
      {
        path: 'student',
        canActivate: [AuthGuard],
        data: {
          role: Role.Manager,
        },
        loadChildren: () =>
          import('./student/student.routes').then((m) => m.STUDENT_ROUTE),
      },*/

    ],
  },
  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
  },
  { path: '**', component: Page404Component },
];
