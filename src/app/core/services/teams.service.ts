import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Team, TeamSeasonStats } from '../models';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private api = `${environment.apiUrl}/teams`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { sport?: string; league?: string; search?: string }) {
    let params = new HttpParams();
    if (filters?.sport)  params = params.set('sport',  filters.sport);
    if (filters?.league) params = params.set('league', filters.league);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Team[]>(this.api, { params });
  }

  getBySlug(slug: string) {
    return this.http.get<Team>(`${this.api}/${slug}`);
  }

  getStats(slug: string) {
    return this.http.get<TeamSeasonStats[]>(`${this.api}/${slug}/stats`);
  }

  getTeamSeasons(slug: string) {
    return this.http.get<any[]>(`${this.api}/${slug}/seasons`);
  }

  getSquadBySeason(slug: string, seasonId: string) {
    return this.http.get<any[]>(`${this.api}/${slug}/squad/${seasonId}`);
  }
}
