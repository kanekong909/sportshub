import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private api = `${environment.apiUrl}/admin/seasons`;

  constructor(private http: HttpClient) {}

  getAll(leagueId?: string) {
    const params: any = leagueId ? { leagueId } : {};
    return this.http.get<any[]>(this.api, { params });
  }

  create(data: any)              { return this.http.post<any>(this.api, data); }
  update(id: string, data: any)  { return this.http.put<any>(`${this.api}/${id}`, data); }
  setCurrent(id: string)         { return this.http.patch(`${this.api}/${id}/current`, {}); }

  getSquad(teamId: string, seasonId: string) {
    return this.http.get<any[]>(`${this.api}/squad`, { params: { teamId, seasonId } });
  }
  addPlayer(playerId: string, teamId: string, seasonId: string) {
    return this.http.post(`${this.api}/squad`, { playerId, teamId, seasonId });
  }
  removePlayer(playerId: string, teamId: string, seasonId: string) {
    return this.http.delete(`${this.api}/squad`, { body: { playerId, teamId, seasonId } });
  }
  getPlayerHistory(playerId: string) {
    return this.http.get<any[]>(`${this.api}/player/${playerId}/history`);
  }
  getCurrentSquad(teamId: string) {
    return this.http.get<any[]>(`${this.api}/team/${teamId}/current`);
  }
}
