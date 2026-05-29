import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-stadiums',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './stadiums.component.html',
  styleUrl: './stadiums.component.css'
})
export class StadiumsComponent implements OnInit {
  stadiums = signal<any[]>([]);
  search = signal('');
  selectedCountry = signal<string>('all');
  selectedContinent = signal<string>('all');

  // Mapeo de países a continentes y banderas
  countriesData: { [key: string]: { continent: string, flag: string, code: string } } = {
    // EUROPA
    'Spain': { continent: 'europe', flag: '🇪🇸', code: 'ES' },
    'España': { continent: 'europe', flag: '🇪🇸', code: 'ES' },
    'England': { continent: 'europe', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'GB-ENG' },
    'United Kingdom': { continent: 'europe', flag: '🇬🇧', code: 'GB' },
    'Italy': { continent: 'europe', flag: '🇮🇹', code: 'IT' },
    'Italia': { continent: 'europe', flag: '🇮🇹', code: 'IT' },
    'Germany': { continent: 'europe', flag: '🇩🇪', code: 'DE' },
    'Alemania': { continent: 'europe', flag: '🇩🇪', code: 'DE' },
    'France': { continent: 'europe', flag: '🇫🇷', code: 'FR' },
    'Francia': { continent: 'europe', flag: '🇫🇷', code: 'FR' },
    'Portugal': { continent: 'europe', flag: '🇵🇹', code: 'PT' },
    'Netherlands': { continent: 'europe', flag: '🇳🇱', code: 'NL' },
    'Holland': { continent: 'europe', flag: '🇳🇱', code: 'NL' },
    'Belgium': { continent: 'europe', flag: '🇧🇪', code: 'BE' },
    'Scotland': { continent: 'europe', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'GB-SCT' },
    
    // AMÉRICA
    'USA': { continent: 'america', flag: '🇺🇸', code: 'US' },
    'United States': { continent: 'america', flag: '🇺🇸', code: 'US' },
    'Estados Unidos': { continent: 'america', flag: '🇺🇸', code: 'US' },
    'Brazil': { continent: 'america', flag: '🇧🇷', code: 'BR' },
    'Brasil': { continent: 'america', flag: '🇧🇷', code: 'BR' },
    'Argentina': { continent: 'america', flag: '🇦🇷', code: 'AR' },
    'Mexico': { continent: 'america', flag: '🇲🇽', code: 'MX' },
    'México': { continent: 'america', flag: '🇲🇽', code: 'MX' },
    'Canada': { continent: 'america', flag: '🇨🇦', code: 'CA' },
    'Canadá': { continent: 'america', flag: '🇨🇦', code: 'CA' },
    'Colombia': { continent: 'america', flag: '🇨🇴', code: 'CO' },
    'Chile': { continent: 'america', flag: '🇨🇱', code: 'CL' },
    'Uruguay': { continent: 'america', flag: '🇺🇾', code: 'UY' },
    
    // ASIA
    'Japan': { continent: 'asia', flag: '🇯🇵', code: 'JP' },
    'Japón': { continent: 'asia', flag: '🇯🇵', code: 'JP' },
    'China': { continent: 'asia', flag: '🇨🇳', code: 'CN' },
    'South Korea': { continent: 'asia', flag: '🇰🇷', code: 'KR' },
    'Corea del Sur': { continent: 'asia', flag: '🇰🇷', code: 'KR' },
    'Qatar': { continent: 'asia', flag: '🇶🇦', code: 'QA' },
    'Saudi Arabia': { continent: 'asia', flag: '🇸🇦', code: 'SA' },
    'Arabia Saudita': { continent: 'asia', flag: '🇸🇦', code: 'SA' },
    'UAE': { continent: 'asia', flag: '🇦🇪', code: 'AE' },
    
    // ÁFRICA
    'South Africa': { continent: 'africa', flag: '🇿🇦', code: 'ZA' },
    'Sudáfrica': { continent: 'africa', flag: '🇿🇦', code: 'ZA' },
    'Morocco': { continent: 'africa', flag: '🇲🇦', code: 'MA' },
    'Marruecos': { continent: 'africa', flag: '🇲🇦', code: 'MA' },
    'Egypt': { continent: 'africa', flag: '🇪🇬', code: 'EG' },
    'Egipto': { continent: 'africa', flag: '🇪🇬', code: 'EG' },
    'Nigeria': { continent: 'africa', flag: '🇳🇬', code: 'NG' },
    
    // OCEANÍA
    'Australia': { continent: 'oceania', flag: '🇦🇺', code: 'AU' },
  };

