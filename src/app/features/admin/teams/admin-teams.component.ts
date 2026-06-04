import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-teams',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-teams.component.html',
})
export class AdminTeamsComponent implements OnInit {
  // 1. Estados reactivos usando Signals
  teams          = signal<any[]>([]);
  showForm       = signal(false);
  showImageModal = signal(false);
  editing        = signal<any>(null);
  selectedTeam   = signal<any>(null);
  selectedFile   = signal<File | null>(null);
  uploading      = signal(false);
  search         = signal('');
  selectedSport  = signal<string>('');
  selectedLeague = signal<string>(''); // Nuevo: filtro por liga
  imageUrl       = '';

  // Mostrar Jugadores
  showPlayersModal = signal(false);
  teamPlayers = signal<any[]>([]);
  loadingPlayers = signal(false);

  // 2. Formulario como objeto plano
  form: any = {
    name: '', shortName: '', country: '', city: '',
    foundedYear: null, primaryColor: '#000000',
    secondaryColor: '#000000', logoUrl: '', description: '',
    leagueId: null // Para asociar a una liga
  };

  // 3. Obtener deportes únicos desde los equipos cargados
  availableSports = computed(() => {
      const allTeams = this.teams();
      const sportsMap = new Map();

      allTeams.forEach(team => {
        // Recorrer TODAS las ligas del equipo
        team.leagues?.forEach((teamLeague: any) => {
          const sport = teamLeague.league?.sport;
          if (sport && !sportsMap.has(sport.id)) {
            sportsMap.set(sport.id, {
              id: sport.id,
              name: sport.name,
              icon: this.getSportIconByName(sport.name)
            });
          }
        });
      });

      return Array.from(sportsMap.values());
  });

  // 4. Obtener ligas únicas desde los equipos cargados
  availableLeagues = computed(() => {
    const allTeams = this.teams();
    const leaguesMap = new Map();

    allTeams.forEach(team => {
      team.leagues?.forEach((teamLeague: any) => {
        const league = teamLeague.league;
        if (league && !leaguesMap.has(league.id)) {
          const sport = league.sport;
          leaguesMap.set(league.id, {
            id: league.id,
            name: league.name,
            sportId: sport?.id,
            sportName: sport?.name,
            sportIcon: this.getSportIconByName(sport?.name),
            logoUrl: league.logoUrl
          });
        }
      });
    });

    // Ordenar por nombre de liga
    return Array.from(leaguesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  });

  // 5. Filtrado reactivo combinando búsqueda, deporte y liga
  filteredTeams = computed(() => {
    const query = this.search().toLowerCase().trim();
    const sportFilter = this.selectedSport();
    const leagueFilter = this.selectedLeague();
    const allTeams = this.teams();

    let filtered = allTeams;

    // Filtro por búsqueda
    if (query) {
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(query) ||
        t.shortName?.toLowerCase().includes(query) ||
        t.city?.toLowerCase().includes(query) ||
        t.country?.toLowerCase().includes(query)
      );
    }

    // Filtro por deporte (el equipo tiene al menos una liga de ese deporte)
    if (sportFilter && sportFilter !== 'all') {
      filtered = filtered.filter(t => {
        return t.leagues?.some((teamLeague: any) =>
          teamLeague.league?.sport?.id === sportFilter
        );
      });
    }

    // Filtro por liga (el equipo está en esa liga)
    if (leagueFilter && leagueFilter !== 'all') {
      filtered = filtered.filter(t => {
        return t.leagues?.some((teamLeague: any) =>
          teamLeague.leagueId === leagueFilter
        );
      });
    }

    return filtered;
  });

  constructor(private admin: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.admin.getTeams('').subscribe({
      next: (t) => this.teams.set(t)
    });
  }

