import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-recover-password',
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="brand">
          <i class="bi bi-shield-lock-fill" style="font-size:2.5rem;color:#1a237e;"></i>
          <h4>Recuperar Contraseña</h4>
        </div>

        <div *ngIf="success" class="alert alert-success small">{{ success }}</div>
        <div *ngIf="error" class="alert alert-danger small">{{ error }}</div>

        <form (ngSubmit)="onSubmit()" *ngIf="!success">
          <div class="mb-3">
            <label class="form-label">Correo institucional</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email" required>
          </div>
          <button type="submit" class="btn btn-sacarf w-100" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            Enviar enlace de recuperación
          </button>
        </form>

        <div class="text-center mt-3">
          <a routerLink="/auth/login" class="text-decoration-none small">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  `,
})
export class RecoverPasswordComponent {
  email = '';
  loading = false;
  success = '';
  error = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (!this.email) return;
    this.loading = true;
    this.authService.recoverPassword({ email: this.email }).subscribe({
      next: () => {
        this.success = 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña';
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.detail || err?.message || 'No se pudo enviar el correo de recuperación';
        this.loading = false;
      },
    });
  }
}
