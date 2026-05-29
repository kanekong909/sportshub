import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-leagues',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-leagues.component.html',
})
export class AdminLeaguesComponent implements OnInit {
  leagues  = signal<any[]>([]);
  sports   = signal<any[]>([]);
  allTeams = signal<any[]>([]);
  teamSearch = signal('');
  showForm = signal(false);
  showImageModal = signal(false);
  editing  = signal<any>(null);
  selectedLeague = signal<any>(null);
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  imageUrl = '';
  
  form: any = {};

  filteredTeams = computed(() => {
    const search = this.teamSearch().toLowerCase().trim();
    const teams = this.allTeams();
    
    if (!search) return teams;
    return teams.filter(t => 
      t.name?.toLowerCase().includes(search) || 
      t.city?.toLowerCase().includes(search)
    );
  });

  constructor(private admin: AdminService, private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
    this.http.get<any[]>(`${environment.apiUrl}/sports`).subscribe(s => this.sports.set(s));
    this.http.get<any[]>(`${environment.apiUrl}/teams`).subscribe(t => this.allTeams.set(t));
  }

  loadData() {
    this.admin.getLeagues().subscribe(l => this.leagues.set(l));
  }

  openCreate() { 
    this.teamSearch.set('');
    this.form = { teamIds: [], logoUrl: '' }; 
    this.editing.set(null); 
    this.showForm.set(true); 
  }

  openEdit(l: any) { 
    this.teamSearch.set('');
    const currentTeamIds = l.teams?.map((t: any) => t.team?.id || t.teamId) || [];
    
    this.form = { 
      name: l.name,
      sportId: l.sportId,
      country: l.country,
      season: l.season,
      logoUrl: l.logoUrl || '',
      teamIds: [...currentTeamIds]
    }; 
    
    this.editing.set(l); 
    this.showForm.set(true); 
  }

  openImage(league: any) {
    this.selectedLeague.set(league);
    this.imageUrl = league.logoUrl || '';
    this.selectedFile.set(null);
    this.showImageModal.set(true);
  }

  isTeamSelected(teamId: string): boolean {
    return this.form.teamIds?.includes(teamId) || false;
  }

  toggleTeamSelection(teamId: string) {
    if (!this.form.teamIds) {
      this.form.teamIds = [];
    }
    
    if (this.isTeamSelected(teamId)) {
      this.form.teamIds = this.form.teamIds.filter((id: string) => id !== teamId);
    } else {
      this.form.teamIds = [...this.form.teamIds, teamId];
    }
  }

  save() {
    const obs = this.editing()
      ? this.admin.updateLeague(this.editing().id, this.form)
      : this.admin.createLeague(this.form);
      
    obs.subscribe({
      next: () => {
        this.loadData();
        this.showForm.set(false);
      }
    });
  }

  saveImageUrl() {
    this.admin.updateLeague(this.selectedLeague().id, { logoUrl: this.imageUrl }).subscribe({
      next: (updated) => {
        this.selectedLeague.set(updated);
        this.loadData();
        this.showImageModal.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile.set(file);
  }

  uploadFile() {
    const currentLeague = this.selectedLeague();
    const file = this.selectedFile();
    if (!currentLeague || !file) return;

    this.uploading.set(true);
    this.admin.uploadLeagueLogo(currentLeague.id, file).subscribe({
      next: (updated) => {
        this.selectedLeague.set(updated);
        this.selectedFile.set(null);
        this.uploading.set(false);
        this.loadData();
        this.showImageModal.set(false);
      },
      error: () => this.uploading.set(false)
    });
  }
}