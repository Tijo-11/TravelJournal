from django.apps import AppConfig

class JournalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Journal'

    def ready(self):
        import Journal.signals  # Import signals to register them