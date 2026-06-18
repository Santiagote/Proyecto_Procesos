import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '@core/services/schedule.service';
import { Schedule, WEEK_DAYS, AcademicPeriod } from '@core/models/schedule.model';

@Component({
  selector: 'app-schedule-list',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="page-title mb-0">Gestión de Horarios</h4>
      <div>
        <button class="btn btn-outline-success me-2" data-bs-toggle="modal" data-bs-target="#periodModal">
          <i class="bi bi-plus-circle me-1"></i>Período
        </button>
        <button class="btn btn-sacarf" data-bs-toggle="modal" data-bs-target="#scheduleModal"
                (click)="openNewSchedule()">
          <i class="bi bi-plus-lg me-1"></i>Nuevo Horario
        </button>
      </div>
    </div>

    <!-- Notificación éxito -->
    <div *ngIf="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>{{ successMsg }}
      <button type="button" class="btn-close" (click)="successMsg=''"></button>
    </div>

    <!-- Notificación error -->
    <div *ngIf="errorMsg" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMsg }}
      <button type="button" class="btn-close" (click)="errorMsg=''"></button>
    </div>

    <!-- Períodos activos -->
    <div class="row g-3 mb-3">
      <div *ngIf="periods.length === 0" class="col-12">
        <div class="alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>No hay períodos académicos registrados. Crea uno primero.
        </div>
      </div>
      <div class="col-md-3" *ngFor="let p of periods">
        <div class="card text-center p-3" [class.border-primary]="p.is_active">
          <strong>{{ p.name }}</strong>
          <small class="text-muted">{{ p.start_date }} - {{ p.end_date }}</small>
          <span class="badge bg-success mt-1" *ngIf="p.is_active">Activo</span>
          <span class="badge bg-secondary mt-1" *ngIf="!p.is_active">Inactivo</span>
        </div>
      </div>
    </div>

    <!-- Tabla de horarios -->
    <div class="card">
      <div class="card-body p-0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Asignatura</th>
              <th>Docente</th>
              <th>Día</th>
              <th>Horario</th>
              <th>Aula</th>
              <th>Período</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="schedules.length === 0">
              <td colspan="7" class="text-center text-muted py-4">
                <i class="bi bi-calendar-x me-2"></i>No hay horarios registrados aún.
              </td>
            </tr>
            <tr *ngFor="let s of schedules">
              <td>{{ s.subject_name }}</td>
              <td>{{ s.teacher_name }}</td>
              <td>{{ WEEK_DAYS[s.week_day] }}</td>
              <td>{{ s.start_time }} - {{ s.end_time }}</td>
              <td>{{ s.classroom || '-' }}</td>
              <td>{{ s.academic_period }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1"
                        title="Editar horario"
                        (click)="openEditSchedule(s)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger"
                        title="Eliminar horario"
                        [disabled]="deletingId === s.id"
                        (click)="confirmarEliminar(s)">
                  <span *ngIf="deletingId === s.id" class="spinner-border spinner-border-sm"></span>
                  <i *ngIf="deletingId !== s.id" class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal confirmar eliminar -->
    <div class="modal fade" id="deleteScheduleModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-trash me-2"></i>Eliminar Horario
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar el horario de <strong>{{ scheduleToDelete?.subject_name }}</strong>?</p>
            <p class="text-muted small">
              <i class="bi bi-info-circle me-1"></i>
              Esta acción no se puede deshacer y eliminará también los registros de asistencia asociados.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" (click)="eliminarConfirmado()">
              <i class="bi bi-trash me-1"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ScheduleListComponent implements OnInit {
  schedules: Schedule[] = [];
  periods: AcademicPeriod[] = [];
  WEEK_DAYS = WEEK_DAYS;
  successMsg = '';
  errorMsg = '';
  deletingId: number | null = null;
  scheduleToDelete: Schedule | null = null;

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.scheduleService.getSchedules().subscribe({
      next: (s) => this.schedules = s,
      error: () => this.errorMsg = 'Error al cargar los horarios. Intenta recargar la página.'
    });
    this.scheduleService.getPeriods().subscribe({
      next: (p) => this.periods = p,
      error: () => this.errorMsg = 'Error al cargar los períodos académicos.'
    });
  }

  openNewSchedule(): void {}

  openEditSchedule(s: Schedule): void {}

  confirmarEliminar(s: Schedule): void {
    this.scheduleToDelete = s;
    const modal = (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('deleteScheduleModal'));
    modal?.show();
  }

  eliminarConfirmado(): void {
    if (!this.scheduleToDelete) return;
    const modal = (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('deleteScheduleModal'));
    modal?.hide();

    this.deletingId = this.scheduleToDelete.id;
    this.errorMsg = '';
    this.successMsg = '';

    this.scheduleService.deleteSchedule(this.scheduleToDelete.id).subscribe({
      next: () => {
        this.successMsg = `Horario de "${this.scheduleToDelete?.subject_name}" eliminado correctamente.`;
        this.deletingId = null;
        this.scheduleToDelete = null;
        this.loadData();
      },
      error: () => {
        this.errorMsg = 'Error al eliminar el horario. Intenta nuevamente.';
        this.deletingId = null;
      }
    });
  }
}
