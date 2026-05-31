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

  // Añadir este método para obtener la URL de la bandera
  getFlagUrl(nationality: string): string {
    if (!nationality) return '';

    // Mapeo de países a códigos de bandera (ISO 3166-1 alpha-2)
    const countryCodes: Record<string, string> = {
      'Spain': 'es',
      'Spanish': 'es',
      'España': 'es',
      'Argentina': 'ar',
      'Argentine': 'ar',
      'Argentinian': 'ar',
      'Brazil': 'br',
      'Brasil': 'br',
      'France': 'fr',
      'Francia': 'fr',
      'French': 'fr',
      'Italy': 'it',
      'Italia': 'it',
      'Italian': 'it',
      'England': 'gb-eng',
      'English': 'gb-eng',
      'Inglaterra': 'gb-eng',
      'Germany': 'de',
      'Alemania': 'de',
      'German': 'de',
      'Portugal': 'pt',
      'Portuguese': 'pt',
      'Netherlands': 'nl',
      'Países Bajos': 'nl',
      'Holland': 'nl',
      'Dutch': 'nl',
      'Belgium': 'be',
      'Bélgica': 'be',
      'Belgian': 'be',
      'Uruguay': 'uy',
      'Uruguayan': 'uy',
      'Colombia': 'co',
      'Colombian': 'co',
      'Chile': 'cl',
      'Chilean': 'cl',
      'Mexico': 'mx',
      'México': 'mx',
      'Mexican': 'mx',
      'United States': 'us',
      'USA': 'us',
      'Estados Unidos': 'us',
      'EEUU': 'us',
      'American': 'us',
      'Austria': 'at',
      'Austrian': 'at',
      'Croatia': 'hr',
      'Croacia': 'hr',
      'Croatian': 'hr',
      'Serbia': 'rs',
      'Serbian': 'rs',
      'Sweden': 'se',
      'Suecia': 'se',
      'Swedish': 'se',
      'Denmark': 'dk',
      'Dinamarca': 'dk',
      'Danish': 'dk',
      'Poland': 'pl',
      'Polonia': 'pl',
      'Polish': 'pl',
      'Czech Republic': 'cz',
      'República Checa': 'cz',
      'Czech': 'cz',
      'Russia': 'ru',
      'Rusia': 'ru',
      'Russian': 'ru',
      'Turkey': 'tr',
      'Turquía': 'tr',
      'Turkish': 'tr',
      'Morocco': 'ma',
      'Marruecos': 'ma',
      'Moroccan': 'ma',
      'Egypt': 'eg',
      'Egipto': 'eg',
      'Egyptian': 'eg',
      'Nigeria': 'ng',
      'Nigerian': 'ng',
      'Senegal': 'sn',
      'Senegalese': 'sn',
      'Cameroon': 'cm',
      'Camerún': 'cm',
      'Cameroonian': 'cm',
      'Ghana': 'gh',
      'Ghanaian': 'gh',
      'Ivory Coast': 'ci',
      'Costa de Marfil': 'ci',
      'Ivorian': 'ci',
      'Japan': 'jp',
      'Japón': 'jp',
      'Japanese': 'jp',
      'South Korea': 'kr',
      'Corea del Sur': 'kr',
      'Korean': 'kr',
      'Australia': 'au',
      'Australian': 'au',
      'Canada': 'ca',
      'Canadá': 'ca',
      'Canadian': 'ca',
      // --- Nuevas adiciones comunes ---
      'Peru': 'pe',
      'Perú': 'pe',
      'Peruvian': 'pe',
      'Ecuador': 'ec',
      'Ecuadorian': 'ec',
      'Venezuela': 've',
      'Venezuelan': 've',
      'Switzerland': 'ch',
      'Suiza': 'ch',
      'Swiss': 'ch',
      'Ukraine': 'ua',
      'Ucrania': 'ua',
      'Ukrainian': 'ua',
      'China': 'cn',
      'Chinese': 'cn',
      'Saudi Arabia': 'sa',
      'Arabia Saudita': 'sa',
      'Saudi': 'sa',
      'South Africa': 'za',
      'Sudáfrica': 'za',
      'South African': 'za'
    };

    const code = countryCodes[nationality] || nationality.slice(0, 2).toLowerCase();

    // Usar flagcdn.com o flagpedia (más confiable)
    return `https://flagcdn.com/w160/${code}.png`;
  }

  // Alternativa con emoji de bandera (más ligero, sin imágenes externas)
  getFlagEmoji(nationality: string): string {
    const countryEmojis: Record<string, string> = {
      'Spain': '🇪🇸', 'España': '🇪🇸',
      'Argentina': '🇦🇷',
      'Brazil': '🇧🇷', 'Brasil': '🇧🇷',
      'France': '🇫🇷', 'Francia': '🇫🇷',
      'Italy': '🇮🇹', 'Italia': '🇮🇹',
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Germany': '🇩🇪', 'Alemania': '🇩🇪',
      'Portugal': '🇵🇹',
      'Netherlands': '🇳🇱', 'Países Bajos': '🇳🇱', 'Holland': '🇳🇱',
      'Belgium': '🇧🇪', 'Bélgica': '🇧🇪',
      'Uruguay': '🇺🇾', 'Uruguayan': '🇺🇾',
      'Colombia': '🇨🇴', 'Colombian': '🇨🇴',
      'Chile': '🇨🇱', 'Chilean': '🇨🇱',
      'Mexico': '🇲🇽', 'México': '🇲🇽', 'Mexican': '🇲🇽',
      'United States': '🇺🇸', 'USA': '🇺🇸', 'American': '🇺🇸',
      'Austria': '🇦🇹', 'Austrian': '🇦🇹',
      'Croatia': '🇭🇷', 'Croacia': '🇭🇷',
      'Serbia': '🇷🇸',
      'Sweden': '🇸🇪', 'Suecia': '🇸🇪',
      'Denmark': '🇩🇰', 'Dinamarca': '🇩🇰',
      'Poland': '🇵🇱', 'Polonia': '🇵🇱',
      'Czech Republic': '🇨🇿', 'República Checa': '🇨🇿',
      'Russia': '🇷🇺', 'Rusia': '🇷🇺',
      'Turkey': '🇹🇷', 'Turquía': '🇹🇷',
      'Morocco': '🇲🇦', 'Marruecos': '🇲🇦',
      'Egypt': '🇪🇬', 'Egipto': '🇪🇬',
      'Nigeria': '🇳🇬',
      'Senegal': '🇸🇳',
      'Cameroon': '🇨🇲', 'Camerún': '🇨🇲',
      'Ghana': '🇬🇭',
      'Japan': '🇯🇵', 'Japón': '🇯🇵',
      'South Korea': '🇰🇷', 'Corea del Sur': '🇰🇷',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦', 'Canadá': '🇨🇦',
    };

    return countryEmojis[nationality] || '🏳️';
  }
}
