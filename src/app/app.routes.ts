import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'teams',
    loadChildren: () => import('./features/teams/teams.routes').then(m => m.TEAMS_ROUTES),
  },
  {
    path: 'players',
    loadChildren: () => import('./features/players/players.routes').then(m => m.PLAYERS_ROUTES),
  },
  {
    path: 'stadiums',
    loadComponent: () => import('./features/stadiums/stadiums.component').then(m => m.StadiumsComponent),
  },
  {
    path: 'coaches',
    loadChildren: () => import('./features/coaches/coaches.routes').then(m => m.COACHES_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: 'home' },
];
