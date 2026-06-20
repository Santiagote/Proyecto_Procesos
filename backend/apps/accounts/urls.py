from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivateAccountView, AuthViewSet, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="users")

urlpatterns = [
    path("login/", AuthViewSet.as_view({"post": "login"}), name="auth-login"),
    path("logout/", AuthViewSet.as_view({"post": "logout"}), name="auth-logout"),
    path("recover-password/", AuthViewSet.as_view({"post": "recover_password"}), name="auth-recover-password"),
    path("reset-password/", AuthViewSet.as_view({"post": "reset_password"}), name="auth-reset-password"),
    path("change-password/", AuthViewSet.as_view({"post": "change_password"}), name="auth-change-password"),
    path("profile/", AuthViewSet.as_view({"get": "profile", "patch": "profile"}), name="auth-profile"),
    path("", include(router.urls)),
    path("activate/<str:token>/", ActivateAccountView.as_view(), name="activate-account"),
]
