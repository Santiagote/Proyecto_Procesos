from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.attendance.views import ExceptionViewSet

router = DefaultRouter()
router.register(r"", ExceptionViewSet, basename="exception-management")

urlpatterns = [
    path("", include(router.urls)),
]
