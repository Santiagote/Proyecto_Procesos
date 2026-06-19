import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '@core/services/student.service';
import { Career } from '@core/models/student.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-student-form',
  template: `
    <div class="page-header">
      <h4 class="page-title mb-0">{{ isEdit ? 'Editar' : 'Nuevo' }} Estudiante</h4>
    </div>

    <div class="card modern-card">
      <div class="card-body">
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <form #studentForm="ngForm" (ngSubmit)="onSubmit(studentForm)">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Cédula *</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person-vcard"></i></span>
                <input type="text" class="form-control" [(ngModel)]="form.cedula" name="cedula" required
                       maxlength="13" (input)="onlyNumbers($event)" inputmode="numeric">
              </div>
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
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input type="email" class="form-control" [(ngModel)]="form.email" name="email" required
                       [readonly]="isEdit">
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Teléfono</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                <input type="text" class="form-control" [(ngModel)]="form.telefono" name="telefono"
                       maxlength="20" (input)="onlyNumbers($event)" inputmode="numeric">
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Carrera *</label>
              <select class="form-select" [(ngModel)]="form.career_id" name="career_id" required [disabled]="careersLoading">
                <option [ngValue]="null">Seleccionar...</option>
                <option *ngFor="let c of careers" [ngValue]="c.id">{{ c.name }}</option>
              </select>
              <small *ngIf="!careersLoading && careers.length === 0" class="text-warning">
                No hay carreras disponibles. Contacta al administrador.
              </small>
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
            <button type="submit" class="btn btn-primary-glow me-2" [disabled]="loading || studentForm.invalid">
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
  careersLoading = true;
  selectedFile: File | null = null;

  form = {
    cedula: '', nombres: '', apellidos: '', email: '',
    telefono: '', career_id: null as number | null, nivel: 1,
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
    this.studentService.getCareers()
      .pipe(finalize(() => this.careersLoading = false))
      .subscribe({
        next: (c) => this.careers = c,
        error: () => {
          this.error = 'Error cargando carreras.';
          this.careers = [];
        }
      });
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

  onlyNumbers(e: Event): void {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] || null;
  }

  onSubmit(studentForm: any): void {
    if (studentForm.invalid) {
      this.error = 'Completa los campos obligatorios antes de guardar.';
      return;
    }

    this.loading = true;
    this.error = '';
    const fd = new FormData();
    Object.entries(this.form).forEach(([k, v]) => fd.append(k, String(v ?? '')));
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
