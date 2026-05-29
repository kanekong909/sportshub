import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Usuarios</h1>
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Favoritos</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (u of users(); track u.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ u.name }}</td>
                <td class="px-4 py-3 text-gray-500">{{ u.email }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-medium"
                    [class]="u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'">
                    {{ u.role }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ u._count?.favoriteTeams || 0 }} equipos</td>
                <td class="px-4 py-3 text-gray-500">{{ u.createdAt | date:'mediumDate' }}</td>
                <td class="px-4 py-3">
                  <button
                    (click)="toggleRole(u)"
                    class="text-xs font-medium px-2 py-1 rounded border transition-colors"
                    [class]="u.role === 'ADMIN' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-purple-200 text-purple-600 hover:bg-purple-50'">
                    {{ u.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  users = signal<any[]>([]);
  constructor(private admin: AdminService) {}
  ngOnInit() { this.load(); }
  load() { this.admin.getUsers().subscribe(u => this.users.set(u)); }
  toggleRole(u: any) {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (confirm(`¿Cambiar rol de ${u.name} a ${newRole}?`)) {
      this.admin.updateRole(u.id, newRole).subscribe(() => this.load());
    }
  }
}
