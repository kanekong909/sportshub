import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CoachesService {
  private api = `${environment.apiUrl}/coaches`;

  constructor(private http: HttpClient) {}

  getAll(query?: { search?: string })     { return this.http.get<any[]>(this.api, { params: query || {} }); }
  getBySlug(slug: string)                  { return this.http.get<any>(`${this.api}/${slug}`); }
  getSquadCoaches(teamId: string, seasonId: string) {
    return this.http.get<any[]>(`${this.api}/squad/${teamId}/${seasonId}`);
  }

  // Admin
  adminGetAll(search = '')  { return this.http.get<any[]>(`${this.api}/admin/all`, { params: { search } }); }
  create(data: any)         { return this.http.post<any>(this.api, data); }
  update(id: string, d: any){ return this.http.put<any>(`${this.api}/${id}`, d); }
  delete(id: string)        { return this.http.delete(`${this.api}/${id}`); }
  uploadPhoto(id: string, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<any>(`${this.api}/${id}/photo`, fd);
  }
  savePhotoUrl(id: string, url: string) {
    return this.http.post<any>(`${this.api}/${id}/photo`, { photoUrl: url });
  }
  getSeasons(id: string)    { return this.http.get<any[]>(`${this.api}/${id}/seasons`); }
  assignToSeason(data: { coachId: string; teamId: string; seasonId: string; role: string; note?: string }) {
    return this.http.post(`${this.api}/season/assign`, data);
  }
  updateSeason(data: any)   { return this.http.put(`${this.api}/season/update`, data); }
  removeFromSeason(data: any){ return this.http.delete(`${this.api}/season/remove`, { body: data }); }
}
