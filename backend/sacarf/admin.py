from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from apps.accounts.models import User, PasswordHistory, PasswordRecoveryToken, AuditLog
from apps.students.models import Student, Career, Subject, StudentSubject
from apps.schedules.models import Schedule, AcademicPeriod
from apps.attendance.models import AttendanceRecord, AttendanceException
from apps.notifications.models import Notification


class UserAdmin(BaseUserAdmin):
    list_display = ["email", "nombres", "apellidos", "role", "is_active"]
    list_filter = ["role", "is_active"]
    search_fields = ["email", "nombres", "apellidos", "cedula"]
    ordering = ["email"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Información personal", {"fields": ("cedula", "nombres", "apellidos", "telefono", "profile_picture")}),
        ("Roles y permisos", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Seguridad", {"fields": ("password_change_required", "failed_login_attempts", "blocked_until")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "cedula", "nombres", "apellidos", "password1", "password2", "role"),
        }),
    )


admin.site.register(User, UserAdmin)
admin.site.register(PasswordHistory)
admin.site.register(PasswordRecoveryToken)
admin.site.register(AuditLog)
admin.site.register(Student)
admin.site.register(Career)
admin.site.register(Subject)
admin.site.register(StudentSubject)
admin.site.register(Schedule)
admin.site.register(AcademicPeriod)
admin.site.register(AttendanceRecord)
admin.site.register(AttendanceException)
admin.site.register(Notification)
