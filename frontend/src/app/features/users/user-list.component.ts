import { Component, OnInit } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="page-title mb-0">Gesti&oacute;n de Usuarios</h4>
      <button class="btn btn-sacarf" (click)="openCreateModal()">
        <i class="bi bi-person-plus-fill me-1"></i>Nuevo Usuario
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div *ngIf="loading" class="loading-spinner">
          <div class="spinner-border"></div>
        </div>
        <table class="data-table" *ngIf="!loading">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombres</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.email }}</td>
              <td>{{ u.nombres }} {{ u.apellidos }}</td>
              <td>
                <span class="badge" [class.badge-admin]="u.role === 'ADMIN'"
                      [class.badge-teacher]="u.role === 'TEACHER'"
                      [class.badge-student]="u.role === 'STUDENT'">
                  {{ u.role === 'ADMIN' ? 'Administrador' : u.role === 'TEACHER' ? 'Docente' : 'Estudiante' }}
                </span>
              </td>
              <td>
                <span class="badge" [class.badge-active]="u.is_active" [class.badge-inactive]="!u.is_active">
                  {{ u.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ u.date_joined | date:'dd/MM/yyyy' }}</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-outline-primary" (click)="editUser(u)" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm" [class.btn-outline-danger]="u.is_active"
                          [class.btn-outline-success]="!u.is_active"
                          (click)="toggleUserStatus(u)" title="{{ u.is_active ? 'Desactivar' : 'Reactivar' }}">
                    <i [class]="u.is_active ? 'bi bi-person-x-fill' : 'bi bi-person-check-fill'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loading && users.length === 0" class="text-center py-4 text-muted">
          No hay usuarios registrados
        </div>
      </div>
    </div>

    <div *ngIf="showModal" class="modal-custom-overlay" (click)="closeModal()">
      <div class="modal-custom" (click)="$event.stopPropagation()">
        <div class="modal-custom-header">
          <span>{{ editMode ? 'Editar Usuario' : 'Nuevo Usuario' }}</span>
          <button class="modal-custom-close" (click)="closeModal()">&times;</button>
        </div>
        <div class="modal-custom-body">
          <div *ngIf="modalError" class="alert alert-danger py-2 small">{{ modalError }}</div>
          <form #userForm="ngForm">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">C&eacute;dula *</label>
                <input type="text" class="form-control" [(ngModel)]="form.cedula" name="cedula" required
                       maxlength="13" (input)="onlyNumbers($event)" inputmode="numeric">
              </div>
              <div class="col-md-6">
                <label class="form-label">Email *</label>
                <input type="email" class="form-control" [(ngModel)]="form.email" name="email" required
                       [readonly]="editMode">
              </div>
              <div class="col-md-6">
                <label class="form-label">Nombres *</label>
                <input type="text" class="form-control" [(ngModel)]="form.nombres" name="nombres" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Apellidos *</label>
                <input type="text" class="form-control" [(ngModel)]="form.apellidos" name="apellidos" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tel&eacute;fono</label>
                <input type="text" class="form-control" [(ngModel)]="form.telefono" name="telefono"
                       maxlength="20" (input)="onlyNumbers($event)" inputmode="numeric">
              </div>
              <div class="col-md-6">
                <label class="form-label">Rol *</label>
                <select class="form-select" [(ngModel)]="form.role" name="role" required [disabled]="editMode">
                  <option value="STUDENT">Estudiante</option>
                  <option value="TEACHER">Docente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div class="col-12" *ngIf="!editMode">
                <label class="form-label">Contrase&ntilde;a</label>
                <div class="input-group">
                  <input [type]="showPassword ? 'text' : 'password'" class="form-control"
                         [(ngModel)]="form.password" name="password"
                         placeholder="Dejar vac&iacute;o para generar autom&aacute;ticamente">
                  <button class="btn btn-outline-secondary" type="button" (click)="showPassword = !showPassword">
                    <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                  <button class="btn btn-outline-secondary" type="button" (click)="generatePassword()" title="Generar contrase&ntilde;a">
                    <i class="bi bi-arrow-repeat"></i>
                  </button>
                </div>
                <small class="form-text">M&iacute;n. 12 caracteres. Vac&iacute;o = generaci&oacute;n autom&aacute;tica.</small>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-custom-footer">
          <button class="btn btn-outline-secondary" (click)="closeModal()">Cancelar</button>
          <button class="btn btn-sacarf" (click)="saveUser()" [disabled]="saving">
            <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ editMode ? 'Actualizar' : 'Crear Usuario' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  showModal = false;
  editMode = false;
  editingUserId: number | null = null;
  saving = false;
  modalError = '';
  showPassword = false;

  form = {
    email: '', cedula: '', nombres: '', apellidos: '',
    telefono: '', role: 'STUDENT' as string, password: '',
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  onlyNumbers(e: Event): void {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  openCreateModal(): void {
    this.editMode = false;
    this.editingUserId = null;
    this.form = { email: '', cedula: '', nombres: '', apellidos: '', telefono: '', role: 'STUDENT', password: '' };
    this.modalError = '';
    this.showPassword = false;
    this.showModal = true;
  }

  editUser(u: User): void {
    this.editMode = true;
    this.editingUserId = u.id;
    this.form = {
      email: u.email,
      cedula: u.cedula,
      nombres: u.nombres,
      apellidos: u.apellidos,
      telefono: u.telefono,
      role: u.role,
      password: '',
    };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.form.password = pwd;
    this.showPassword = true;
  }

  saveUser(): void {
    if (!this.form.email || !this.form.cedula || !this.form.nombres || !this.form.apellidos) {
      this.modalError = 'Completa los campos obligatorios';
      return;
    }

    this.saving = true;
    this.modalError = '';

    if (this.editMode && this.editingUserId) {
      const data: any = {};
      if (this.form.nombres) data.nombres = this.form.nombres;
      if (this.form.apellidos) data.apellidos = this.form.apellidos;
      if (this.form.telefono) data.telefono = this.form.telefono;
      this.userService.updateUser(this.editingUserId, data).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadUsers(); },
        error: err => { this.modalError = err.message; this.saving = false; },
      });
    } else {
      const payload = {
        email: this.form.email,
        cedula: this.form.cedula,
        nombres: this.form.nombres,
        apellidos: this.form.apellidos,
        telefono: this.form.telefono,
        role: this.form.role,
        ...(this.form.password ? { password: this.form.password } : {}),
      };
      this.userService.createUser(payload).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadUsers(); },
        error: err => { this.modalError = err.message; this.saving = false; },
      });
    }
  }

  toggleUserStatus(u: User): void {
    const motivo = prompt(u.is_active ? 'Motivo de desactivaci\u00f3n:' : '');
    if (u.is_active && !motivo) return;
    const obs = u.is_active
      ? this.userService.deactivateUser(u.id, motivo || 'Sin motivo')
      : this.userService.reactivateUser(u.id);
    obs.subscribe(() => this.loadUsers());
  }
}
