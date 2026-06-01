import re
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "cedula", "nombres", "apellidos",
            "telefono", "role", "is_active", "profile_picture",
            "password_change_required", "date_joined",
        ]
        read_only_fields = ["id", "password_change_required", "date_joined", "is_active"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "cedula", "nombres", "apellidos", "telefono", "role", "password"]

    def validate_password(self, value):
        if len(value) < 12:
            raise serializers.ValidationError("La contraseña debe tener al menos 12 caracteres")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not check_password(value, user.password):
            raise serializers.ValidationError("La contraseña actual no es correcta")
        return value

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Debe contener al menos una mayúscula")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Debe contener al menos un número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Debe contener al menos un carácter especial")
        return value

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        if data["current_password"] == data["new_password"]:
            raise serializers.ValidationError("La nueva contraseña debe ser diferente a la actual")
        return data


class PasswordRecoveryRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField()

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Debe contener al menos una mayúscula")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Debe contener al menos un número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Debe contener al menos un carácter especial")
        return value


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["nombres", "apellidos", "telefono", "profile_picture"]
        read_only_fields = ["email", "role"]
