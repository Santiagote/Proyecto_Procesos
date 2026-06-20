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

<<<<<<< HEAD
    <div class="card modern-card">
=======
    <!-- Alerta de éxito -->
    <div *ngIf="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>{{ successMsg }}
      <button type="button" class="btn-close" (click)="successMsg=''"></button>
    </div>

    <!-- Alerta de error -->
    <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
      <button type="button" class="btn-close" (click)="error=''"></button>
    </div>

    <div class="card">
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
      <div class="card-body">
        <form #studentForm="ngForm" (ngSubmit)="onSubmit(studentForm)" novalidate>
          <div class="row g-3">

            <div class="col-md-4">
              <label class="form-label">Cédula *</label>
<<<<<<< HEAD
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person-vcard"></i></span>
                <input type="text" class="form-control" [(ngModel)]="form.cedula" name="cedula" required
                       maxlength="13" (input)="onlyNumbers($event)" inputmode="numeric">
=======
              <input type="text" class="form-control"
                     [(ngModel)]="form.cedula" name="cedula"
                     required maxlength="10" pattern="[0-9]{10}"
                     #cedula="ngModel"
                     (blur)="validarCedula()"
                     [class.is-invalid]="cedula.invalid && cedula.touched"
                     [class.is-valid]="cedula.valid && cedula.touched"
                     placeholder="Ej: 1104567890">
              <div class="invalid-feedback">
                <span *ngIf="cedula.errors?.['required']">La cédula es obligatoria.</span>
                <span *ngIf="cedula.errors?.['pattern']">Debe tener exactamente 10 dígitos numéricos.</span>
              </div>
              <div *ngIf="cedulaError" class="text-danger small mt-1">
                <i class="bi bi-x-circle me-1"></i>{{ cedulaError }}
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Nombres *</label>
              <input type="text" class="form-control"
                     [(ngModel)]="form.nombres" name="nombres"
                     required minlength="2" maxlength="100"
                     pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$"
                     #nombres="ngModel"
                     [class.is-invalid]="nombres.invalid && nombres.touched"
                     [class.is-valid]="nombres.valid && nombres.touched"
                     placeholder="Ej: Juan Carlos">
              <div class="invalid-feedback">
                <span *ngIf="nombres.errors?.['required']">El nombre es obligatorio.</span>
                <span *ngIf="nombres.errors?.['pattern']">Solo se permiten letras y espacios.</span>
                <span *ngIf="nombres.errors?.['minlength']">Mínimo 2 caracteres.</span>
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Apellidos *</label>
              <input type="text" class="form-control"
                     [(ngModel)]="form.apellidos" name="apellidos"
                     required minlength="2" maxlength="100"
                     pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$"
                     #apellidos="ngModel"
                     [class.is-invalid]="apellidos.invalid && apellidos.touched"
                     [class.is-valid]="apellidos.valid && apellidos.touched"
                     placeholder="Ej: Pérez Gómez">
              <div class="invalid-feedback">
                <span *ngIf="apellidos.errors?.['required']">Los apellidos son obligatorios.</span>
                <span *ngIf="apellidos.errors?.['pattern']">Solo se permiten letras y espacios.</span>
                <span *ngIf="apellidos.errors?.['minlength']">Mínimo 2 caracteres.</span>
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Email *</label>
<<<<<<< HEAD
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input type="email" class="form-control" [(ngModel)]="form.email" name="email" required
                       [readonly]="isEdit">
=======
              <input type="email" class="form-control"
                     [(ngModel)]="form.email" name="email"
                     required email
                     #emailField="ngModel"
                     [readonly]="isEdit"
                     [class.is-invalid]="emailField.invalid && emailField.touched"
                     [class.is-valid]="emailField.valid && emailField.touched"
                     placeholder="Ej: juan.perez@unl.edu.ec">
              <div class="invalid-feedback">
                <span *ngIf="emailField.errors?.['required']">El email es obligatorio.</span>
                <span *ngIf="emailField.errors?.['email']">Ingresa un email válido.</span>
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Teléfono</label>
<<<<<<< HEAD
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                <input type="text" class="form-control" [(ngModel)]="form.telefono" name="telefono"
                       maxlength="20" (input)="onlyNumbers($event)" inputmode="numeric">
=======
              <input type="text" class="form-control"
                     [(ngModel)]="form.telefono" name="telefono"
                     maxlength="10" pattern="[0-9]{7,10}"
                     #telefono="ngModel"
                     [class.is-invalid]="telefono.invalid && telefono.touched"
                     placeholder="Ej: 0991234567">
              <div class="invalid-feedback">
                <span *ngIf="telefono.errors?.['pattern']">Ingresa un número válido (7-10 dígitos).</span>
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Carrera *</label>
<<<<<<< HEAD
              <select class="form-select" [(ngModel)]="form.career_id" name="career_id" required [disabled]="careersLoading">
                <option [ngValue]="null">Seleccionar...</option>
                <option *ngFor="let c of careers" [ngValue]="c.id">{{ c.name }}</option>
              </select>
              <small *ngIf="!careersLoading && careers.length === 0" class="text-warning">
                No hay carreras disponibles. Contacta al administrador.
