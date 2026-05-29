import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Player } from '../models';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private api = `${environment.apiUrl}/players`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { sport?: string; teamSlug?: string; search?: string }) {
    let params = new HttpParams();
    if (filters?.sport)     params = params.set('sport',     filters.sport);
    if (filters?.teamSlug)  params = params.set('teamSlug',  filters.teamSlug);
    if (filters?.search)    params = params.set('search',    filters.search);
    return this.http.get<Player[]>(this.api, { params });
  }

  getBySlug(slug: string) {
    return this.http.get<Player>(`${this.api}/${slug}`);
  }
}
