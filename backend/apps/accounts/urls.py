from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import admin_views, views

auth_urlpatterns = [
    path("login/", views.LoginView.as_view(), name="login"),
    path("register/", views.PatientRegisterView.as_view(), name="register"),
    path("register/verify/", views.VerifyRegistrationView.as_view(), name="register-verify"),
    path("register/resend/", views.ResendRegistrationCodeView.as_view(), name="register-resend"),
    path("password/forgot/", views.ForgotPasswordView.as_view(), name="password-forgot"),
    path("password/verify/", views.VerifyResetCodeView.as_view(), name="password-verify"),
    path("password/reset/", views.ResetPasswordView.as_view(), name="password-reset"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.MeView.as_view(), name="me"),
]

admin_urlpatterns = [
    path("stats/", admin_views.AdminStatsView.as_view(), name="admin-stats"),
    path("patients/", admin_views.AdminPatientListView.as_view(), name="admin-patients"),
    path("patients/<str:pk>/", admin_views.AdminPatientDetailView.as_view(), name="admin-patient"),
    path("doctors/", admin_views.AdminDoctorListCreateView.as_view(), name="admin-doctors"),
    path("doctors/options/", admin_views.AdminDoctorOptionsView.as_view(), name="admin-doctor-options"),
    path("doctors/<str:pk>/", admin_views.AdminDoctorDetailView.as_view(), name="admin-doctor"),
]
