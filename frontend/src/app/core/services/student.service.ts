import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
<<<<<<< HEAD
import { Student, Career, Subject, StudentSubject } from '@core/models/student.model';
=======
import { Student, StudentCreateRequest, Career, Subject, StudentSubject } from '@core/models/student.model';

function parsearErrorBackend(err: any): string {
  const e = err?.error;
  if (!e) return 'Error al procesar la solicitud. Intenta nuevamente.';
  if (typeof e === 'string') return e;
  if (e.detail) return e.detail;
  if (e.cedula) return `Cédula: ${Array.isArray(e.cedula) ? e.cedula[0] : e.cedula}`;
  if (e.email) return `Correo: ${Array.isArray(e.email) ? e.email[0] : e.email}`;
  if (e.user?.cedula) return 'Ya existe un usuario con esa cédula.';
  if (e.user?.email) return 'Ya existe un usuario con ese correo electrónico.';
  if (e.non_field_errors) return Array.isArray(e.non_field_errors) ? e.non_field_errors[0] : e.non_field_errors;
  const primerCampo = Object.keys(e)[0];
  if (primerCampo) {
    const msg = Array.isArray(e[primerCampo]) ? e[primerCampo][0] : e[primerCampo];
    return `${primerCampo}: ${msg}`;
  }
  return 'Error al procesar la solicitud. Intenta nuevamente.';
}
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885

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
    return this.http.get<any>(`${this.baseUrl}/search/`, { params: { q: query } }).pipe(map(res => res.results || res));
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
    return this.http.get<any>(`${this.baseUrl}/subjects/`).pipe(
      map(res => res.results ?? res)
    );
  }
}
