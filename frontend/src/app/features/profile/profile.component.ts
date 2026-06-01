import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-profile',
  template: `
    <h4 class="page-title">Mi Perfil</h4>

    <div class="row g-4">
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <div class="mb-3">
              <i class="bi bi-person-circle" style="font-size:5rem;color:#1a237e;"></i>
            </div>
            <h5>{{ currentUser?.nombres }} {{ currentUser?.apellidos }}</h5>
            <span class="badge bg-primary">{{ roleLabel }}</span>
            <p class="text-muted small mt-2">{{ currentUser?.email }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card">
          <div class="card-header">Actualizar Datos</div>
          <div class="card-body">
            <div *ngIf="success" class="alert alert-success small">{{ success }}</div>
            <div *ngIf="error" class="alert alert-danger small">{{ error }}</div>

            <form (ngSubmit)="onSubmit()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nombres</label>
                  <input type="text" class="form-control" [(ngModel)]="form.nombres" name="nombres">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellidos</label>
                  <input type="text" class="form-control" [(ngModel)]="form.apellidos" name="apellidos">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono</label>
                  <input type="text" class="form-control" [(ngModel)]="form.telefono" name="telefono">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Foto de perfil</label>
                  <input type="file" class="form-control" (change)="onFileChange($event)">
                </div>
              </div>
              <button type="submit" class="btn btn-sacarf mt-3" [disabled]="saving">
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                Guardar Cambios
              </button>
            </form>

            <hr>
            <h6>Cambiar Contraseña</h6>
            <form (ngSubmit)="onChangePassword()">
              <div class="row g-2">
                <div class="col-md-4">
                  <input type="password" class="form-control" [(ngModel)]="pwForm.current"
                         name="currentPw" placeholder="Contraseña actual">
                </div>
                <div class="col-md-4">
                  <input type="password" class="form-control" [(ngModel)]="pwForm.newPw"
                         name="newPw" placeholder="Nueva contraseña">
                </div>
                <div class="col-md-4">
                  <input type="password" class="form-control" [(ngModel)]="pwForm.confirm"
                         name="confirmPw" placeholder="Confirmar">
                </div>
              </div>
              <button type="submit" class="btn btn-outline-primary mt-2 btn-sm">
                Cambiar Contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  roleLabel = '';
  saving = false;
  success = '';
  error = '';

  form = { nombres: '', apellidos: '', telefono: '' };
  pwForm = { current: '', newPw: '', confirm: '' };
  selectedFile: File | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (this.currentUser) {
      this.form.nombres = this.currentUser.nombres;
      this.form.apellidos = this.currentUser.apellidos;
      this.form.telefono = this.currentUser.telefono;
      this.roleLabel = this.currentUser.role === 'ADMIN' ? 'Administrador'
        : this.currentUser.role === 'TEACHER' ? 'Docente' : 'Estudiante';
    }
  }

  onFileChange(e: any): void {
    this.selectedFile = e.target.files[0] || null;
  }

  onSubmit(): void {
    this.saving = true;
    const fd = new FormData();
    Object.entries(this.form).forEach(([k, v]) => fd.append(k, v));
    if (this.selectedFile) fd.append('profile_picture', this.selectedFile);
    this.authService.updateProfile(fd).subscribe({
      next: () => { this.success = 'Perfil actualizado'; this.saving = false; },
      error: err => { this.error = err.message; this.saving = false; },
    });
  }

  onChangePassword(): void {
    if (this.pwForm.newPw !== this.pwForm.confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    this.authService.changePassword({
      current_password: this.pwForm.current,
      new_password: this.pwForm.newPw,
      confirm_password: this.pwForm.confirm,
    }).subscribe({
      next: () => {
        this.success = 'Contraseña cambiada exitosamente';
        this.pwForm = { current: '', newPw: '', confirm: '' };
      },
      error: err => this.error = err.message,
    });
  }
}
