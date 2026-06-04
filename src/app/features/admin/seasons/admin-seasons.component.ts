import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeasonService } from '../../../core/services/season.service';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-seasons',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-seasons.component.html',
  styleUrl: './admin-seasons.component.css'
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
  editNotePhoto = '';

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

  // Nota Jugador
  playerNotes: Record<string, string> = {};
  editingNote  = signal<any>(null);
  editNoteText = '';
  editNoteActive = true;

  seasonForm: any = { name: '', leagueId: '', startDate: '', endDate: '', current: false };

  constructor(
    private seasonService: SeasonService,
    private adminService: AdminService,
    private toast: ToastService  // ← Asegúrate de que esté inyectado
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
    this.adminService.getAllSeasons(this.filterLeagueId || undefined)
      .subscribe({
        next: (s) => this.seasons.set(s),
        error: (err) => {
          console.error('Error loading seasons:', err);
          this.toast.error('Error al cargar las temporadas');
        }
      });
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
      ? this.adminService.updateSeason(this.editingSeason().id, this.seasonForm)
      : this.adminService.createSeason(this.seasonForm);

    obs.subscribe({
      next: () => {
        this.toast.success(this.editingSeason() ? 'Temporada actualizada' : 'Temporada creada');
        this.loadSeasons();
        this.cancelEditSeason();
      },
      error: (err) => {
        console.error('Error saving season:', err);
        this.toast.error('Error al guardar la temporada');
      }
    });
  }

  setCurrent(s: any) {
    this.adminService.setCurrentSeason(s.id).subscribe({
      next: () => {
        this.toast.success(`"${s.name}" marcada como temporada actual`);
        this.loadSeasons();
      },
      error: (err) => {
        console.error('Error setting current season:', err);
        this.toast.error('Error al marcar como actual');
      }
    });
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
    this.adminService.getPlayers().subscribe(players => {
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
      this.adminService.getAllSeasons().subscribe(all => this.teamSeasons.set(all));
    }
  }

  loadSquad() {
    if (!this.squadTeamId || !this.squadSeasonId) return;
    this.seasonService.getSquad(this.squadTeamId, this.squadSeasonId)
      .subscribe({
        next: (s) => {
          this.squad.set(s);
          this.filterAvailablePlayers();
        },
        error: (err) => {
          console.error('Error loading squad:', err);
          this.toast.error('Error al cargar la plantilla');
        }
      });
  }

  filterAvailablePlayers() {
    const inSquad = new Set(this.squad().map((e: any) => e.playerId));
    const q = this.searchAddPlayer.toLowerCase();
    this.availablePlayers.set(
      this.teamPlayers()
        .filter(p => !inSquad.has(p.id))
        .filter(p => !q || `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
    );
  }

  addPlayerToSquad(player: any) {
    const note = this.playerNotes[player.id] || '';
    this.seasonService.addPlayer(player.id, this.squadTeamId, this.squadSeasonId, note)
      .subscribe({
        next: () => {
          this.toast.success(`${player.firstName} ${player.lastName} añadido a la plantilla`);
          this.loadSquad();
          this.searchAddPlayer = '';
          delete this.playerNotes[player.id];
        },
        error: (err) => {
          console.error('Error adding player:', err);
          this.toast.error('Error al añadir el jugador');
        }
      });
  }

  removeFromSquad(entry: any) {
    this.seasonService.removePlayer(entry.playerId, this.squadTeamId, this.squadSeasonId)
      .subscribe({
        next: () => {
          this.toast.info(`Jugador desactivado de la plantilla`);
          this.loadSquad();
        },
        error: (err) => {
          console.error('Error removing player:', err);
          this.toast.error('Error al desactivar el jugador');
        }
      });
  }

  getSeasonName() {
    return this.teamSeasons().find(s => s.id === this.squadSeasonId)?.name || '';
  }

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

  toggleActive(entry: any) {
    this.seasonService.updateNote(
      entry.playerId, this.squadTeamId, this.squadSeasonId,
      entry.note || '', !entry.isActive
    ).subscribe({
      next: () => {
        this.toast.success(entry.isActive ? 'Jugador desactivado' : 'Jugador activado');
        this.loadSquad();
      },
      error: (err) => {
        console.error('Error toggling active:', err);
        this.toast.error('Error al cambiar el estado');
      }
    });
  }

  openEditNote(entry: any) {
    this.editingNote.set(entry);
    this.editNoteText   = entry.note   || '';
    this.editNoteActive = entry.isActive;
    this.editNotePhoto  = entry.photoUrl || '';
  }

  saveNote() {
    const e = this.editingNote();
    this.seasonService.updateNote(
      e.playerId, this.squadTeamId, this.squadSeasonId,
      this.editNoteText, this.editNoteActive, this.editNotePhoto
    ).subscribe({
      next: () => {
        this.toast.success('Nota actualizada');
        this.loadSquad();
        this.editingNote.set(null);
      },
      error: (err) => {
        console.error('Error saving note:', err);
        this.toast.error('Error al guardar la nota');
      }
    });
  }

  deleteFromSquad(entry: any) {
    const nombre = `${entry.player.firstName} ${entry.player.lastName}`;
    this.seasonService.deletePlayer(entry.playerId, this.squadTeamId, this.squadSeasonId)
      .subscribe({
        next: () => {
          this.loadSquad();
          this.toast.success(`${nombre} eliminado de la plantilla`);
        },
        error: (err) => {
          console.error('Error deleting player:', err);
          this.toast.error(`Error al quitar a ${nombre}`);
        }
      });
  }
}
