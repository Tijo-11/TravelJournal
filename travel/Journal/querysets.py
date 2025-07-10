from django.db.models import F, FloatField, Count, Max, Min, ExpressionWrapper, DurationField
from django.db.models.functions import Now, Greatest, Extract
from django.utils import timezone

def with_engagement_scores(queryset, max_counts=None, time_span_days=1):
    if not max_counts:
        # Use existing like_count and comment_count; calculate max for normalization
        max_counts = queryset.aggregate(
            max_likes=Max('like_count'),
            max_comments=Max('comment_count'),
            max_shares=Max('annotated_share_count')  # Use annotated share count
        )

    oldest_created = queryset.aggregate(oldest=Min('created_at'))['oldest']
    time_span_days = (timezone.now() - oldest_created).days if oldest_created else 1

    return queryset.annotate(
        # Convert interval to seconds using EXTRACT(EPOCH FROM ...)
        recency_seconds=ExpressionWrapper(
            Extract(Now() - F('created_at'), 'epoch'),
            output_field=FloatField()
        ),
        normalized_recency=ExpressionWrapper(
            1 - (F('recency_seconds') / (time_span_days * 86400.0)),
            output_field=FloatField()
        ),
        normalized_likes=ExpressionWrapper(
            F('like_count') / Greatest(max_counts['max_likes'] or 1, 1),
            output_field=FloatField()
        ),
        normalized_comments=ExpressionWrapper(
            F('comment_count') / Greatest(max_counts['max_comments'] or 1, 1),
            output_field=FloatField()
        ),
        normalized_shares=ExpressionWrapper(
            F('annotated_share_count') / Greatest(max_counts['max_shares'] or 1, 1),
            output_field=FloatField()
        ),
        engagement_score=ExpressionWrapper(
            0.5 * F('normalized_recency') +
            0.1667 * F('normalized_likes') +
            0.1667 * F('normalized_comments') +
            0.1667 * F('normalized_shares'),
            output_field=FloatField()
        )
    )