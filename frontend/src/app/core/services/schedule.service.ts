import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Schedule, AcademicPeriod } from '@core/models/schedule.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private baseUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  getSchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.baseUrl}/schedules/`);
  }

  getSchedule(id: number): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.baseUrl}/schedules/${id}/`);
  }

  createSchedule(data: any): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.baseUrl}/schedules/`, data);
  }

  updateSchedule(id: number, data: any): Observable<Schedule> {
    return this.http.patch<Schedule>(`${this.baseUrl}/schedules/${id}/`, data);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/schedules/${id}/`);
  }

  getPeriods(): Observable<AcademicPeriod[]> {
    return this.http.get<AcademicPeriod[]>(`${this.baseUrl}/periods/`);
  }

  createPeriod(data: any): Observable<AcademicPeriod> {
    return this.http.post<AcademicPeriod>(`${this.baseUrl}/periods/`, data);
  }
}
