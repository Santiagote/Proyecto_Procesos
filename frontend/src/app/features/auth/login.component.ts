import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="brand">
          <i class="bi bi-camera-fill" style="font-size:3rem;color:#1a237e;"></i>
          <h2>SACARF</h2>
          <p>Sistema de Control de Asistencia</p>
        </div>

        <div *ngIf="error" class="alert alert-danger py-2 small">{{ error }}</div>

        <form (ngSubmit)="onLogin()">
          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email"
                   placeholder="correo@unl.edu.ec" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <div class="input-group">
              <input [type]="showPassword ? 'text' : 'password'" class="form-control" [(ngModel)]="password" name="password"
                     placeholder="Ingresa tu contraseña" required>
              <button type="button" class="btn btn-outline-secondary" (click)="showPassword=!showPassword">
                <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-sacarf w-100 mb-3" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            Iniciar Sesión
          </button>
          <div class="text-center">
            <a routerLink="/auth/recover-password" class="text-decoration-none small">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        if (res.password_change_required) {
          this.router.navigate(['/profile']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        this.error = err.message || 'Credenciales inválidas';
        this.loading = false;
      },
    });
  }
}
