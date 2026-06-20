import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="brand">
          <i class="bi bi-key-fill" style="font-size:2.5rem;color:#1a237e;"></i>
          <h4>Nueva Contraseña</h4>
        </div>

        <div *ngIf="success" class="alert alert-success small">{{ success }}</div>
        <div *ngIf="error" class="alert alert-danger small">{{ error }}</div>

        <form (ngSubmit)="onSubmit()" *ngIf="!success">
          <div class="mb-3">
            <label class="form-label">Nueva contraseña</label>
            <div class="input-group">
              <input [type]="showPassword ? 'text' : 'password'" class="form-control" [(ngModel)]="newPassword" name="newPassword" required>
              <button type="button" class="btn btn-outline-secondary" (click)="showPassword=!showPassword">
                <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <small class="text-muted">Mín. 8 caracteres, 1 mayúscula, 1 número, 1 especial</small>
          </div>
          <div class="mb-3">
            <label class="form-label">Confirmar contraseña</label>
            <div class="input-group">
              <input [type]="showPassword ? 'text' : 'password'" class="form-control" [(ngModel)]="confirmPassword" name="confirmPassword" required>
              <button type="button" class="btn btn-outline-secondary" (click)="showPassword=!showPassword">
                <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-sacarf w-100" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            Restablecer contraseña
          </button>
        </form>

        <div class="text-center mt-3" *ngIf="success">
          <a routerLink="/auth/login" class="btn btn-sacarf">Ir al inicio de sesión</a>
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent {
  token = '';
  showPassword = false;
  newPassword = '';
  confirmPassword = '';
  loading = false;
  success = '';
  error = '';

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    if (!this.token) { this.error = 'Token inválido'; return; }
    this.loading = true;
    this.authService.resetPassword({ token: this.token, new_password: this.newPassword }).subscribe({
      next: () => { this.success = 'Contraseña restablecida correctamente'; this.loading = false; },
      error: err => { this.error = err.message; this.loading = false; },
    });
  }
}
