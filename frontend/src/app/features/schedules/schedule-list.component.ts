import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '@core/services/schedule.service';
import { Schedule, WEEK_DAYS, AcademicPeriod } from '@core/models/schedule.model';
import { UserService } from '@core/services/user.service';
import { StudentService } from '@core/services/student.service';
import { Subject } from '@core/models/student.model';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-schedule-list',
  template: `
    <div class="page-header">
      <h4 class="page-title mb-0">Gestión de Horarios</h4>
      <div class="d-flex gap-2">
        <button class="btn btn-glass btn-glass-success" (click)="openPeriodModal()">
          <i class="bi bi-calendar-plus me-1"></i>Período
        </button>
        <button class="btn btn-primary-glow" (click)="openScheduleModal()">
          <i class="bi bi-plus-lg me-1"></i>Nuevo Horario
        </button>
      </div>
    </div>

    <!-- Notificaciones -->
    <div *ngIf="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>{{ successMsg }}
      <button type="button" class="btn-close" (click)="successMsg=''"></button>
    </div>
    <div *ngIf="errorMsg" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMsg }}
      <button type="button" class="btn-close" (click)="errorMsg=''"></button>
    </div>

    <!-- Períodos Académicos -->
    <div class="periods-grid" *ngIf="periods.length > 0">
      <div class="period-card" *ngFor="let p of periods" [class.active]="p.is_active">
        <div class="period-card-body">
          <div class="period-card-top">
            <span class="period-name">{{ p.name }}</span>
            <span class="period-badge" [class.active]="p.is_active">
              {{ p.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="period-dates">
            <i class="bi bi-calendar3"></i>
            {{ p.start_date }} — {{ p.end_date }}
          </div>
          <div class="period-duration">
            <i class="bi bi-clock"></i>
            {{ getPeriodDuration(p) }}
          </div>
        </div>
        <div class="period-card-actions">
          <button class="btn-icon" title="Editar período" (click)="editPeriod(p)">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-icon text-danger" title="Eliminar período" (click)="deletePeriod(p)">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    </div>
    <div *ngIf="periods.length === 0" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>No hay períodos académicos registrados. Crea uno primero.
    </div>

    <!-- Tabla de Horarios -->
    <div class="card modern-card">
      <div class="card-body p-0">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Asignatura</th>
                <th>Docente</th>
                <th>Día</th>
                <th>Horario</th>
                <th>Aula</th>
                <th>Período</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="schedules.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  <i class="bi bi-calendar-x me-2"></i>No hay horarios registrados aún.
                </td>
              </tr>
              <tr *ngFor="let s of schedules">
                <td>
                  <span class="fw-medium text-light">{{ s.subject_name }}</span>
                </td>
                <td>{{ s.teacher_name }}</td>
                <td>
                  <span class="day-badge">{{ WEEK_DAYS[s.week_day] }}</span>
                </td>
                <td class="text-nowrap">
                  <i class="bi bi-clock me-1 text-muted"></i>{{ s.start_time }} - {{ s.end_time }}
                </td>
                <td>{{ s.classroom || '—' }}</td>
                <td>
                  <span class="period-tag">{{ s.academic_period }}</span>
                </td>
                <td>
                  <div class="table-actions justify-content-end">
                    <button class="btn btn-sm btn-outline-primary"
                            title="Editar horario"
                            (click)="openScheduleModal(s)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            title="Eliminar horario"
                            [disabled]="deletingId === s.id"
                            (click)="confirmarEliminar(s)">
                      <span *ngIf="deletingId === s.id" class="spinner-border spinner-border-sm"></span>
                      <i *ngIf="deletingId !== s.id" class="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="schedules.length === 0" class="empty-state">
          <i class="bi bi-calendar-week"></i>
          <p>No hay horarios registrados</p>
          <button class="btn btn-primary-glow btn-sm" (click)="openScheduleModal()">
            <i class="bi bi-plus-lg me-1"></i>Crear primer horario
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Horario -->
    <div *ngIf="showScheduleModal" class="modal-custom-overlay" (click)="closeScheduleModal()">
      <div class="modal-custom" (click)="$event.stopPropagation()">
        <div class="modal-custom-header">
          <span>{{ editScheduleId ? 'Editar Horario' : 'Nuevo Horario' }}</span>
          <button class="modal-custom-close" (click)="closeScheduleModal()">&times;</button>
        </div>
        <div class="modal-custom-body">
          <div *ngIf="schedError" class="alert alert-danger py-2 small">{{ schedError }}</div>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Asignatura *</label>
              <select class="form-select" [(ngModel)]="schedForm.subject_id">
                <option [ngValue]="null">Seleccionar...</option>
                <option *ngFor="let sub of subjects" [ngValue]="sub.id">{{ sub.name }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Docente *</label>
              <select class="form-select" [(ngModel)]="schedForm.teacher_id">
                <option [ngValue]="null">Seleccionar...</option>
                <option *ngFor="let t of teachers" [ngValue]="t.id">{{ t.nombres }} {{ t.apellidos }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Día *</label>
              <select class="form-select" [(ngModel)]="schedForm.week_day">
                <option [ngValue]="null">Seleccionar...</option>
                <option *ngFor="let d of weekDayKeys" [ngValue]="d">{{ WEEK_DAYS[d] }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Hora inicio *</label>
              <input type="time" class="form-control" [(ngModel)]="schedForm.start_time">
            </div>
            <div class="col-md-4">
              <label class="form-label">Hora fin *</label>
              <input type="time" class="form-control" [(ngModel)]="schedForm.end_time">
            </div>
            <div class="col-md-6">
              <label class="form-label">Aula</label>
              <input type="text" class="form-control" [(ngModel)]="schedForm.classroom" placeholder="Ej: A-101">
            </div>
            <div class="col-md-6">
              <label class="form-label">Período académico *</label>
              <select class="form-select" [(ngModel)]="schedForm.academic_period">
                <option value="">Seleccionar...</option>
                <option *ngFor="let p of periods" [value]="p.name">{{ p.name }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-custom-footer">
          <button class="btn btn-outline-secondary" (click)="closeScheduleModal()">Cancelar</button>
          <button class="btn btn-primary-glow" (click)="saveSchedule()" [disabled]="schedSaving">
            <span *ngIf="schedSaving" class="spinner-border spinner-border-sm me-2"></span>
            {{ editScheduleId ? 'Actualizar' : 'Crear Horario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Período -->
    <div *ngIf="showPeriodModal" class="modal-custom-overlay" (click)="closePeriodModal()">
      <div class="modal-custom" (click)="$event.stopPropagation()">
        <div class="modal-custom-header">
          <span>{{ editPeriodId ? 'Editar Período' : 'Nuevo Período Académico' }}</span>
          <button class="modal-custom-close" (click)="closePeriodModal()">&times;</button>
        </div>
        <div class="modal-custom-body">
          <div *ngIf="periodError" class="alert alert-danger py-2 small">{{ periodError }}</div>
          <div class="row g-3">
            <div class="col-md-12">
              <label class="form-label">Nombre *</label>
              <input type="text" class="form-control" [(ngModel)]="periodForm.name" placeholder="Ej: 2026-1S">
            </div>
            <div class="col-md-6">
              <label class="form-label">Fecha inicio *</label>
              <input type="date" class="form-control" [(ngModel)]="periodForm.start_date">
            </div>
            <div class="col-md-6">
              <label class="form-label">Fecha fin *</label>
              <input type="date" class="form-control" [(ngModel)]="periodForm.end_date">
            </div>
            <div class="col-12">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" [(ngModel)]="periodForm.is_active" id="periodActive">
                <label class="form-check-label" for="periodActive">Período activo</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-custom-footer">
          <button class="btn btn-outline-secondary" (click)="closePeriodModal()">Cancelar</button>
          <button class="btn btn-primary-glow" (click)="savePeriod()" [disabled]="periodSaving">
            <span *ngIf="periodSaving" class="spinner-border spinner-border-sm me-2"></span>
            {{ editPeriodId ? 'Actualizar' : 'Crear Período' }}
          </button>
        </div>
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
  weekDayKeys = Object.keys(WEEK_DAYS).map(Number);
  successMsg = '';
  errorMsg = '';
  deletingId: number | null = null;
  scheduleToDelete: Schedule | null = null;

  subjects: Subject[] = [];
  teachers: User[] = [];

  showScheduleModal = false;
  editScheduleId: number | null = null;
  schedSaving = false;
  schedError = '';
  schedForm = { subject_id: null as number | null, teacher_id: null as number | null, week_day: null as number | null, start_time: '', end_time: '', classroom: '', academic_period: '' };

  showPeriodModal = false;
  editPeriodId: number | null = null;
  periodSaving = false;
  periodError = '';
  periodForm = { name: '', start_date: '', end_date: '', is_active: false };

  constructor(
    private scheduleService: ScheduleService,
    private userService: UserService,
    private studentService: StudentService,
  ) {}

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
    this.studentService.getSubjects().subscribe(s => this.subjects = s);
    this.userService.getUsers().subscribe(u => this.teachers = u.filter(x => x.role === 'TEACHER'));
  }

  getPeriodDuration(p: AcademicPeriod): string {
    if (!p.start_date || !p.end_date) return '';
    const start = new Date(p.start_date);
    const end = new Date(p.end_date);
    const diffMs = end.getTime() - start.getTime();
    const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    if (months > 0) return `${months}m ${days}d`;
    return `${days} días`;
  }

  openScheduleModal(s?: Schedule): void {
    this.schedError = '';
    if (s) {
      this.editScheduleId = s.id;
      this.schedForm = {
        subject_id: s.subject,
        teacher_id: s.teacher,
        week_day: s.week_day,
        start_time: s.start_time,
        end_time: s.end_time,
        classroom: s.classroom || '',
        academic_period: s.academic_period,
      };
    } else {
      this.editScheduleId = null;
      this.schedForm = { subject_id: null, teacher_id: null, week_day: null, start_time: '', end_time: '', classroom: '', academic_period: '' };
    }
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
  }

  saveSchedule(): void {
    if (!this.schedForm.subject_id || !this.schedForm.teacher_id || !this.schedForm.week_day || !this.schedForm.start_time || !this.schedForm.end_time || !this.schedForm.academic_period) {
      this.schedError = 'Completa todos los campos obligatorios';
      return;
    }
    this.schedSaving = true;
    this.schedError = '';

    const data = {
      subject: this.schedForm.subject_id,
      teacher: this.schedForm.teacher_id,
      week_day: this.schedForm.week_day,
      start_time: this.schedForm.start_time,
      end_time: this.schedForm.end_time,
      classroom: this.schedForm.classroom,
      academic_period: this.schedForm.academic_period,
    };

    const obs = this.editScheduleId
      ? this.scheduleService.updateSchedule(this.editScheduleId, data)
      : this.scheduleService.createSchedule(data);

    obs.subscribe({
      next: () => { this.schedSaving = false; this.closeScheduleModal(); this.loadData(); },
      error: err => { this.schedError = err.message; this.schedSaving = false; },
    });
  }

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

  openPeriodModal(): void {
    this.editPeriodId = null;
    this.periodForm = { name: '', start_date: '', end_date: '', is_active: false };
    this.periodError = '';
    this.showPeriodModal = true;
  }

  editPeriod(p: AcademicPeriod): void {
    this.editPeriodId = p.id;
    this.periodForm = { name: p.name, start_date: p.start_date, end_date: p.end_date, is_active: p.is_active };
    this.periodError = '';
    this.showPeriodModal = true;
  }

  closePeriodModal(): void {
    this.showPeriodModal = false;
  }

  savePeriod(): void {
    if (!this.periodForm.name || !this.periodForm.start_date || !this.periodForm.end_date) {
      this.periodError = 'Completa todos los campos obligatorios';
      return;
    }
    this.periodSaving = true;
    this.periodError = '';

    const obs = this.editPeriodId
      ? this.scheduleService.updatePeriod(this.editPeriodId, this.periodForm)
      : this.scheduleService.createPeriod(this.periodForm);

    obs.subscribe({
      next: () => { this.periodSaving = false; this.closePeriodModal(); this.loadData(); },
      error: err => { this.periodError = err.message; this.periodSaving = false; },
    });
  }

  deletePeriod(p: AcademicPeriod): void {
    if (confirm(`¿Eliminar el período "${p.name}"?`)) {
      this.scheduleService.deletePeriod(p.id).subscribe(() => this.loadData());
    }
  }
}
