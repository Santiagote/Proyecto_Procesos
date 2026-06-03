from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, CareerViewSet, SubjectViewSet

router = DefaultRouter()
router.register(r"careers", CareerViewSet, basename="careers")
router.register(r"subjects", SubjectViewSet, basename="subjects")

urlpatterns = [
    path("", StudentViewSet.as_view({"get": "list", "post": "create"}), name="students-list"),
    path("search/", StudentViewSet.as_view({"get": "search"}), name="students-search"),
    path("<int:pk>/", StudentViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update"}), name="students-detail"),
    path("<int:pk>/deactivate/", StudentViewSet.as_view({"post": "deactivate"}), name="students-deactivate"),
    path("<int:pk>/subjects/", StudentViewSet.as_view({"get": "subjects"}), name="students-subjects"),
    path("<int:pk>/enroll/", StudentViewSet.as_view({"post": "enroll"}), name="students-enroll"),
    path("", include(router.urls)),
]
