import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamsService } from '../../../core/services/teams.service';
import { Team } from '../../../core/models';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.css'
})
export class TeamListComponent implements OnInit {
  // 1. Signals de estado base
  teams = signal<Team[]>([]);
  loading = signal(true);
  activeSport = signal('');
  activeLeague = signal(''); // Nuevo: filtro por liga
  search = signal('');

  sports = [
    { label: 'Todos', value: '' },
    { label: '⚽ Soccer', value: 'soccer' },
    { label: '🏀 NBA', value: 'nba' },
    { label: '🏈 NFL', value: 'nfl' },
  ];

  // Computed: Ligas únicas disponibles basadas en los equipos
  availableLeagues = computed(() => {
    const allTeams = this.teams();
    const leaguesMap = new Map();

    allTeams.forEach(team => {
      team.leagues?.forEach(teamLeague => {
        const league = teamLeague.league;
        if (league && !leaguesMap.has(league.id)) {
          leaguesMap.set(league.id, {
            id: league.id,
            name: league.name,
            slug: league.slug,
            sportId: league.sport?.id,
            sportName: league.sport?.name,
            logoUrl: league.logoUrl
          });
        }
      });
    });

    return Array.from(leaguesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  });

  // Computed: Ligas filtradas por deporte seleccionado
  filteredLeagues = computed(() => {
    const sportFilter = this.activeSport();
    if (!sportFilter) {
      return this.availableLeagues();
    }
    return this.availableLeagues().filter(league =>
      league.sportId === sportFilter || league.sportName?.toLowerCase() === sportFilter
    );
  });

  // 2. Signal computado (Se actualiza solo de forma automática y óptima)
  filtered = computed(() => {
    let result = this.teams();
    const sportFilter = this.activeSport();
    const leagueFilter = this.activeLeague();
    const searchFilter = this.search().toLowerCase().trim();

    // Filtro por deporte
    if (sportFilter) {
      result = result.filter(t =>
        t.leagues?.some(l => l.league?.sport?.slug === sportFilter)
      );
    }

    // Filtro por liga
    if (leagueFilter) {
      result = result.filter(t =>
        t.leagues?.some(l => l.league?.id === leagueFilter)
      );
    }

    // Filtro por búsqueda
    if (searchFilter) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(searchFilter) ||
        t.city?.toLowerCase().includes(searchFilter) ||
        t.country?.toLowerCase().includes(searchFilter)
      );
    }

    return result;
  });

  constructor(private teamsService: TeamsService) {}

  ngOnInit() {
    this.teamsService.getAll().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // Método para limpiar todos los filtros
  clearFilters() {
    this.search.set('');
    this.activeSport.set('');
    this.activeLeague.set('');
  }

  // Método para contar equipos por liga
  getTeamsCountByLeague(leagueId: string): number {
    if (leagueId === 'all') {
      return this.teams().length;
    }
    return this.teams().filter(t =>
      t.leagues?.some(l => l.league?.id === leagueId)
    ).length;
  }
}
