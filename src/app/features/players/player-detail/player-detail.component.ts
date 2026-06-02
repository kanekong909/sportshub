import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PlayersService } from '../../../core/services/players.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Player } from '../../../core/models';
import { SeasonService } from '../../../core/services/season.service';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.css'
})
export class PlayerDetailComponent implements OnInit {
  player     = signal<Player | null>(null);
  loading    = signal(true);
  isFollowing = signal(false);
  playerHistory = signal<any[]>([]);

  constructor(
    private route: ActivatedRoute,
    private playersService: PlayersService,
    private userService: UserService,
    public auth: AuthService,
    private seasonService: SeasonService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.playersService.getBySlug(slug).subscribe(p => {
      console.log('📋 Datos completos del jugador:', p);
      console.log('🔍 SeasonStats:', p.seasonStats);
      console.log('📊 Team:', p.team);
      console.log('🏷️ Position:', p.position);

      this.player.set(p);
      this.loading.set(false);
      if (this.auth.isLoggedIn()) {
        this.userService.addHistory('player', p.id).subscribe();
      }
      this.seasonService.getPlayerHistory(p.id).subscribe(h => {
        console.log('📜 Historial del jugador:', h);
        this.playerHistory.set(h)
      });
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

  // player-detail.component.ts - Añade este método
  getAge(birthDate: string | Date | null | undefined): number | string {
    if (!birthDate) return 'No disponible';

    const today = new Date();
    const birth = new Date(birthDate);

    // Verificar si la fecha es válida
    if (isNaN(birth.getTime())) return 'No disponible';

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

}
