from django.db import models
from Users.models import CustomUser

class Journal(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='journals')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    like_count = models.PositiveIntegerField(default=0)  # Cache for number of likes
    comment_count = models.PositiveIntegerField(default=0)  # Cache for number of comments

    def __str__(self):
        return self.title

    def update_counts(self):
        """Update cached like and comment counts."""
        self.like_count = self.likes.count()
        self.comment_count = self.comments.filter(parent__isnull=True).count()  # Count top-level comments
        self.save(update_fields=['like_count', 'comment_count'])

class Media(models.Model):
    journal = models.ForeignKey(Journal, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='journal_media/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Media for {self.journal.title}"

class Like(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='likes')
    journal = models.ForeignKey(Journal, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'journal')  # Prevent multiple likes by the same user

    def __str__(self):
        return f"{self.user.email} likes {self.journal.title}"

class Comment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='comments')
    journal = models.ForeignKey(Journal, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.email} on {self.journal.title}"

class SharedJournal(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='shared_journals')
    journal = models.ForeignKey(Journal, on_delete=models.CASCADE, related_name='shares')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'journal')  # Prevent multiple shares of the same journal

    def __str__(self):
        return f"{self.user.email} shared {self.journal.title}"