  getCountryFlag(countryName: string): string {
    const countryData = this.countriesData[countryName];
    if (countryData) {
      return countryData.flag;
    }
    // Fallback: intentar encontrar por coincidencia parcial o código
    const found = Object.entries(this.countriesData).find(([key]) => 
      countryName?.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(countryName?.toLowerCase())
    );
    return found ? found[1].flag : '🌍';
  }

  // Obtener países únicos de los estadios
  availableCountries = computed(() => {
    const allStadiums = this.stadiums();
    const countriesMap = new Map<string, { country: string, count: number, flag: string, continent: string }>();
    
    allStadiums.forEach(stadium => {
      if (stadium.country) {
        const countryData = this.countriesData[stadium.country] || { 
          continent: 'other', 
          flag: '🌍', 
          code: stadium.country.substring(0, 2).toUpperCase() 
        };
        
        if (countriesMap.has(stadium.country)) {
          countriesMap.get(stadium.country)!.count++;
        } else {
          countriesMap.set(stadium.country, {
            country: stadium.country,
            count: 1,
            flag: countryData.flag,
            continent: countryData.continent
          });
        }
      }
    });
    
    return Array.from(countriesMap.values()).sort((a, b) => a.country.localeCompare(b.country));
  });

  // Agrupar países por continente
  countriesByContinent = computed(() => {
    const continents = {
      europe: { name: 'Europa', countries: [] as any[], order: 1 },
      america: { name: 'América', countries: [] as any[], order: 2 },
      asia: { name: 'Asia', countries: [] as any[], order: 3 },
      africa: { name: 'África', countries: [] as any[], order: 4 },
      oceania: { name: 'Oceanía', countries: [] as any[], order: 5 },
      other: { name: 'Otros', countries: [] as any[], order: 6 }
    };
    
    this.availableCountries().forEach(country => {
      const continent = country.continent;
      if (continents[continent as keyof typeof continents]) {
        continents[continent as keyof typeof continents].countries.push(country);
      } else {
        continents.other.countries.push(country);
      }
    });
    
    // Ordenar continentes por order
    return Object.values(continents)
      .filter(continent => continent.countries.length > 0)
      .sort((a, b) => a.order - b.order);
  });

  // Filtrar estadios por búsqueda y país
  filteredStadiums = computed(() => {
    let filtered = this.stadiums();
    
    // Filtro por búsqueda
    const query = this.search().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(query) || 
        s.city?.toLowerCase().includes(query) ||
        s.team?.name?.toLowerCase().includes(query)
      );
    }
    
    // Filtro por país
    const country = this.selectedCountry();
    if (country && country !== 'all') {
      filtered = filtered.filter(s => s.country === country);
    }
    
    return filtered;
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStadiums();
  }

  loadStadiums() {
    this.http.get<any[]>(`${environment.apiUrl}/stadiums`).subscribe(s => {
      this.stadiums.set(s);
    });
  }

  updateSearch(value: string) {
    this.search.set(value);
  }

  selectCountry(country: string) {
    this.selectedCountry.set(country);
  }

  clearFilters() {
    this.selectedCountry.set('all');
    this.search.set('');
  }

  onImageError(event: any) {
    event.target.src = '';
    event.target.parentElement.classList.add('no-image');
  }
}