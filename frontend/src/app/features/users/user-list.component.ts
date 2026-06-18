import { Component, OnInit } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="page-title mb-0">Gestión de Usuarios</h4>
      <button class="btn btn-sacarf" (click)="openCreateModal()">
        <i class="bi bi-person-plus-fill me-1"></i>Nuevo Usuario
      </button>
    </div>

    <div *ngIf="successMsg" class="alert alert-success alert-dismissible fade show">
      <i class="bi bi-check-circle-fill me-2"></i>{{ successMsg }}
      <button type="button" class="btn-close" (click)="successMsg=''"></button>
    </div>
    <div *ngIf="errorMsg" class="alert alert-danger alert-dismissible fade show">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMsg }}
      <button type="button" class="btn-close" (click)="errorMsg=''"></button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="data-table">
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
            <tr *ngIf="loading">
              <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
              </td>
            </tr>
            <tr *ngIf="!loading && users.length === 0">
              <td colspan="6" class="text-center text-muted py-4">
                <i class="bi bi-people me-2"></i>No hay usuarios registrados.
              </td>
            </tr>
            <tr *ngFor="let u of users">
              <td>{{ u.email }}</td>
              <td>{{ u.nombres }} {{ u.apellidos }}</td>
              <td>
                <span class="badge"
                  [class.bg-primary]="u.role === 'ADMIN'"
                  [class.bg-info]="u.role === 'TEACHER'"
                  [class.bg-secondary]="u.role === 'STUDENT'">
                  {{ u.role === 'ADMIN' ? 'Administrador' : u.role === 'TEACHER' ? 'Docente' : 'Estudiante' }}
                </span>
              </td>
              <td>
                <span class="badge" [class.bg-success]="u.is_active" [class.bg-danger]="!u.is_active">
                  {{ u.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ u.date_joined | date:'dd/MM/yyyy' }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" title="Editar" (click)="editUser(u)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm me-1"
                  [class.btn-outline-danger]="u.is_active"
                  [class.btn-outline-success]="!u.is_active"
                  [title]="u.is_active ? 'Desactivar' : 'Reactivar'"
                  (click)="toggleUserStatus(u)">
                  <i [class]="u.is_active ? 'bi bi-person-x-fill' : 'bi bi-person-check-fill'"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Crear/Editar Usuario -->
    <div *ngIf="showFormModal" class="modal d-block" style="background:rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" style="background:#1a237e;color:white;">
            <h5 class="modal-title">
              <i class="bi bi-person-fill me-2"></i>{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeFormModal()"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Cédula *</label>
                <input type="text" class="form-control" [(ngModel)]="form.cedula"
                       placeholder="Ej: 1105853434" maxlength="13" [disabled]="!!editingUser">
              </div>
              <div class="col-md-6">
                <label class="form-label">Rol *</label>
                <select class="form-select" [(ngModel)]="form.role" [disabled]="!!editingUser">
                  <option value="ADMIN">Administrador</option>
                  <option value="TEACHER">Docente</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Nombres *</label>
                <input type="text" class="form-control" [(ngModel)]="form.nombres" placeholder="Ej: Juan Carlos">
              </div>
              <div class="col-md-6">
                <label class="form-label">Apellidos *</label>
                <input type="text" class="form-control" [(ngModel)]="form.apellidos" placeholder="Ej: Pérez López">
              </div>
              <div class="col-md-12">
                <label class="form-label">Correo electrónico *</label>
                <input type="email" class="form-control" [(ngModel)]="form.email"
                       placeholder="Ej: juan.perez@unl.edu.ec" [disabled]="!!editingUser">
              </div>
              <div class="col-md-6">
                <label class="form-label">Teléfono</label>
                <input type="text" class="form-control" [(ngModel)]="form.telefono" placeholder="Ej: 0987654321">
              </div>
            </div>
            <div *ngIf="formError" class="alert alert-danger mt-3 mb-0">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ formError }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeFormModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="saveUser()" [disabled]="formLoading">
              <span *ngIf="formLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!formLoading" class="bi bi-check-lg me-1"></i>
              {{ editingUser ? 'Guardar cambios' : 'Crear usuario' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Desactivar/Reactivar -->
    <div *ngIf="showConfirmModal" class="modal d-block" style="background:rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header"
            [style.background]="selectedUser?.is_active ? '#d32f2f' : '#2e7d32'"
            style="color:white;">
            <h5 class="modal-title">
              <i class="bi me-2" [class.bi-person-x-fill]="selectedUser?.is_active"
                 [class.bi-person-check-fill]="!selectedUser?.is_active"></i>
              {{ selectedUser?.is_active ? 'Desactivar' : 'Reactivar' }} Usuario
            </h5>
            <button class="btn-close btn-close-white" (click)="showConfirmModal=false"></button>
          </div>
          <div class="modal-body">
            <p>¿Deseas <strong>{{ selectedUser?.is_active ? 'desactivar' : 'reactivar' }}</strong> a
              <strong>{{ selectedUser?.nombres }} {{ selectedUser?.apellidos }}</strong>?</p>
            <div *ngIf="selectedUser?.is_active">
              <label class="form-label">Motivo *</label>
              <textarea class="form-control" [(ngModel)]="motivo" rows="2" placeholder="Escribe el motivo..."></textarea>
              <div *ngIf="motivoError" class="text-danger small mt-1">{{ motivoError }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showConfirmModal=false">Cancelar</button>
            <button class="btn" [class.btn-danger]="selectedUser?.is_active"
              [class.btn-success]="!selectedUser?.is_active" (click)="confirmarToggle()" [disabled]="formLoading">
              <span *ngIf="formLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ selectedUser?.is_active ? 'Desactivar' : 'Reactivar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  successMsg = '';
  errorMsg = '';
  formLoading = false;
  formError = '';
  showFormModal = false;
  showConfirmModal = false;
  editingUser: User | null = null;
  selectedUser: User | null = null;
  motivo = '';
  motivoError = '';

  form = { cedula: '', nombres: '', apellidos: '', email: '', telefono: '', role: 'TEACHER' };

  constructor(private userService: UserService) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => { this.errorMsg = 'Error al cargar usuarios.'; this.loading = false; }
    });
  }

  openCreateModal(): void {
    this.editingUser = null;
    this.form = { cedula: '', nombres: '', apellidos: '', email: '', telefono: '', role: 'TEACHER' };
    this.formError = '';
    this.showFormModal = true;
  }

  editUser(u: User): void {
    this.editingUser = u;
    this.form = { cedula: u.cedula, nombres: u.nombres, apellidos: u.apellidos, email: u.email, telefono: u.telefono || '', role: u.role };
    this.formError = '';
    this.showFormModal = true;
  }

  closeFormModal(): void { this.showFormModal = false; this.editingUser = null; }

  saveUser(): void {
    if (!this.form.cedula || !this.form.nombres || !this.form.apellidos || !this.form.email) {
      this.formError = 'Completa todos los campos obligatorios.'; return;
    }
    this.formLoading = true;
    this.formError = '';
    const obs = this.editingUser
      ? this.userService.updateUser(this.editingUser.id, { nombres: this.form.nombres, apellidos: this.form.apellidos, telefono: this.form.telefono })
      : this.userService.createUser(this.form);
    obs.subscribe({
      next: () => {
        this.successMsg = this.editingUser ? 'Usuario actualizado correctamente.' : 'Usuario creado. Se envió email de activación.';
        this.formLoading = false;
        this.showFormModal = false;
        this.loadUsers();
      },
      error: err => {
        this.formError = err?.error?.detail || JSON.stringify(err?.error) || 'Error al guardar.';
        this.formLoading = false;
      }
    });
  }

  toggleUserStatus(u: User): void {
    this.selectedUser = u;
    this.motivo = '';
    this.motivoError = '';
    this.showConfirmModal = true;
  }

  confirmarToggle(): void {
    if (!this.selectedUser) return;
    if (this.selectedUser.is_active && !this.motivo.trim()) {
      this.motivoError = 'El motivo es obligatorio.'; return;
    }
    this.formLoading = true;
    const u = this.selectedUser;
    const obs = u.is_active ? this.userService.deactivateUser(u.id, this.motivo) : this.userService.reactivateUser(u.id);
    obs.subscribe({
      next: () => {
        this.successMsg = u.is_active ? `${u.nombres} desactivado correctamente.` : `${u.nombres} reactivado correctamente.`;
        this.formLoading = false;
        this.showConfirmModal = false;
        this.loadUsers();
      },
      error: err => {
        this.errorMsg = err?.error?.detail || 'Error al cambiar estado.';
        this.formLoading = false;
        this.showConfirmModal = false;
      }
    });
  }
}
