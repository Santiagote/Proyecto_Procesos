from django.db import models
from django.utils.text import slugify
from apps.accounts.models import User


class Career(models.Model):
    name = models.CharField(max_length=100, verbose_name="Carrera")
    code = models.CharField(max_length=10, unique=True, verbose_name="Código")

    class Meta:
        verbose_name = "Carrera"
        verbose_name_plural = "Carreras"

    def _generate_code(self):
        base_code = "".join(character for character in slugify(self.name).upper() if character.isalnum())[:10]
        if not base_code:
            base_code = "CAREER"

        code = base_code
        suffix = 1
        while Career.objects.exclude(pk=self.pk).filter(code=code).exists():
            suffix_text = str(suffix)
            code = f"{base_code[:10 - len(suffix_text)]}{suffix_text}"
            suffix += 1
        return code

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self._generate_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=100, verbose_name="Asignatura")
    code = models.CharField(max_length=10, unique=True, verbose_name="Código")
    career = models.ForeignKey(Career, on_delete=models.CASCADE, related_name="subjects", verbose_name="Carrera")
    teachers = models.ManyToManyField(User, related_name="subjects", limit_choices_to={"role": "TEACHER"}, verbose_name="Docentes")

    class Meta:
        verbose_name = "Asignatura"
        verbose_name_plural = "Asignaturas"

    def __str__(self):
        return f"{self.name} ({self.code})"


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile", verbose_name="Usuario")
    career = models.ForeignKey(Career, on_delete=models.SET_NULL, null=True, related_name="students", verbose_name="Carrera")
    nivel = models.IntegerField(verbose_name="Nivel")
    reference_image_url = models.URLField(blank=True, verbose_name="URL imagen de referencia")
    rekognition_face_id = models.CharField(max_length=100, blank=True, verbose_name="Face ID en Rekognition")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Estudiante"
        verbose_name_plural = "Estudiantes"

    def __str__(self):
        return f"{self.user.nombres} {self.user.apellidos} - {self.career}"


class StudentSubject(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="enrolled_subjects")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="enrolled_students")
    academic_period = models.CharField(max_length=20, verbose_name="Período académico")

    class Meta:
        verbose_name = "Inscripción"
        verbose_name_plural = "Inscripciones"
        unique_together = ("student", "subject", "academic_period")

    def __str__(self):
        return f"{self.student} -> {self.subject}"
