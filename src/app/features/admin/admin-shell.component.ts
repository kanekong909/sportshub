import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span>⚙️</span>
          <span>Admin Panel</span>
        </div>
        <nav class="sidebar-nav">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" class="nav-item">
              <i [class]="'pi ' + item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
        <div class="sidebar-footer">
          <a routerLink="/home" class="nav-item">
            <i class="pi pi-arrow-left"></i>
            <span>Volver al sitio</span>
          </a>
        </div>
      </aside>

      <!-- Contenido -->
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 220px; background: #1e293b; color: #e2e8f0;
      display: flex; flex-direction: column; flex-shrink: 0; position: fixed;
      top: 0; left: 0; bottom: 0; z-index: 50;
    }
    .sidebar-logo {
      padding: 20px 16px; font-size: 15px; font-weight: 600;
      border-bottom: 1px solid #334155; display: flex; align-items: center; gap: 8px;
    }
    .sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px; padding: 9px 12px;
      border-radius: 8px; text-decoration: none; color: #94a3b8; font-size: 14px;
      transition: all .15s; cursor: pointer;
    }
    .nav-item:hover { background: #334155; color: #e2e8f0; }
    .nav-item.active { background: #3b82f6; color: #fff; }
    .nav-item i { font-size: 15px; width: 18px; text-align: center; }
    .sidebar-footer { padding: 12px 8px; border-top: 1px solid #334155; }
    .admin-main { margin-left: 220px; flex: 1; background: #f8fafc; min-height: 100vh; }
  `]
})
export class AdminShellComponent {
  navItems = [
    { path: '/admin/dashboard', icon: 'pi-chart-bar',    label: 'Dashboard'  },
    { path: '/admin/teams',     icon: 'pi-shield',       label: 'Equipos'    },
    { path: '/admin/players',   icon: 'pi-user',         label: 'Jugadores'  },
    { path: '/admin/transfers', icon: 'pi-arrows-h',     label: 'Traspasos'  },
    { path: '/admin/stadiums',  icon: 'pi-building',     label: 'Estadios'   },
    { path: '/admin/leagues',   icon: 'pi-list',         label: 'Ligas'      },
    { path: '/admin/users',     icon: 'pi-users',        label: 'Usuarios'   },
  ];
  constructor(public auth: AuthService) {}
}
