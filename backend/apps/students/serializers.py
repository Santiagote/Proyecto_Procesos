from rest_framework import serializers
from .models import Student, Career, Subject, StudentSubject
from apps.accounts.serializers import UserSerializer


class CareerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Career
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class SubjectListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code"]


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    career_name = serializers.CharField(source="career.name", read_only=True)

    class Meta:
        model = Student
        fields = "__all__"


class StudentCreateSerializer(serializers.Serializer):
    cedula = serializers.CharField(max_length=13)
    nombres = serializers.CharField(max_length=100)
    apellidos = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    career_id = serializers.IntegerField()
    nivel = serializers.IntegerField()
    reference_image = serializers.ImageField(required=False)


class StudentUpdateSerializer(serializers.Serializer):
    nombres = serializers.CharField(max_length=100, required=False)
    apellidos = serializers.CharField(max_length=100, required=False)
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    career_id = serializers.IntegerField(required=False)
    nivel = serializers.IntegerField(required=False)
    reference_image = serializers.ImageField(required=False)


class StudentSubjectSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_code = serializers.CharField(source="subject.code", read_only=True)

    class Meta:
        model = StudentSubject
        fields = ["id", "student", "subject", "subject_name", "subject_code", "academic_period"]
