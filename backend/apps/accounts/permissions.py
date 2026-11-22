from rest_framework.permissions import BasePermission

from .models import Role


class HasRole(BasePermission):
    role = None

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == self.role)


class IsSuperAdmin(HasRole):
    role = Role.SUPERADMIN


class IsDoctor(HasRole):
    role = Role.DOCTOR


class IsPatient(HasRole):
    role = Role.PATIENT
