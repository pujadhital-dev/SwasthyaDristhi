from django.contrib.auth import user_logged_in
from django.core import signing
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from . import otp
from .models import OtpPurpose, User
from .serializers import (
    EmailCodeSerializer,
    EmailSerializer,
    LoginSerializer,
    PasswordResetSerializer,
    PatientRegisterSerializer,
    UserSerializer,
    check_new_password,
    create_patient_from_payload,
    tokens_for,
)

RESET_TOKEN_SALT = "accounts.password-reset"
RESET_TOKEN_MAX_AGE = 15 * 60  # seconds the user has to choose a new password


def error(message, http_status=status.HTTP_400_BAD_REQUEST, **extra):
    return Response({"detail": message, **extra}, status=http_status)


# --- Login ------------------------------------------------------------------


class LoginView(APIView):
    """POST /api/auth/login/  {email, password} -> {access, refresh, user}"""

    permission_classes = [AllowAny]
    throttle_scope = "auth"

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            detail = serializer.errors.get("detail")
            if detail:
                return error(detail[0], status.HTTP_401_UNAUTHORIZED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        user_logged_in.send(sender=user.__class__, request=request, user=user)  # updates last_login
        return Response({**tokens_for(user), "user": UserSerializer(user).data})


class MeView(APIView):
    """GET /api/auth/me/  -> the logged-in user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# --- Patient registration (with email code) ---------------------------------


class PatientRegisterView(APIView):
    """
    POST /api/auth/register/  -> checks the form and emails a 6-digit code.
    The account is NOT created yet; see VerifyRegistrationView.
    """

    permission_classes = [AllowAny]
    throttle_scope = "auth"

    def post(self, request):
        serializer = PatientRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        payload = serializer.to_pending_payload()

        pending = otp.latest(email, OtpPurpose.REGISTER)
        wait = otp.seconds_until_resend(pending)
        if wait:
            # A code was just sent: keep it valid, but use the newest form details.
            pending.payload = payload
            pending.save(update_fields=["payload"])
        else:
            try:
                otp.issue(email, OtpPurpose.REGISTER, name=payload["first_name"], payload=payload)
            except otp.OtpError as exc:
                return error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
            wait = otp.seconds_until_resend(otp.latest(email, OtpPurpose.REGISTER))

        return Response(
            {"detail": f"We sent a 6-digit code to {email}.", "email": email, "resend_in": wait},
            status=status.HTTP_200_OK,
        )


class VerifyRegistrationView(APIView):
    """POST /api/auth/register/verify/  {email, code} -> creates the patient account."""

    permission_classes = [AllowAny]
    throttle_scope = "otp"

    def post(self, request):
        serializer = EmailCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            record = otp.verify(email, OtpPurpose.REGISTER, serializer.validated_data["code"])
        except otp.OtpError as exc:
            return error(str(exc))

        if User.objects.filter(email=email).exists():
            return error("This email is already verified. Please log in.", status.HTTP_409_CONFLICT)

        create_patient_from_payload(email, record.payload)
        return Response(
            {"detail": "Your email is verified and your account is ready. Please log in."},
            status=status.HTTP_201_CREATED,
        )


class ResendRegistrationCodeView(APIView):
    """POST /api/auth/register/resend/  {email}"""

    permission_classes = [AllowAny]
    throttle_scope = "otp"

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        pending = otp.latest(email, OtpPurpose.REGISTER)
        if pending is None:
            return error("Your sign-up has expired. Please fill in the form again.", status.HTTP_404_NOT_FOUND)

        wait = otp.seconds_until_resend(pending)
        if wait:
            return error(f"Please wait {wait} seconds before asking for a new code.", 429, resend_in=wait)

        try:
            otp.issue(email, OtpPurpose.REGISTER, name=pending.payload.get("first_name", ""), payload=pending.payload)
        except otp.OtpError as exc:
            return error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"detail": f"A new code was sent to {email}.", "resend_in": int(otp.RESEND_COOLDOWN.total_seconds())})


# --- Forgot password ---------------------------------------------------------


class ForgotPasswordView(APIView):
    """
    POST /api/auth/password/forgot/  {email}
    Always answers the same way, so it never reveals whether an email is registered.
    """

    permission_classes = [AllowAny]
    throttle_scope = "otp"

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        cooldown = int(otp.RESEND_COOLDOWN.total_seconds())

        user = User.objects.filter(email=email, is_active=True).first()
        if user and not otp.seconds_until_resend(otp.latest(email, OtpPurpose.RESET_PASSWORD)):
            try:
                otp.issue(email, OtpPurpose.RESET_PASSWORD, name=user.first_name)
            except otp.OtpError as exc:
                return error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(
            {
                "detail": f"If an account exists for {email}, we sent a 6-digit code to it.",
                "email": email,
                "resend_in": cooldown,
            }
        )


class VerifyResetCodeView(APIView):
    """POST /api/auth/password/verify/  {email, code} -> {reset_token}"""

    permission_classes = [AllowAny]
    throttle_scope = "otp"

    def post(self, request):
        serializer = EmailCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            otp.verify(email, OtpPurpose.RESET_PASSWORD, serializer.validated_data["code"])
        except otp.OtpError as exc:
            return error(str(exc))

        user = User.objects.filter(email=email, is_active=True).first()
        if user is None:
            return error("This code has expired. Please request a new one.")

        # The token carries part of the current password hash, so it stops working
        # as soon as the password changes (one use only).
        token = signing.dumps({"uid": str(user.pk), "h": user.password[-12:]}, salt=RESET_TOKEN_SALT)
        return Response({"reset_token": token})


class ResetPasswordView(APIView):
    """POST /api/auth/password/reset/  {reset_token, password}"""

    permission_classes = [AllowAny]
    throttle_scope = "otp"

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expired = "This reset link has expired. Please start again."

        try:
            data = signing.loads(
                serializer.validated_data["reset_token"], salt=RESET_TOKEN_SALT, max_age=RESET_TOKEN_MAX_AGE
            )
        except signing.BadSignature:
            return error(expired)

        user = User.objects.filter(pk=data.get("uid"), is_active=True).first()
        if user is None or user.password[-12:] != data.get("h"):
            return error(expired)

        password = serializer.validated_data["password"]
        check_new_password(password, email=user.email, first_name=user.first_name, last_name=user.last_name)
        user.set_password(password)
        user.save(update_fields=["password"])
        return Response({"detail": "Your password was changed. Please log in with your new password."})
