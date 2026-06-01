from rest_framework import serializers
from .models import AttendanceRecord, AttendanceException
from apps.students.serializers import StudentSerializer
from apps.schedules.serializers import ScheduleSerializer


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_cedula = serializers.CharField(source="student.user.cedula", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = "__all__"
        read_only_fields = ["id", "recorded_at"]

    def get_student_name(self, obj):
        return f"{obj.student.user.nombres} {obj.student.user.apellidos}"

    def get_teacher_name(self, obj):
        return f"{obj.teacher.nombres} {obj.teacher.apellidos}"


class AttendanceCaptureSerializer(serializers.Serializer):
    image = serializers.ImageField(help_text="Imagen facial capturada (JPEG/PNG, máx 5MB)")


class AttendanceBulkCreateSerializer(serializers.Serializer):
    student_ids = serializers.ListField(child=serializers.IntegerField())
    schedule_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=AttendanceRecord.Status.choices, default=AttendanceRecord.Status.ABSENT)


class AttendanceExceptionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    modified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceException
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def get_student_name(self, obj):
        return f"{obj.student.user.nombres} {obj.student.user.apellidos}"

    def get_modified_by_name(self, obj):
        return f"{obj.modified_by.nombres} {obj.modified_by.apellidos}"


class AttendanceExceptionCreateSerializer(serializers.Serializer):
    attendance_record_id = serializers.IntegerField(required=False, allow_null=True)
    student_id = serializers.IntegerField()
    schedule_id = serializers.IntegerField()
    new_status = serializers.ChoiceField(choices=["PRESENT", "JUSTIFIED"])
    reason = serializers.CharField()
    supporting_document = serializers.ImageField(required=False)
