import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  favoriteTeams   = signal<any[]>([]);
  followedPlayers = signal<any[]>([]);
  notes           = signal<any[]>([]);
  history         = signal<any[]>([]);

  constructor(
    public auth: AuthService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.userService.getFavoriteTeams().subscribe(t => this.favoriteTeams.set(t));
    this.userService.getFollowedPlayers().subscribe(p => this.followedPlayers.set(p));
    this.userService.getNotes().subscribe(n => this.notes.set(n));
    this.userService.getHistory().subscribe(h => this.history.set(h));
  }
}