from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrAdmin(BasePermission):
    """Allow access only to the object owner or admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.role == 'ADMIN':
            return True
        # Check if obj has a 'user' attribute (profile models)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsAdminOrReadOnly(BasePermission):
    """Allow read access to all authenticated users; write only for admins."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


class IsResidentOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ['RESIDENT', 'ADMIN'] or request.user.is_staff
        )


class IsVolunteerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ['VOLUNTEER', 'ADMIN'] or request.user.is_staff
        )


class IsSecurityOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ['SECURITY', 'ADMIN'] or request.user.is_staff
        )


class IsGuardianOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ['GUARDIAN', 'ADMIN'] or request.user.is_staff
        )
