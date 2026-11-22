from django.urls import include, path

from apps.accounts.urls import admin_urlpatterns, auth_urlpatterns

# No Django admin site: the Super Admin uses the React dashboard, backed by /api/admin/.
urlpatterns = [
    path("api/auth/", include(auth_urlpatterns)),
    path("api/admin/", include(admin_urlpatterns)),
]
