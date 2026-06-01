import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { Router } from '@angular/router';
import {
  User, LoginRequest, LoginResponse,
  PasswordChangeRequest, PasswordRecoveryRequest, PasswordResetRequest,
} from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'sacarf_access_token';
  private readonly REFRESH_KEY = 'sacarf_refresh_token';
  private readonly USER_KEY = 'sacarf_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login/`, data).pipe(
      tap(res => {
        this.storeTokens(res.tokens.access, res.tokens.refresh);
        this.storeUser(res.user);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  logout(): void {
    const refresh = localStorage.getItem(this.REFRESH_KEY);
    if (refresh) {
      this.http.post(`${environment.apiUrl}/auth/logout/`, { refresh }).subscribe({ error: () => {} });
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<any> {
    const refresh = localStorage.getItem(this.REFRESH_KEY);
    if (!refresh) return throwError(() => new Error('No refresh token'));
    return this.http.post<any>(`${environment.apiUrl}/auth/login/refresh/`, { refresh }).pipe(
      tap(res => this.storeTokens(res.access, res.refresh || refresh)),
      catchError(err => {
        this.clearSession();
        this.router.navigate(['/auth/login']);
        return throwError(() => err);
      })
    );
  }

  changePassword(data: PasswordChangeRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/change-password/`, data);
  }

  recoverPassword(data: PasswordRecoveryRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/recover-password/`, data);
  }

  resetPassword(data: PasswordResetRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password/`, data);
  }

  getProfile(): Observable<User> {
    return this.http.get<any>(`${environment.apiUrl}/auth/profile/`);
  }

  updateProfile(data: FormData): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/auth/profile/`, data);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  get userRole(): string | null {
    return this.currentUser?.role || null;
  }

  hasRole(roles: string[]): boolean {
    return !!this.currentUser && roles.includes(this.currentUser.role);
  }

  private storeTokens(access: string, refresh: string): void {
    localStorage.setItem(this.TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_KEY, refresh);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }
}
