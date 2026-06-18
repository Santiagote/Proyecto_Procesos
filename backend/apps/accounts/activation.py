import secrets
from django.utils import timezone
from datetime import timedelta
from .models import AccountActivationToken, User
from django.conf import settings
from cloud.ses import send_activation_email


def crear_token_activacion(user):
    """Crea un token de activación para el usuario."""
    AccountActivationToken.objects.filter(user=user).delete()
    token = secrets.token_urlsafe(48)
    expires_at = timezone.now() + timedelta(hours=24)
    AccountActivationToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at,
    )
    return token


def enviar_correo_activacion(user, temp_password):
    """Envía el correo de activación al usuario."""
    token = crear_token_activacion(user)
    activation_url = f"{settings.FRONTEND_URL}/activate?token={token}"
    send_activation_email(
        to_email=user.email,
        nombres=user.nombres,
        activation_url=activation_url,
        temp_password=temp_password,
    )
    return token


def activar_cuenta(token):
    """Activa la cuenta del usuario con el token dado."""
    try:
        activation = AccountActivationToken.objects.select_related('user').get(
            token=token,
            is_used=False,
        )
    except AccountActivationToken.DoesNotExist:
        return None, "Token inválido o ya utilizado."

    if timezone.now() > activation.expires_at:
        return None, "El enlace de activación ha expirado. Contacta al administrador."

    user = activation.user
    user.is_verified = True
    user.is_active = True
    user.save(update_fields=['is_verified', 'is_active'])

    activation.is_used = True
    activation.save(update_fields=['is_used'])

    return user, None
