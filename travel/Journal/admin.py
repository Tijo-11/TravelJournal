from django.contrib import admin
from .models import Journal, Media

@admin.register(Journal)
class JournalAdmin(admin.ModelAdmin):
    list_display= ['title', 'user', 'created_at']
    search_fields= ['title', 'user__username']
    
@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    lsit_display= ['journal', 'file', 'uploaded_at']

    
