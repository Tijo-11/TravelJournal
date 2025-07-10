from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Like, Comment

@receiver([post_save, post_delete], sender=Like)
def update_like_count(sender, instance, **kwargs):
    instance.journal.update_counts()

@receiver([post_save, post_delete], sender=Comment)
def update_comment_count(sender, instance, **kwargs):
    instance.journal.update_counts()