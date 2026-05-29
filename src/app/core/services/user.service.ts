import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, Team, Player, UserNote } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = `${environment.apiUrl}/users/me`;

  constructor(private http: HttpClient) {}

  getProfile()           { return this.http.get<User>(this.api); }
  getFavoriteTeams()     { return this.http.get<any[]>(`${this.api}/favorites`); }
  addFavoriteTeam(id: string)    { return this.http.post(`${this.api}/favorites/${id}`, {}); }
  removeFavoriteTeam(id: string) { return this.http.delete(`${this.api}/favorites/${id}`); }
  getFollowedPlayers()   { return this.http.get<any[]>(`${this.api}/players`); }
  followPlayer(id: string)    { return this.http.post(`${this.api}/players/${id}`, {}); }
  unfollowPlayer(id: string)  { return this.http.delete(`${this.api}/players/${id}`); }
  getNotes()             { return this.http.get<UserNote[]>(`${this.api}/notes`); }
  saveNote(entityType: string, entityId: string, content: string) {
    return this.http.post<UserNote>(`${this.api}/notes`, { entityType, entityId, content });
  }
  deleteNote(noteId: string) { return this.http.delete(`${this.api}/notes/${noteId}`); }
  getHistory()           { return this.http.get<any[]>(`${this.api}/history`); }
  addHistory(entityType: string, entityId: string) {
    return this.http.post(`${this.api}/history`, { entityType, entityId });
  }
}
