import { Component, OnInit } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="page-title mb-0">Gestión de Usuarios</h4>
      <button class="btn btn-sacarf" data-bs-toggle="modal" data-bs-target="#userModal">
        <i class="bi bi-person-plus-fill me-1"></i>Nuevo Usuario
      </button>
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
            <tr *ngFor="let u of users">
              <td>{{ u.email }}</td>
              <td>{{ u.nombres }} {{ u.apellidos }}</td>
              <td><span class="badge" [class.bg-primary]="u.role === 'ADMIN'"
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
                <button class="btn btn-sm btn-outline-primary me-1" (click)="editUser(u)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm" [class.btn-outline-danger]="u.is_active"
                        [class.btn-outline-success]="!u.is_active"
                        (click)="toggleUserStatus(u)">
                  <i [class]="u.is_active ? 'bi bi-person-x-fill' : 'bi bi-person-check-fill'"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(u => this.users = u);
  }

  editUser(u: User): void {}

  toggleUserStatus(u: User): void {
    const motivo = prompt(u.is_active ? 'Motivo de desactivación:' : '¿Reactivar cuenta?');
    if (!motivo && u.is_active) return;
    const obs = u.is_active
      ? this.userService.deactivateUser(u.id, motivo || 'Sin motivo')
      : this.userService.reactivateUser(u.id);
    obs.subscribe(() => this.userService.getUsers().subscribe(us => this.users = us));
  }
}
