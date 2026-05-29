import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-transfers',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-transfers.component.html',
  styleUrl: './admin-transfers.component.css'
})
export class AdminTransfersComponent implements OnInit {
  tab            = signal<'transfer' | 'free' | 'history'>('transfer');
  players        = signal<any[]>([]);
  playerResults  = signal<any[]>([]);
  teamResults    = signal<any[]>([]);
  freeAgents     = signal<any[]>([]);
  transfers      = signal<any[]>([]);
  selectedPlayer = signal<any>(null);
  selectedTeam   = signal<any>(null);
  toTeamId       = signal<string>('');
  transferring   = signal(false);
  successMsg     = signal('');
  searchPlayer   = '';
  searchTeam     = '';
  transferNote   = '';
  allTeams: any[] = [];

  constructor(private admin: AdminService) {}

  ngOnInit() {
    this.admin.getPlayers().subscribe(p => this.players.set(p));
    this.admin.getTeams().subscribe(t => { this.allTeams = t; });
    this.admin.getFreeAgents().subscribe(f => this.freeAgents.set(f));
    this.admin.getTransfers().subscribe(t => this.transfers.set(t));
  }

  searchPlayers() {
    if (this.searchPlayer.length < 2) { this.playerResults.set([]); return; }
    const q = this.searchPlayer.toLowerCase();
    this.playerResults.set(
      this.players().filter(p =>
        p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q)
      ).slice(0, 8)
    );
  }

  searchTeams() {
    if (!this.searchTeam) { this.teamResults.set([]); return; }
    const q = this.searchTeam.toLowerCase();
    this.teamResults.set(
      this.allTeams.filter(t => t.name.toLowerCase().includes(q)).slice(0, 6)
    );
  }

  selectPlayer(p: any) {
    this.selectedPlayer.set(p);
    this.toTeamId.set('');
    this.selectedTeam.set(null);
    this.successMsg.set('');
    this.searchTeam = '';
    this.teamResults.set([]);
  }

  selectTeam(t: any) {
    this.selectedTeam.set(t);
    this.toTeamId.set(t.id);
  }

  quickTransfer(p: any) {
    this.tab.set('transfer');
    this.selectPlayer(p);
    this.searchPlayer = `${p.firstName} ${p.lastName}`;
    this.playerResults.set([p]);
  }

  canTransfer() {
    // Permite transferencia si:
      // 1. Hay un jugador seleccionado
      // 2. Hay un equipo destino seleccionado (incluyendo 'none' para agente libre)
      // 3. No está en proceso de transferencia
    return !!this.selectedPlayer() && 
        (this.toTeamId() !== '' || this.toTeamId() === 'none') && 
        !this.transferring();
  }

  confirmTransfer() {
    if (!this.canTransfer()) return;
    
    // Si toTeamId es 'none', significa agente libre (null)
    const toTeamId = this.toTeamId() === 'none' ? null : this.toTeamId();
    
    this.transferring.set(true);
    this.successMsg.set('');

    this.admin.transferPlayer(this.selectedPlayer().id, toTeamId, this.transferNote || undefined)
      .subscribe({
        next: (updated) => {
          const name = `${updated.firstName} ${updated.lastName}`;
          const dest = toTeamId === null ? 'agente libre' : updated.team?.name;
          this.successMsg.set(`${name} transferido a ${dest}`);
          this.transferring.set(false);
          
          // Resetear el formulario
          this.toTeamId.set('');
          this.transferNote = '';
          this.searchTeam = '';
          this.selectedTeam.set(null);
          
          // Opcional: limpiar la selección del jugador después de un tiempo
          setTimeout(() => {
            this.selectedPlayer.set(null);
            this.searchPlayer = '';
          }, 2000);
          
          // Recargar datos
          this.refreshData();
        },
        error: (err) => {
          this.transferring.set(false);
          console.error('Error en transferencia:', err);
          // Podrías agregar un mensaje de error aquí
          alert('Error al procesar la transferencia');
        }
      });
  }

  selectFreeAgent() {
    this.selectedTeam.set(null);
    this.toTeamId.set('none');
    this.searchTeam = '';
    this.teamResults.set([]);
  }

  setFreeAgent(event: Event) {
    event.stopPropagation(); // Evita que el click se propague al div padre
    this.selectFreeAgent();
  }

  private refreshData() {
    this.admin.getFreeAgents().subscribe(f => this.freeAgents.set(f));
    this.admin.getTransfers().subscribe(t => this.transfers.set(t));
    this.admin.getPlayers().subscribe(p => this.players.set(p));
  }
}