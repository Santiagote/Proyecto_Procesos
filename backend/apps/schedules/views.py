from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Schedule, AcademicPeriod
from .serializers import ScheduleSerializer, ScheduleListSerializer, AcademicPeriodSerializer
from apps.accounts.permissions import IsAdmin


class ScheduleViewSet(ModelViewSet):
    queryset = Schedule.objects.select_related("subject", "teacher").all()
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.action == "list":
            return ScheduleListSerializer
        return ScheduleSerializer


class AcademicPeriodViewSet(ModelViewSet):
    queryset = AcademicPeriod.objects.all()
    serializer_class = AcademicPeriodSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
