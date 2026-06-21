import { Component, OnInit } from '@angular/core';
import { StudentService } from '@core/services/student.service';
import { Student, Career } from '@core/models/student.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-student-list',
  template: `
    <div class="page-header">
      <h4 class="page-title mb-0">Gestión de Estudiantes</h4>
      <button class="btn btn-primary-glow" routerLink="/students/new" *ngIf="isAdmin">
        <i class="bi bi-person-plus-fill me-2"></i>Nuevo Estudiante
      </button>
    </div>

    <div class="card modern-card">
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

        <div class="table-container" *ngIf="!loading && students.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Nombres</th>
                <th>Email</th>
                <th>Carrera</th>
                <th>Nivel</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of students">
                <td>{{ s.user.cedula }}</td>
                <td><span class="fw-medium text-light">{{ s.user.nombres }} {{ s.user.apellidos }}</span></td>
                <td>{{ s.user.email }}</td>
                <td>{{ s.career_name }}</td>
                <td>{{ s.nivel }}</td>
                <td>
                  <div class="table-actions justify-content-end">
                    <button class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/students', s.id]" *ngIf="isAdmin">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="confirmDeactivate(s)" *ngIf="isAdmin">
                      <i class="bi bi-person-x-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!loading && students.length === 0" class="empty-state">
          <i class="bi bi-people"></i>
          <p>No se encontraron estudiantes</p>
        </div>
      </div>
    </div>

    <div *ngIf="showDeactivateModal" class="modal-custom-overlay" (click)="showDeactivateModal = false">
      <div class="modal-custom" (click)="$event.stopPropagation()">
        <div class="modal-custom-header">
          <span>Desactivar Estudiante</span>
          <button class="modal-custom-close" (click)="showDeactivateModal = false">&times;</button>
        </div>
        <div class="modal-custom-body">
          <p>¿Desactivar a <strong>{{ selectedStudent?.user?.nombres }} {{ selectedStudent?.user?.apellidos }}</strong>?</p>
          <div class="mb-3">
            <label class="form-label">Motivo</label>
            <textarea class="form-control" [(ngModel)]="deactivateReason" rows="2" placeholder="Razón de la desactivación"></textarea>
          </div>
        </div>
        <div class="modal-custom-footer">
          <button class="btn btn-outline-secondary" (click)="showDeactivateModal = false">Cancelar</button>
          <button class="btn btn-primary-glow" (click)="deactivate()">Desactivar</button>
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
