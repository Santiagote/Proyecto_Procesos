from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScheduleViewSet, AcademicPeriodViewSet

router = DefaultRouter()
router.register(r"schedules", ScheduleViewSet, basename="schedules")
router.register(r"periods", AcademicPeriodViewSet, basename="periods")

urlpatterns = [
    path("", include(router.urls)),
]
