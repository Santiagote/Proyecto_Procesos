import { Component, OnInit } from '@angular/core';
import { StudentService } from '@core/services/student.service';
import { Student, Career } from '@core/models/student.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-student-list',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="page-title mb-0">Gestión de Estudiantes</h4>
      <button class="btn btn-sacarf" routerLink="/students/new" *ngIf="isAdmin">
        <i class="bi bi-person-plus-fill me-2"></i>Nuevo Estudiante
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" placeholder="Buscar por nombre, cédula o carrera..."
                     [(ngModel)]="searchQuery" (input)="onSearch()">
            </div>
          </div>
        </div>

        <div *ngIf="loading" class="loading-spinner">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <table class="data-table" *ngIf="!loading && students.length > 0">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombres</th>
              <th>Email</th>
              <th>Carrera</th>
              <th>Nivel</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of students">
              <td>{{ s.user.cedula }}</td>
              <td>{{ s.user.nombres }} {{ s.user.apellidos }}</td>
              <td>{{ s.user.email }}</td>
              <td>{{ s.career_name }}</td>
              <td>{{ s.nivel }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/students', s.id]" *ngIf="isAdmin">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="confirmDeactivate(s)" *ngIf="isAdmin">
                  <i class="bi bi-person-x-fill"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && students.length === 0" class="text-center py-4 text-muted">
          No se encontraron estudiantes
        </div>
      </div>
    </div>

    <div *ngIf="showDeactivateModal" class="modal d-block" style="background:rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Desactivar Estudiante</h5>
            <button class="btn-close" (click)="showDeactivateModal = false"></button>
          </div>
          <div class="modal-body">
            <p>¿Desactivar a <strong>{{ selectedStudent?.user?.nombres }} {{ selectedStudent?.user?.apellidos }}</strong>?</p>
            <div class="mb-3">
              <label class="form-label">Motivo</label>
              <textarea class="form-control" [(ngModel)]="deactivateReason" rows="2"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showDeactivateModal = false">Cancelar</button>
            <button class="btn btn-danger" (click)="deactivate()">Desactivar</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  loading = false;
  searchQuery = '';
  showDeactivateModal = false;
  selectedStudent: Student | null = null;
  deactivateReason = '';

  isAdmin = false;
  constructor(private studentService: StudentService, private authService: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(['ADMIN']);
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getStudents().subscribe({
      next: res => { this.students = res.results; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  onSearch(): void {
    if (this.searchQuery.length < 2) { this.loadStudents(); return; }
    this.studentService.searchStudents(this.searchQuery).subscribe(s => this.students = s);
  }

  confirmDeactivate(s: Student): void {
    this.selectedStudent = s;
    this.deactivateReason = '';
    this.showDeactivateModal = true;
  }

  deactivate(): void {
    if (!this.selectedStudent || !this.deactivateReason) return;
    this.studentService.deactivateStudent(this.selectedStudent.id, this.deactivateReason).subscribe({
      next: () => { this.showDeactivateModal = false; this.loadStudents(); },
    });
  }
}
