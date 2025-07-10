from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('C', 'Custom'),
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    country_of_birth = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    banner_image = models.ImageField(upload_to='banners/', null=True, blank=True)
    is_blocked = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(default=uuid.uuid4, null=True, blank=True)

    username = None
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email

class Follow(models.Model):
    follower = models.ForeignKey(CustomUser, related_name='following', on_delete=models.CASCADE)
    followed = models.ForeignKey(CustomUser, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'followed')  # Prevent duplicate follows
        constraints = [
            models.CheckConstraint(
                check=~models.Q(follower=models.F('followed')),
                name='prevent_self_follow'
            )
        ]

    def __str__(self):
        return f"{self.follower.email} follows {self.followed.email}"
    
   # is_active = False → disables login and authentication completely.
   #is_blocked = True → user can technically still log in, but you can 
   # restrict access to specific views or actions in your app.
#    is_active is a built-in Django field that determines 
#    if the user account is usable (e.g., for login).
# is_blocked is a custom field for app-specific logic 
# (e.g., blocking users for violating rules without deactivating the account).