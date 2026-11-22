"""Serializers for the Super Admin dashboard (/api/admin/...)."""
from datetime import date

from rest_framework import serializers

from .models import Role, User
from .serializers import clean_phone


def doctor_summary(user):
    if user is None:
        return None
    profile = getattr(user, "doctor_profile", None)
    return {
        "id": str(user.pk),
        "name": user.full_name,
        "email": user.email,
        "specialization": profile.specialization if profile else "",
        "is_active": user.is_active,
    }


class AdminPatientSerializer(serializers.Serializer):
    """Read shape of a patient row: built from a PatientProfile."""

    def to_representation(self, profile):
        user = profile.user
        dob = profile.date_of_birth
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day)) if dob else None
        return {
            "id": str(user.pk),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": user.full_name,
            "email": user.email,
            "phone": profile.phone,
            "date_of_birth": dob.isoformat() if dob else None,
            "age": age,
            "gender": profile.gender,
            "is_active": user.is_active,
            "date_joined": user.date_joined.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "assigned_doctor": doctor_summary(profile.assigned_doctor),
        }


class AdminPatientUpdateSerializer(serializers.Serializer):
    assigned_doctor = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    is_active = serializers.BooleanField(required=False)

    def validate_assigned_doctor(self, value):
        if not value:
            return None
        doctor = User.objects.filter(pk=value, role=Role.DOCTOR).first() if _is_object_id(value) else None
        if doctor is None:
            raise serializers.ValidationError("Doctor not found.")
        if not doctor.is_active:
            raise serializers.ValidationError("This doctor's account is deactivated.")
        return doctor


class AdminDoctorUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    specialization = serializers.CharField(max_length=120, required=False, allow_blank=True)
    license_number = serializers.CharField(max_length=60, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)

    def validate_phone(self, value):
        return clean_phone(value, required=False)


def _is_object_id(value):
    from bson import ObjectId

    return ObjectId.is_valid(str(value))
