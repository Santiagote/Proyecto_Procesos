import io
from datetime import datetime
from django.utils import timezone
from django.db.models import Count, Q
from django.http import HttpResponse
from apps.students.models import Student, Subject
from apps.attendance.models import AttendanceRecord
from apps.schedules.models import Schedule


class ReportService:
    @staticmethod
    def generate_student_report(student_id, subject_id=None, period=None):
        student = Student.objects.select_related("user", "career").get(id=student_id)
        records = AttendanceRecord.objects.filter(student=student)
        if subject_id:
            records = records.filter(subject_id=subject_id)
        if period:
            records = records.filter(schedule__academic_period=period)

        total = records.count()
        present = records.filter(status="PRESENT").count()
        absent = records.filter(status="ABSENT").count()
        justified = records.filter(status="JUSTIFIED").count()
        percentage = round((present / total * 100) if total > 0 else 0, 2)

        return {
            "student": {
                "id": student.id,
                "nombres": f"{student.user.nombres} {student.user.apellidos}",
                "cedula": student.user.cedula,
                "email": student.user.email,
                "carrera": student.career.name if student.career else "",
                "nivel": student.nivel,
            },
            "summary": {
                "total_sessions": total,
                "present": present,
                "absent": absent,
                "justified": justified,
                "percentage": percentage,
            },
            "details": AttendanceRecord.objects.filter(
                id__in=records.values("id")
            ).select_related("subject", "schedule").order_by("-recorded_at").values(
                "recorded_at", "status", "subject__name", "schedule__start_time"
            ),
        }

    @staticmethod
    def generate_subject_report(subject_id, period=None):
        subject = Subject.objects.get(id=subject_id)
        students = Student.objects.filter(enrolled_subjects__subject=subject)
        if period:
            students = students.filter(enrolled_subjects__academic_period=period)

        total_sessions = Schedule.objects.filter(subject=subject, is_active=True).count()

        students_data = []
        for student in students:
            records = AttendanceRecord.objects.filter(student=student, subject=subject)
            if period:
                records = records.filter(schedule__academic_period=period)
            total = records.count()
            present = records.filter(status="PRESENT").count()
            absent = records.filter(status="ABSENT").count()
            justified = records.filter(status="JUSTIFIED").count()
            pct = round((present / total * 100) if total > 0 else 0, 2)
            students_data.append({
                "student_id": student.id,
                "nombres": f"{student.user.nombres} {student.user.apellidos}",
                "cedula": student.user.cedula,
                "total": total,
                "present": present,
                "absent": absent,
                "justified": justified,
                "percentage": pct,
            })

        return {
            "subject": {"id": subject.id, "name": subject.name, "code": subject.code},
            "period": period or "Todos",
            "total_sessions": total_sessions,
            "enrolled": len(students_data),
            "students": students_data,
        }

    @staticmethod
    def generate_teacher_report(teacher_id, period=None):
        subjects = Subject.objects.filter(teachers__id=teacher_id)
        report = []
        for subject in subjects:
            data = ReportService.generate_subject_report(subject.id, period)
            report.append({
                "subject": data["subject"],
                "summary": {
                    "total_sessions": data["total_sessions"],
                    "enrolled": data["enrolled"],
                },
            })
        return {"teacher_id": teacher_id, "subjects": report}

    @staticmethod
    def generate_period_report(period):
        subjects = Subject.objects.all()
        report = []
        for subject in subjects:
            data = ReportService.generate_subject_report(subject.id, period)
            report.append(data)
        return {"period": period, "subjects": report}

    @staticmethod
    def export_to_pdf(report_data, title):
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            styles = getSampleStyleSheet()
            elements = []

            elements.append(Paragraph(f"<b>{title}</b>", styles["Title"]))
            elements.append(Spacer(1, 12))
            elements.append(Paragraph(f"Generado: {timezone.now().strftime('%d/%m/%Y %H:%M')}", styles["Normal"]))
            elements.append(Spacer(1, 20))

            students = report_data.get("students", [])
            if students:
                data = [["Estudiante", "Cédula", "Presentes", "Ausentes", "Justificados", "% Asistencia"]]
                for s in students:
                    data.append([
                        s["nombres"], s["cedula"], s["present"],
                        s["absent"], s["justified"], f"{s['percentage']}%",
                    ])
                table = Table(data)
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]))
                elements.append(table)

            doc.build(elements)
            buffer.seek(0)
            return buffer
        except ImportError:
            raise Exception("ReportLab no está instalado. Usa: pip install reportlab")

    @staticmethod
    def export_to_excel(report_data, sheet_name):
        try:
            import openpyxl
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = sheet_name[:31]

            headers = ["Estudiante", "Cédula", "Total Sesiones", "Presentes", "Ausentes", "Justificados", "% Asistencia"]
            ws.append(headers)

            for s in report_data.get("students", []):
                ws.append([
                    s["nombres"],
                    s["cedula"],
                    s["total"],
                    s["present"],
                    s["absent"],
                    s["justified"],
                    s["percentage"],
                ])

            buffer = io.BytesIO()
            wb.save(buffer)
            buffer.seek(0)
            return buffer
        except ImportError:
            raise Exception("openpyxl no está instalado. Usa: pip install openpyxl")
