from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdminOrTeacher, IsAdmin
from apps.students.models import Student
from apps.reports.services import ReportService


class ReportViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def student(self, request):
        user = request.user
        student_id = request.query_params.get("student_id")
        subject_id = request.query_params.get("subject_id")
        period = request.query_params.get("period")

        if user.role == "STUDENT":
            try:
                student_id = user.student_profile.id
            except Exception:
                return Response({"detail": "Perfil no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        elif user.role == "TEACHER" and not student_id:
            return Response({"detail": "student_id requerido"}, status=status.HTTP_400_BAD_REQUEST)

        report = ReportService.generate_student_report(student_id, subject_id, period)
        return Response(report)

    @action(detail=False, methods=["get"])
    def subject(self, request):
        subject_id = request.query_params.get("subject_id")
        period = request.query_params.get("period")
        if not subject_id:
            return Response({"detail": "subject_id requerido"}, status=status.HTTP_400_BAD_REQUEST)
        report = ReportService.generate_subject_report(subject_id, period)
        return Response(report)

    @action(detail=False, methods=["get"], permission_classes=[IsAdminOrTeacher])
    def teacher(self, request):
        user = request.user
        teacher_id = request.query_params.get("teacher_id", user.id if user.role == "TEACHER" else None)
        period = request.query_params.get("period")
        if not teacher_id:
            return Response({"detail": "teacher_id requerido"}, status=status.HTTP_400_BAD_REQUEST)
        report = ReportService.generate_teacher_report(teacher_id, period)
        return Response(report)

    @action(detail=False, methods=["get"], permission_classes=[IsAdmin])
    def period(self, request):
        period = request.query_params.get("period")
        if not period:
            return Response({"detail": "period requerido"}, status=status.HTTP_400_BAD_REQUEST)
        report = ReportService.generate_period_report(period)
        return Response(report)

    @action(detail=False, methods=["get"])
    def export_pdf(self, request):
        report_type = request.query_params.get("type", "subject")
        subject_id = request.query_params.get("subject_id")
        period = request.query_params.get("period")
        student_id = request.query_params.get("student_id")

        if report_type == "subject" and subject_id:
            report = ReportService.generate_subject_report(subject_id, period)
            title = f"Reporte de Asistencia - {report['subject']['name']}"
        elif report_type == "student" and student_id:
            report = ReportService.generate_student_report(student_id, period=period)
            title = f"Reporte de {report['student']['nombres']}"
        else:
            return Response({"detail": "Parámetros insuficientes"}, status=status.HTTP_400_BAD_REQUEST)

        pdf_buffer = ReportService.export_to_pdf(report, title)
        return Response(pdf_buffer.getvalue(), content_type="application/pdf",
                        headers={"Content-Disposition": f"attachment; filename={report_type}_report.pdf"})

    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        report_type = request.query_params.get("type", "subject")
        subject_id = request.query_params.get("subject_id")
        period = request.query_params.get("period")
        student_id = request.query_params.get("student_id")

        if report_type == "subject" and subject_id:
            report = ReportService.generate_subject_report(subject_id, period)
            sheet_name = report["subject"]["name"][:31]
        elif report_type == "student" and student_id:
            report = ReportService.generate_student_report(student_id, period=period)
            sheet_name = f"Estudiante_{student_id}"
        else:
            return Response({"detail": "Parámetros insuficientes"}, status=status.HTTP_400_BAD_REQUEST)

        excel_buffer = ReportService.export_to_excel(report, sheet_name)
        return Response(excel_buffer.getvalue(),
                        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        headers={"Content-Disposition": f"attachment; filename={report_type}_report.xlsx"})
