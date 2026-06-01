import logging
from django.db import transaction
from django.utils import timezone
from apps.students.models import Student
from apps.attendance.models import AttendanceRecord, AttendanceException

logger = logging.getLogger(__name__)


class AttendanceService:
    @staticmethod
    @transaction.atomic
    def register_attendance(student, schedule, confidence=None, ip_address=None):
        record, created = AttendanceRecord.objects.get_or_create(
            student=student,
            schedule=schedule,
            defaults={
                "subject": schedule.subject,
                "teacher": schedule.teacher,
                "status": AttendanceRecord.Status.PRESENT,
                "confidence": confidence,
                "ip_address": ip_address,
                "registered_by": "SYSTEM",
            },
        )
        if not created:
            return record, False
        return record, True

    @staticmethod
    def has_duplicate(student, schedule):
        return AttendanceRecord.objects.filter(student=student, schedule=schedule).exists()

    @staticmethod
    @transaction.atomic
    def create_exception(data, modified_by):
        student = Student.objects.get(id=data["student_id"])
        schedule_id = data["schedule_id"]

        record = None
        if data.get("attendance_record_id"):
            record = AttendanceRecord.objects.get(id=data["attendance_record_id"])
            previous_status = record.status
            record.status = data["new_status"]
            record.registered_by = "MANUAL"
            record.save()
        else:
            record, _ = AttendanceRecord.objects.get_or_create(
                student=student,
                schedule_id=schedule_id,
                defaults={
                    "subject_id": schedule_id,
                    "teacher_id": 1,
                    "status": data["new_status"],
                    "registered_by": "MANUAL",
                },
            )
            previous_status = record.status

        exception = AttendanceException.objects.create(
            attendance_record=record,
            student=student,
            schedule_id=schedule_id,
            previous_status=previous_status,
            new_status=data["new_status"],
            reason=data["reason"],
            modified_by=modified_by,
        )

        return exception

    @staticmethod
    def get_student_attendance_history(student, subject_id=None, period=None):
        qs = AttendanceRecord.objects.filter(student=student)
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if period:
            qs = qs.filter(schedule__academic_period=period)
        return qs.select_related("subject", "schedule").order_by("-recorded_at")

    @staticmethod
    def get_subject_attendance_summary(subject_id, period=None):
        records = AttendanceRecord.objects.filter(subject_id=subject_id)
        if period:
            records = records.filter(schedule__academic_period=period)

        total_sessions = records.values("schedule").distinct().count()
        students_data = []

        for student in Student.objects.filter(enrolled_subjects__subject_id=subject_id).distinct():
            student_records = records.filter(student=student)
            total = student_records.count()
            present = student_records.filter(status="PRESENT").count()
            absent = student_records.filter(status="ABSENT").count()
            justified = student_records.filter(status="JUSTIFIED").count()
            percentage = (present / total * 100) if total > 0 else 0

            students_data.append({
                "student_id": student.id,
                "student_name": f"{student.user.nombres} {student.user.apellidos}",
                "cedula": student.user.cedula,
                "total_sessions": total,
                "present": present,
                "absent": absent,
                "justified": justified,
                "percentage": round(percentage, 2),
            })

        return {
            "subject_id": subject_id,
            "total_sessions": total_sessions,
            "enrolled_students": len(students_data),
            "students": students_data,
        }
