"""Super Admin dashboard API: overview stats, patient management, doctor management."""
from datetime import timedelta

from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .admin_serializers import (
    AdminDoctorUpdateSerializer,
    AdminPatientSerializer,
    AdminPatientUpdateSerializer,
    _is_object_id,
)
from .models import DoctorProfile, PatientProfile, Role, User
from .permissions import IsSuperAdmin
from .serializers import DoctorSerializer


class AdminPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


def patient_counts_by_doctor():
    """{doctor ObjectId: number of assigned patients}"""
    rows = (
        PatientProfile.objects.filter(assigned_doctor__isnull=False)
        .values("assigned_doctor")
        .annotate(n=Count("pk"))
    )
    return {row["assigned_doctor"]: row["n"] for row in rows}


def get_user_or_404(pk, role):
    if not _is_object_id(pk):
        from django.http import Http404

        raise Http404
    return get_object_or_404(User, pk=pk, role=role)


# --- Overview ---------------------------------------------------------------


class AdminStatsView(APIView):
    """GET /api/admin/stats/"""

    permission_classes = [IsSuperAdmin]

    def get(self, request):
        week_ago = timezone.now() - timedelta(days=7)
        patients = User.objects.filter(role=Role.PATIENT)
        doctors = User.objects.filter(role=Role.DOCTOR)

        counts = patient_counts_by_doctor()
        workload = sorted(
            (
                {
                    "id": str(d.pk),
                    "name": d.full_name,
                    "specialization": getattr(d, "doctor_profile", None)
                    and d.doctor_profile.specialization
                    or "",
                    "is_active": d.is_active,
                    "patient_count": counts.get(d.pk, 0),
                }
                for d in doctors.select_related("doctor_profile")
            ),
            key=lambda row: -row["patient_count"],
        )

        recent = (
            PatientProfile.objects.select_related("user", "assigned_doctor")
            .order_by("-created_at")[:6]
        )

        return Response(
            {
                "patients": {
                    "total": patients.count(),
                    "active": patients.filter(is_active=True).count(),
                    "new_this_week": patients.filter(date_joined__gte=week_ago).count(),
                    "unassigned": PatientProfile.objects.filter(
                        assigned_doctor__isnull=True, user__is_active=True
                    ).count(),
                },
                "doctors": {
                    "total": doctors.count(),
                    "active": doctors.filter(is_active=True).count(),
                },
                "doctor_workload": workload[:6],
                "recent_patients": AdminPatientSerializer(recent, many=True).data,
            }
        )


# --- Patients ---------------------------------------------------------------


class AdminPatientListView(generics.ListAPIView):
    """GET /api/admin/patients/?search=&doctor=<id|unassigned>&status=<active|inactive>"""

    permission_classes = [IsSuperAdmin]
    serializer_class = AdminPatientSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = PatientProfile.objects.select_related(
            "user", "assigned_doctor", "assigned_doctor__doctor_profile"
        ).order_by("-created_at")
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(phone__icontains=search)
            )

        doctor = params.get("doctor", "")
        if doctor == "unassigned":
            qs = qs.filter(assigned_doctor__isnull=True)
        elif doctor and _is_object_id(doctor):
            qs = qs.filter(assigned_doctor=doctor)

        status_filter = params.get("status", "")
        if status_filter in ("active", "inactive"):
            qs = qs.filter(user__is_active=status_filter == "active")

        return qs


class AdminPatientDetailView(APIView):
    """GET / PATCH /api/admin/patients/<id>/  {assigned_doctor?, is_active?}"""

    permission_classes = [IsSuperAdmin]

    def get_profile(self, pk):
        user = get_user_or_404(pk, Role.PATIENT)
        return get_object_or_404(
            PatientProfile.objects.select_related(
                "user", "assigned_doctor", "assigned_doctor__doctor_profile"
            ),
            user=user,
        )

    def get(self, request, pk):
        return Response(AdminPatientSerializer(self.get_profile(pk)).data)

    def patch(self, request, pk):
        profile = self.get_profile(pk)
        serializer = AdminPatientUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if "assigned_doctor" in data:
            profile.assigned_doctor = data["assigned_doctor"]
            profile.save(update_fields=["assigned_doctor"])
        if "is_active" in data:
            profile.user.is_active = data["is_active"]
            profile.user.save(update_fields=["is_active"])

        return Response(AdminPatientSerializer(self.get_profile(pk)).data)


# --- Doctors ----------------------------------------------------------------


class AdminDoctorListCreateView(generics.ListCreateAPIView):
    """GET /api/admin/doctors/?search=&status=  |  POST to create a doctor."""

    permission_classes = [IsSuperAdmin]
    serializer_class = DoctorSerializer
    pagination_class = AdminPagination

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["patient_counts"] = patient_counts_by_doctor()
        return context

    def get_queryset(self):
        qs = (
            User.objects.filter(role=Role.DOCTOR)
            .select_related("doctor_profile")
            .order_by("-date_joined")
        )
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(doctor_profile__specialization__icontains=search)
            )

        status_filter = params.get("status", "")
        if status_filter in ("active", "inactive"):
            qs = qs.filter(is_active=status_filter == "active")

        return qs


class AdminDoctorOptionsView(APIView):
    """GET /api/admin/doctors/options/ -> active doctors for the 'assign doctor' picker."""

    permission_classes = [IsSuperAdmin]

    def get(self, request):
        counts = patient_counts_by_doctor()
        doctors = (
            User.objects.filter(role=Role.DOCTOR, is_active=True)
            .select_related("doctor_profile")
            .order_by("first_name")
        )
        return Response(
            [
                {
                    "id": str(d.pk),
                    "name": d.full_name,
                    "specialization": getattr(d, "doctor_profile", None)
                    and d.doctor_profile.specialization
                    or "",
                    "patient_count": counts.get(d.pk, 0),
                }
                for d in doctors
            ]
        )


class AdminDoctorDetailView(APIView):
    """GET / PATCH /api/admin/doctors/<id>/"""

    permission_classes = [IsSuperAdmin]

    def serialize(self, user):
        return DoctorSerializer(user, context={"patient_counts": patient_counts_by_doctor()}).data

    def get(self, request, pk):
        return Response(self.serialize(get_user_or_404(pk, Role.DOCTOR)))

    def patch(self, request, pk):
        user = get_user_or_404(pk, Role.DOCTOR)
        serializer = AdminDoctorUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user_fields = [f for f in ("first_name", "last_name", "is_active") if f in data]
        for field in user_fields:
            setattr(user, field, data[field])
        if user_fields:
            user.save(update_fields=user_fields)

        profile_fields = [f for f in ("phone", "specialization", "license_number") if f in data]
        if profile_fields:
            profile, _ = DoctorProfile.objects.get_or_create(user=user)
            for field in profile_fields:
                setattr(profile, field, data[field])
            profile.save(update_fields=profile_fields)

        user = User.objects.select_related("doctor_profile").get(pk=user.pk)
        return Response(self.serialize(user))
