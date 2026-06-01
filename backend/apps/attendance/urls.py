from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, ExceptionViewSet

router = DefaultRouter()
router.register(r"records", AttendanceViewSet, basename="attendance")
router.register(r"exceptions", ExceptionViewSet, basename="exceptions")

urlpatterns = [
    path("", include(router.urls)),
]
