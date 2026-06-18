import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Component({
  selector: 'app-activate-account',
  template: `
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1a237e;">
      <div style="background:white;padding:40px;border-radius:12px;text-align:center;max-width:400px;">
        <h1 style="color:#1a237e;">📷 SACARF</h1>
        <div *ngIf="loading">
          <p>Activando tu cuenta...</p>
        </div>
        <div *ngIf="success">
          <h2 style="color:green;">✅ ¡Cuenta activada!</h2>
          <p>Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión.</p>
          <button (click)="goToLogin()" style="background:#1a237e;color:white;padding:12px 24px;border:none;border-radius:6px;cursor:pointer;font-size:16px;">
            Ir al Login
          </button>
        </div>
        <div *ngIf="error">
          <h2 style="color:red;">❌ Error</h2>
          <p>{{ errorMessage }}</p>
          <p>Contacta al administrador para que reactive tu cuenta.</p>
        </div>
      </div>
    </div>
  `,
})
export class ActivateAccountComponent implements OnInit {
  loading = true;
  success = false;
  error = false;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading = false;
      this.error = true;
      this.errorMessage = 'Token de activación no encontrado.';
      return;
    }
    this.http.get(`${environment.apiUrl}/auth/activate/${token}/`).subscribe({
      next: () => { this.loading = false; this.success = true; },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.detail || 'Error al activar la cuenta.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
