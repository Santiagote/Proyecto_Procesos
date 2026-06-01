import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AttendanceRecord, AttendanceException, AttendanceSummary } from '@core/models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private baseUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  captureAttendance(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(`${this.baseUrl}/records/capture/`, formData);
  }

  getHistory(params?: any): Observable<{ results: AttendanceRecord[]; count: number }> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) httpParams = httpParams.set(k, params[k]); });
    return this.http.get<any>(`${this.baseUrl}/records/history/`, { params: httpParams });
  }

  getExceptions(params?: any): Observable<{ results: AttendanceException[]; count: number }> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) httpParams = httpParams.set(k, params[k]); });
    return this.http.get<any>(`${this.baseUrl}/exceptions/audit/`, { params: httpParams });
  }

  justifyAbsence(data: any): Observable<AttendanceException> {
    return this.http.post<AttendanceException>(`${this.baseUrl}/exceptions/justify/`, data);
  }
}
