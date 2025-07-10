# admin.py
from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = [
        'email', 'first_name', 'last_name',
        'date_of_birth', 'country_of_birth', 'gender',
        'is_verified', 'is_blocked', 'is_staff'
    ]
    search_fields = ['email', 'first_name', 'last_name']
    list_filter = ['is_verified', 'is_blocked', 'is_staff', 'gender']
    fields = [
        'email', 'first_name', 'last_name', 'date_of_birth', 'country_of_birth', 'gender',
        'profile_image', 'banner_image',
        'is_verified', 'email_verification_token',
        'is_blocked', 'is_staff', 'is_active'
    ]
