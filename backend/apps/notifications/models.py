from django.db import models
from apps.accounts.models import User


class Notification(models.Model):
    class Type(models.TextChoices):
        ATTENDANCE_CONFIRMATION = "ATTENDANCE_CONFIRM", "Confirmación de asistencia"
        RECOGNITION_ERROR = "RECOGNITION_ERROR", "Error de reconocimiento"
        OUT_OF_SCHEDULE = "OUT_OF_SCHEDULE", "Fuera de horario"
        ACCOUNT_STATUS = "ACCOUNT_STATUS", "Estado de cuenta"
        PASSWORD_CHANGED = "PASSWORD_CHANGED", "Cambio de contraseña"
        CREDENTIALS = "CREDENTIALS", "Credenciales iniciales"
        RECOVERY = "RECOVERY", "Recuperación de contraseña"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=Type.choices)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    email_sent = models.BooleanField(default=False)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notificación"
        verbose_name_plural = "Notificaciones"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.subject}"
