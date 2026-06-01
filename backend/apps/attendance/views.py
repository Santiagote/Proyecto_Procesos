import logging
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.accounts.permissions import IsAdmin, IsAdminOrTeacher
from apps.students.models import Student
from apps.schedules.services import ScheduleService
from apps.attendance.models import AttendanceRecord, AttendanceException
from apps.attendance.serializers import (
    AttendanceRecordSerializer, AttendanceCaptureSerializer,
    AttendanceExceptionSerializer, AttendanceExceptionCreateSerializer,
)
from apps.attendance.services import AttendanceService

logger = logging.getLogger(__name__)


class AttendanceViewSet(GenericViewSet):
    queryset = AttendanceRecord.objects.select_related("student__user", "subject", "teacher", "schedule").all()
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == "capture":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "capture":
            return AttendanceCaptureSerializer
        return AttendanceRecordSerializer

    @action(detail=False, methods=["post"])
    def capture(self, request):
        serializer = AttendanceCaptureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image_file = serializer.validated_data["image"]
        ip_address = request.META.get("REMOTE_ADDR")

        try:
            from cloud.rekognition import search_face
            result = search_face(image_file)

            if not result["matched"]:
                return Response(
                    {"detail": "No se pudo reconocer el rostro. Intenta nuevamente o contacta al docente."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            student_id = result["student_id"]
            confidence = result["confidence"]

            if confidence < 90.0:
                return Response(
                    {"detail": f"Confianza baja ({confidence:.1f}%). Intenta con mejor iluminación."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            student = Student.objects.select_related("user").get(id=student_id, is_active=True)

            schedule, error = ScheduleService.get_active_session(student)
            if error:
                return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

            attendance, created = AttendanceService.register_attendance(
                student, schedule, confidence=confidence, ip_address=ip_address
            )

            if not created:
                return Response({
                    "detail": "Tu asistencia ya fue registrada para esta sesión",
                    "attendance": AttendanceRecordSerializer(attendance).data,
                })

            from cloud.ses import send_attendance_confirmation
            send_attendance_confirmation(
                student.user.email,
                student_name=f"{student.user.nombres} {student.user.apellidos}",
                subject_name=schedule.subject.name,
                teacher_name=f"{schedule.teacher.nombres} {schedule.teacher.apellidos}",
                date=attendance.recorded_at,
            )

            return Response({
                "detail": "Asistencia registrada correctamente",
                "attendance": AttendanceRecordSerializer(attendance).data,
            })

        except Student.DoesNotExist:
            return Response({"detail": "Estudiante no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("Error en captura de asistencia")
            return Response({"detail": f"Error del sistema: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["get"])
    def history(self, request):
        user = request.user
        if user.role == "STUDENT":
            try:
                student = user.student_profile
            except Student.DoesNotExist:
                return Response({"detail": "Perfil de estudiante no encontrado"}, status=status.HTTP_404_NOT_FOUND)
            records = AttendanceService.get_student_attendance_history(
                student,
                subject_id=request.query_params.get("subject_id"),
                period=request.query_params.get("period"),
            )
        elif user.role == "TEACHER":
            records = AttendanceRecord.objects.filter(teacher=user)
        else:
            records = AttendanceRecord.objects.all()

        page = self.paginate_queryset(records)
        if page is not None:
            serializer = AttendanceRecordSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(AttendanceRecordSerializer(records, many=True).data)


class ExceptionViewSet(GenericViewSet):
    queryset = AttendanceException.objects.select_related("student__user", "modified_by").all()
    permission_classes = [IsAuthenticated, IsAdminOrTeacher]
    serializer_class = AttendanceExceptionSerializer

    @action(detail=False, methods=["post"])
    def justify(self, request):
        serializer = AttendanceExceptionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            exception = AttendanceService.create_exception(serializer.validated_data, request.user)
            return Response(AttendanceExceptionSerializer(exception).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def audit(self, request):
        records = self.queryset
        if request.user.role == "TEACHER":
            records = records.filter(attendance_record__teacher=request.user)
        page = self.paginate_queryset(records)
        if page is not None:
            serializer = AttendanceExceptionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(AttendanceExceptionSerializer(records, many=True).data)