  openCreate() {
    this.form = {
      name: '', shortName: '', country: '', city: '',
      foundedYear: null, primaryColor: '#000000',
      secondaryColor: '#000000', logoUrl: '', description: '',
      leagueId: null
    };
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(team: any) {
    this.form = {
      name:           team.name           || '',
      shortName:      team.shortName      || '',
      country:        team.country        || '',
      city:           team.city           || '',
      foundedYear:    team.foundedYear    || null,
      primaryColor:   team.primaryColor   || '#000000',
      secondaryColor: team.secondaryColor || '#000000',
      logoUrl:        team.logoUrl        || '',
      description:    team.description    || '',
      leagueId:       team.leagues?.[0]?.leagueId || null
    };
    this.editing.set(team);
    this.showForm.set(true);
  }

  openImage(team: any) {
    this.selectedTeam.set(team);
    this.imageUrl = team.logoUrl || '';
    this.selectedFile.set(null);
    this.showImageModal.set(true);
  }

  save() {
    const obs = this.editing()
      ? this.admin.updateTeam(this.editing().id, this.form)
      : this.admin.createTeam(this.form);

    obs.subscribe({
      next: () => {
        this.load();
        this.showForm.set(false);
      }
    });
  }

  confirmDelete(team: any) {
    if (confirm(`¿Borrar "${team.name}"? Esta acción no se puede deshacer.`)) {
      this.admin.deleteTeam(team.id).subscribe({
        next: () => this.load()
      });
    }
  }

  saveImageUrl() {
    this.admin.updateTeam(this.selectedTeam().id, { logoUrl: this.imageUrl }).subscribe({
      next: (updated) => {
        this.selectedTeam.set(updated);
        this.load();
        this.showImageModal.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile.set(file);
  }

  uploadFile() {
    const currentTeam = this.selectedTeam();
    const file = this.selectedFile();
    if (!currentTeam || !file) return;

    this.uploading.set(true);
    this.admin.uploadTeamLogo(currentTeam.id, file).subscribe({
      next: (updated) => {
        this.selectedTeam.set(updated);
        this.selectedFile.set(null);
        this.uploading.set(false);
        this.load();
        this.showImageModal.set(false);
      },
      error: () => this.uploading.set(false)
    });
  }

  clearFilters() {
    this.search.set('');
    this.selectedSport.set('');
    this.selectedLeague.set('');
  }

  getSportIconByName(sportName: string): string {
    const icons: { [key: string]: string } = {
      'fútbol': '⚽',
      'futbol': '⚽',
      'football': '⚽',
      'soccer': '⚽',
      'baloncesto': '🏀',
      'basketball': '🏀',
      'básquet': '🏀',
      'tenis': '🎾',
      'tennis': '🎾',
      'béisbol': '⚾',
      'baseball': '⚾',
      'voleibol': '🏐',
      'volleyball': '🏐',
      'hockey': '🏒',
      'rugby': '🏉'
    };
    return icons[sportName?.toLowerCase()] || '🏅';
  }

  getTeamSport(team: any): any {
    return team.leagues?.[0]?.league?.sport || null;
  }

  // Nuevo: Obtener todas las ligas de un equipo
  getTeamLeagues(team: any): any[] {
    return team.leagues?.map((tl: any) => tl.league) || [];
  }

 getTeamsCountBySport(sportId: string): number {
    if (sportId === 'all') {
      return this.teams().length;
    }
    return this.teams().filter(t => {
      return t.leagues?.some((teamLeague: any) =>
        teamLeague.league?.sport?.id === sportId
      );
    }).length;
  }

  getTeamsCountByLeague(leagueId: string): number {
    if (leagueId === 'all') {
      return this.teams().length;
    }
    return this.teams().filter(t => {
      return t.leagues?.some((teamLeague: any) =>
        teamLeague.leagueId === leagueId
      );
    }).length;
  }

  // Método para filtrar ligas por deporte seleccionado
  getFilteredLeagues() {
    const sportFilter = this.selectedSport();
    if (!sportFilter || sportFilter === 'all') {
      return this.availableLeagues();
    }
    return this.availableLeagues().filter(league => league.sportId === sportFilter);
  }

  // Mostrar Jugadores
  viewTeamPlayers(team: any) {
    this.selectedTeam.set(team);
    this.loadingPlayers.set(true);
    this.showPlayersModal.set(true);

    this.admin.getPlayers(team.id, '').subscribe({
      next: (players) => {
        this.teamPlayers.set(players);
        this.loadingPlayers.set(false);
      },
      error: () => this.loadingPlayers.set(false)
    });
  }
}
