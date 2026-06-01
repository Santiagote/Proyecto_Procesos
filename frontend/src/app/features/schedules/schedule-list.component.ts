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

    <div class="row g-3 mb-3">
      <div class="col-md-3" *ngFor="let p of periods">
        <div class="card text-center p-3" [class.border-primary]="p.is_active">
          <strong>{{ p.name }}</strong>
          <small class="text-muted">{{ p.start_date }} - {{ p.end_date }}</small>
          <span class="badge bg-success mt-1" *ngIf="p.is_active">Activo</span>
        </div>
      </div>
    </div>

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
            <tr *ngFor="let s of schedules">
              <td>{{ s.subject_name }}</td>
              <td>{{ s.teacher_name }}</td>
              <td>{{ WEEK_DAYS[s.week_day] }}</td>
              <td>{{ s.start_time }} - {{ s.end_time }}</td>
              <td>{{ s.classroom || '-' }}</td>
              <td>{{ s.academic_period }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="openEditSchedule(s)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteSchedule(s.id)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ScheduleListComponent implements OnInit {
  schedules: Schedule[] = [];
  periods: AcademicPeriod[] = [];
  WEEK_DAYS = WEEK_DAYS;

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.scheduleService.getSchedules().subscribe(s => this.schedules = s);
    this.scheduleService.getPeriods().subscribe(p => this.periods = p);
  }

  openNewSchedule(): void {}

  openEditSchedule(s: Schedule): void {}

  deleteSchedule(id: number): void {
    if (confirm('¿Eliminar este horario?')) {
      this.scheduleService.deleteSchedule(id).subscribe(() => this.loadData());
    }
  }
}
