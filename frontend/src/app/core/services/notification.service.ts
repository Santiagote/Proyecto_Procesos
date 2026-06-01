import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Notification } from '@core/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<{ results: Notification[]; count: number }> {
    return this.http.get<any>(`${this.baseUrl}/notifications/`);
  }

  markRead(id: number): Observable<Notification> {
    return this.http.post<Notification>(`${this.baseUrl}/notifications/${id}/mark_read/`, {});
  }

  markAllRead(): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/mark_all_read/`, {});
  }

  getUnreadCount(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(`${this.baseUrl}/notifications/unread_count/`);
  }
}
