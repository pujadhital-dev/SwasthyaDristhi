from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class Role(models.TextChoices):
    SUPERADMIN = "SUPERADMIN", "Super Admin"
    DOCTOR = "DOCTOR", "Doctor"
    PATIENT = "PATIENT", "Patient"


class Gender(models.TextChoices):
    MALE = "MALE", "Male"
    FEMALE = "FEMALE", "Female"
    OTHER = "OTHER", "Other"


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra):
        if not email:
            raise ValueError("An email address is required.")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("role", Role.PATIENT)
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra)

    def create_superuser(self, email, password=None, **extra):
        # `python manage.py createsuperuser` lands here: this is the Super Admin.
        extra["role"] = Role.SUPERADMIN
        extra["is_staff"] = True
        extra["is_superuser"] = True
        return self._create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    """One account model for every role; users log in with their email."""

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PATIENT)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["first_name"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class PatientProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="patient_profile"
    )
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=Gender.choices)
    assigned_doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_patients",
        limit_choices_to={"role": Role.DOCTOR},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "patient_profiles"

    def __str__(self):
        return f"Patient: {self.user.email}"


class DoctorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="doctor_profile"
    )
    phone = models.CharField(max_length=20, blank=True)
    specialization = models.CharField(max_length=120, blank=True)
    license_number = models.CharField(max_length=60, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "doctor_profiles"

    def __str__(self):
        return f"Doctor: {self.user.email}"


class OtpPurpose(models.TextChoices):
    REGISTER = "REGISTER", "Email verification"
    RESET_PASSWORD = "RESET_PASSWORD", "Password reset"


class EmailOTP(models.Model):
    """
    A one-time code sent by email.

    REGISTER: the sign-up form is kept in `payload` (password already hashed) and the
    account is only created once the code is verified, so unverified sign-ups never
    become users.
    RESET_PASSWORD: the code proves the person owns the account's email.
    """

    email = models.EmailField()
    purpose = models.CharField(max_length=20, choices=OtpPurpose.choices)
    code_hash = models.CharField(max_length=64)
    payload = models.JSONField(default=dict, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "email_otps"
        indexes = [models.Index(fields=["email", "purpose"])]

    def __str__(self):
        return f"{self.purpose} code for {self.email}"
