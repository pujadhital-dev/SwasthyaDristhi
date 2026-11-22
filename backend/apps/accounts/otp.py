"""Create, email and check one-time codes (registration and password reset)."""
import hashlib
import hmac
import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone

from .models import EmailOTP, OtpPurpose

logger = logging.getLogger(__name__)

CODE_TTL = timedelta(minutes=10)
RESEND_COOLDOWN = timedelta(seconds=60)
MAX_ATTEMPTS = 5

SUBJECTS = {
    OtpPurpose.REGISTER: "Your SwasthyaDrishti verification code",
    OtpPurpose.RESET_PASSWORD: "Reset your SwasthyaDrishti password",
}


class OtpError(Exception):
    """Raised with a message that is safe to show to the user."""


def _hash(email, purpose, code):
    msg = f"{email}:{purpose}:{code}".encode()
    return hmac.new(settings.SECRET_KEY.encode(), msg, hashlib.sha256).hexdigest()


def latest(email, purpose):
    return EmailOTP.objects.filter(email=email, purpose=purpose).order_by("-created_at").first()


def seconds_until_resend(otp):
    if otp is None:
        return 0
    wait = (otp.created_at + RESEND_COOLDOWN - timezone.now()).total_seconds()
    return max(0, int(wait + 0.999))


def issue(email, purpose, *, name="", payload=None):
    """Replace any earlier code for this email and purpose, then email a new one."""
    code = f"{secrets.randbelow(1_000_000):06d}"
    EmailOTP.objects.filter(email=email, purpose=purpose).delete()
    otp = EmailOTP.objects.create(
        email=email,
        purpose=purpose,
        code_hash=_hash(email, purpose, code),
        payload=payload or {},
        expires_at=timezone.now() + CODE_TTL,
    )

    context = {
        "name": name,
        "code": code,
        "minutes": int(CODE_TTL.total_seconds() // 60),
        "purpose": purpose,
        "is_reset": purpose == OtpPurpose.RESET_PASSWORD,
    }
    try:
        send_mail(
            subject=SUBJECTS[purpose],
            message=render_to_string("emails/otp.txt", context),
            html_message=render_to_string("emails/otp.html", context),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )
    except Exception:
        logger.exception("Could not send %s code to %s", purpose, email)
        otp.delete()
        raise OtpError("We could not send the email right now. Please try again in a moment.")
    return otp


def verify(email, purpose, code):
    """Return the matching EmailOTP (deleted from the database), or raise OtpError."""
    otp = latest(email, purpose)
    if otp is None:
        raise OtpError("This code has expired. Please request a new one.")
    if timezone.now() > otp.expires_at:
        otp.delete()
        raise OtpError("This code has expired. Please request a new one.")
    if otp.attempts >= MAX_ATTEMPTS:
        otp.delete()
        raise OtpError("Too many wrong attempts. Please request a new code.")

    if not hmac.compare_digest(otp.code_hash, _hash(email, purpose, str(code).strip())):
        otp.attempts += 1
        otp.save(update_fields=["attempts"])
        left = MAX_ATTEMPTS - otp.attempts
        if left <= 0:
            otp.delete()
            raise OtpError("Too many wrong attempts. Please request a new code.")
        raise OtpError(f"That code is not correct. {left} {'attempt' if left == 1 else 'attempts'} left.")

    otp.delete()
    return otp
