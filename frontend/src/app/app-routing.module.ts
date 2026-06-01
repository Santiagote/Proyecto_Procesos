import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, LoginGuard } from '@core/guards/auth.guard';
import { LayoutComponent } from '@features/layout/layout.component';
import { LoginComponent } from '@features/auth/login.component';
import { RecoverPasswordComponent } from '@features/auth/recover-password.component';
import { ResetPasswordComponent } from '@features/auth/reset-password.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { StudentListComponent } from '@features/students/student-list.component';
import { StudentFormComponent } from '@features/students/student-form.component';
import { CaptureComponent } from '@features/attendance/capture.component';
import { HistoryComponent } from '@features/attendance/history.component';
import { ScheduleListComponent } from '@features/schedules/schedule-list.component';
import { ReportViewComponent } from '@features/reports/report-view.component';
import { ExceptionListComponent } from '@features/exceptions/exception-list.component';
import { UserListComponent } from '@features/users/user-list.component';
import { ProfileComponent } from '@features/profile/profile.component';

const routes: Routes = [
  {
    path: 'auth',
    canActivate: [LoginGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'recover-password', component: RecoverPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'students', component: StudentListComponent, data: { roles: ['ADMIN', 'TEACHER'] } },
      { path: 'students/new', component: StudentFormComponent, data: { roles: ['ADMIN'] } },
      { path: 'students/:id', component: StudentFormComponent, data: { roles: ['ADMIN', 'TEACHER'] } },
      { path: 'attendance/capture', component: CaptureComponent, data: { roles: ['STUDENT'] } },
      { path: 'attendance/history', component: HistoryComponent },
      { path: 'schedules', component: ScheduleListComponent, data: { roles: ['ADMIN'] } },
      { path: 'reports', component: ReportViewComponent },
      { path: 'exceptions', component: ExceptionListComponent, data: { roles: ['ADMIN', 'TEACHER'] } },
      { path: 'users', component: UserListComponent, data: { roles: ['ADMIN'] } },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
