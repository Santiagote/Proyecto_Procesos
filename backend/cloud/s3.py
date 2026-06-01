import uuid
import logging
from django.conf import settings
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def get_s3_client():
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def upload_student_image(image_file, student_id):
    client = get_s3_client()
    ext = "jpg"
    if hasattr(image_file, "name") and image_file.name:
        ext = image_file.name.split(".")[-1].lower()
        if ext not in ("jpg", "jpeg", "png"):
            ext = "jpg"

    key = f"students/{student_id}/{uuid.uuid4().hex}.{ext}"

    try:
        client.upload_fileobj(
            image_file,
            settings.AWS_S3_BUCKET_NAME,
            key,
            ExtraArgs={
                "ContentType": f"image/{ext}",
                "ServerSideEncryption": "AES256",
            },
        )
        url = f"https://{settings.AWS_S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
        logger.info(f"Imagen subida a S3: {url}")
        return url
    except ClientError as e:
        logger.error(f"Error subiendo imagen a S3: {e}")
        raise


def delete_image(key):
    client = get_s3_client()
    try:
        client.delete_object(Bucket=settings.AWS_S3_BUCKET_NAME, Key=key)
        logger.info(f"Imagen eliminada de S3: {key}")
    except ClientError as e:
        logger.error(f"Error eliminando imagen de S3: {e}")
        raise


def generate_presigned_url(key, expiration=3600):
    client = get_s3_client()
    try:
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.AWS_S3_BUCKET_NAME, "Key": key},
            ExpiresIn=expiration,
        )
        return url
    except ClientError as e:
        logger.error(f"Error generando URL firmada: {e}")
        raise
