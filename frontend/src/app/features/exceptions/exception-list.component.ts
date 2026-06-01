import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '@core/services/attendance.service';
import { AttendanceException } from '@core/models/attendance.model';

@Component({
  selector: 'app-exception-list',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="page-title mb-0">Excepciones de Asistencia</h4>
      <button class="btn btn-sacarf" data-bs-toggle="modal" data-bs-target="#exceptionModal">
        <i class="bi bi-plus-lg me-1"></i>Justificar / Corregir
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Estado Anterior</th>
              <th>Nuevo Estado</th>
              <th>Motivo</th>
              <th>Modificado por</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of exceptions">
              <td>{{ e.student_name }}</td>
              <td><span class="status-badge status-ausente">Ausente</span></td>
              <td><span class="status-badge"
                    [class.status-presente]="e.new_status === 'PRESENT'"
                    [class.status-justificado]="e.new_status === 'JUSTIFIED'">
                  {{ e.new_status === 'PRESENT' ? 'Presente' : 'Justificado' }}
                </span>
              </td>
              <td>{{ e.reason }}</td>
              <td>{{ e.modified_by_name }}</td>
              <td>{{ e.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ExceptionListComponent implements OnInit {
  exceptions: AttendanceException[] = [];

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.attendanceService.getExceptions().subscribe({
      next: res => this.exceptions = res.results || [],
    });
  }
}
