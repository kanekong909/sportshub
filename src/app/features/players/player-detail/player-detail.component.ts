import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PlayersService } from '../../../core/services/players.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Player } from '../../../core/models';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.css' 
})
export class PlayerDetailComponent implements OnInit {
  player     = signal<Player | null>(null);
  loading    = signal(true);
  isFollowing = signal(false);

  constructor(
    private route: ActivatedRoute,
    private playersService: PlayersService,
    private userService: UserService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.playersService.getBySlug(slug).subscribe(p => {
      this.player.set(p);
      this.loading.set(false);
      if (this.auth.isLoggedIn()) {
        this.userService.addHistory('player', p.id).subscribe();
      }
    });
    if (this.auth.isLoggedIn()) {
      this.userService.getFollowedPlayers().subscribe(list => {
        this.isFollowing.set(list.some((f: any) => f.player.slug === slug));
      });
    }
  }

  toggleFollow() {
    const id = this.player()!.id;
    if (this.isFollowing()) {
      this.userService.unfollowPlayer(id).subscribe(() => this.isFollowing.set(false));
    } else {
      this.userService.followPlayer(id).subscribe(() => this.isFollowing.set(true));
    }
  }

  objectEntries(obj: any): [string, any][] {
    return obj ? Object.entries(obj) : [];
  }
}