from django.db import transaction
from django.conf import settings
from apps.accounts.models import User
from apps.accounts.services import AuthService, UserService
from .models import Student, StudentSubject


class StudentService:
    @staticmethod
    @transaction.atomic
    def create_student(data):
        image_file = data.pop("reference_image", None)
        user_data = {
            "cedula": data.pop("cedula"),
            "nombres": data.pop("nombres"),
            "apellidos": data.pop("apellidos"),
            "email": data.pop("email"),
            "telefono": data.pop("telefono", ""),
            "role": User.Role.STUDENT,
        }
        password = AuthService.generate_temp_password()
        user = User.objects.create_user(**user_data, password=password)
        user.password_change_required = True
        user.is_active = False
        user.save()
        student = Student.objects.create(
            user=user,
            career_id=data["career_id"],
            nivel=data["nivel"],
        )
        if image_file:
            from cloud.s3 import upload_student_image
            from cloud.rekognition import index_face
            url = upload_student_image(image_file, student.id)
            student.reference_image_url = url
            face_id = index_face(url, student.id)
            student.rekognition_face_id = face_id
            student.save()
        from apps.accounts.activation import enviar_correo_activacion
        enviar_correo_activacion(user, password)
        return student

    @staticmethod
    @transaction.atomic
    def update_student(student, data):
        image_file = data.pop("reference_image", None)
        user = student.user
        user_fields = ["nombres", "apellidos", "telefono"]
        for field in user_fields:
            if field in data:
                setattr(user, field, data.pop(field))
        user.save()
        student_fields = ["career_id", "nivel"]
        for field in student_fields:
            if field in data:
                setattr(student, field, data[field])
        student.save()
        if image_file:
            from cloud.s3 import upload_student_image
            from cloud.rekognition import update_face
            url = upload_student_image(image_file, student.id)
            student.reference_image_url = url
            update_face(url, student.rekognition_face_id)
            student.save()
        return student

    @staticmethod
    @transaction.atomic
    def deactivate_student(student_id, motivo, admin_user):
        student = Student.objects.get(id=student_id)
        student.is_active = False
        student.user.is_active = False
        student.save(update_fields=["is_active"])
        student.user.save(update_fields=["is_active"])
        from apps.accounts.models import AuditLog
        AuditLog.objects.create(
            user=admin_user,
            action="DESACTIVAR_ESTUDIANTE",
            entity_type="Student",
            entity_id=str(student.id),
            new_value={"motivo": motivo},
        )
        return student

    @staticmethod
    def search_students(query):
        from django.db.models import Q
        words = query.strip().split()
        if len(words) >= 2:
            filters = (
                Q(user__nombres__icontains=words[0]) & Q(user__apellidos__icontains=words[1])
            ) | (
                Q(user__nombres__icontains=words[1]) & Q(user__apellidos__icontains=words[0])
            )
            for word in words:
                filters |= Q(user__cedula__icontains=word)
        else:
            filters = (
                Q(user__cedula__icontains=query) |
                Q(user__nombres__icontains=query) |
                Q(user__apellidos__icontains=query) |
                Q(career__name__icontains=query)
            )
        return Student.objects.filter(filters).select_related("user", "career")
