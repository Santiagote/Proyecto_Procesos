import logging
from django.conf import settings
from django.utils import timezone
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def get_ses_client():
    return boto3.client(
        "ses",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def _send_email(to_email, subject, body_html):
    try:
        client = get_ses_client()
        client.send_email(
            Source=settings.AWS_SES_SOURCE_EMAIL,
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Html": {"Data": body_html, "Charset": "UTF-8"}},
            },
        )
        logger.info(f"Correo enviado a {to_email}: {subject}")
        return True
    except ClientError as e:
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
    recovery_url = f"https://sacar.app/reset-password?token={token}"
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
