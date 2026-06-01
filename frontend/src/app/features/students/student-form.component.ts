import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '@core/services/student.service';
import { Career } from '@core/models/student.model';

@Component({
  selector: 'app-student-form',
  template: `
    <h4 class="page-title">{{ isEdit ? 'Editar' : 'Nuevo' }} Estudiante</h4>

    <div class="card">
      <div class="card-body">
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <form (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Cédula *</label>
              <input type="text" class="form-control" [(ngModel)]="form.cedula" name="cedula" required>
            </div>
            <div class="col-md-4">
              <label class="form-label">Nombres *</label>
              <input type="text" class="form-control" [(ngModel)]="form.nombres" name="nombres" required>
            </div>
            <div class="col-md-4">
              <label class="form-label">Apellidos *</label>
              <input type="text" class="form-control" [(ngModel)]="form.apellidos" name="apellidos" required>
            </div>
            <div class="col-md-4">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" [(ngModel)]="form.email" name="email" required
                     [attr.readonly]="isEdit">
            </div>
            <div class="col-md-4">
              <label class="form-label">Teléfono</label>
              <input type="text" class="form-control" [(ngModel)]="form.telefono" name="telefono">
            </div>
            <div class="col-md-4">
              <label class="form-label">Carrera *</label>
              <select class="form-select" [(ngModel)]="form.career_id" name="career_id" required>
                <option value="">Seleccionar...</option>
                <option *ngFor="let c of careers" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Nivel *</label>
              <input type="number" class="form-control" [(ngModel)]="form.nivel" name="nivel" min="1" max="10" required>
            </div>
            <div class="col-md-4">
              <label class="form-label">Fotografía de referencia</label>
              <input type="file" class="form-control" (change)="onFileSelected($event)" accept="image/*">
            </div>
          </div>

          <div class="mt-4">
            <button type="submit" class="btn btn-sacarf me-2" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEdit ? 'Actualizar' : 'Registrar' }} Estudiante
            </button>
            <a routerLink="/students" class="btn btn-outline-secondary">Cancelar</a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class StudentFormComponent implements OnInit {
  isEdit = false;
  studentId: number | null = null;
  loading = false;
  error = '';
  careers: Career[] = [];
  selectedFile: File | null = null;

  form = {
    cedula: '', nombres: '', apellidos: '', email: '',
    telefono: '', career_id: 0, nivel: 1,
  };

  constructor(
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    if (this.route.snapshot.params['id']) {
      this.isEdit = true;
      this.studentId = +this.route.snapshot.params['id'];
    }
  }

  ngOnInit(): void {
    this.studentService.getCareers().subscribe(c => this.careers = c);
    if (this.isEdit && this.studentId) {
      this.studentService.getStudent(this.studentId).subscribe(s => {
        this.form.cedula = s.user.cedula;
        this.form.nombres = s.user.nombres;
        this.form.apellidos = s.user.apellidos;
        this.form.email = s.user.email;
        this.form.telefono = s.user.telefono;
        this.form.career_id = s.career;
        this.form.nivel = s.nivel;
      });
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] || null;
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    const fd = new FormData();
    Object.entries(this.form).forEach(([k, v]) => fd.append(k, String(v)));
    if (this.selectedFile) fd.append('reference_image', this.selectedFile);

    const obs = this.isEdit
      ? this.studentService.updateStudent(this.studentId!, fd)
      : this.studentService.createStudent(fd);

    obs.subscribe({
      next: () => this.router.navigate(['/students']),
      error: err => { this.error = err.message; this.loading = false; },
    });
  }
}