=======
              <select class="form-select"
                      [(ngModel)]="form.career_id" name="career_id"
                      required
                      #carreraField="ngModel"
                      [disabled]="careersLoading"
                      [class.is-invalid]="carreraField.invalid && carreraField.touched">
                <option [ngValue]="null">-- Seleccionar carrera --</option>
                <option *ngFor="let c of careers" [ngValue]="c.id">
                  {{ c.name || c.nombre || c.code || c.codigo || ('Carrera ' + c.id) }}
                </option>
              </select>
              <div class="invalid-feedback">Selecciona una carrera.</div>
              <small *ngIf="!careersLoading && careers.length === 0" class="text-warning">
                <i class="bi bi-exclamation-triangle me-1"></i>No hay carreras disponibles.
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
              </small>
            </div>

            <div class="col-md-4">
              <label class="form-label">Nivel *</label>
              <input type="number" class="form-control"
                     [(ngModel)]="form.nivel" name="nivel"
                     required min="1" max="10"
                     #nivelField="ngModel"
                     [class.is-invalid]="nivelField.invalid && nivelField.touched"
                     [class.is-valid]="nivelField.valid && nivelField.touched"
                     placeholder="Entre 1 y 10">
              <div class="invalid-feedback">
                <span *ngIf="nivelField.errors?.['required']">El nivel es obligatorio.</span>
                <span *ngIf="nivelField.errors?.['min'] || nivelField.errors?.['max']">El nivel debe estar entre 1 y 10.</span>
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Fotografía de referencia</label>
              <input type="file" class="form-control"
                     (change)="onFileSelected($event)"
                     accept="image/jpeg,image/png,image/jpg">
              <small class="text-muted">Formatos: JPG, PNG. Máx 5MB.</small>
              <div *ngIf="fileError" class="text-danger small mt-1">
                <i class="bi bi-x-circle me-1"></i>{{ fileError }}
              </div>
            </div>

          </div>

<<<<<<< HEAD
          <div class="mt-4">
            <button type="submit" class="btn btn-primary-glow me-2" [disabled]="loading || studentForm.invalid">
=======
          <div class="mt-4 d-flex align-items-center gap-2">
            <button type="submit" class="btn btn-sacarf"
                    [disabled]="loading || studentForm.invalid || !!cedulaError">
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!loading" class="bi bi-save me-2"></i>
              {{ isEdit ? 'Actualizar' : 'Registrar' }} Estudiante
            </button>
            <a routerLink="/students" class="btn btn-outline-secondary">
              <i class="bi bi-x-lg me-1"></i>Cancelar
            </a>
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
  successMsg = '';
  cedulaError = '';
  fileError = '';
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
<<<<<<< HEAD
        error: () => {
          this.error = 'Error cargando carreras.';
=======
        error: (err) => {
          this.error = err?.status === 401
            ? 'Sesión expirada. Por favor, inicia sesión nuevamente.'
            : 'Error al cargar las carreras. Intenta recargar la página.';
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
          this.careers = [];
        }
      });

    if (this.isEdit && this.studentId) {
      this.studentService.getStudent(this.studentId).subscribe({
        next: (s) => {
          this.form.cedula = s.user.cedula;
          this.form.nombres = s.user.nombres;
          this.form.apellidos = s.user.apellidos;
          this.form.email = s.user.email;
          this.form.telefono = s.user.telefono;
          this.form.career_id = s.career;
          this.form.nivel = s.nivel;
        },
        error: () => this.error = 'Error al cargar los datos del estudiante.'
      });
    }
  }

<<<<<<< HEAD
  onlyNumbers(e: Event): void {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
=======
  validarCedula(): void {
    const cedula = this.form.cedula;
    this.cedulaError = '';
    if (!cedula || cedula.length !== 10) return;

    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
      this.cedulaError = 'Los dos primeros dígitos deben corresponder a una provincia válida (01-24).';
      return;
    }

    const digitos = cedula.split('').map(Number);
    const verificador = digitos[9];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let val = digitos[i] * (i % 2 === 0 ? 2 : 1);
      if (val > 9) val -= 9;
      suma += val;
    }
    const residuo = suma % 10;
    const digitoEsperado = residuo === 0 ? 0 : 10 - residuo;

    if (digitoEsperado !== verificador) {
      this.cedulaError = 'La cédula no es válida según el algoritmo del Registro Civil Ecuador.';
    }
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
  }

  onFileSelected(event: any): void {
    this.fileError = '';
    const file = event.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      this.fileError = 'Solo se permiten imágenes JPG o PNG.';
      this.selectedFile = null;
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'La imagen no debe superar los 5MB.';
      this.selectedFile = null;
      return;
    }
    this.selectedFile = file;
  }

  onSubmit(studentForm: any): void {
    if (studentForm.invalid || this.cedulaError) {
      this.error = 'Por favor corrige los errores antes de guardar.';
      Object.values(studentForm.controls).forEach((c: any) => c.markAsTouched());
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMsg = '';

    const fd = new FormData();
    Object.entries(this.form).forEach(([k, v]) => fd.append(k, String(v ?? '')));
    if (this.selectedFile) fd.append('reference_image', this.selectedFile);

    const obs = this.isEdit
      ? this.studentService.updateStudent(this.studentId!, fd)
      : this.studentService.createStudent(fd);

    obs.pipe(finalize(() => this.loading = false)).subscribe({
      next: () => {
        this.successMsg = this.isEdit
          ? 'Estudiante actualizado correctamente.'
          : 'Estudiante registrado correctamente. Se envió un correo con sus credenciales.';
        setTimeout(() => this.router.navigate(['/students']), 2000);
      },
      error: (err) => {
        this.error = err?.message || 'Error al guardar. Intenta nuevamente.';
      },
    });
  }
}
