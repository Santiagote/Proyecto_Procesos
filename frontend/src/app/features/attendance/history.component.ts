import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '@core/services/attendance.service';
import { AuthService } from '@core/services/auth.service';
import { AttendanceRecord } from '@core/models/attendance.model';

@Component({
  selector: 'app-history',
  template: `
    <h4 class="page-title">Historial de Asistencias</h4>

    <div class="card">
      <div class="card-body">
        <div *ngIf="loading" class="loading-spinner">
          <div class="spinner-border text-primary"></div>
        </div>

        <table class="data-table" *ngIf="!loading">
          <thead>
            <tr>
              <th *ngIf="isAdmin || isTeacher">Estudiante</th>
              <th>Cédula</th>
              <th>Asignatura</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Confianza</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of records">
              <td *ngIf="isAdmin || isTeacher">{{ r.student_name }}</td>
              <td>{{ r.student_cedula }}</td>
              <td>{{ r.subject_name }}</td>
              <td>{{ r.recorded_at | date:'dd/MM/yyyy' }}</td>
              <td>{{ r.recorded_at | date:'HH:mm:ss' }}</td>
              <td>
                <span class="status-badge" [class.status-presente]="r.status === 'PRESENT'"
                      [class.status-ausente]="r.status === 'ABSENT'"
                      [class.status-justificado]="r.status === 'JUSTIFIED'">
                  {{ r.status === 'PRESENT' ? 'Presente' : r.status === 'ABSENT' ? 'Ausente' : 'Justificado' }}
                </span>
              </td>
              <td>{{ r.confidence ? (r.confidence | number:'1.1-1') + '%' : '-' }}</td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && records.length === 0" class="text-center py-4 text-muted">
          No hay registros de asistencia
        </div>
      </div>
    </div>
  `,
})
export class HistoryComponent implements OnInit {
  records: AttendanceRecord[] = [];
  loading = false;
  isAdmin = false;
  isTeacher = false;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
  ) {
    this.isAdmin = this.authService.hasRole(['ADMIN']);
    this.isTeacher = this.authService.hasRole(['TEACHER']);
  }

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.attendanceService.getHistory().subscribe({
      next: res => { this.records = res.results; this.loading = false; },
      error: () => this.loading = false,
    });
  }
}
