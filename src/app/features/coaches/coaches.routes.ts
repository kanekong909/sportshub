import { Routes } from '@angular/router';

export const COACHES_ROUTES: Routes = [
  { path: '',      loadComponent: () => import('./coach-list/coach-list.component').then(m => m.CoachListComponent) },
  { path: ':slug', loadComponent: () => import('./coach-detail/coach-detail.component').then(m => m.CoachDetailComponent) },
];
