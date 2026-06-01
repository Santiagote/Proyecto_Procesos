from django.db import models
from apps.students.models import Subject
from apps.accounts.models import User


class Schedule(models.Model):
    class WeekDay(models.IntegerChoices):
        MONDAY = 1, "Lunes"
        TUESDAY = 2, "Martes"
        WEDNESDAY = 3, "Miércoles"
        THURSDAY = 4, "Jueves"
        FRIDAY = 5, "Viernes"
        SATURDAY = 6, "Sábado"

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="schedules", verbose_name="Asignatura")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="schedules", limit_choices_to={"role": "TEACHER"}, verbose_name="Docente")
    week_day = models.IntegerField(choices=WeekDay.choices, verbose_name="Día de la semana")
    start_time = models.TimeField(verbose_name="Hora inicio")
    end_time = models.TimeField(verbose_name="Hora fin")
    classroom = models.CharField(max_length=50, blank=True, verbose_name="Aula")
    academic_period = models.CharField(max_length=20, verbose_name="Período académico")
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        verbose_name = "Horario"
        verbose_name_plural = "Horarios"
        ordering = ["week_day", "start_time"]

    def __str__(self):
        return f"{self.subject.name} - {self.get_week_day_display()} {self.start_time}-{self.end_time}"


class AcademicPeriod(models.Model):
    name = models.CharField(max_length=20, unique=True, verbose_name="Período")
    start_date = models.DateField(verbose_name="Fecha inicio")
    end_date = models.DateField(verbose_name="Fecha fin")
    is_active = models.BooleanField(default=False, verbose_name="Activo")

    class Meta:
        verbose_name = "Período académico"
        verbose_name_plural = "Períodos académicos"

    def __str__(self):
        return self.name
