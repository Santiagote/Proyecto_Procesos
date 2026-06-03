import logging
import tempfile
from django.conf import settings
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def get_rekognition_client():
    return boto3.client(
        "rekognition",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def create_collection():
    client = get_rekognition_client()
    try:
        response = client.create_collection(CollectionId=settings.AWS_REKOGNITION_COLLECTION_ID)
        logger.info(f"Colección creada: {response['CollectionArn']}")
        return response
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceAlreadyExistsException":
            logger.info("La colección ya existe")
            return None
        raise


def index_face(image_url, student_id):
    client = get_rekognition_client()
    try:
        # Extraer bucket y key desde la URL
        from django.conf import settings
        import boto3
        s3 = boto3.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
        # Parsear key desde la URL
        key = image_url.split(f"{settings.AWS_S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/")[1]
        
        s3_obj = s3.get_object(Bucket=settings.AWS_S3_BUCKET_NAME, Key=key)
        image_bytes = s3_obj["Body"].read()

        result = client.index_faces(
            CollectionId=settings.AWS_REKOGNITION_COLLECTION_ID,
            Image={"Bytes": image_bytes},
            ExternalImageId=str(student_id),
            DetectionAttributes=["ALL"],
        )

        if result["FaceRecords"]:
            face_id = result["FaceRecords"][0]["Face"]["FaceId"]
            logger.info(f"Rostro indexado: {face_id} para estudiante {student_id}")
            return face_id
        raise Exception("No se detectó un rostro en la imagen")
    except ClientError as e:
        logger.error(f"Error indexando rostro: {e}")
        raise


def search_face(image_file):
    client = get_rekognition_client()
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            for chunk in image_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as f:
            image_bytes = f.read()

        import os
        os.unlink(tmp_path)

        result = client.search_faces_by_image(
            CollectionId=settings.AWS_REKOGNITION_COLLECTION_ID,
            Image={"Bytes": image_bytes},
            FaceMatchThreshold=settings.FACIAL_RECOGNITION_THRESHOLD / 100.0,
            MaxFaces=1,
        )

        if result["FaceMatches"]:
            match = result["FaceMatches"][0]
            return {
                "matched": True,
                "student_id": int(match["Face"]["ExternalImageId"]),
                "confidence": match["Similarity"],
                "face_id": match["Face"]["FaceId"],
            }

        return {"matched": False, "confidence": 0.0}

    except ClientError as e:
        logger.error(f"Error en búsqueda facial: {e}")
        raise


def update_face(image_url, face_id):
    client = get_rekognition_client()
    try:
        client.delete_faces(
            CollectionId=settings.AWS_REKOGNITION_COLLECTION_ID,
            FaceIds=[face_id],
        )
    except ClientError:
        logger.warning(f"No se pudo eliminar rostro anterior: {face_id}")
    return index_face(image_url, face_id)


def delete_face(face_id):
    client = get_rekognition_client()
    try:
        client.delete_faces(
            CollectionId=settings.AWS_REKOGNITION_COLLECTION_ID,
            FaceIds=[face_id],
        )
    except ClientError as e:
        logger.error(f"Error eliminando rostro: {e}")
        raise
