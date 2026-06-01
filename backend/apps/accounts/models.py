from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El correo electrónico es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrador"
        TEACHER = "TEACHER", "Docente"
        STUDENT = "STUDENT", "Estudiante"

    email = models.EmailField(unique=True, verbose_name="Correo institucional")
    cedula = models.CharField(max_length=13, unique=True, verbose_name="Cédula")
    nombres = models.CharField(max_length=100, verbose_name="Nombres")
    apellidos = models.CharField(max_length=100, verbose_name="Apellidos")
    telefono = models.CharField(max_length=20, blank=True, verbose_name="Teléfono")
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT, verbose_name="Rol")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    is_staff = models.BooleanField(default=False)
    password_change_required = models.BooleanField(default=False, verbose_name="Cambio de contraseña requerido")
    failed_login_attempts = models.IntegerField(default=0, verbose_name="Intentos fallidos")
    blocked_until = models.DateTimeField(null=True, blank=True, verbose_name="Bloqueado hasta")
    profile_picture = models.URLField(blank=True, verbose_name="Foto de perfil")
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de registro")

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["cedula", "nombres", "apellidos"]

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return f"{self.nombres} {self.apellidos} ({self.email})"


class PasswordHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_histories")
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Historial de contraseña"
        verbose_name_plural = "Historial de contraseñas"
        ordering = ["-created_at"]


class PasswordRecoveryToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recovery_tokens")
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Token de recuperación"
        verbose_name_plural = "Tokens de recuperación"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100, verbose_name="Acción")
    entity_type = models.CharField(max_length=50, verbose_name="Tipo de entidad")
    entity_id = models.CharField(max_length=50, blank=True, verbose_name="ID de entidad")
    old_value = models.JSONField(null=True, blank=True, verbose_name="Valor anterior")
    new_value = models.JSONField(null=True, blank=True, verbose_name="Valor nuevo")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Registro de auditoría"
        verbose_name_plural = "Registros de auditoría"
        ordering = ["-created_at"]
