from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from django.contrib.auth import get_user_model
from .models import Journal, Media, Like, Comment, SharedJournal
from Users.models import Follow

User = get_user_model()

class PublicUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'full_name', 'profile_image']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['id', 'file', 'uploaded_at']

class LikeSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'journal', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate(self, data):
        request = self.context.get('request')
        if Like.objects.filter(user=request.user, journal=data['journal']).exists():
            raise serializers.ValidationError("User has already liked this journal")
        return data

class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'journal', 'parent', 'content', 'created_at', 'updated_at', 'replies']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True, context=self.context).data

class SharedJournalSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    journal = serializers.PrimaryKeyRelatedField(queryset=Journal.objects.all())

    class Meta:
        model = SharedJournal
        fields = ['id', 'user', 'journal', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate(self, data):
        request = self.context.get('request')
        if SharedJournal.objects.filter(user=request.user, journal=data['journal']).exists():
            raise serializers.ValidationError("User has already shared this journal")
        return data

class JournalSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)
    media_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
        max_length=20
    )
    delete_media_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    user = PublicUserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    shares = SharedJournalSerializer(many=True, read_only=True)
    is_shared = serializers.SerializerMethodField()
    shared_by = serializers.SerializerMethodField()

    class Meta:
        model = Journal
        fields = [
            'id', 'title', 'content', 'created_at', 'updated_at',
            'media', 'media_files', 'delete_media_ids', 'user',
            'like_count', 'comment_count', 'is_liked', 'comments', 'shares',
            'is_shared', 'shared_by'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'like_count', 'comment_count']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, journal=obj).exists()
        return False

    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SharedJournal.objects.filter(
                journal=obj,
                user__in=Follow.objects.filter(follower=request.user).values_list('followed', flat=True)
            ).exists()
        return False

    def get_shared_by(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            shared_by = SharedJournal.objects.filter(
                journal=obj,
                user__in=Follow.objects.filter(follower=request.user).values_list('followed', flat=True)
            ).order_by('-created_at').first()
            if shared_by:
                return PublicUserSerializer(shared_by.user, context=self.context).data
        return None

    def validate_media_files(self, value):
        if len(value) > 20:
            raise serializers.ValidationError("Cannot upload more than 20 media files")
        return value

    def create(self, validated_data):
        # Remove 'user' from validated_data if present to avoid duplication
        validated_data.pop('user', None)
        media_files = validated_data.pop('media_files', [])
        # Create journal with user from request context
        journal = Journal.objects.create(user=self.context['request'].user, **validated_data)
        for file in media_files:
            Media.objects.create(journal=journal, file=file)
        return journal

    def update(self, instance, validated_data):
        # Remove 'user' from validated_data if present (not expected in update)
        validated_data.pop('user', None)
        media_files = validated_data.pop('media_files', [])
        delete_ids = validated_data.pop('delete_media_ids', [])

        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.save()

        Media.objects.filter(id__in=delete_ids, journal=instance).delete()
        for file in media_files:
            Media.objects.create(journal=instance, file=file)

        return instance