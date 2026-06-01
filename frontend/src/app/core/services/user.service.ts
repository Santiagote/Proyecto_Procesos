import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}/`);
  }

  createUser(data: any): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/`, data);
  }

  updateUser(id: number, data: any): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/`, data);
  }

  deactivateUser(id: number, motivo: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/${id}/deactivate/`, { motivo });
  }

  reactivateUser(id: number): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/${id}/reactivate/`, {});
  }
}
