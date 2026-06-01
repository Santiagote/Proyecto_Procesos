from rest_framework import serializers
from .models import Schedule, AcademicPeriod


class ScheduleSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = "__all__"

    def get_teacher_name(self, obj):
        return f"{obj.teacher.nombres} {obj.teacher.apellidos}"


class ScheduleListSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Schedule
        fields = ["id", "subject", "subject_name", "week_day", "start_time", "end_time", "classroom"]


class AcademicPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicPeriod
        fields = "__all__"
