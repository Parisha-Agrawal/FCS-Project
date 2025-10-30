from django.contrib.auth.models import AbstractUser
from django.db import models
from dotenv import load_dotenv
import os
import uuid
from django.utils import timezone
from datetime import timedelta
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from django.conf import settings
from cryptography.fernet import Fernet
load_dotenv()
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
User = settings.AUTH_USER_MODEL

# Ensure the key is loaded correctly
if not ENCRYPTION_KEY:
    raise ValueError("ENCRYPTION_KEY is not set in the environment")

# cipher_suite = Fernet(ENCRYPTION_KEY)
cipher_suite = Fernet(ENCRYPTION_KEY.encode())
def user_directory_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"profile_pics/{filename}"

class CustomUser(AbstractUser):
    username = models.CharField(unique=True, max_length=150)
    email = models.EmailField(unique=True)
    # profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    profile_picture = models.ImageField(upload_to=user_directory_path, blank=True, null=True)

    is_verified = models.BooleanField(default=False)
    verification_document = models.FileField(upload_to="verification_docs/", null=True, blank=True)
    document = models.FileField(upload_to='documents/', null=True, blank=True)  # User uploads document
    Balance = models.FloatField(default=10000)

    bio = models.TextField(blank=True, null=True)
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username

def private_media_path(instance, filename):
    return f'private_media/{instance.sender.id}_{filename}'

class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages")
    
    encrypted_content = models.TextField(blank=True, null=True)
    # media = models.FileField(upload_to=private_media_path, blank=True, null=True)
    media = models.FileField(upload_to='message_media/', null=True, blank=True)

    is_encrypted = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    is_ephemeral = models.BooleanField(default=False)
    expires_in = models.IntegerField(null=True, blank=True)  # in seconds
    expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.encrypted_content and not self.is_encrypted:
            self.encrypted_content = cipher_suite.encrypt(self.encrypted_content.encode()).decode()
            self.is_encrypted = True
        
        if self.is_ephemeral and self.expires_in:
            self.expires_at = timezone.now() + timedelta(seconds=self.expires_in)
        super().save(*args, **kwargs)

    def get_decrypted_content(self):
        if self.encrypted_content:
            return cipher_suite.decrypt(self.encrypted_content.encode()).decode()
        return None

    def get_media_url(self):
        if self.media:
            return self.media.url
        return None


class Transaction(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_transactions")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_transactions")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.sender} sent {self.amount} to {self.receiver} on {self.timestamp}"
    
    def get_transactions_by_user(self, sender):
        transactions = Transaction.objects.filter(sender=sender)
        return transactions  # This will return a QuerySet of transactions

class OTPVerification(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    otp_secret_key = models.CharField(max_length=100)
    valid_until = models.DateTimeField()

class GroupChat(models.Model):
    name = models.CharField(max_length=255, unique=True)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="group_chats"
    )
    # created_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return self.name

class GroupMessage(models.Model):
    group = models.ForeignKey(GroupChat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="group_messages")
    encrypted_content = models.TextField(blank=True, null=True)
    media = models.FileField(upload_to="chat_media/", blank=True, null=True)
    is_encrypted = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    is_ephemeral = models.BooleanField(default=False)
    expires_in = models.IntegerField(null=True, blank=True)  # in seconds
    expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.encrypted_content and not self.is_encrypted:
            self.encrypted_content = cipher_suite.encrypt(self.encrypted_content.encode()).decode()
            self.is_encrypted = True
        if self.is_ephemeral and self.expires_in:
            self.expires_at = timezone.now() + timedelta(seconds=self.expires_in)
        super().save(*args, **kwargs)

    def get_decrypted_content(self):
        return cipher_suite.decrypt(self.encrypted_content.encode()).decode() if self.encrypted_content else None
    
    # check if needed
    def get_media_url(self):
        if self.media:
            return self.media.url  # Ensures frontend can access media URLs
        return None


class Relationship(models.Model):
    FOLLOWING = 'following'
    BLOCKED = 'blocked'
    REQUESTED = 'requested'
    FRIENDS = 'friends'
    STATUS_CHOICES = [
        (FOLLOWING, 'Following'),
        (BLOCKED, 'Blocked'),
        (REQUESTED, 'Requested'),
        (FRIENDS, 'Friends'),
    ]

    from_user = models.ForeignKey(User, related_name='following_set', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='followers_set', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user', 'status')

    def __str__(self):
        return f"{self.from_user} -> {self.to_user} ({self.status})"
    

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    followers_count = models.PositiveIntegerField(default=0)
    following_count = models.PositiveIntegerField(default=0)

class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
    ]

    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"{self.from_user} ➡️ {self.to_user} ({self.status})"
    
class Report(models.Model):
    reported_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reports_received')
    reason = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Block(models.Model):
    blocker = models.ForeignKey(User, related_name='blocker', on_delete=models.CASCADE)
    blocked = models.ForeignKey(User, related_name='blocked', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker.username} blocked {self.blocked.username}"