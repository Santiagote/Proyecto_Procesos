import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
    return this.http.get<Career[] | PaginatedResponse<Career>>(`${this.baseUrl}/careers/`).pipe(
      map(response => {
        const careers = Array.isArray(response)
          ? response
          : (response as CareerApiResponse).results
            ?? (response as CareerApiResponse).data
            ?? (response as CareerApiResponse).careers
            ?? (response as CareerApiResponse).items
            ?? [];

        return careers
          .map(career => {
            const rawCareer = career as CareerApiItem & Career;

            return {
              id: rawCareer.id ?? rawCareer.career_id ?? rawCareer.id_carrera ?? 0,
              name: rawCareer.name ?? rawCareer.nombre ?? rawCareer.code ?? rawCareer.codigo ?? '',
              code: rawCareer.code ?? rawCareer.codigo ?? '',
              nombre: rawCareer.nombre,
              codigo: rawCareer.codigo,
            };
          })
          .filter(career => career.id > 0 && career.name.trim().length > 0);
      })
    );
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/`);
  }
}
