import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (auth.isLoggedIn()) {
      <app-navbar />
    }
    <main [class.with-nav]="auth.isLoggedIn()">
      <router-outlet />
    </main>
  `,
  styles: [`
    main { min-height: 100vh; }
    main.with-nav { padding-top: 56px; }
  `]
})
export class App {
  constructor(public auth: AuthService) {}
}
