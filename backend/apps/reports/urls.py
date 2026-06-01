from django.urls import path
from .views import ReportViewSet

urlpatterns = [
    path("student/", ReportViewSet.as_view({"get": "student"}), name="report-student"),
    path("subject/", ReportViewSet.as_view({"get": "subject"}), name="report-subject"),
    path("teacher/", ReportViewSet.as_view({"get": "teacher"}), name="report-teacher"),
    path("period/", ReportViewSet.as_view({"get": "period"}), name="report-period"),
    path("export/pdf/", ReportViewSet.as_view({"get": "export_pdf"}), name="report-export-pdf"),
    path("export/excel/", ReportViewSet.as_view({"get": "export_excel"}), name="report-export-excel"),
]
