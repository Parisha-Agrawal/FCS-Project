from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Relationship
from .models import UserProfile

@receiver(post_save, sender=Relationship)
def update_counts_on_create(sender, instance, created, **kwargs):
    if created and instance.status == 'following':
        try:
            to_profile = instance.to_user.profile
            from_profile = instance.from_user.profile
            to_profile.followers_count += 1
            from_profile.following_count += 1
            to_profile.save()
            from_profile.save()
        except UserProfile.DoesNotExist:
            pass

@receiver(post_delete, sender=Relationship)
def update_counts_on_delete(sender, instance, **kwargs):
    if instance.status == 'following':
        try:
            to_profile = instance.to_user.profile
            from_profile = instance.from_user.profile
            to_profile.followers_count = max(to_profile.followers_count - 1, 0)
            from_profile.following_count = max(from_profile.following_count - 1, 0)
            to_profile.save()
            from_profile.save()
        except UserProfile.DoesNotExist:
            pass
