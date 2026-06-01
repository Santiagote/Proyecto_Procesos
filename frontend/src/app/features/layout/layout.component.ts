import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: string[];
  section?: string;
}

@Component({
  selector: 'app-layout',
  template: `
    <div class="sidebar" [class.open]="sidebarOpen">
      <div class="sidebar-header">
        <a class="brand" routerLink="/dashboard">
          <i class="bi bi-camera-fill me-2"></i>SACARF
        </a>
      </div>
      <nav class="sidebar-nav">
        <ng-container *ngFor="let item of navItems; let i = index">
          <div *ngIf="item.section" class="nav-section">{{ item.section }}</div>
          <a class="nav-item" [class.active]="isActive(item.route)"
             [routerLink]="item.route" *ngIf="hasRole(item.roles)"
             (click)="sidebarOpen = false">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        </ng-container>
      </nav>
    </div>

    <div class="main-content">
      <div class="topbar">
        <button class="btn btn-link text-dark" (click)="sidebarOpen = !sidebarOpen">
          <i class="bi bi-list fs-4"></i>
        </button>
        <div class="d-flex align-items-center gap-3">
          <span class="text-muted small">{{ currentUser?.nombres }} {{ currentUser?.apellidos }}</span>
          <span class="badge bg-primary">{{ currentUser?.role }}</span>
          <button class="btn btn-outline-danger btn-sm" (click)="logout()">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
      <div class="content-wrapper">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  sidebarOpen = false;

  navItems: NavItem[] = [
    { section: 'PRINCIPAL', label: '', route: '', icon: '', roles: [] },
    { label: 'Dashboard', route: '/dashboard', icon: 'bi bi-grid-1x2-fill', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { section: 'GESTIÓN', label: '', route: '', icon: '', roles: [] },
    { label: 'Estudiantes', route: '/students', icon: 'bi bi-people-fill', roles: ['ADMIN', 'TEACHER'] },
    { label: 'Horarios', route: '/schedules', icon: 'bi bi-calendar-week-fill', roles: ['ADMIN'] },
    { label: 'Usuarios', route: '/users', icon: 'bi bi-person-badge-fill', roles: ['ADMIN'] },
    { section: 'ASISTENCIAS', label: '', route: '', icon: '', roles: [] },
    { label: 'Capturar', route: '/attendance/capture', icon: 'bi bi-camera-fill', roles: ['STUDENT'] },
    { label: 'Historial', route: '/attendance/history', icon: 'bi bi-clock-history', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { label: 'Excepciones', route: '/exceptions', icon: 'bi bi-exclamation-triangle-fill', roles: ['ADMIN', 'TEACHER'] },
    { section: 'REPORTES', label: '', route: '', icon: '', roles: [] },
    { label: 'Reportes', route: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { section: 'CONFIGURACIÓN', label: '', route: '', icon: '', roles: [] },
    { label: 'Mi Perfil', route: '/profile', icon: 'bi bi-person-circle', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }

  hasRole(roles: string[]): boolean {
    if (roles.length === 0) return true;
    return this.authService.hasRole(roles);
  }

  isActive(route: string): boolean {
    return window.location.pathname.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
  }
}
