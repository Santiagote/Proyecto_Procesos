import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Student, StudentCreateRequest, Career, Subject, StudentSubject } from '@core/models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private baseUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents(params?: any): Observable<{ results: Student[]; count: number }> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) httpParams = httpParams.set(k, params[k]); });
    return this.http.get<any>(`${this.baseUrl}/students/`, { params: httpParams });
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/students/${id}/`);
  }

  createStudent(data: FormData): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/students/`, data);
  }

  updateStudent(id: number, data: FormData): Observable<Student> {
    return this.http.patch<Student>(`${this.baseUrl}/students/${id}/`, data);
  }

  deactivateStudent(id: number, motivo: string): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/students/${id}/deactivate/`, { motivo });
  }

  searchStudents(query: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students/search/`, { params: { q: query } });
  }

  getStudentSubjects(studentId: number): Observable<StudentSubject[]> {
    return this.http.get<StudentSubject[]>(`${this.baseUrl}/students/${studentId}/subjects/`);
  }

  enrollStudent(studentId: number, subjectId: number, period: string): Observable<StudentSubject> {
    return this.http.post<StudentSubject>(`${this.baseUrl}/students/${studentId}/enroll/`, {
      subject_id: subjectId, academic_period: period,
    });
  }

  getCareers(): Observable<Career[]> {
    return this.http.get<Career[]>(`${this.baseUrl}/careers/`);
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/`);
  }
}
