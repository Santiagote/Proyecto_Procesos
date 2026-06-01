import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private baseUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getStudentReport(studentId?: number, subjectId?: number, period?: string): Observable<any> {
    let params = new HttpParams();
    if (studentId) params = params.set('student_id', studentId);
    if (subjectId) params = params.set('subject_id', subjectId);
    if (period) params = params.set('period', period);
    return this.http.get(`${this.baseUrl}/student/`, { params });
  }

  getSubjectReport(subjectId: number, period?: string): Observable<any> {
    let params = new HttpParams().set('subject_id', subjectId);
    if (period) params = params.set('period', period);
    return this.http.get(`${this.baseUrl}/subject/`, { params });
  }

  getTeacherReport(teacherId?: number, period?: string): Observable<any> {
    let params = new HttpParams();
    if (teacherId) params = params.set('teacher_id', teacherId);
    if (period) params = params.set('period', period);
    return this.http.get(`${this.baseUrl}/teacher/`, { params });
  }

  getPeriodReport(period: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/period/`, { params: { period } });
  }

  exportPdf(type: string, subjectId?: number, studentId?: number, period?: string): Observable<Blob> {
    let params = new HttpParams().set('type', type);
    if (subjectId) params = params.set('subject_id', subjectId);
    if (studentId) params = params.set('student_id', studentId);
    if (period) params = params.set('period', period);
    return this.http.get(`${this.baseUrl}/export/pdf/`, { params, responseType: 'blob' });
  }

  exportExcel(type: string, subjectId?: number, studentId?: number, period?: string): Observable<Blob> {
    let params = new HttpParams().set('type', type);
    if (subjectId) params = params.set('subject_id', subjectId);
    if (studentId) params = params.set('student_id', studentId);
    if (period) params = params.set('period', period);
    return this.http.get(`${this.baseUrl}/export/excel/`, { params, responseType: 'blob' });
  }
}
