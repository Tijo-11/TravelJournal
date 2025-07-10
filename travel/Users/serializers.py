from rest_framework import serializers
from .models import CustomUser, Follow
import re

class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True, use_url=True)
    banner_image = serializers.ImageField(required=False, allow_null=True, use_url=True)
    password = serializers.CharField(write_only=True, required=False)
    full_name = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    journals = serializers.SerializerMethodField()
    shared_journals = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'country_of_birth', 'gender',
            'profile_image', 'banner_image',
            'is_verified', 'is_blocked', 'is_staff', 'is_superuser', 'password',
            'followers_count', 'following_count', 'is_following', 'journals', 'shared_journals'
        ]
        read_only_fields = ['id', 'is_verified', 'is_blocked', 'is_superuser', 'is_staff']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, followed=obj).exists()
        return False

    def get_journals(self, obj):
        from Journal.serializers import JournalSerializer  # Local import
        journals = obj.journals.all()
        return JournalSerializer(journals, many=True, context=self.context).data

    def get_shared_journals(self, obj):
        from Journal.serializers import JournalSerializer  # Local import
        shared_journals = obj.shared_journals.values_list('journal', flat=True)
        journals = obj.journals.model.objects.filter(id__in=shared_journals)
        return JournalSerializer(journals, many=True, context=self.context).data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class FollowSerializer(serializers.ModelSerializer):
    follower = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    followed = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'followed', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, data):
        if data['follower'] == data['followed']:
            raise serializers.ValidationError("Users cannot follow themselves")
        if Follow.objects.filter(follower=data['follower'], followed=data['followed']).exists():
            raise serializers.ValidationError("You are already following this user")
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'first_name', 'last_name',
            'date_of_birth', 'country_of_birth', 'gender',
            'password', 'password2'
        ]

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        if len(data['password']) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters long"})
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', data['password']):
            raise serializers.ValidationError({"password": "Password must contain at least one special character"})
        return data

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            date_of_birth=validated_data.get('date_of_birth'),
            country_of_birth=validated_data.get('country_of_birth', ''),
            gender=validated_data.get('gender', '')
        )
        return user

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist")
        return value