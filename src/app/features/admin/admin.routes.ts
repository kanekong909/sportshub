import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',  loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'teams',      loadComponent: () => import('./teams/admin-teams.component').then(m => m.AdminTeamsComponent) },
      { path: 'players',    loadComponent: () => import('./players/admin-players.component').then(m => m.AdminPlayersComponent) },
      { path: 'transfers',  loadComponent: () => import('./transfers/admin-transfers.component').then(m => m.AdminTransfersComponent) },
      { path: 'seasons',    loadComponent: () => import('./seasons/admin-seasons.component').then(m => m.AdminSeasonsComponent) },
      { path: 'stadiums',   loadComponent: () => import('./stadiums/admin-stadiums.component').then(m => m.AdminStadiumsComponent) },
      { path: 'leagues',    loadComponent: () => import('./leagues/admin-leagues.component').then(m => m.AdminLeaguesComponent) },
      {
        path: 'stats',
        loadComponent: () => import('./stats/admin-stats.component').then(m => m.AdminStatsComponent)
      },
      { path: 'coaches', loadComponent: () => import('./coaches/admin-coaches.component').then(m => m.AdminCoachesComponent) },
      { path: 'users',      loadComponent: () => import('./users/admin-users.component').then(m => m.AdminUsersComponent) },
    ]
  }
];
