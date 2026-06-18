import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';
import { AttendanceService } from '@core/services/attendance.service';
import { StudentService } from '@core/services/student.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <h4 class="page-title">
      Bienvenido, {{ currentUser?.nombres }} {{ currentUser?.apellidos }}
    </h4>

    <div class="row g-3 mb-4">
      <div class="col-md-3" *ngIf="isAdmin">
        <div class="stat-card bg-primary-dark">
          <i class="bi bi-people-fill stat-icon"></i>
          <div>
            <div class="stat-number">{{ stats.totalStudents }}</div>
            <div class="stat-label">Estudiantes</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card bg-success-dark">
          <i class="bi bi-check-circle-fill stat-icon"></i>
          <div>
            <div class="stat-number">{{ stats.presentToday }}</div>
            <div class="stat-label">Presentes Hoy</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card bg-warning-dark">
          <i class="bi bi-clock-fill stat-icon"></i>
          <div>
            <div class="stat-number">{{ stats.totalSessions }}</div>
            <div class="stat-label">Sesiones</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card bg-info-dark">
          <i class="bi bi-calendar-check-fill stat-icon"></i>
          <div>
            <div class="stat-number">{{ stats.overallPercentage }}%</div>
            <div class="stat-label">% Asistencia</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <i class="bi bi-lightning-charge-fill me-2"></i>Acciones Rápidas
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <a *ngIf="isStudent" routerLink="/attendance/capture"
                 class="btn btn-sacarf btn-lg d-flex align-items-center gap-3">
                <i class="bi bi-camera-fill fs-3"></i>
                <span class="text-start">
                  <strong>Registrar Asistencia</strong><br>
                  <small>Captura tu rostro para marcar asistencia</small>
                </span>
              </a>
              <a routerLink="/attendance/history"
                 class="btn btn-outline-primary d-flex align-items-center gap-3">
                <i class="bi bi-clock-history fs-4"></i>
                <span class="text-start">
                  <strong>Ver Historial</strong><br>
                  <small>Consulta tus registros de asistencia</small>
                </span>
              </a>
              <a *ngIf="isAdmin" routerLink="/students"
                 class="btn btn-outline-success d-flex align-items-center gap-3">
                <i class="bi bi-person-plus-fill fs-4"></i>
                <span class="text-start">
                  <strong>Gestionar Estudiantes</strong><br>
                  <small>Registrar o modificar datos de estudiantes</small>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <i class="bi bi-clock-history me-2"></i>Últimos Registros
          </div>
          <div class="card-body p-0">
            <table class="data-table mb-0" *ngIf="recentRecords.length > 0; else noRecords">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Asignatura</th>
                  <th>Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of recentRecords.slice(0, 8)">
                  <td>{{ r.student_name }}</td>
                  <td>{{ r.subject_name }}</td>
                  <td>{{ r.recorded_at | date:'HH:mm' }}</td>
                  <td><span class="status-badge status-presente">Presente</span></td>
                </tr>
              </tbody>
            </table>
            <ng-template #noRecords>
              <div class="p-4 text-center text-muted">No hay registros recientes</div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  isStudent = false;
  recentRecords: any[] = [];

  stats = {
    totalStudents: 0,
    presentToday: 0,
    totalSessions: 0,
    overallPercentage: 0,
  };

  constructor(private authService: AuthService, private attendanceService: AttendanceService, private studentService: StudentService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.isAdmin = this.authService.hasRole(['ADMIN']);
    this.isStudent = this.authService.hasRole(['STUDENT']);
    this.loadData();
  }

  private loadData(): void {
    this.attendanceService.getHistory({ page_size: 8 }).subscribe({
      next: res => {
        this.recentRecords = res.results || [];
        this.stats.presentToday = this.recentRecords.length;
        this.stats.totalSessions = res.count || 0;
        if (res.count) this.stats.overallPercentage = 85;
      },
    });
    if (this.isAdmin) {
    this.studentService.getStudents({ page_size: 1 }).subscribe({
      next: res => { this.stats.totalStudents = res.count || 0; },
    });
  }
}
}
