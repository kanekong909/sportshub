import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-players',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Jugadores</h1>
          <p class="text-gray-500 text-sm mt-1">{{ players().length }} jugadores</p>
        </div>
        <button (click)="openCreate()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Nuevo jugador</button>
      </div>

      <input [(ngModel)]="search" (ngModelChange)="onSearchChange()" placeholder="Buscar jugador..."
  class="mb-4 w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos.</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nac.</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (p of players(); track p.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    @if (p.photoUrl) {
                      <img [src]="p.photoUrl" [alt]="p.firstName" class="w-full h-full object-cover" />
                    } @else {
                      <span class="text-xs font-bold text-gray-400">{{ p.firstName[0] }}{{ p.lastName[0] }}</span>
                    }
                  </div>
                </td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ p.firstName }} {{ p.lastName }}</td>
                <td class="px-4 py-3 text-gray-500">{{ p.team?.name || '—' }}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{{ p.position?.code || '—' }}</span></td>
                <td class="px-4 py-3 text-gray-500">{{ p.nationality || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button (click)="openEdit(p)" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                    <button (click)="openImage(p)" class="text-green-600 hover:text-green-800 text-xs font-medium">Foto</button>
                    <button (click)="confirmDelete(p)" class="text-red-500 hover:text-red-700 text-xs font-medium">Borrar</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showForm()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
            <h2 class="text-lg font-semibold text-black">{{ editing() ? 'Editar jugador' : 'Nuevo jugador' }}</h2>
            <button (click)="showForm.set(false)" class="text-gray-400 text-xl">×</button>
          </div>
          <div class="p-6 grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input [(ngModel)]="form.firstName" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Apellido *</label>
              <input [(ngModel)]="form.lastName" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Número de camiseta</label>
              <input [(ngModel)]="form.jerseyNumber" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Nacionalidad</label>
              <input [(ngModel)]="form.nationality" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Altura (cm)</label>
              <input [(ngModel)]="form.height" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Peso (kg)</label>
              <input [(ngModel)]="form.weight" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">URL foto</label>
              <input [(ngModel)]="form.photoUrl" placeholder="https://..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Biografía</label>
              <textarea [(ngModel)]="form.biography" rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"></textarea>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button (click)="showForm.set(false)" class="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
            <button (click)="save()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {{ editing() ? 'Guardar cambios' : 'Crear jugador' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showImageModal()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Foto — {{ selectedPlayer()?.firstName }} {{ selectedPlayer()?.lastName }}</h2>
            <button (click)="showImageModal.set(false)" class="text-gray-400 text-xl">×</button>
          </div>
          <div class="p-6">
            @if (selectedPlayer()?.photoUrl) {
              <div class="flex justify-center mb-4">
                <img [src]="selectedPlayer()!.photoUrl" alt="foto" class="w-20 h-20 object-cover rounded-full border-2 border-gray-100" />
              </div>
            }
            <label class="block text-xs font-medium text-gray-600 mb-1">URL de foto</label>
            <div class="flex gap-2 mb-4">
              <input [(ngModel)]="imageUrl" placeholder="https://..." class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
              <button (click)="saveImageUrl()" class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Guardar</button>
            </div>
            <div class="border-t border-gray-100 pt-4">
              <label class="block text-xs font-medium text-gray-600 mb-2">O subir archivo</label>
              <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                <span class="text-2xl mb-1">📁</span>
                <span class="text-xs text-gray-500">Seleccionar imagen</span>
                <input type="file" accept="image/*" (change)="onFileSelected($event)" class="hidden" />
              </label>
              @if (selectedFile()) {
                <div class="mt-3 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span class="text-xs text-gray-600 truncate">{{ selectedFile()!.name }}</span>
                  <button (click)="uploadFile()" class="ml-2 px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium">
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
})
export class AdminPlayersComponent implements OnInit {
  players        = signal<any[]>([]);
  showForm       = signal(false);
  showImageModal = signal(false);
  editing        = signal<any>(null);
  selectedPlayer = signal<any>(null);
  selectedFile   = signal<File | null>(null);
  uploading      = signal(false);
  search         = '';
  imageUrl       = '';
  form: any      = {};
  searchTimeout: any;

  constructor(private admin: AdminService) {}
  ngOnInit() { this.load(); }
  load() {
    this.admin.getPlayers('', this.search).subscribe(p => this.players.set(p));
  }

  openCreate() { this.form = {}; this.editing.set(null); this.showForm.set(true); }
  openEdit(p: any) { this.form = { ...p }; this.editing.set(p); this.showForm.set(true); }
  openImage(p: any) { this.selectedPlayer.set(p); this.imageUrl = p.photoUrl || ''; this.selectedFile.set(null); this.showImageModal.set(true); }

  save() {
    const obs = this.editing()
      ? this.admin.updatePlayer(this.editing().id, this.form)
      : this.admin.createPlayer(this.form);
    obs.subscribe(() => { this.load(); this.showForm.set(false); });
  }

  confirmDelete(p: any) {
    if (confirm(`¿Borrar a ${p.firstName} ${p.lastName}?`)) {
      this.admin.deletePlayer(p.id).subscribe(() => this.load());
    }
  }

  saveImageUrl() {
    this.admin.updatePlayer(this.selectedPlayer().id, { photoUrl: this.imageUrl }).subscribe(u => {
      this.selectedPlayer.set(u); this.load();
    });
  }

  onFileSelected(e: any) { const f = e.target.files[0]; if (f) this.selectedFile.set(f); }

  uploadFile() {
    if (!this.selectedFile()) return;
    this.uploading.set(true);
    this.admin.uploadPlayerPhoto(this.selectedPlayer().id, this.selectedFile()!).subscribe(u => {
      this.selectedPlayer.set(u); this.selectedFile.set(null); this.uploading.set(false); this.load();
    });
  }

  onSearchChange() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.load();
    }, 300);
  }
}
