import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoachesService } from '../../../core/services/coaches.service';

const ROLE_LABEL: Record<string, string> = {
  HEAD_COACH: 'Entrenador Principal',
  ASSISTANT:  'Asistente',
  GK_COACH:   'Entrenador de Porteros',
  FITNESS:    'Preparador Físico',
  ANALYST:    'Analista',
};

@Component({
  selector: 'app-coach-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-inner">
        <div class="page-header">
          <div>
            <h1 class="page-title">Cuerpo Técnico</h1>
            <p class="page-sub">Entrenadores y staff técnico</p>
          </div>
          <input [(ngModel)]="search" (ngModelChange)="filter()"
            placeholder="Buscar entrenador..."
            class="search-input" />
        </div>

        @if (loading()) {
          <div class="loading">Cargando entrenadores...</div>
        } @else {
          <div class="coaches-grid">
            @for (coach of filtered(); track coach.id) {
              <a [routerLink]="['/coaches', coach.slug]" class="coach-card">
                <div class="coach-photo">
                  @if (coach.photoUrl) {
                    <img [src]="coach.photoUrl" [alt]="coach.firstName" />
                  } @else {
                    <span>{{ coach.firstName[0] }}{{ coach.lastName[0] }}</span>
                  }
                </div>
                <div class="coach-info">
                  <div class="coach-name">{{ coach.firstName }} {{ coach.lastName }}</div>
                  <div class="coach-nationality">{{ coach.nationality }}</div>
                  @if (coach.seasonTeams?.[0]) {
                    <div class="coach-team">
                      @if (coach.seasonTeams[0].team.logoUrl) {
                        <img [src]="coach.seasonTeams[0].team.logoUrl" class="team-logo-xs" />
                      }
                      <span>{{ coach.seasonTeams[0].team.name }}</span>
                    </div>
                    <span class="role-chip">{{ getRoleLabel(coach.seasonTeams[0].role) }}</span>
                  } @else {
                    <span class="role-chip free">Sin equipo</span>
                  }
                </div>
              </a>
            }
          </div>
          @if (filtered().length === 0) {
            <div class="empty">No se encontraron entrenadores</div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: calc(100vh - 56px); padding: 24px 16px; }
    .page-inner { max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: #f1f5f9; }
    .page-sub { font-size: 13px; color: rgba(148,163,184,0.6); margin-top: 2px; }
    .search-input {
      padding: 9px 14px; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px; font-size: 14px; outline: none;
      background: rgba(255,255,255,0.06); color: #f1f5f9; width: 100%;
    }
    .search-input::placeholder { color: rgba(148,163,184,0.5); }
    .search-input:focus { border-color: rgba(99,102,241,0.5); }
    .loading, .empty { text-align: center; padding: 60px; color: rgba(148,163,184,0.5); font-size: 14px; }
    .coaches-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .coach-card {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 14px;
      text-decoration: none; color: inherit; transition: all .2s;
    }
    .coach-card:hover { border-color: rgba(255,255,255,0.22); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
    .coach-photo {
      width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
      background: rgba(99,102,241,0.2); border: 2px solid rgba(99,102,241,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; color: #a5b4fc; overflow: hidden;
    }
    .coach-photo img { width: 100%; height: 100%; object-fit: cover; }
    .coach-name { font-size: 14px; font-weight: 600; color: #f1f5f9; margin-bottom: 2px; }
    .coach-nationality { font-size: 11px; color: rgba(148,163,184,0.55); margin-bottom: 6px; }
    .coach-team { display: flex; align-items: center; gap: 5px; font-size: 11px; color: rgba(148,163,184,0.7); margin-bottom: 5px; }
    .team-logo-xs { width: 14px; height: 14px; object-fit: contain; }
    .role-chip { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px; background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
    .role-chip.free { background: rgba(148,163,184,0.1); color: rgba(148,163,184,0.5); border-color: rgba(148,163,184,0.2); }
    @media (min-width: 640px) {
      .page-header { flex-direction: row; align-items: flex-start; justify-content: space-between; }
      .search-input { width: 240px; }
      .coaches-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (min-width: 1024px) {
      .page { padding: 40px 24px; }
      .coaches-grid { grid-template-columns: repeat(4, 1fr); }
    }
  `]
})
export class CoachListComponent implements OnInit {
  coaches  = signal<any[]>([]);
  filtered = signal<any[]>([]);
  loading  = signal(true);
  search   = '';

  constructor(private coachesService: CoachesService) {}

  ngOnInit() {
    this.coachesService.getAll().subscribe(c => {
      this.coaches.set(c);
      this.filtered.set(c);
      this.loading.set(false);
    });
  }

  filter() {
    const q = this.search.toLowerCase();
    this.filtered.set(
      q ? this.coaches().filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.nationality?.toLowerCase().includes(q)
      ) : this.coaches()
    );
  }

  getRoleLabel(role: string) { return ROLE_LABEL[role] || role; }
}
