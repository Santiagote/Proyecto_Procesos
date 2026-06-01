from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, CareerViewSet, SubjectViewSet

router = DefaultRouter()
router.register(r"students", StudentViewSet, basename="students")
router.register(r"careers", CareerViewSet, basename="careers")
router.register(r"subjects", SubjectViewSet, basename="subjects")

urlpatterns = [
    path("", include(router.urls)),
]
