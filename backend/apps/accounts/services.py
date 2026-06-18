import secrets
import string
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, PasswordHistory, PasswordRecoveryToken, AuditLog


class AuthService:
    @staticmethod
    def authenticate(email, password):
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return None

        if not user.is_active:
            raise Exception("Tu cuenta está desactivada. Contacta al administrador.")

        if user.blocked_until and user.blocked_until > timezone.now():
            minutos_restantes = int((user.blocked_until - timezone.now()).total_seconds() / 60) + 1
            raise Exception(f"Cuenta bloqueada. Intenta nuevamente en {minutos_restantes} minuto(s).")
        if user.blocked_until and user.blocked_until <= timezone.now():
            user.blocked_until = None
            user.failed_login_attempts = 0
            user.save(update_fields=["failed_login_attempts", "blocked_until"])

        if user.check_password(password):
            user.failed_login_attempts = 0
            user.save(update_fields=["failed_login_attempts"])
            return user
        else:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                user.blocked_until = timezone.now() + timedelta(minutes=settings.ACCOUNT_BLOCK_MINUTES)
                user.save(update_fields=["failed_login_attempts", "blocked_until"])
                raise Exception(f"Cuenta bloqueada por {settings.ACCOUNT_BLOCK_MINUTES} minutos por demasiados intentos fallidos.")
            user.save(update_fields=["failed_login_attempts", "blocked_until"])
            intentos_restantes = settings.MAX_LOGIN_ATTEMPTS - user.failed_login_attempts
            raise Exception(f"Credenciales inválidas. Te quedan {intentos_restantes} intento(s) antes de que tu cuenta sea bloqueada.")

    @staticmethod
    def get_tokens_for_user(user):
        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role
        refresh["email"] = user.email
        refresh["nombres"] = user.nombres
        refresh["apellidos"] = user.apellidos
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    @staticmethod
    def blacklist_refresh_token(refresh_token):
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass

    @staticmethod
    def generate_temp_password():
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return "".join(secrets.choice(alphabet) for _ in range(12))


class UserService:
    @staticmethod
    @transaction.atomic
    def create_user(data):
        password = data.pop("password", None)
        if not password:
            password = AuthService.generate_temp_password()
        user = User(**data)
        user.set_password(password)
        user.password_change_required = True
        user.is_active = False
        user.save()
        PasswordHistory.objects.create(user=user, password_hash=user.password)
        from apps.accounts.activation import enviar_correo_activacion
        enviar_correo_activacion(user, password)
        return user

    @staticmethod
    def deactivate_user(user_id, motivo, admin_user):
        user = User.objects.get(id=user_id)
        if user == admin_user:
            raise Exception("No puedes desactivar tu propia cuenta")
        old_active = user.is_active
        user.is_active = False
        user.save(update_fields=["is_active"])
        AuditLog.objects.create(
            user=admin_user,
            action="DESACTIVAR_USUARIO",
            entity_type="User",
            entity_id=str(user.id),
            old_value={"is_active": old_active},
            new_value={"is_active": False, "motivo": motivo},
        )
        from cloud.ses import send_account_status_email
        send_account_status_email(user.email, "desactivada", motivo)
        return user

    @staticmethod
    def reactivate_user(user_id, admin_user):
        user = User.objects.get(id=user_id)
        old_active = user.is_active
        user.is_active = True
        user.failed_login_attempts = 0
        user.blocked_until = None
        user.save(update_fields=["is_active", "failed_login_attempts", "blocked_until"])
        AuditLog.objects.create(
            user=admin_user,
            action="REACTIVAR_USUARIO",
            entity_type="User",
            entity_id=str(user.id),
            old_value={"is_active": old_active},
            new_value={"is_active": True},
        )
        from cloud.ses import send_account_status_email
        send_account_status_email(user.email, "reactivada", "")
        return user


class PasswordService:
    @staticmethod
    @transaction.atomic
    def change_password(user, current_password, new_password):
        if not check_password(current_password, user.password):
            raise Exception("Contraseña actual incorrecta")
        PasswordService._check_password_history(user, new_password)
        PasswordService._check_password_policy(new_password)
        user.set_password(new_password)
        user.password_change_required = False
        user.save()
        PasswordHistory.objects.create(user=user, password_hash=user.password)
        AuditLog.objects.create(
            user=user,
            action="CAMBIAR_CONTRASENA",
            entity_type="User",
            entity_id=str(user.id),
        )
        from cloud.ses import send_password_changed_email
        send_password_changed_email(user.email)
        return user

    @staticmethod
    def _check_password_history(user, new_password):
        recent = PasswordHistory.objects.filter(user=user).order_by("-created_at")[:settings.PASSWORD_HISTORY_COUNT]
        for entry in recent:
            if check_password(new_password, entry.password_hash):
                raise Exception(f"No puedes reutilizar las últimas {settings.PASSWORD_HISTORY_COUNT} contraseñas")

    @staticmethod
    def _check_password_policy(password):
        import re
        if len(password) < 8:
            raise Exception("Mínimo 8 caracteres")
        if not re.search(r"[A-Z]", password):
            raise Exception("Debe contener al menos una mayúscula")
        if not re.search(r"\d", password):
            raise Exception("Debe contener al menos un número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            raise Exception("Debe contener al menos un carácter especial")

    @staticmethod
    def generate_recovery_token(user):
        import hashlib
        import uuid
        raw = uuid.uuid4().hex + str(user.id) + str(timezone.now())
        token = hashlib.sha256(raw.encode()).hexdigest()
        expires = timezone.now() + timedelta(minutes=settings.PASSWORD_RECOVERY_TOKEN_MINUTES)
        PasswordRecoveryToken.objects.create(user=user, token=token, expires_at=expires)
        return token

    @staticmethod
    @transaction.atomic
    def reset_password(token, new_password):
        try:
            recovery = PasswordRecoveryToken.objects.get(token=token, is_used=False, expires_at__gt=timezone.now())
        except PasswordRecoveryToken.DoesNotExist:
            raise Exception("Token inválido o expirado")
        PasswordService._check_password_policy(new_password)
        PasswordService._check_password_history(recovery.user, new_password)
        recovery.user.set_password(new_password)
        recovery.user.password_change_required = False
        recovery.user.save()
        recovery.is_used = True
        recovery.save()
        PasswordHistory.objects.create(user=recovery.user, password_hash=recovery.user.password)
        return recovery.user
