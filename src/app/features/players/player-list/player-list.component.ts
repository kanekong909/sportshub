import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlayersService } from '../../../core/services/players.service';
import { Player } from '../../../core/models';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.css'
})
export class PlayerListComponent implements OnInit {
  // 1. Estados base como Signals reactivos
  players = signal<Player[]>([]);
  loading = signal(true);
  activeSport = signal('');
  search = signal(''); // Cambiado a Signal para reactividad nativa

  sports = [
    { label: 'Todos', value: '' },
    { label: 'Soccer', value: 'soccer' },
    { label: 'NBA', value: 'nba' },
    { label: 'NFL', value: 'nfl' },
  ];

  // 2. Cálculo declarativo y eficiente de los datos filtrados
  filtered = computed(() => {
    let result = this.players();
    const sportFilter = this.activeSport().toLowerCase().trim();
    const searchFilter = this.search().toLowerCase().trim();

    // 1. FILTRO DE DEPORTE (Evaluando los códigos de posición de la API)
    if (sportFilter) {
      result = result.filter(p => {
        const posCode = p.position?.code?.toLowerCase() || '';

        if (sportFilter === 'soccer') {
          return ['gk', 'def', 'mid', 'fwd'].includes(posCode);
        }
        
        if (sportFilter === 'nba') {
          return ['pg', 'sg', 'sf', 'pf', 'c'].includes(posCode);
        }
        
        if (sportFilter === 'nfl') {
          return ['qb', 'rb', 'wr', 'te', 'lb', 'cb'].includes(posCode);
        }

        return false;
      });
    }

    // 2. FILTRO DE BÚSQUEDA
    if (searchFilter) {
      result = result.filter(p =>
        p.firstName.toLowerCase().includes(searchFilter) ||
        p.lastName.toLowerCase().includes(searchFilter) ||
        p.team?.name.toLowerCase().includes(searchFilter)
      );
    }

    return result;
  });


  constructor(private playersService: PlayersService) {}

  ngOnInit() {
    this.playersService.getAll().subscribe({
      next: (players) => {
        console.log('Estructura de un jugador:', players[0]);
        this.players.set(players);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
