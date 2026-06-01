from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from .models import User
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    PasswordChangeSerializer, PasswordRecoveryRequestSerializer,
    PasswordResetSerializer, ProfileSerializer,
)
from .services import AuthService, UserService, PasswordService
from .permissions import IsAdmin


class AuthViewSet(GenericViewSet):
    permission_classes = [AllowAny]
    throttle_scope = "password_recovery"

    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = AuthService.authenticate(serializer.validated_data["email"], serializer.validated_data["password"])
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_423_LOCKED)
        if not user:
            return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        tokens = AuthService.get_tokens_for_user(user)
        return Response({
            "tokens": tokens,
            "user": UserSerializer(user).data,
            "password_change_required": user.password_change_required,
        })

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def logout(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            AuthService.blacklist_refresh_token(refresh_token)
        return Response({"detail": "Sesión cerrada correctamente"})

    @action(detail=False, methods=["post"])
    def recover_password(self, request):
        serializer = PasswordRecoveryRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=serializer.validated_data["email"])
            token = PasswordService.generate_recovery_token(user)
            from cloud.ses import send_recovery_email
            send_recovery_email(user.email, token)
        except User.DoesNotExist:
            pass
        return Response({"detail": "Si el correo existe, recibirás instrucciones para recuperar tu contraseña"})

    @action(detail=False, methods=["post"])
    def reset_password(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            PasswordService.reset_password(
                serializer.validated_data["token"],
                serializer.validated_data["new_password"],
            )
            return Response({"detail": "Contraseña restablecida correctamente"})
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        try:
            PasswordService.change_password(
                request.user,
                serializer.validated_data["current_password"],
                serializer.validated_data["new_password"],
            )
            return Response({"detail": "Contraseña cambiada correctamente"})
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated])
    def profile(self, request):
        if request.method == "GET":
            serializer = ProfileSerializer(request.user)
            user_data = UserSerializer(request.user).data
            return Response({**serializer.data, "email": user_data["email"], "role": user_data["role"]})
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        UserService.create_user(serializer.validated_data)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        motivo = request.data.get("motivo", "")
        if not motivo:
            return Response({"detail": "El motivo es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = UserService.deactivate_user(pk, motivo, request.user)
            return Response(UserSerializer(user).data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def reactivate(self, request, pk=None):
        try:
            user = UserService.reactivate_user(pk, request.user)
            return Response(UserSerializer(user).data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
