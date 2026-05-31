import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
      <p class="text-gray-500 mb-8">Resumen general del sistema</p>

      <div class="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-5">
        @for (card of statCards(); track card.label) {
          <a [routerLink]="card.link" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all block">
            <div class="text-3xl font-bold text-gray-900">{{ card.value }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ card.label }}</div>
            <div class="text-xl mt-2">{{ card.icon }}</div>
          </a>
        }
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        @for (action of quickActions; track action.label) {
          <a [routerLink]="action.link" class="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:border-blue-300 transition-all">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" [style.background]="action.bg">{{ action.icon }}</div>
            <div>
              <div class="font-medium text-gray-900">{{ action.label }}</div>
              <div class="text-sm text-gray-500">{{ action.desc }}</div>
            </div>
          </a>
        }
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<any>({});

  statCards() {
    const s = this.stats();
    return [
      { label: 'Equipos',   value: s.teams    || 0, icon: '🛡️', link: '/admin/teams'    },
      { label: 'Jugadores', value: s.players  || 0, icon: '👤', link: '/admin/players'  },
      { label: 'Estadios',  value: s.stadiums || 0, icon: '🏟️', link: '/admin/stadiums' },
      { label: 'Ligas',     value: s.leagues  || 0, icon: '🏆', link: '/admin/leagues'  },
      { label: 'Usuarios',  value: s.users    || 0, icon: '👥', link: '/admin/users'    },
    ];
  }

  quickActions = [
    { label: 'Añadir equipo',    desc: 'Crear nuevo equipo',       icon: '➕', bg: '#EFF6FF', link: '/admin/teams'   },
    { label: 'Añadir jugador',   desc: 'Registrar nuevo jugador',  icon: '👤', bg: '#F0FDF4', link: '/admin/players' },
    { label: 'Gestionar imágenes', desc: 'Logos y fotos',         icon: '🖼️', bg: '#FFFBEB', link: '/admin/teams'   },
    { label: 'Añadir estadística', desc: 'Registrar nueva temporada', icon: '📈', bg: '#FDF2F8', link: '/admin/stats' },
  ];

  constructor(private admin: AdminService) {}

  ngOnInit() {
    this.admin.getStats().subscribe(s => this.stats.set(s));
  }
}
