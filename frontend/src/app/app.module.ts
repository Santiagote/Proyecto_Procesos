import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Core
import { AuthInterceptor } from '@core/interceptors/auth.interceptor';
import { ErrorInterceptor } from '@core/interceptors/error.interceptor';

// Layout
import { LayoutComponent } from '@features/layout/layout.component';

// Auth
import { LoginComponent } from '@features/auth/login.component';
import { RecoverPasswordComponent } from '@features/auth/recover-password.component';
import { ResetPasswordComponent } from '@features/auth/reset-password.component';

// Features
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

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoginComponent,
    RecoverPasswordComponent,
    ResetPasswordComponent,
    DashboardComponent,
    StudentListComponent,
    StudentFormComponent,
    CaptureComponent,
    HistoryComponent,
    ScheduleListComponent,
    ReportViewComponent,
    ExceptionListComponent,
    UserListComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
