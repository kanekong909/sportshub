import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">🏆 SportsHub</div>
        <h1>Crea tu cuenta</h1>
        <p class="auth-sub">Tu enciclopedia deportiva personalizada</p>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <div class="form-group">
          <label>Nombre</label>
          <input type="text" [(ngModel)]="name" placeholder="Tu nombre" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="tu@email.com" />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="password" placeholder="Mínimo 8 caracteres" />
        </div>

        <button class="btn-primary" (click)="register()" [disabled]="loading()">
          {{ loading() ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>

        <p class="auth-footer">
          ¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #f9fafb; padding: 20px;
    }
    .auth-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 16px;
      padding: 40px; width: 100%; max-width: 400px;
    }
    .auth-logo { font-size: 20px; font-weight: 600; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 600; color: #111; margin-bottom: 6px; }
    .auth-sub { font-size: 14px; color: #6b7280; margin-bottom: 28px; }
    .auth-error {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
      padding: 10px 14px; font-size: 13px; color: #b91c1c; margin-bottom: 16px;
    }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .form-group input {
      width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px;
      font-size: 14px; outline: none; box-sizing: border-box; transition: border-color .15s;
    }
    .form-group input:focus { border-color: #3b82f6; }
    .btn-primary {
      width: 100%; padding: 11px; background: #1d4ed8; color: #fff; border: none;
      border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;
      margin-top: 8px; transition: background .15s;
    }
    .btn-primary:hover:not(:disabled) { background: #1e40af; }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
    .auth-footer { font-size: 13px; color: #6b7280; text-align: center; margin-top: 20px; }
    .auth-footer a { color: #1d4ed8; text-decoration: none; font-weight: 500; }
  `]
})
export class RegisterComponent {
  name     = '';
  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.password) { this.error.set('Completa todos los campos'); return; }
    if (this.password.length < 8) { this.error.set('La contraseña debe tener al menos 8 caracteres'); return; }
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (e) => { this.error.set(e.error?.message || 'Error al registrarse'); this.loading.set(false); },
    });
  }
}
