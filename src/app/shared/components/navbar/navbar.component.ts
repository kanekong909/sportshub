import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css' 
})
export class NavbarComponent {
  menuOpen = signal(false);
  constructor(public auth: AuthService) {}
  isAdmin() { return (this.auth.currentUser() as any)?.role === 'ADMIN'; }
  initial() { return this.auth.currentUser()?.name?.[0]?.toUpperCase() || '?'; }
}
