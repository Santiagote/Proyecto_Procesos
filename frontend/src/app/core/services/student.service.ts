import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { Student, StudentCreateRequest, Career, Subject, StudentSubject } from '@core/models/student.model';

interface PaginatedResponse<T> {
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private baseUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents(params?: any): Observable<{ results: Student[]; count: number }> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) httpParams = httpParams.set(k, params[k]); });
    return this.http.get<any>(`${this.baseUrl}/`, { params: httpParams });
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}/`);
  }

  createStudent(data: FormData): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/`, data);
  }

  updateStudent(id: number, data: FormData): Observable<Student> {
    return this.http.patch<Student>(`${this.baseUrl}/${id}/`, data);
  }

  deactivateStudent(id: number, motivo: string): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/${id}/deactivate/`, { motivo });
  }

  searchStudents(query: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/search/`, { params: { q: query } });
  }

  getStudentSubjects(studentId: number): Observable<StudentSubject[]> {
    return this.http.get<StudentSubject[]>(`${this.baseUrl}/${studentId}/subjects/`);
  }

  enrollStudent(studentId: number, subjectId: number, period: string): Observable<StudentSubject> {
    return this.http.post<StudentSubject>(`${this.baseUrl}/${studentId}/enroll/`, {
      subject_id: subjectId, academic_period: period,
    });
  }

  getCareers(): Observable<Career[]> {
    return this.http.get<Career[] | PaginatedResponse<Career>>(`${this.baseUrl}/careers/`).pipe(
      map(response => Array.isArray(response) ? response : response.results)
    );
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/`);
  }
}
