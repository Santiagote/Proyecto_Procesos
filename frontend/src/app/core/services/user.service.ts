import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
import { Observable, map } from 'rxjs';
=======
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
import { environment } from '@env/environment';
import { User } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.baseUrl}/users/`).pipe(
<<<<<<< HEAD
      map(res => res.results ?? res)
=======
      map(res => Array.isArray(res) ? res : (res?.results ?? []))
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
    );
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
