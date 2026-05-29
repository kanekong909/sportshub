import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TeamsService } from '../../../core/services/teams.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Team } from '../../../core/models';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './team-detail.component.html',
  styleUrl: './team-detail.component.css'
})
export class TeamDetailComponent implements OnInit {
  // 1. Estados reactivos base
  team = signal<Team | null>(null);
  loading = signal(true);
  isFavorite = signal(false);
  activeTab = signal('squad');

  tabs = [
    { key: 'squad',   label: 'Plantilla'    },
    { key: 'history', label: 'Historia'     },
    { key: 'stats',   label: 'Estadísticas' },
    { key: 'stadium', label: 'Estadio'      },
    { key: 'titles',  label: 'Palmarés'     },
  ];

  // 2. Signals Computados (Se calculan automáticamente cuando 'team' cambia)
  heroStats = computed(() => {
    const t = this.team();
    if (!t) return [];

    const titles = t.titles || [];
    const capacity = t.stadium?.capacity;

    return [
      { label: 'Títulos totales', value: titles.length },
      { label: 'Fundación',       value: t.foundedYear || '—' },
      { label: 'Jugadores',       value: t.players?.length || 0 },
      { label: 'Aforo estadio',   value: capacity ? `${(capacity / 1000).toFixed(0)}k` : '—' },
    ];
  });

  groupedTitles = computed(() => {
    const titles = this.team()?.titles || [];
    const map = new Map<string, number>();
    
    titles.forEach(t => map.set(t.name, (map.get(t.name) || 0) + 1));
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  });

  constructor(
    private route: ActivatedRoute,
    private teamsService: TeamsService,
    private userService: UserService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    
    this.teamsService.getBySlug(slug).subscribe({
      next: (team) => {
        this.team.set(team);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    if (this.auth.isLoggedIn()) {
      this.userService.getFavoriteTeams().subscribe({
        next: (favs) => {
          this.isFavorite.set(favs.some((f: any) => f.team.slug === slug));
        }
      });
    }
  }

  toggleFavorite() {
    const currentTeam = this.team();
    if (!currentTeam) return;

    const id = currentTeam.id;
    if (this.isFavorite()) {
      this.userService.removeFavoriteTeam(id).subscribe(() => this.isFavorite.set(false));
    } else {
      this.userService.addFavoriteTeam(id).subscribe(() => this.isFavorite.set(true));
    }
  }
}
