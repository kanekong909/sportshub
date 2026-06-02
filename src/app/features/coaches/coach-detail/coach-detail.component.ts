import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CoachesService } from '../../../core/services/coaches.service';

const ROLE_LABEL: Record<string, string> = {
  HEAD_COACH: 'Entrenador Principal',
  ASSISTANT:  'Asistente',
  GK_COACH:   'Entrenador de Porteros',
  FITNESS:    'Preparador Físico',
  ANALYST:    'Analista',
};

@Component({
  selector: 'app-coach-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    @if (loading()) {
      <div class="loading-screen">
        <div class="loading-spinner"></div>
        <span>Cargando entrenador...</span>
      </div>
    } @else if (coach()) {
      <div class="coach-page">

        <!-- HERO -->
        <div class="hero-section">
          <div class="hero-bg">
            @if (coach()!.photoUrl) {
              <img [src]="coach()!.photoUrl" class="hero-bg-img" alt="" />
            }
            <div class="hero-bg-overlay"></div>
          </div>

          <div class="hero-content">
            <div class="hero-photo-wrap">
              <div class="hero-photo">
                @if (coach()!.photoUrl) {
                  <img [src]="coach()!.photoUrl" [alt]="coach()!.firstName" />
                } @else {
                  <span class="hero-initials">{{ coach()!.firstName[0] }}{{ coach()!.lastName[0] }}</span>
                }
              </div>
              <div class="role-badge">
                {{ getRoleLabel(currentRole()) }}
              </div>
            </div>

            <div class="hero-info">
              <h1 class="hero-name">
                <span class="hero-firstname">{{ coach()!.firstName }}</span>
                <span class="hero-lastname">{{ coach()!.lastName }}</span>
              </h1>

              <div class="hero-stats-row">
                @if (coach()!.nationality) {
                  <div class="hero-stat"><span>🌍</span><span>{{ coach()!.nationality }}</span></div>
                }
                @if (currentTeam()) {
                  <a [routerLink]="['/teams', currentTeam()!.slug]" class="hero-stat team-link-hero">
                    @if (currentTeam()!.logoUrl) {
                      <img [src]="currentTeam()!.logoUrl" class="team-logo-hero" />
                    }
                    <span>{{ currentTeam()!.name }}</span>
                  </a>
                }
                @if (totalSeasons() > 0) {
                  <div class="hero-stat"><span>📅</span><span>{{ totalSeasons() }} temporadas</span></div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- CONTENIDO -->
        <div class="content">
          <div class="content-grid">
            <div class="content-main">

              @if (coach()!.biography) {
                <div class="glass-card">
                  <h2 class="card-title">Biografía</h2>
                  <p class="bio-text">{{ coach()!.biography }}</p>
                </div>
              }

              <!-- Trayectoria -->
              @if (coach()!.seasonTeams?.length) {
                <div class="glass-card">
                  <h2 class="card-title">Trayectoria</h2>
                  <div class="timeline">
                    @for (entry of coach()!.seasonTeams; track entry.id) {
                      <a [routerLink]="['/teams', entry.team.slug]" class="timeline-entry">
                        <div class="tl-season">{{ entry.season.name }}</div>
                        <div class="tl-connector">
                          <div class="tl-dot" [class.active]="entry.isActive"></div>
                          <div class="tl-line"></div>
                        </div>
                        <div class="tl-team">
                          <div class="tl-logo">
                            @if (entry.team.logoUrl) {
                              <img [src]="entry.team.logoUrl" [alt]="entry.team.name" />
                            } @else {
                              <span>{{ entry.team.name[0] }}</span>
                            }
                          </div>
                          <div>
                            <div class="tl-team-name">{{ entry.team.name }}</div>
                            <div class="tl-role">{{ getRoleLabel(entry.role) }}</div>
                            @if (entry.note) {
                              <div class="tl-note">{{ entry.note }}</div>
                            }
                          </div>
                          @if (!entry.isActive) {
                            <span class="tl-inactive">Inactivo</span>
                          }
                        </div>
                      </a>
                    }
                  </div>
                </div>
              }

              <!-- Stats como entrenador -->
              @if (coach()!.stats?.length) {
                <div class="glass-card">
                  <h2 class="card-title">Récord como entrenador</h2>
                  <div class="stats-table">
                    <div class="stats-header">
                      <span>Temporada</span><span>Equipo</span><span>PJ</span>
                      <span>PG</span><span>PE</span><span>PP</span><span>%V</span>
                    </div>
                    @for (s of coach()!.stats; track s.id) {
                      <div class="stats-row">
                        <span>{{ s.season }}</span>
                        <span>{{ s.team?.name }}</span>
                        <span>{{ s.played }}</span>
                        <span class="green">{{ s.won }}</span>
                        <span>{{ s.drawn }}</span>
                        <span class="red">{{ s.lost }}</span>
                        <span>{{ s.played > 0 ? ((s.won / s.played) * 100).toFixed(0) : 0 }}%</span>
                      </div>
                    }
                  </div>
                </div>
              }

            </div>

            <div class="content-side">
              <div class="glass-card">
                <h2 class="card-title">Datos personales</h2>
                <div class="info-list">
                  @if (coach()!.birthDate) {
                    <div class="info-item">
                      <span class="info-key">Nacimiento</span>
                      <span class="info-val">{{ coach()!.birthDate | date:'d MMM y' }}</span>
                    </div>
                  }
                  @if (coach()!.birthPlace) {
                    <div class="info-item">
                      <span class="info-key">Lugar</span>
                      <span class="info-val">{{ coach()!.birthPlace }}</span>
                    </div>
                  }
                  @if (coach()!.nationality) {
                    <div class="info-item">
                      <span class="info-key">Nacionalidad</span>
                      <span class="info-val">{{ coach()!.nationality }}</span>
                    </div>
                  }
                </div>
              </div>

              @if (currentTeam()) {
                <a [routerLink]="['/teams', currentTeam()!.slug]" class="team-card-link">
                  <div class="glass-card">
                    <h2 class="card-title">Equipo actual</h2>
                    <div class="team-row">
                      <div class="team-logo-md">
                        @if (currentTeam()!.logoUrl) {
                          <img [src]="currentTeam()!.logoUrl" />
                        } @else {
                          <span>{{ currentTeam()!.name[0] }}</span>
                        }
                      </div>
                      <div>
                        <div class="team-name-md">{{ currentTeam()!.name }}</div>
                        <div class="team-hint">Ver perfil →</div>
                      </div>
                    </div>
                  </div>
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 16px; color: rgba(148,163,184,0.7); font-size: 14px; }
    .loading-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); border-top-color: #60a5fa; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .coach-page { min-height: 100vh; }
    .hero-section { position: relative; min-height: 380px; overflow: hidden; display: flex; align-items: flex-end; }
    .hero-bg { position: absolute; inset: 0; z-index: 0; }
    .hero-bg-img { width: 100%; height: 100%; object-fit: cover; object-position: top; filter: blur(24px) brightness(0.3) saturate(1.4); transform: scale(1.1); }
    .hero-bg-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.6) 50%, rgba(15,23,42,0.95) 100%); }
    .hero-content { position: relative; z-index: 1; width: 100%; padding: 24px 20px 32px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .hero-photo-wrap { position: relative; flex-shrink: 0; }
    .hero-photo { width: 120px; height: 120px; border-radius: 50%; overflow: hidden; border: 3px solid rgba(255,255,255,0.2); background: rgba(99,102,241,0.3); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 40px rgba(99,102,241,0.3); }
    .hero-photo img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
    .hero-initials { font-size: 40px; font-weight: 700; color: rgba(165,180,252,0.9); }
    .role-badge { position: absolute; bottom: 4px; right: -8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 2px solid rgba(15,23,42,0.8); white-space: nowrap; }
    .hero-info { text-align: center; }
    .hero-name { margin-bottom: 14px; }
    .hero-firstname { display: block; font-size: 18px; font-weight: 400; color: rgba(226,232,240,0.6); }
    .hero-lastname  { display: block; font-size: 34px; font-weight: 800; color: #f1f5f9; line-height: 1; letter-spacing: -.02em; }
    .hero-stats-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .hero-stat { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(148,163,184,0.8); }
    .team-link-hero { text-decoration: none; }
    .team-logo-hero { width: 18px; height: 18px; object-fit: contain; }
    .content { padding: 0 16px 40px; }
    .content-grid { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
    .content-main { display: flex; flex-direction: column; gap: 16px; }
    .content-side { display: flex; flex-direction: column; gap: 16px; }
    .glass-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); border-radius: 16px; padding: 20px; }
    .card-title { font-size: 12px; font-weight: 600; color: rgba(148,163,184,0.7); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; }
    .bio-text { font-size: 14px; color: rgba(226,232,240,0.75); line-height: 1.7; }
    .timeline { display: flex; flex-direction: column; }
    .timeline-entry { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; text-decoration: none; color: inherit; }
    .timeline-entry:hover { opacity: .8; }
    .tl-season { font-size: 12px; font-weight: 600; color: #60a5fa; min-width: 56px; padding-top: 2px; }
    .tl-connector { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
    .tl-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(99,102,241,0.4); border: 2px solid rgba(99,102,241,0.3); margin-top: 4px; }
    .tl-dot.active { background: #6366f1; border-color: #a5b4fc; }
    .tl-line { width: 1px; flex: 1; min-height: 28px; background: rgba(255,255,255,0.07); margin-top: 4px; }
    .timeline-entry:last-child .tl-line { display: none; }
    .tl-team { display: flex; align-items: center; gap: 10px; flex: 1; }
    .tl-logo { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 12px; font-weight: 700; color: #f1f5f9; flex-shrink: 0; }
    .tl-logo img { width: 100%; height: 100%; object-fit: contain; }
    .tl-team-name { font-size: 13px; font-weight: 600; color: #f1f5f9; }
    .tl-role { font-size: 11px; color: rgba(148,163,184,0.55); margin-top: 1px; }
    .tl-note { font-size: 11px; color: #60a5fa; font-style: italic; margin-top: 1px; }
    .tl-inactive { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: rgba(239,68,68,0.15); color: #fca5a5; margin-left: auto; }
    .stats-table { display: flex; flex-direction: column; gap: 0; font-size: 13px; }
    .stats-header { display: grid; grid-template-columns: 1fr 1.5fr repeat(5, 0.6fr); padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(148,163,184,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    .stats-row { display: grid; grid-template-columns: 1fr 1.5fr repeat(5, 0.6fr); padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(226,232,240,0.8); }
    .stats-row:last-child { border-bottom: none; }
    .green { color: #6ee7b7; }
    .red   { color: #fca5a5; }
    .info-list { display: flex; flex-direction: column; }
    .info-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .info-item:last-child { border-bottom: none; }
    .info-key { font-size: 13px; color: rgba(148,163,184,0.55); }
    .info-val { font-size: 13px; font-weight: 500; color: #e2e8f0; }
    .team-card-link { text-decoration: none; display: block; }
    .team-row { display: flex; align-items: center; gap: 12px; }
    .team-logo-md { width: 44px; height: 44px; border-radius: 10px; background: rgba(255,255,255,0.08); overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #f1f5f9; flex-shrink: 0; }
    .team-logo-md img { width: 100%; height: 100%; object-fit: contain; }
    .team-name-md { font-size: 15px; font-weight: 600; color: #f1f5f9; }
    .team-hint { font-size: 12px; color: #60a5fa; margin-top: 2px; }
    @media (min-width: 640px) {
      .hero-content { flex-direction: row; align-items: flex-end; padding: 40px 32px; }
      .hero-info { text-align: left; }
      .hero-stats-row { justify-content: flex-start; }
      .hero-photo { width: 160px; height: 160px; }
      .hero-lastname { font-size: 44px; }
      .content { padding: 0 32px 48px; }
    }
    @media (min-width: 1024px) {
      .hero-section { min-height: 440px; }
      .hero-content { max-width: 1100px; margin: 0 auto; }
      .content { max-width: 1100px; margin: 0 auto; }
      .content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
    }
  `]
})
export class CoachDetailComponent implements OnInit {
  coach   = signal<any>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private coachesService: CoachesService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.coachesService.getBySlug(slug).subscribe({
      next: c  => { this.coach.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getRoleLabel(role: string) { return ROLE_LABEL[role] || role; }

  currentTeam() {
    const active = this.coach()?.seasonTeams?.find((e: any) => e.isActive);
    return active?.team || null;
  }

  currentRole() {
    const active = this.coach()?.seasonTeams?.find((e: any) => e.isActive);
    return active?.role || 'HEAD_COACH';
  }

  totalSeasons() {
    return new Set(this.coach()?.seasonTeams?.map((e: any) => e.season.name)).size || 0;
  }
}
