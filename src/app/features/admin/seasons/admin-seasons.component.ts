import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeasonService } from '../../../core/services/season.service';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-seasons',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-seasons.component.html',
  styleUrl : './admin-seasons.component.css'
})
export class AdminSeasonsComponent implements OnInit {
  tab           = signal<'seasons' | 'squad'>('seasons');
  seasons       = signal<any[]>([]);
  leagues       = signal<any[]>([]);
  teams         = signal<any[]>([]);
  teamSeasons   = signal<any[]>([]);
  squad         = signal<any[]>([]);
  allPlayers    = signal<any[]>([]);
  availablePlayers = signal<any[]>([]);
  editingSeason = signal<any>(null);

  filterLeagueId = '';
  squadTeamId    = '';
  squadSeasonId  = '';
  searchAddPlayer = '';
  teamPlayers = signal<any[]>([]);

  // Filtros
  searchLeague    = '';
  searchTeamSquad = '';
  filteredLeagues = signal<any[]>([]);
  filteredTeams   = signal<any[]>([]);

  seasonForm: any = { name: '', leagueId: '', startDate: '', endDate: '', current: false };

  constructor(
    private seasonService: SeasonService,
    private adminService: AdminService,
  ) {}

  ngOnInit() {
    this.loadSeasons();
    this.adminService.getLeagues().subscribe(l => {
      this.leagues.set(l);
      this.filteredLeagues.set(l);
    });
    this.adminService.getTeams().subscribe(t => {
      this.teams.set(t);
      this.filteredTeams.set(t);
    });
    this.adminService.getPlayers().subscribe(p => this.allPlayers.set(p));
  }

  loadSeasons() {
    this.seasonService.getAll(this.filterLeagueId || undefined)
      .subscribe(s => this.seasons.set(s));
  }

  openCreateSeason() {
    this.editingSeason.set(null);
    this.seasonForm = { name: '', leagueId: '', startDate: '', endDate: '', current: false };
  }

  openEditSeason(s: any) {
    this.editingSeason.set(s);
    this.seasonForm = {
      name:      s.name,
      leagueId:  s.leagueId,
      startDate: s.startDate?.split('T')[0] || '',
      endDate:   s.endDate?.split('T')[0]   || '',
      current:   s.current,
    };
  }

  cancelEditSeason() {
    this.editingSeason.set(null);
    this.seasonForm = { name: '', leagueId: '', startDate: '', endDate: '', current: false };
  }

  saveSeason() {
    const obs = this.editingSeason()
      ? this.seasonService.update(this.editingSeason().id, this.seasonForm)
      : this.seasonService.create(this.seasonForm);
    obs.subscribe(() => { this.loadSeasons(); this.cancelEditSeason(); });
  }

  setCurrent(s: any) {
    this.seasonService.setCurrent(s.id).subscribe(() => this.loadSeasons());
  }

  // ---- PLANTILLAS ----
  onTeamChange() {
    this.squadSeasonId = '';
    this.squad.set([]);
    this.availablePlayers.set([]);
    this.searchAddPlayer = '';

    if (!this.squadTeamId) {
      this.teamSeasons.set([]);
      return;
    }

    // Cargar jugadores del equipo seleccionado
    this.adminService.getPlayers(this.squadTeamId).subscribe(players => {
      this.teamPlayers.set(players);
      this.availablePlayers.set(players);
    });

    // Buscar temporadas del equipo
    const team = this.teams().find(t => t.id === this.squadTeamId);
    if (!team) return;
    const leagueIds = team.leagues?.map((l: any) => l.leagueId) || [];
    const relevantSeasons = this.seasons().filter(s => leagueIds.includes(s.leagueId));
    if (relevantSeasons.length > 0) {
      this.teamSeasons.set(relevantSeasons);
    } else {
      this.seasonService.getAll().subscribe(all => this.teamSeasons.set(all));
    }
  }

  // Cargar equipo
  loadSquad() {
    if (!this.squadTeamId || !this.squadSeasonId) return;
    this.seasonService.getSquad(this.squadTeamId, this.squadSeasonId)
      .subscribe(s => {
        this.squad.set(s);
        this.filterAvailablePlayers();
      });
  }

  // Filtro de jugadores disponibles para añadir a la plantilla, excluyendo los que ya están en ella y buscando por nombre
  filterAvailablePlayers() {
    const inSquad = new Set(this.squad().map((e: any) => e.playerId));
    const q = this.searchAddPlayer.toLowerCase();
    this.availablePlayers.set(
      this.teamPlayers()
        .filter(p => !inSquad.has(p.id))
        .filter(p => !q || `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
    );
  }

  // Añadir jugador al equipo
  addPlayerToSquad(player: any) {
    this.seasonService.addPlayer(player.id, this.squadTeamId, this.squadSeasonId)
      .subscribe(() => {
        this.loadSquad();
        this.searchAddPlayer = '';
      });
  }
  // Eliminar jugador del equipo
  removeFromSquad(entry: any) {
    this.seasonService.removePlayer(entry.playerId, this.squadTeamId, this.squadSeasonId)
      .subscribe(() => this.loadSquad());
  }

  // Obtener nombre de temporada
  getSeasonName() {
    return this.teamSeasons().find(s => s.id === this.squadSeasonId)?.name || '';
  }

  // FILTRAR
  filterLeagues() {
    const q = this.searchLeague.toLowerCase();
    this.filteredLeagues.set(
      q ? this.leagues().filter(l => l.name.toLowerCase().includes(q)) : this.leagues()
    );
  }
  filterTeamsSquad() {
    const q = this.searchTeamSquad.toLowerCase();
    this.filteredTeams.set(
      q ? this.teams().filter(t => t.name.toLowerCase().includes(q)) : this.teams()
    );
  }
  selectTeamForSquad(team: any) {
    this.squadTeamId = team.id;
    this.onTeamChange();
  }
}
