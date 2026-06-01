from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from .models import Schedule


class ScheduleService:
    @staticmethod
    def get_active_session(student):
        now = timezone.now()
        today_weekday = now.isoweekday()
        today = now.date()
        active_period = Schedule.objects.filter(
            subject__enrolled_students__student=student,
            week_day=today_weekday,
            is_active=True,
            subject__enrolled_students__academic_period__in=[
                s.academic_period for s in student.enrolled_subjects.all()
            ],
        ).select_related("subject", "teacher").first()

        if not active_period:
            return None, "No tienes clases programadas para hoy"

        schedule_start = datetime.combine(today, active_period.start_time, tzinfo=timezone.get_current_timezone())
        schedule_end = datetime.combine(today, active_period.end_time, tzinfo=timezone.get_current_timezone())

        window_start = schedule_start + timedelta(minutes=settings.ATTENDANCE_WINDOW_START)
        window_end = schedule_start + timedelta(minutes=settings.ATTENDANCE_WINDOW_END)

        if now < window_start:
            return None, f"El registro aún no está disponible (desde {window_start.strftime('%H:%M')})"
        if now > window_end:
            if now > schedule_end:
                return None, "La clase ya terminó"
            return None, "Fuera del horario de registro permitido"

        return active_period, None

    @staticmethod
    def get_active_session_by_schedule_id(schedule_id):
        now = timezone.now()
        today = now.date()
        try:
            schedule = Schedule.objects.select_related("subject", "teacher").get(id=schedule_id, is_active=True)
        except Schedule.DoesNotExist:
            return None, "Horario no encontrado o inactivo"

        schedule_start = datetime.combine(today, schedule.start_time, tzinfo=timezone.get_current_timezone())
        schedule_end = datetime.combine(today, schedule.end_time, tzinfo=timezone.get_current_timezone())

        window_start = schedule_start + timedelta(minutes=settings.ATTENDANCE_WINDOW_START)
        window_end = schedule_start + timedelta(minutes=settings.ATTENDANCE_WINDOW_END)

        if now < window_start:
            return None, f"El registro aún no está disponible (desde {window_start.strftime('%H:%M')})"
        if now > window_end:
            if now > schedule_end:
                return None, "La clase ya terminó"
            return None, "Fuera del horario de registro permitido"

        return schedule, None
