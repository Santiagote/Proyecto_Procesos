from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from .models import Student, Career, Subject, StudentSubject
from .serializers import (
    StudentSerializer, StudentCreateSerializer, StudentUpdateSerializer,
    CareerSerializer, SubjectSerializer, SubjectListSerializer, StudentSubjectSerializer,
)
from .services import StudentService
from apps.accounts.permissions import IsAdmin, IsAdminOrTeacher


class CareerViewSet(ModelViewSet):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class SubjectViewSet(ModelViewSet):
    queryset = Subject.objects.all()
    permission_classes = [IsAuthenticated, IsAdminOrTeacher]

    def get_serializer_class(self):
        if self.action == "list":
            return SubjectListSerializer
        return SubjectSerializer

    def get_queryset(self):
        qs = Subject.objects.all()
        if self.request.user.role == "TEACHER":
            qs = qs.filter(teachers=self.request.user)
        return qs


class StudentViewSet(ModelViewSet):
    queryset = Student.objects.filter(is_active=True).select_related("user", "career")
    permission_classes = [IsAuthenticated, IsAdminOrTeacher]

    def get_serializer_class(self):
        if self.action == "create":
            return StudentCreateSerializer
        if self.action in ("update", "partial_update"):
            return StudentUpdateSerializer
        return StudentSerializer

    def create(self, request, *args, **kwargs):
        serializer = StudentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            student = StudentService.create_student(serializer.validated_data)
            return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            error_str = str(e)
            if 'cedula' in error_str:
                return Response(
                    {"detail": "Ya existe un estudiante registrado con esa cédula."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif 'email' in error_str:
                return Response(
                    {"detail": "Ya existe un usuario registrado con ese correo electrónico."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"detail": "Ya existe un estudiante con esos datos. Verifica la cédula y el correo."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = StudentUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            student = StudentService.update_student(instance, serializer.validated_data)
            return Response(StudentSerializer(student).data)
        except IntegrityError as e:
            error_str = str(e)
            if 'cedula' in error_str:
                return Response(
                    {"detail": "Ya existe un estudiante con esa cédula."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif 'email' in error_str:
                return Response(
                    {"detail": "Ya existe un usuario con ese correo electrónico."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"detail": "Error de datos duplicados. Verifica la información ingresada."},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=["get"])
    def search(self, request):
        query = request.query_params.get("q", "")
        if len(query) < 2:
            return Response({"detail": "Mínimo 2 caracteres"}, status=status.HTTP_400_BAD_REQUEST)
        students = StudentService.search_students(query)
        page = self.paginate_queryset(students)
        if page is not None:
            serializer = StudentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(StudentSerializer(students, many=True).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def deactivate(self, request, pk=None):
        motivo = request.data.get("motivo", "")
        if not motivo:
            return Response({"detail": "El motivo es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)
        student = StudentService.deactivate_student(pk, motivo, request.user)
        return Response(StudentSerializer(student).data)

    @action(detail=True, methods=["get"])
    def subjects(self, request, pk=None):
        student = self.get_object()
        enrollments = StudentSubject.objects.filter(student=student)
        serializer = StudentSubjectSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def enroll(self, request, pk=None):
        student = self.get_object()
        subject_id = request.data.get("subject_id")
        period = request.data.get("academic_period")
        if not subject_id or not period:
            return Response({"detail": "subject_id y academic_period son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)
        enrollment, created = StudentSubject.objects.get_or_create(
            student=student, subject_id=subject_id, academic_period=period
        )
        if not created:
            return Response({"detail": "Ya inscrito"}, status=status.HTTP_409_CONFLICT)
        return Response(StudentSubjectSerializer(enrollment).data, status=status.HTTP_201_CREATED)
