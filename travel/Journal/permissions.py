from rest_framework.permissions import BasePermission

class IsOwnerOrAdminDeleteOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'POST', 'PUT', 'PATCH']:
            return request.user.is_authenticated
        if request.method == 'DELETE':
            return request.user.is_authenticated and (request.user.is_staff or obj.user == request.user)
        return False