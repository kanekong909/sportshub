import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-stadiums',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-stadiums.component.html',
  styleUrl: './admin-stadiums.component.css'
})
export class AdminStadiumsComponent implements OnInit {
  stadiums       = signal<any[]>([]);
  teams          = signal<any[]>([]); // Lista de equipos para asignar
  showForm       = signal(false);
  showImageModal = signal(false);
  editing        = signal<any>(null);
  selectedStadium = signal<any>(null);
  selectedFile   = signal<File | null>(null);
  uploading      = signal(false);
  imageUrl       = '';
  teamSearch     = signal(''); // Búsqueda de equipos
  
  form: any = {
    name: '',
    teamId: null, // ID del equipo asignado
    city: '',
    country: '',
    capacity: null,
    inaugurated: null,
    surface: '',
    imageUrl: ''
  };

  // Filtrar equipos por búsqueda
  filteredTeams = computed(() => {
    const search = this.teamSearch().toLowerCase().trim();
    const allTeams = this.teams();
    
    if (!search) return allTeams;
    
    return allTeams.filter(t => 
      t.name?.toLowerCase().includes(search) ||
      t.city?.toLowerCase().includes(search) ||
      t.country?.toLowerCase().includes(search)
    );
  });

  constructor(private admin: AdminService) {}
  
  ngOnInit() { 
    this.load(); 
    this.loadTeams(); // Cargar equipos disponibles
  }
  
  load() { 
    this.admin.getStadiums().subscribe(s => this.stadiums.set(s)); 
  }
  
  loadTeams() {
    this.admin.getTeams('').subscribe(t => this.teams.set(t));
  }
  
  openCreate() { 
    this.teamSearch.set('');
    this.form = {
      name: '',
      teamId: null,
      city: '',
      country: '',
      capacity: null,
      inaugurated: null,
      surface: '',
      imageUrl: ''
    }; 
    this.editing.set(null); 
    this.showForm.set(true); 
  }
  
  openEdit(s: any) { 
    this.teamSearch.set('');
    this.form = { 
      name: s.name || '',
      teamId: s.teamId || s.team?.id || null,
      city: s.city || '',
      country: s.country || '',
      capacity: s.capacity || null,
      inaugurated: s.inaugurated || null,
      surface: s.surface || '',
      imageUrl: s.imageUrl || ''
    }; 
    this.editing.set(s); 
    this.showForm.set(true); 
  }
  
  openImage(s: any) { 
    this.selectedStadium.set(s); 
    this.imageUrl = s.imageUrl || ''; 
    this.selectedFile.set(null); 
    this.showImageModal.set(true); 
  }
  
  save() {
    const obs = this.editing()
      ? this.admin.updateStadium(this.editing().id, this.form)
      : this.admin.createStadium(this.form);
      
    obs.subscribe(() => { 
      this.load(); 
      this.showForm.set(false); 
    });
  }
  
  saveImageUrl() {
    this.admin.updateStadium(this.selectedStadium().id, { imageUrl: this.imageUrl }).subscribe(() => {
      this.load();
      this.showImageModal.set(false);
    });
  }
  
  onFileSelected(e: any) { 
    const f = e.target.files[0]; 
    if (f) this.selectedFile.set(f); 
  }
  
  uploadFile() {
    if (!this.selectedFile() || !this.selectedStadium()) return;
    this.uploading.set(true);
    this.admin.uploadStadiumImage(this.selectedStadium().id, this.selectedFile()!).subscribe(() => {
      this.selectedFile.set(null); 
      this.uploading.set(false); 
      this.load();
      this.showImageModal.set(false);
    });
  }

  // Obtener nombre del equipo asignado
  getTeamName(teamId: string | null) {
    if (!teamId) return 'Sin asignar';
    const team = this.teams().find(t => t.id === teamId);
    return team ? team.name : 'Sin asignar';
  }
}