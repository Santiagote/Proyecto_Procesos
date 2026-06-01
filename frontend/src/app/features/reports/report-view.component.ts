import { Component, OnInit } from '@angular/core';
import { ReportService } from '@core/services/report.service';
import { StudentService } from '@core/services/student.service';
import { AuthService } from '@core/services/auth.service';
import { Subject } from '@core/models/student.model';

@Component({
  selector: 'app-report-view',
  template: `
    <h4 class="page-title">Reportes de Asistencia</h4>

    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label">Tipo de Reporte</label>
            <select class="form-select" [(ngModel)]="reportType" (change)="onTypeChange()">
              <option value="student">Por Estudiante</option>
              <option value="subject">Por Asignatura</option>
              <option value="teacher">Por Docente</option>
              <option value="period">Por Período</option>
            </select>
          </div>
          <div class="col-md-3" *ngIf="reportType === 'subject'">
            <label class="form-label">Asignatura</label>
            <select class="form-select" [(ngModel)]="subjectId">
              <option value="">Seleccionar...</option>
              <option *ngFor="let s of subjects" [value]="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Período</label>
            <input type="text" class="form-control" [(ngModel)]="period" placeholder="Ej: 2026-1S">
          </div>
          <div class="col-md-3">
            <button class="btn btn-sacarf w-100" (click)="generateReport()" [disabled]="loading">
              <i class="bi bi-search me-1"></i> Generar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading-spinner">
      <div class="spinner-border text-primary"></div>
    </div>

    <div class="card" *ngIf="report && !loading">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>{{ reportTitle }}</span>
        <div>
          <button class="btn btn-sm btn-outline-danger me-1" (click)="exportPDF()">
            <i class="bi bi-filetype-pdf me-1"></i>PDF
          </button>
          <button class="btn btn-sm btn-outline-success" (click)="exportExcel()">
            <i class="bi bi-file-earmark-excel me-1"></i>Excel
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Cédula</th>
              <th>Presentes</th>
              <th>Ausentes</th>
              <th>Justificados</th>
              <th>% Asistencia</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of report.students || []">
              <td>{{ s.nombres || s.student_name }}</td>
              <td>{{ s.cedula }}</td>
              <td>{{ s.present }}</td>
              <td>{{ s.absent }}</td>
              <td>{{ s.justified }}</td>
              <td>
                <span [class.text-success]="s.percentage >= 70"
                      [class.text-danger]="s.percentage < 70"
                      class="fw-bold">
                  {{ s.percentage }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ReportViewComponent implements OnInit {
  reportType = 'subject';
  subjectId = '';
  period = '';
  loading = false;
  report: any = null;
  subjects: Subject[] = [];
  reportTitle = '';

  constructor(
    private reportService: ReportService,
    private studentService: StudentService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.studentService.getSubjects().subscribe(s => this.subjects = s);
    if (this.authService.hasRole(['STUDENT'])) this.reportType = 'student';
  }

  onTypeChange(): void {
    this.report = null;
  }

  generateReport(): void {
    this.loading = true;
    this.report = null;

    let obs;
    switch (this.reportType) {
      case 'student':
        obs = this.reportService.getStudentReport(undefined, undefined, this.period);
        this.reportTitle = 'Reporte por Estudiante';
        break;
      case 'subject':
        obs = this.reportService.getSubjectReport(+this.subjectId, this.period);
        this.reportTitle = `Reporte de Asistencia - ${this.subjects.find(s => s.id === +this.subjectId)?.name || ''}`;
        break;
      case 'teacher':
        obs = this.reportService.getTeacherReport(undefined, this.period);
        this.reportTitle = 'Reporte por Docente';
        break;
      case 'period':
        obs = this.reportService.getPeriodReport(this.period);
        this.reportTitle = `Reporte del Período ${this.period}`;
        break;
    }

    obs?.subscribe({
      next: res => { this.report = res; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  exportPDF(): void {
    this.reportService.exportPdf(this.reportType, +this.subjectId, undefined, this.period)
      .subscribe(blob => this.downloadFile(blob, 'reporte.pdf'));
  }

  exportExcel(): void {
    this.reportService.exportExcel(this.reportType, +this.subjectId, undefined, this.period)
      .subscribe(blob => this.downloadFile(blob, 'reporte.xlsx'));
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
