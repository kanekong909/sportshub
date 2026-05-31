import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Stats
  getStats()              { return this.http.get<any>(`${this.api}/stats`); }

  // Teams
  getTeams(search = '')   { return this.http.get<any[]>(`${this.api}/teams`, { params: { search } }); }
  createTeam(data: any)   { return this.http.post<any>(`${this.api}/teams`, data); }
  updateTeam(id: string, data: any) { return this.http.put<any>(`${this.api}/teams/${id}`, data); }
  deleteTeam(id: string)  { return this.http.delete(`${this.api}/teams/${id}`); }
  uploadTeamLogo(id: string, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<any>(`${this.api}/teams/${id}/logo`, fd);
  }

  // Players
  getPlayers(teamId = '', search = '') {
    return this.http.get<any[]>(`${this.api}/players`, { params: { search, ...(teamId && { teamId }) } });
  }
  createPlayer(data: any) { return this.http.post<any>(`${this.api}/players`, data); }
  updatePlayer(id: string, data: any) { return this.http.put<any>(`${this.api}/players/${id}`, data); }
  deletePlayer(id: string){ return this.http.delete(`${this.api}/players/${id}`); }
  uploadPlayerPhoto(id: string, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<any>(`${this.api}/players/${id}/photo`, fd);
  }

  // Stadiums
  getStadiums()           { return this.http.get<any[]>(`${this.api}/stadiums`); }
  createStadium(data: any){ return this.http.post<any>(`${this.api}/stadiums`, data); }
  updateStadium(id: string, data: any) { return this.http.put<any>(`${this.api}/stadiums/${id}`, data); }
  uploadStadiumImage(id: string, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<any>(`${this.api}/stadiums/${id}/image`, fd);
  }

  // Leagues
  getLeagues()            { return this.http.get<any[]>(`${this.api}/leagues`); }
  createLeague(data: any) { return this.http.post<any>(`${this.api}/leagues`, data); }
  updateLeague(id: string, data: any) { return this.http.put<any>(`${this.api}/leagues/${id}`, data); }
  deleteLeague(id: string) {
    return this.http.delete(`${this.api}/admin/leagues/${id}`);
  }

  uploadLeagueLogo(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/admin/leagues/${id}/upload-logo`, formData);
  }

  // Users
  getUsers()              { return this.http.get<any[]>(`${this.api}/users`); }
  updateRole(id: string, role: string) { return this.http.patch(`${this.api}/users/${id}/role`, { role }); }

  // Transfers
  getTransfers(playerId?: string) {
    const params: any = playerId ? { playerId } : {};
    return this.http.get<any[]>(`${this.api}/transfers`, { params });
  }
  transferPlayer(playerId: string, toTeamId: string | null, description?: string) {
    return this.http.post<any>(`${this.api}/transfers`, { playerId, toTeamId, description });
  }
  getFreeAgents() { return this.http.get<any[]>(`${this.api}/free-agents`); }

  // STATS
  // Stats - Estadísticas de equipo
  getTeamSeasonStats(query: any = {}) {
    return this.http.get<any[]>(`${this.api}/team-season-stats`, { params: query });
  }

  createTeamSeasonStat(data: any) {
    return this.http.post<any>(`${this.api}/team-season-stats`, data);
  }

  updateTeamSeasonStat(id: string, data: any) {
    return this.http.put<any>(`${this.api}/team-season-stats/${id}`, data);
  }

  deleteTeamSeasonStat(id: string) {
    return this.http.delete(`${this.api}/team-season-stats/${id}`);
  }

  // Temporadas
  getSeasons() {
    return this.http.get<string[]>(`${this.api}/seasons`);
  }
}
