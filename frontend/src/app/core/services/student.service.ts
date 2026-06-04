import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Student, StudentCreateRequest, Career, Subject, StudentSubject } from '@core/models/student.model';
interface PaginatedResponse<T> {
  results: T[];
}

interface CareerApiItem {
  id?: number;
  career_id?: number;
  id_carrera?: number;
  name?: string;
  nombre?: string;
  code?: string;
  codigo?: string;
}

interface CareerApiResponse {
  results?: CareerApiItem[];
  data?: CareerApiItem[];
  careers?: CareerApiItem[];
  items?: CareerApiItem[];
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
    return this.http.get<any>(`${this.baseUrl}/careers/`).pipe(
      map(response => {
        const list = Array.isArray(response) ? response : (response?.results ?? []);
        return list.map((c: any) => ({
          id: c.id ?? 0,
          name: c.name ?? c.nombre ?? '',
          code: c.code ?? c.codigo ?? '',
        })).filter((c: any) => c.id > 0 && c.name.trim().length > 0);
      }),
      catchError(() => of([]))
    );
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/`);
  }
}
