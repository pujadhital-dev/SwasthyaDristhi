import re
from datetime import date

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import DoctorProfile, Gender, PatientProfile, Role, User

NEPAL_MOBILE_RE = re.compile(r"^(\+977)?9\d{9}$")


def clean_phone(value, required=True):
    phone = re.sub(r"[\s-]", "", value or "")
    if not phone:
        if required:
            raise serializers.ValidationError("Phone number is required.")
        return ""
    if not NEPAL_MOBILE_RE.match(phone):
        raise serializers.ValidationError("Enter a valid 10-digit mobile number.")
    return phone


def check_new_password(password, **user_fields):
    """Run Django's password validators against an unsaved user."""
    try:
        validate_password(password, user=User(**user_fields))
    except Exception as exc:  # django.core.exceptions.ValidationError
        raise serializers.ValidationError({"password": list(exc.messages)})


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class UserSerializer(serializers.ModelSerializer):
    # MongoDB ids are ObjectIds; send them to the frontend as strings.
    id = serializers.CharField(source="pk", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role"]
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            email=attrs["email"].strip().lower(),
            password=attrs["password"],
        )
        # Same message for wrong email, wrong password and disabled accounts,
        # so the form never reveals which emails are registered.
        if user is None:
            raise serializers.ValidationError({"detail": "Invalid email or password."})
        attrs["user"] = user
        return attrs


class PatientRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    date_of_birth = serializers.DateField()
    gender = serializers.ChoiceField(choices=Gender.choices)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_phone(self, value):
        return clean_phone(value)

    def validate_date_of_birth(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        return value

    def validate(self, attrs):
        check_new_password(
            attrs["password"],
            email=attrs["email"],
            first_name=attrs["first_name"],
            last_name=attrs.get("last_name", ""),
        )
        return attrs

    def to_pending_payload(self):
        """Sign-up data kept with the email code until it is verified (password hashed)."""
        data = self.validated_data
        return {
            "first_name": data["first_name"].strip(),
            "last_name": data.get("last_name", "").strip(),
            "phone": data["phone"],
            "date_of_birth": data["date_of_birth"].isoformat(),
            "gender": data["gender"],
            "password_hash": make_password(data["password"]),
        }


def create_patient_from_payload(email, payload):
    """Create the PATIENT user and profile once their email is verified."""
    user = User(
        email=email,
        first_name=payload["first_name"],
        last_name=payload.get("last_name", ""),
        role=Role.PATIENT,
    )
    user.password = payload["password_hash"]
    user.save()
    try:
        PatientProfile.objects.create(
            user=user,
            phone=payload["phone"],
            date_of_birth=date.fromisoformat(payload["date_of_birth"]),
            gender=payload["gender"],
        )
    except Exception:
        # No multi-document transaction on a standalone MongoDB, so undo by hand.
        user.delete()
        raise
    return user


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class EmailCodeSerializer(EmailSerializer):
    code = serializers.RegexField(r"^\s*\d{6}\s*$", error_messages={"invalid": "Enter the 6-digit code."})


class PasswordResetSerializer(serializers.Serializer):
    reset_token = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class DoctorSerializer(serializers.Serializer):
    """Used by the Super Admin to list and create doctor accounts."""

    id = serializers.CharField(source="pk", read_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    phone = serializers.CharField(
        source="doctor_profile.phone", max_length=20, required=False, allow_blank=True
    )
    specialization = serializers.CharField(
        source="doctor_profile.specialization", max_length=120, required=False, allow_blank=True
    )
    license_number = serializers.CharField(
        source="doctor_profile.license_number", max_length=60, required=False, allow_blank=True
    )
    is_active = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    patient_count = serializers.SerializerMethodField()

    def get_patient_count(self, user):
        return self.context.get("patient_counts", {}).get(user.pk, 0)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_phone(self, value):
        return clean_phone(value, required=False)

    def validate(self, attrs):
        check_new_password(
            attrs["password"],
            email=attrs["email"],
            first_name=attrs["first_name"],
            last_name=attrs.get("last_name", ""),
        )
        return attrs

    def create(self, data):
        profile = data.pop("doctor_profile", {})
        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            first_name=data["first_name"].strip(),
            last_name=data.get("last_name", "").strip(),
            role=Role.DOCTOR,
        )
        try:
            DoctorProfile.objects.create(user=user, **profile)
        except Exception:
            user.delete()
            raise
        return user
