import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8 text-center">
          <div class="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm mb-4">
            <span class="text-3xl">📊</span>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestor de Estadísticas
            </h1>
          </div>
          <p class="text-gray-500">Gestiona las estadísticas por temporada de equipos y ligas</p>
        </div>

        <!-- Selectores -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Buscador de Liga -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
            <div class="bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3">
              <h3 class="text-white font-semibold flex items-center gap-2">
                <span>🏆</span> Seleccionar Liga
              </h3>
            </div>
            <div class="p-5">
              <div class="relative">
                <input
                  type="text"
                  placeholder="🔍 Buscar liga..."
                  (input)="onLeagueSearch($event)"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                >
              </div>
              <div class="max-h-64 overflow-y-auto mt-3 space-y-1">
                @for (l of filteredLeagues(); track l.id) {
                  <div
                    (click)="selectLeague(l)"
                    [class.bg-gradient-to-r]="selectedLeague()?.id === l.id"
                    [class.from-purple-50]="selectedLeague()?.id === l.id"
                    [class.to-indigo-50]="selectedLeague()?.id === l.id"
                    [class.border-purple-300]="selectedLeague()?.id === l.id"
                    class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200">
                    <div class="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center p-1">
                      <img [src]="l.logoUrl || 'assets/default-league.png'" class="w-full h-full object-contain rounded-full">
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-gray-800">{{ l.name }}</div>
                      <div class="text-xs text-gray-400">{{ l.country || 'Internacional' }}</div>
                    </div>
                    @if (selectedLeague()?.id === l.id) {
                      <span class="text-purple-600 text-xl">✓</span>
                    }
                  </div>
                }
                @if (filteredLeagues().length === 0) {
                  <div class="text-center text-gray-400 py-8">No se encontraron ligas</div>
                }
              </div>
            </div>
          </div>

          <!-- Buscador de Equipos -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
            <div class="bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-3">
              <h3 class="text-white font-semibold flex items-center gap-2">
                <span>⚽</span> Seleccionar Equipo
              </h3>
            </div>
            <div class="p-5">
              <div class="relative">
                <input
                  type="text"
                  placeholder="🔍 Buscar equipo..."
                  (input)="onTeamSearch($event)"
                  [disabled]="!selectedLeague()"
                  [class.opacity-50]="!selectedLeague()"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100">
              </div>
              @if (!selectedLeague()) {
                <div class="text-center text-amber-600 text-sm mt-3 bg-amber-50 p-2 rounded-lg">
                  ⚠️ Primero selecciona una liga
                </div>
              }
              <div class="max-h-64 overflow-y-auto mt-3 space-y-1">
                @for (t of filteredTeams(); track t.id) {
                  <div
                    (click)="selectTeam(t)"
                    [class.bg-gradient-to-r]="selectedTeam()?.id === t.id"
                    [class.from-blue-50]="selectedTeam()?.id === t.id"
                    [class.to-cyan-50]="selectedTeam()?.id === t.id"
                    [class.border-blue-300]="selectedTeam()?.id === t.id"
                    class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200">
                    <div class="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center p-1">
                      <img [src]="t.logoUrl || 'assets/default-team.png'" class="w-full h-full object-contain rounded-full">
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-gray-800">{{ t.name }}</div>
                      <div class="text-xs text-gray-400">{{ t.city || 'Ciudad no especificada' }}</div>
                    </div>
                    @if (selectedTeam()?.id === t.id) {
                      <span class="text-blue-600 text-xl">✓</span>
                    }
                  </div>
                }
                @if (filteredTeams().length === 0 && selectedLeague()) {
                  <div class="text-center text-gray-400 py-8">No se encontraron equipos en esta liga</div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de Estadísticas -->
        @if (selectedTeam() && selectedLeague()) {
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn">
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-white font-bold text-lg flex items-center gap-2">
                    <span>{{ statsLoaded() ? '✏️' : '➕' }}</span>
                    {{ statsLoaded() ? 'Editar Estadísticas' : 'Nueva Estadística' }}
                  </h3>
                  <p class="text-green-100 text-sm mt-1">
                    {{ selectedTeam()?.name }} • {{ selectedLeague()?.name }}
                  </p>
                </div>
                <div class="bg-white/20 rounded-full px-3 py-1 text-white text-sm font-semibold">
                  Temporada {{ statForm.get('season')?.value }}
                </div>
              </div>
            </div>

            <form [formGroup]="statForm" (ngSubmit)="onSubmit()" class="p-6">
             <div class="md:col-span-2">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  📅 Temporada
                </label>
                <div class="relative">
                  <select
                    formControlName="season"
                    class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all appearance-none font-medium text-gray-700 hover:border-purple-300"
                  >
                    <option value="" disabled class="text-gray-400">Selecciona una temporada</option>
                    @for (s of seasons(); track s.id) {
                      <option [value]="s.name" class="py-2">
                        {{ s.name }}
                      </option>
                    }
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-gray-50 rounded-xl p-3">
                  <label class="text-xs font-bold text-gray-500 uppercase block mb-1">PJ</label>
                  <input type="number" formControlName="played" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-center font-semibold">
                </div>
                <div class="bg-green-50 rounded-xl p-3">
                  <label class="text-xs font-bold text-green-600 uppercase block mb-1">PG</label>
                  <input type="number" formControlName="won" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-center font-semibold">
                </div>
                <div class="bg-yellow-50 rounded-xl p-3">
                  <label class="text-xs font-bold text-yellow-600 uppercase block mb-1">PE</label>
                  <input type="number" formControlName="drawn" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-center font-semibold">
                </div>
                <div class="bg-red-50 rounded-xl p-3">
                  <label class="text-xs font-bold text-red-600 uppercase block mb-1">PP</label>
                  <input type="number" formControlName="lost" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-center font-semibold">
                </div>
                <div class="bg-blue-50 rounded-xl p-3">
                  <label class="text-xs font-bold text-blue-600 uppercase block mb-1">GF</label>
                  <input type="number" formControlName="goalsFor" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-center font-semibold">
                </div>
                <div class="bg-orange-50 rounded-xl p-3">
                  <label class="text-xs font-bold text-orange-600 uppercase block mb-1">GC</label>
                  <input type="number" formControlName="goalsAgainst" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-center font-semibold">
                </div>
                <div class="bg-purple-50 rounded-xl p-3">
                  <label class="text-xs font-bold text-purple-600 uppercase block mb-1">PTS</label>
                  <input type="number" formControlName="points" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-center font-bold text-purple-700">
                </div>
                <div class="bg-indigo-50 rounded-xl p-3">
                  <label class="text-xs font-bold text-indigo-600 uppercase block mb-1">Posición</label>
                  <input type="number" formControlName="position" class="w-full bg-white border border-gray-200 rounded-lg p-2 text-center font-semibold">
                </div>
              </div>

              <button
                type="submit"
                [disabled]="statForm.invalid"
                class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {{ statsLoaded() ? '🔄 Actualizar Estadística' : '✨ Crear Estadística' }}
              </button>
            </form>
          </div>
        }

        <!-- Mensaje de bienvenida -->
        @if (!selectedLeague()) {
          <div class="text-center py-12">
            <div class="text-6xl mb-4">🎯</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Selecciona una liga para comenzar</h3>
            <p class="text-gray-400">Elige una liga y luego un equipo para gestionar sus estadísticas</p>
          </div>
        }
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out;
      }
    </style>
  `
})
export class AdminStatsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private admin = inject(AdminService);
  private toast = inject(ToastService);

  teams = signal<any[]>([]);
  teamSearch = signal('');
  leagueSearch = signal('');
  seasons = signal<any[]>([]);

  allTeams = signal<any[]>([]);
  leagues = signal<any[]>([]);

  filteredLeagues = computed(() => {
    return this.leagues().filter(l =>
      l.name.toLowerCase().includes(this.leagueSearch().toLowerCase())
    );
  });

  filteredTeams = computed(() => {
    const league = this.selectedLeague();
    const search = this.teamSearch().toLowerCase();

    let teams = league && league.teams
      ? this.allTeams().filter(t => league.teams.some((lt: any) => lt.team.id === t.id))
      : this.allTeams();

    return teams.filter(t => t.name.toLowerCase().includes(search));
  });

  selectedTeam = signal<any | null>(null);
  selectedLeague = signal<any | null>(null);
  statsLoaded = signal<any | null>(null);

  statForm = this.fb.group({
    season: ['2024-25', Validators.required],
    played: [0], won: [0], drawn: [0], lost: [0],
    goalsFor: [0], goalsAgainst: [0], points: [0], position: [1]
  });

  ngOnInit() {
    this.admin.getTeams().subscribe(t => this.allTeams.set(t));
    this.admin.getLeagues().subscribe(l => this.leagues.set(l));
    this.admin.getSeasons().subscribe(s => this.seasons.set(s));

    // NUEVO: Escuchar cambios en el selector de temporada
    this.statForm.get('season')?.valueChanges.subscribe(() => {
      this.checkStats();
    });
  }

  onTeamSearch(e: Event) {
    this.teamSearch.set((e.target as HTMLInputElement).value);
  }

  onLeagueSearch(e: Event) {
    this.leagueSearch.set((e.target as HTMLInputElement).value);
  }

  selectTeam(t: any) {
    this.selectedTeam.set(t);
    this.checkStats();
  }

  selectLeague(l: any) {
    this.selectedLeague.set(l);
    this.selectedTeam.set(null);
    this.statsLoaded.set(null);
    this.teamSearch.set('');
  }

  checkStats() {
    const teamId = this.selectedTeam()?.id;
    const leagueId = this.selectedLeague()?.id;
    const season = this.statForm.get('season')?.value;

    if (teamId && leagueId && season) {
      this.admin.getTeamSeasonStats({ teamId, leagueId, season })
        .subscribe(res => {
          const stat = Array.isArray(res) ? res[0] : res;

          if (stat) {
            this.statsLoaded.set(stat);
            // Actualizamos todo, pero evitamos disparar el evento de nuevo
            this.statForm.patchValue(stat, { emitEvent: false });
          } else {
            this.statsLoaded.set(null);
            // Reseteamos valores numéricos manteniendo la temporada actual
            this.statForm.patchValue({
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              points: 0,
              position: 1
            }, { emitEvent: false }); // <--- CLAVE: Esto evita el bucle
          }
        });
    }
  }

   onSubmit() {
    const data = { ...this.statForm.value, teamId: this.selectedTeam().id, leagueId: this.selectedLeague().id };

    if (this.statsLoaded()) {
      this.admin.updateTeamSeasonStat(this.statsLoaded().id, data).subscribe({
        next: () => {
          this.toast.success('Estadística actualizada correctamente');
          this.checkStats();
        },
        error: (err) => {
          this.toast.error('Error al actualizar la estadística');
          console.error(err);
        }
      });
    } else {
      this.admin.createTeamSeasonStat(data).subscribe({
        next: () => {
          this.toast.success('Estadística creada correctamente');
          this.checkStats();
        },
        error: (err) => {
          this.toast.error('Error al crear la estadística');
          console.error(err);
        }
      });
    }
  }
}
