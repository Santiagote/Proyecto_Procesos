from django.db import models
from apps.students.models import Student, Subject
from apps.schedules.models import Schedule
from apps.accounts.models import User


class AttendanceRecord(models.Model):
    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Presente"
        ABSENT = "ABSENT", "Ausente"
        JUSTIFIED = "JUSTIFIED", "Justificado"

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="attendance_records", verbose_name="Estudiante")
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name="attendance_records", verbose_name="Horario")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="attendance_records", verbose_name="Asignatura")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance_records", verbose_name="Docente")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PRESENT, verbose_name="Estado")
    recorded_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha/Hora registro")
    confidence = models.FloatField(null=True, blank=True, verbose_name="Confianza del reconocimiento")
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name="IP origen")
    registered_by = models.CharField(max_length=20, default="SYSTEM", verbose_name="Registrado por")

    class Meta:
        verbose_name = "Registro de asistencia"
        verbose_name_plural = "Registros de asistencia"
        ordering = ["-recorded_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "schedule"],
                name="unique_student_schedule",
                violation_error_message="El estudiante ya tiene un registro para esta sesión",
            )
        ]

    def __str__(self):
        return f"{self.student} - {self.status} - {self.recorded_at}"


class AttendanceException(models.Model):
    attendance_record = models.ForeignKey(AttendanceRecord, on_delete=models.CASCADE, related_name="exceptions", null=True, blank=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="attendance_exceptions")
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name="attendance_exceptions")
    previous_status = models.CharField(max_length=10, verbose_name="Estado anterior")
    new_status = models.CharField(max_length=10, verbose_name="Nuevo estado")
    reason = models.TextField(verbose_name="Motivo")
    supporting_document = models.URLField(blank=True, verbose_name="Documento adjunto")
    modified_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="modified_exceptions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Excepción de asistencia"
        verbose_name_plural = "Excepciones de asistencia"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student} - {self.previous_status} -> {self.new_status}"
