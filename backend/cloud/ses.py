import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def _send_email(to_email, subject, body_html):
    try:
        headers = {
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
        }
        payload = {
            "sender": {"name": "SACARF", "email": settings.BREVO_SOURCE_EMAIL},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": body_html,
        }
        response = requests.post(BREVO_API_URL, json=payload, headers=headers, timeout=10)
        if response.status_code in (200, 201):
            logger.info(f"Correo enviado a {to_email}: {subject}")
            return True
        else:
            logger.error(f"Error Brevo {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error enviando correo a {to_email}: {e}")
        return False


def send_credentials_email(to_email, temp_password):
    subject = "Credenciales de acceso - SACARF"
    body = f"""
    <h2>Bienvenido al Sistema SACARF</h2>
    <p>Tu cuenta ha sido creada exitosamente.</p>
    <p><b>Correo:</b> {to_email}</p>
    <p><b>Contraseña temporal:</b> <code>{temp_password}</code></p>
    <p>Por seguridad, debes cambiar tu contraseña en el primer inicio de sesión.</p>
    """
    return _send_email(to_email, subject, body)


def send_attendance_confirmation(to_email, student_name, subject_name, teacher_name, date):
    subject = "Asistencia registrada - SACARF"
    body = f"""
    <h2>Asistencia Registrada</h2>
    <p>Hola <b>{student_name}</b>,</p>
    <p>Tu asistencia ha sido registrada correctamente:</p>
    <ul>
        <li><b>Asignatura:</b> {subject_name}</li>
        <li><b>Docente:</b> {teacher_name}</li>
        <li><b>Fecha/Hora:</b> {date.strftime('%d/%m/%Y %H:%M')}</li>
    </ul>
    <p>Estado: <b style="color:green">Presente</b></p>
    """
    return _send_email(to_email, subject, body)


def send_recovery_email(to_email, token):
    subject = "Recuperación de contraseña - SACARF"
    recovery_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
    body = f"""
    <h2>Recuperación de Contraseña</h2>
    <p>Has solicitado restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente enlace (válido por 30 minutos):</p>
    <p><a href="{recovery_url}">{recovery_url}</a></p>
    <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    """
    return _send_email(to_email, subject, body)


def send_password_changed_email(to_email):
    subject = "Contraseña actualizada - SACARF"
    body = """
    <h2>Contraseña Actualizada</h2>
    <p>Tu contraseña ha sido cambiada exitosamente.</p>
    <p>Si no realizaste este cambio, contacta al administrador inmediatamente.</p>
    """
    return _send_email(to_email, subject, body)


def send_account_status_email(to_email, status, motivo):
    subject = f"Cuenta {status} - SACARF"
    motivo_html = f"<p><b>Motivo:</b> {motivo}</p>" if motivo else ""
    body = f"""
    <h2>Estado de tu Cuenta</h2>
    <p>Tu cuenta ha sido <b>{status}</b>.</p>
    {motivo_html}
    <p>Si tienes dudas, contacta al administrador del sistema.</p>
    """
    return _send_email(to_email, subject, body)


def send_activation_email(to_email, nombres, activation_url, temp_password):
    subject = "Activa tu cuenta - SACARF"
    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a237e; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">📷 SACARF</h1>
            <p style="color: #90caf9; margin: 5px 0;">Sistema de Control de Asistencia</p>
        </div>
        <div style="padding: 30px; background-color: #f5f5f5;">
            <h2>¡Bienvenido/a, {nombres}!</h2>
            <p>Tu cuenta ha sido creada en el sistema SACARF. Para comenzar, debes activar tu cuenta haciendo clic en el botón de abajo.</p>

            <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p><strong>📧 Correo:</strong> {to_email}</p>
                <p><strong>🔑 Contraseña temporal:</strong> <code style="background:#eee; padding:3px 8px; border-radius:4px;">{temp_password}</code></p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{activation_url}"
                   style="background-color: #1a237e; color: white; padding: 14px 30px;
                          text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                    ✅ Activar mi cuenta
                </a>
            </div>

            <p style="color: #666; font-size: 13px;">
                ⚠️ Este enlace expira en <strong>24 horas</strong>.<br>
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="{activation_url}">{activation_url}</a>
            </p>

            <p style="color: #666; font-size: 13px;">
                🔐 Por seguridad, te pediremos cambiar tu contraseña al iniciar sesión por primera vez.
            </p>
        </div>
        <div style="background-color: #e0e0e0; padding: 10px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">© 2026 SACARF - Universidad Nacional de Loja</p>
        </div>
    </div>
    """
    return _send_email(to_email, subject, body)
