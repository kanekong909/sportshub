import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoachesService } from '../../../core/services/coaches.service';
import { AdminService } from '../../../core/services/admin.service';
import { SeasonService } from '../../../core/services/season.service';
import { ToastService } from '../../../core/services/toast.service';

const ROLES = [
  { value: 'HEAD_COACH', label: 'Entrenador Principal' },
  { value: 'ASSISTANT',  label: 'Asistente'            },
  { value: 'GK_COACH',   label: 'Entrenador Porteros'  },
  { value: 'FITNESS',    label: 'Preparador Físico'     },
  { value: 'ANALYST',    label: 'Analista'              },
];

@Component({
  selector: 'app-admin-coaches',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Cuerpo Técnico</h1>
          <p class="text-gray-500 text-sm mt-1">{{ coaches().length }} entrenadores</p>
        </div>
        <div class="flex gap-2">
          <button (click)="tab.set('coaches')" [class]="tab()==='coaches' ? 'tab-on' : 'tab-off'">Entrenadores</button>
          <button (click)="tab.set('assign')"  [class]="tab()==='assign'  ? 'tab-on' : 'tab-off'">Asignar</button>
        </div>
      </div>

      <!-- TAB ENTRENADORES -->
      @if (tab() === 'coaches') {
        <div class="flex gap-3 mb-4">
          <input [(ngModel)]="search" (ngModelChange)="load()" placeholder="Buscar..."
            class="w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
          <button (click)="openCreate()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            + Nuevo
          </button>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nac.</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo actual</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (c of coaches(); track c.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <div class="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-400">
                      @if (c.photoUrl) { <img [src]="c.photoUrl" class="w-full h-full object-cover" /> }
                      @else { {{ c.firstName[0] }}{{ c.lastName[0] }} }
                    </div>
                  </td>
                  <td class="px-4 py-3 font-medium text-gray-900">{{ c.firstName }} {{ c.lastName }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ c.nationality || '—' }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ c.seasonTeams?.[0]?.team?.name || '—' }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="openEdit(c)"   class="text-blue-600 text-xs font-medium hover:text-blue-800">Editar</button>
                      <button (click)="openPhoto(c)"  class="text-green-600 text-xs font-medium hover:text-green-800">Foto</button>
                      <button (click)="deleteCoach(c)" class="text-red-500 text-xs font-medium hover:text-red-700">Borrar</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- TAB ASIGNAR -->
      @if (tab() === 'assign') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">Asignar entrenador a temporada</h2>
            <div class="flex flex-col gap-3">

              <!-- Buscador entrenador -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Entrenador</label>
                <input [(ngModel)]="searchCoachAssign" (ngModelChange)="filterCoachesAssign()"
                  placeholder="Buscar entrenador..."
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400 mb-1" />
                @if (assignForm.coachId) {
                  <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 overflow-hidden flex-shrink-0">
                      @if (selectedCoachAssign()?.photoUrl) {
                        <img [src]="selectedCoachAssign()!.photoUrl" class="w-full h-full object-cover" />
                      } @else {
                        {{ selectedCoachAssign()?.firstName?.[0] }}{{ selectedCoachAssign()?.lastName?.[0] }}
                      }
                    </div>
                    <span class="text-xs font-medium text-gray-900 flex-1">{{ selectedCoachAssign()?.firstName }} {{ selectedCoachAssign()?.lastName }}</span>
                    <button (click)="assignForm.coachId=''; selectedCoachAssign.set(null)" class="text-gray-400 hover:text-gray-600 text-sm">×</button>
                  </div>
                } @else if (filteredCoachesAssign().length > 0) {
                  <div class="border border-gray-100 rounded-lg max-h-36 overflow-y-auto">
                    @for (c of filteredCoachesAssign(); track c.id) {
                      <div (click)="selectCoachAssign(c)"
                        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden flex-shrink-0">
                          @if (c.photoUrl) { <img [src]="c.photoUrl" class="w-full h-full object-cover" /> }
                          @else { {{ c.firstName[0] }}{{ c.lastName[0] }} }
                        </div>
                        <span class="text-sm text-gray-900">{{ c.firstName }} {{ c.lastName }}</span>
                        <span class="text-xs text-gray-400 ml-auto">{{ c.nationality }}</span>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Buscador equipo con logo -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Equipo</label>
                <input [(ngModel)]="searchTeamAssign" (ngModelChange)="filterTeamsAssign()"
                  placeholder="Buscar equipo..."
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400 mb-1" />
                @if (assignForm.teamId) {
                  <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <div class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden flex-shrink-0">
                      @if (selectedTeamAssign()?.logoUrl) {
                        <img [src]="selectedTeamAssign()!.logoUrl" class="w-full h-full object-contain" />
                      } @else {
                        {{ selectedTeamAssign()?.shortName }}
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-medium text-gray-900 truncate">{{ selectedTeamAssign()?.name }}</div>
                      <div class="text-xs text-gray-400">{{ selectedTeamAssign()?.leagues?.[0]?.league?.name }}</div>
                    </div>
                    <button (click)="assignForm.teamId=''; selectedTeamAssign.set(null)" class="text-gray-400 hover:text-gray-600 text-sm">×</button>
                  </div>
                } @else if (filteredTeamsAssign().length > 0) {
                  <div class="border border-gray-100 rounded-lg max-h-40 overflow-y-auto">
                    @for (t of filteredTeamsAssign(); track t.id) {
                      <div (click)="selectTeamAssign(t)"
                        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden flex-shrink-0">
                          @if (t.logoUrl) { <img [src]="t.logoUrl" [alt]="t.name" class="w-full h-full object-contain" /> }
                          @else { {{ t.shortName }} }
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm text-gray-900 truncate">{{ t.name }}</div>
                          <div class="text-xs text-gray-400">{{ t.leagues?.[0]?.league?.name }}</div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Temporada -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Temporada</label>
                <select [(ngModel)]="assignForm.seasonId"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400">
                  <option value="">Seleccionar...</option>
                  @for (s of seasons(); track s.id) {
                    <option [value]="s.id">{{ s.name }} — {{ s.league?.name }}</option>
                  }
                </select>
              </div>

              <!-- Rol -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                <select [(ngModel)]="assignForm.role"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400">
                  @for (r of roles; track r.value) {
                    <option [value]="r.value">{{ r.label }}</option>
                  }
                </select>
              </div>

              <!-- Nota -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Nota</label>
                <input [(ngModel)]="assignForm.note" placeholder="Ej: Interino, primera temporada..."
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
              </div>

              <button (click)="assign()"
                class="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 mt-2">
                Asignar
              </button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Modal crear/editar -->
    @if (showForm()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
            <h2 class="text-lg font-semibold text-gray-900">{{ editing() ? 'Editar' : 'Nuevo' }} entrenador</h2>
            <button (click)="showForm.set(false)" class="text-gray-400 text-xl">×</button>
          </div>
          <div class="p-6 grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input [ngModel]="form().firstName" (ngModelChange)="setField('firstName',$event)"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Apellido *</label>
              <input [ngModel]="form().lastName" (ngModelChange)="setField('lastName',$event)"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Nacionalidad</label>
              <input [ngModel]="form().nationality" (ngModelChange)="setField('nationality',$event)"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Fecha nacimiento</label>
              <input [ngModel]="form().birthDate" (ngModelChange)="setField('birthDate',$event)" type="date"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Lugar de nacimiento</label>
              <input [ngModel]="form().birthPlace" (ngModelChange)="setField('birthPlace',$event)"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">URL foto</label>
              <input [ngModel]="form().photoUrl" (ngModelChange)="setField('photoUrl',$event)"
                placeholder="https://..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Biografía</label>
              <textarea [ngModel]="form().biography" (ngModelChange)="setField('biography',$event)"
                rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400 resize-none"></textarea>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button (click)="showForm.set(false)" class="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
            <button (click)="save()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {{ editing() ? 'Guardar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal foto -->
    @if (showPhoto()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900">Foto — {{ selectedCoach()?.firstName }} {{ selectedCoach()?.lastName }}</h2>
            <button (click)="showPhoto.set(false)" class="text-gray-400 text-xl">×</button>
          </div>
          <div class="p-5">
            @if (selectedCoach()?.photoUrl) {
              <div class="flex justify-center mb-4">
                <img [src]="selectedCoach()!.photoUrl" class="w-20 h-20 object-cover rounded-full border-2 border-gray-100" />
              </div>
            }
            <label class="block text-xs font-medium text-gray-600 mb-1">URL de foto</label>
            <div class="flex gap-2 mb-4">
              <input [(ngModel)]="photoUrl" placeholder="https://..."
                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
              <button (click)="savePhotoUrl()" class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Guardar</button>
            </div>
            <div class="border-t border-gray-100 pt-4">
              <label class="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                <span class="text-xl mb-1">📁</span>
                <span class="text-xs text-gray-500">Subir imagen</span>
                <input type="file" accept="image/*" (change)="onFileSelected($event)" class="hidden" />
              </label>
              @if (selectedFile()) {
                <div class="mt-3 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span class="text-xs text-gray-600 truncate">{{ selectedFile()!.name }}</span>
                  <button (click)="uploadFile()" class="ml-2 px-3 py-1 bg-green-600 text-white rounded-lg text-xs">
                    {{ uploading() ? 'Subiendo...' : 'Subir' }}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .tab-on  { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; background: #1d4ed8; color: #fff; border: none; cursor: pointer; }
    .tab-off { padding: 8px 16px; border-radius: 8px; font-size: 13px; background: #f3f4f6; color: #6b7280; border: none; cursor: pointer; }
  `]
})
export class AdminCoachesComponent implements OnInit {
  tab           = signal<'coaches' | 'assign'>('coaches');
  coaches       = signal<any[]>([]);
  teams         = signal<any[]>([]);
  seasons       = signal<any[]>([]);
  showForm      = signal(false);
  showPhoto     = signal(false);
  editing       = signal<any>(null);
  selectedCoach = signal<any>(null);
  selectedFile  = signal<File | null>(null);
  uploading     = signal(false);
  search        = '';
  photoUrl      = '';
  roles         = ROLES;

  // Buscador
  searchCoachAssign     = '';
  searchTeamAssign      = '';
  filteredCoachesAssign = signal<any[]>([]);
  filteredTeamsAssign   = signal<any[]>([]);
  selectedCoachAssign   = signal<any>(null);
  selectedTeamAssign    = signal<any>(null);

  form = signal<any>({ firstName: '', lastName: '', nationality: '', birthDate: '', birthPlace: '', photoUrl: '', biography: '' });
  assignForm: any = { coachId: '', teamId: '', seasonId: '', role: 'HEAD_COACH', note: '' };

  constructor(
    private coachesService: CoachesService,
    private adminService: AdminService,
    private seasonService: SeasonService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.load();
    this.adminService.getTeams().subscribe(t => this.teams.set(t));
    this.seasonService.getAll().subscribe(s => this.seasons.set(s));
  }

  load() { this.coachesService.adminGetAll(this.search).subscribe(c => this.coaches.set(c)); }
  setField(f: string, v: any) { this.form.update(fm => ({ ...fm, [f]: v })); }

  openCreate() {
    this.form.set({ firstName: '', lastName: '', nationality: '', birthDate: '', birthPlace: '', photoUrl: '', biography: '' });
    this.editing.set(null); this.showForm.set(true);
  }

  openEdit(c: any) {
    this.form.set({ firstName: c.firstName, lastName: c.lastName, nationality: c.nationality || '', birthDate: c.birthDate?.split('T')[0] || '', birthPlace: c.birthPlace || '', photoUrl: c.photoUrl || '', biography: c.biography || '' });
    this.editing.set(c); this.showForm.set(true);
  }

  openPhoto(c: any) { this.selectedCoach.set(c); this.photoUrl = c.photoUrl || ''; this.selectedFile.set(null); this.showPhoto.set(true); }

  save() {
    const obs = this.editing()
      ? this.coachesService.update(this.editing().id, this.form())
      : this.coachesService.create(this.form());
    obs.subscribe({ next: () => { this.load(); this.showForm.set(false); this.toast.success('Guardado correctamente'); }, error: () => this.toast.error('Error al guardar') });
  }

  deleteCoach(c: any) {
    this.coachesService.delete(c.id).subscribe({ next: () => { this.load(); this.toast.success(`${c.firstName} ${c.lastName} eliminado`); }, error: () => this.toast.error('Error al eliminar') });
  }

  savePhotoUrl() {
    this.coachesService.savePhotoUrl(this.selectedCoach().id, this.photoUrl).subscribe({ next: () => { this.load(); this.showPhoto.set(false); this.toast.success('Foto actualizada'); }, error: () => this.toast.error('Error') });
  }

  onFileSelected(e: any) { const f = e.target.files[0]; if (f) this.selectedFile.set(f); }

  uploadFile() {
    if (!this.selectedFile()) return;
    this.uploading.set(true);
    this.coachesService.uploadPhoto(this.selectedCoach().id, this.selectedFile()!).subscribe({ next: () => { this.load(); this.showPhoto.set(false); this.uploading.set(false); this.toast.success('Foto subida'); }, error: () => { this.uploading.set(false); this.toast.error('Error al subir'); } });
  }

  assign() {
    if (!this.assignForm.coachId || !this.assignForm.teamId || !this.assignForm.seasonId) { this.toast.warning('Completa todos los campos'); return; }
    this.coachesService.assignToSeason(this.assignForm).subscribe({ next: () => { this.toast.success('Entrenador asignado'); this.assignForm = { coachId: '', teamId: '', seasonId: '', role: 'HEAD_COACH', note: '' }; }, error: () => this.toast.error('Error al asignar') });
  }

  // BUSCADOR
  filterCoachesAssign() {
    const q = this.searchCoachAssign.toLowerCase();
    this.filteredCoachesAssign.set(
      q.length < 1 ? [] : this.coaches().filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }

  selectCoachAssign(c: any) {
    this.assignForm.coachId = c.id;
    this.selectedCoachAssign.set(c);
    this.searchCoachAssign = '';
    this.filteredCoachesAssign.set([]);
  }

  filterTeamsAssign() {
    const q = this.searchTeamAssign.toLowerCase();
    this.filteredTeamsAssign.set(
      q.length < 1 ? [] : this.teams().filter(t =>
        t.name.toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }

  selectTeamAssign(t: any) {
    this.assignForm.teamId = t.id;
    this.selectedTeamAssign.set(t);
    this.searchTeamAssign = '';
    this.filteredTeamsAssign.set([]);
  }
}
