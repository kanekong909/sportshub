import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TeamsService } from '../../../core/services/teams.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { SeasonService } from '../../../core/services/season.service';
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

  teamSeasons      = signal<any[]>([]);
  selectedSeasonId = signal<string>('');
  displayPlayers   = signal<any[]>([]);
  squadLoading     = signal(false);

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

  // Jugadores por posicion
  playersByPosition = computed(() => {
    const players = this.displayPlayers();
    const groups = new Map<string, any[]>();

    // Orden de posiciones para mostrar
    const positionOrder = ['GK', 'DEF', 'MID', 'FWD'];

    // Inicializar grupos vacíos
    positionOrder.forEach(pos => groups.set(pos, []));
    groups.set('other', []);

    // Clasificar jugadores
    players.forEach(player => {
      const code = player.position?.code?.toUpperCase() || '';
      if (positionOrder.includes(code)) {
        groups.get(code)?.push(player);
      } else {
        groups.get('other')?.push(player);
      }
    });

    // Ordenar jugadores por número de camiseta dentro de cada grupo
    groups.forEach((playersList, key) => {
      playersList.sort((a, b) => (a.jerseyNumber || 999) - (b.jerseyNumber || 999));
    });

    return {
      GK: { players: groups.get('GK') || [], label: 'Porteros', icon: '🧤' },
      DEF: { players: groups.get('DEF') || [], label: 'Defensas', icon: '🛡️' },
      MID: { players: groups.get('MID') || [], label: 'Mediocampistas', icon: '⚡' },
      FWD: { players: groups.get('FWD') || [], label: 'Delanteros', icon: '🎯' },
      other: { players: groups.get('other') || [], label: 'Otros', icon: '🏃' }
    };
  });

  constructor(
    private route: ActivatedRoute,
    private teamsService: TeamsService,
    private userService: UserService,
    public auth: AuthService,
    private seasonService: SeasonService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.teamsService.getBySlug(slug).subscribe({
      next: (team) => {
        this.team.set(team);
        this.loading.set(false);
        // this.displayPlayers.set(team.players || []);
        this.loadCurrentSquad();
        this.loadTeamSeasons(slug);
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

  loadTeamSeasons(slug: string) {
    this.teamsService.getTeamSeasons(slug).subscribe(seasons => {
      this.teamSeasons.set(seasons);
    });
  }

  loadCurrentPlayers() {
    this.selectedSeasonId.set('');
    this.displayPlayers.set(this.team()?.players || []);
  }

  loadSeasonSquad(season: any) {
    this.selectedSeasonId.set(season.id);
    this.squadLoading.set(true);
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.teamsService.getSquadBySeason(slug, season.id).subscribe(entries => {
      this.displayPlayers.set(entries.map((e: any) => ({
        ...e.player,
        photoUrl: e.photoUrl || e.player.photoUrl, // foto de temporada primero, luego la general
      })));
      this.squadLoading.set(false);
    });
  }

  loadCurrentSquad() {
    const currentTeam = this.team();
    if (!currentTeam) return;

    this.squadLoading.set(true);
    this.seasonService.getCurrentSquad(currentTeam.id).subscribe({
      next: (data) => {
        // data viene como PlayerSeasonTeam[] con player anidado
        this.displayPlayers.set(data.map((item: any) => item.player));
        this.selectedSeasonId.set(''); // marca "Actual" como seleccionado
        this.squadLoading.set(false);
      },
      error: () => {
        this.displayPlayers.set([]);
        this.squadLoading.set(false);
      }
    });
  }

  onSeasonChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (value === 'current') {
      this.loadCurrentSquad();
    } else {
      const season = this.teamSeasons().find(s => s.id === value);
      if (season) {
        this.loadSeasonSquad(season);
      }
    }
  }
}
