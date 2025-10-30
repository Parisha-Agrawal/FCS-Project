from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .models import Message, CustomUser, GroupChat, GroupMessage, Report, Transaction, OTPVerification, Relationship
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, MessageSerializer, GroupChatSerializer, GroupMessageSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework import viewsets, permissions
from django.db.models import Q
from .serializers import FriendRequestSerializer

from django.core.files.storage import default_storage
from django.conf import settings
from django.contrib.auth import get_user_model

from django.shortcuts import get_object_or_404
import pyotp
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta
from django.utils import timezone
from .models import Block

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anyone to access this endpoint
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "User registered successfully."})
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=400)

    # Ensure authentication
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })
    
    return Response({"error": "Invalid credentials"}, status=401)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    users = CustomUser.objects.all()
    return Response(UserSerializer(users, many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data

    if "username" in data:
        user.username = data["username"]
    user.email = data.get('email', user.email)

    if "profile_picture" in request.FILES:
        user.profile_picture = request.FILES["profile_picture"]
    if 'document' in request.FILES:
        user.document = request.FILES['document']
    
    user.save()

    profile_picture_url = request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None

    return Response({
        "message": "Profile updated successfully!",
        # "user": {
        #     "id": user.id,
        #     "username": user.username,
        #     "email": user.email,
        #     "profile_picture": profile_picture_url,  # Return full image URL
        # },
        "user": UserSerializer(user).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Only logged-in users can access
def get_profile(request):
    if request.user.is_authenticated:  # Ensure user is logged in
        # return Response(UserSerializer(request.user).data)
        user = request.user
        profile_picture_url = request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_picture": profile_picture_url,  # Return full image URL
            "is_verified": user.is_verified
        })
    else:
        return Response({"error": "User not authenticated"}, status=401)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_id(request):
    username = request.query_params.get("username")
    try:
        user = User.objects.get(username=username)
        return Response({"id": user.id})
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)


def transact(sender, receiver, amount):
    with transaction.atomic():
        sender.Balance -= float(amount)
        receiver.Balance += float(amount)
        sender.save()
        receiver.save()
    return Response({"message": "Transaction was successfully!"}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_otp(request):
    if request.method == 'POST':
        otp = request.data.get('otp')


        user = request.user
        otp_entry = OTPVerification.objects.filter(user=user).last()

        transaction = Transaction.objects.filter(sender=user).last()
        sender = transaction.sender
        receiver = transaction.receiver
        amount = transaction.amount

        if not otp_entry:
            return Response({"error": "No OTP found, request a new one"}, status=400)

        dt = otp_entry.valid_until.replace(tzinfo=None)
        if dt < datetime.now():
            print(f"OTP has expired! {dt} {datetime.now()}")
            return Response({"error": "OTP has expired"}, status=400)

        totp = pyotp.TOTP(otp_entry.otp_secret_key, interval=120)
        if totp.verify(otp):
            otp_entry.delete()
            transact(sender, receiver, amount)
            return Response({"message": "Redirecting!"}, status=200)
            
    return Response({"error": "Invalid OTP"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_otp(request):
    user = request.user
    totp = pyotp.TOTP(pyotp.random_base32(), interval=120)
    otp = totp.now()
    valid_date = datetime.now() + timedelta(minutes=1)
    # Update or create the OTP entry
    otp_entry, created = OTPVerification.objects.update_or_create(
        user=user,
        defaults={
            'otp_secret_key': totp.secret,
            'valid_until': valid_date
        }
    )
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()


    server.login('devtestingemail1903@gmail.com', 'iokj zocf ercb wnus')
    email = user.email
    
    msg = EmailMessage()
    msg['Subject'] = "OPT Verification"
    msg['From'] = 'devtestingemail1903@gmail.com'
    msg['To'] = email
    msg.set_content("Your otp is: " + otp)

    server.send_message(msg)

    print("Email sent to: " + email)

    print(f"Your one time password is {otp}")
    return Response({"message": "OTP sent successfully!"}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_gateway(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')
        # Factor 1 Authentication
        user = authenticate(request, username=username, password=password)
        if user is None: 
            return Response({"error": "Invalid Credentials"}, status=400)
        
        return Response({"message": "Password Authentication Passed!"}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay(request):
    sender = request.user
    # receiver_id = request.data.get('receiver_id')
    receiver_username = request.data.get('receiver_username')
    amount = float(request.data.get('amount'))
    
    if amount <= 0:
        return Response({"error": "Amount must be greater than zero"}, status=400)

    receiver = CustomUser.objects.filter(username=receiver_username).first()
    if not receiver:
        return Response({"error": "User not found"}, status=404)

    if amount > sender.Balance:
        return Response({"error": "Not enough balance in account"}, status=400)
    
    # Create a Record
    _transaction = Transaction.objects.create(sender=sender, receiver=receiver, amount=amount)
    return Response({"message": "Request Validated"}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    sender = request.user
    receiver_username = request.data.get('receiver_username') 
    content = request.data.get('content', '')
    uploaded_file = request.FILES.get('file', None)
    is_ephemeral = request.data.get("is_ephemeral") == "true"
    expires_in = request.data.get("expires_in")
    
    if not receiver_username or (not content and not uploaded_file):
        return Response({"error": "Receiver or content/file required"}, status=400)

    receiver = CustomUser.objects.filter(username=receiver_username).first()
    if not receiver:
        return Response({"error": "User not found"}, status=404)

    expires_at = None
    if is_ephemeral and expires_in:
        try:
            expires_at = timezone.now() + timedelta(seconds=int(expires_in))
        except ValueError:
            return Response({"error": "Invalid expiry duration"}, status=400)
        
    message = Message.objects.create(
        sender=sender,
        receiver=receiver,
        encrypted_content=content if content else None,
        media=uploaded_file if uploaded_file else None,
        is_ephemeral=is_ephemeral,
        expires_in=int(expires_in) if is_ephemeral and expires_in else None,
        expires_at=expires_at
    )
    
    return Response({"message": "Message sent successfully!"}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request):
    user = request.user
    now = timezone.now()

    # Filter received and sent messages
    received_messages = Message.objects.filter(receiver=user)
    sent_messages = Message.objects.filter(sender=user)

    # Combine and exclude expired ephemeral messages
    all_messages = list(received_messages) + list(sent_messages)
    filtered_messages = [
        msg for msg in all_messages
        if not msg.is_ephemeral or (msg.expires_at and msg.expires_at > now)
    ]

    # Sort by timestamp descending
    filtered_messages.sort(key=lambda x: x.timestamp, reverse=True)
    serializer = MessageSerializer(filtered_messages, many=True, context={"request": request})
    return Response(serializer.data, status=200)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-timestamp')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(receiver=user) | Message.objects.filter(sender=user)
    
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_verify_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        if user.verification_document:
            user.is_verified = True
            user.save()
            return Response({"message": "User verified successfully."})
        return Response({"error": "No document uploaded"}, status=400)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(['POST'])
def admin_login(request):
    username = request.data.get("VPLAdmin")
    password = request.data.get("2021312@123")
    user = authenticate(username=username, password=password)
    
    if user and user.is_staff:  # Only allow staff members to log in as admin
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "is_staff": user.is_staff,
            },
        })
    return Response({"error": "Invalid credentials or not an admin"}, status=401)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_get_users(request):
    User = get_user_model()  # Get the correct User model dynamically
    users = User.objects.all()
    return Response(UserSerializer(users, many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_reject_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        user.is_verified = False
        user.save()
        return Response({"message": "User verification rejected."})
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_get_user_documents(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        if user.verification_document:
            return Response({"document_url": request.build_absolute_uri(user.verification_document.url)})
        return Response({"error": "No document uploaded"}, status=400)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_groups(request):
    user = request.user
    groups = GroupChat.objects.filter(members=user)

    if not groups.exists():
        return Response({"message": "No groups found"}, status=200)
    
    return Response(GroupChatSerializer(groups, many=True).data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group(request):
    user = request.user

    if not user.is_verified:
        return Response({"error": "Only verified users can create group chats."}, status=403)

    name = request.data.get('name')
    member_usernames = request.data.get('members', [])  # expecting list of usernames

    if not name or not member_usernames:
        return Response({"error": "Group name and members are required"}, status=400)

    group = GroupChat.objects.create(name=name)
    group.members.add(user)  # Add the creator

    not_found = []
    for username in member_usernames:
        member = CustomUser.objects.filter(username=username).first()
        if member:
            group.members.add(member)
        else:
            not_found.append(username)

    response_data = {
        "message": "Group created successfully!",
        "group": GroupChatSerializer(group).data
    }

    if not_found:
        response_data["warning"] = f"The following usernames were not found: {', '.join(not_found)}"

    return Response(response_data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_group_message(request, group_id):
    group = get_object_or_404(GroupChat, id=group_id)
    is_ephemeral = request.data.get("is_ephemeral") == "true"
    expires_in = request.data.get("expires_in")

    if request.user not in group.members.all():
        return Response({"error": "You are not in this group"}, status=403)

    content = request.data.get("content", "")
    media = request.FILES.get("media")

    expires_at = None
    if is_ephemeral and expires_in:
        try:
            expires_at = timezone.now() + timedelta(seconds=int(expires_in))
        except ValueError:
            return Response({"error": "Invalid expiry duration"}, status=400)
        
    message = GroupMessage.objects.create(
        group=group,
        sender=request.user,
        encrypted_content=content if content else None,
        media=media if media else None,
        is_ephemeral=is_ephemeral,
        expires_in=int(expires_in) if is_ephemeral and expires_in else None,
        expires_at=expires_at
    )
    return Response({"message": "Message sent successfully!"}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_group_messages(request, group_id):
    group = get_object_or_404(GroupChat, id=group_id)

    if request.user not in group.members.all():
        return Response({"error": "You are not in this group"}, status=403)

    now = timezone.now()
    # Fetch and filter out expired ephemeral messages
    messages = group.messages.all()
    filtered_messages = [
        msg for msg in messages
        if not msg.is_ephemeral or (msg.expires_at and msg.expires_at > now)
    ]
    # Sort by timestamp descending
    filtered_messages.sort(key=lambda x: x.timestamp, reverse=True)

    serializer = GroupMessageSerializer(filtered_messages, many=True, context={'request': request})
    return Response(serializer.data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request):
    from_user = request.user
    to_username = request.data.get('to_username')

    if not to_username:
        return Response({"error": "Username is required."}, status=400)

    try:
        to_user = CustomUser.objects.get(username=to_username)
        if to_user == from_user:
            return Response({"error": "You can't follow yourself."}, status=400)

        relationship, created = Relationship.objects.get_or_create(
            from_user=from_user,
            to_user=to_user,
            status=Relationship.FOLLOWING,
        )

        if not created:
            return Response({"message": "Already following."}, status=200)

        # Optionally update follower/following count
        from_user.profile.following_count += 1
        from_user.profile.save()

        to_user.profile.followers_count += 1
        to_user.profile.save()

        return Response({"message": f"Followed {to_user.username}"}, status=201)

    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.query_params.get('q', '')
    users = CustomUser.objects.filter(
        Q(username__icontains=query) |
        Q(bio__icontains=query)
    )
    return Response(UserSerializer(users, many=True).data)

from django.contrib.auth import get_user_model
User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    to_username = request.data.get("to_username")
    from_user = request.user

    if to_username == from_user.username:
        return Response({"error": "You cannot send a friend request to yourself."}, status=400)

    try:
        to_user = User.objects.get(username=to_username)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    # Check if a friend request already exists in either direction
    if FriendRequest.objects.filter(from_user=from_user, to_user=to_user, status='pending').exists():
        return Response({"error": "Friend request already sent."}, status=400)

    if FriendRequest.objects.filter(from_user=to_user, to_user=from_user, status='pending').exists():
        return Response({"error": "User has already sent you a friend request."}, status=400)


    # Also check if they're already friends
    if Relationship.objects.filter(from_user=from_user, to_user=to_user, status="friends").exists():
        return Response({"error": "You are already friends."}, status=400)

    friend_request = FriendRequest.objects.create(from_user=from_user, to_user=to_user)
    return Response({"id": friend_request.id}, status=201)

User = get_user_model()
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request):
    from_username = request.data.get('from_username')
    to_user = request.user

    try:
        from_user = User.objects.get(username=from_username)
        request_obj = FriendRequest.objects.get(from_user=from_user, to_user=to_user)
        
        # Step 1: Mark request as accepted
        request_obj.status = 'accepted'
        request_obj.save()

        # Step 2: Create mutual relationships
        Relationship.objects.get_or_create(from_user=from_user, to_user=to_user, status="friends")
        Relationship.objects.get_or_create(from_user=to_user, to_user=from_user, status="friends")

        return Response({"message": "Friend request accepted"}, status=status.HTTP_200_OK)

    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request not found"}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_friend_request(request, pk):
    try:
        friend_request = FriendRequest.objects.get(pk=pk, to_user=request.user, status='pending')
    except FriendRequest.DoesNotExist:
        return Response({"detail": "Friend request not found."}, status=404)

    friend_request.status = 'declined'
    friend_request.save()
    return Response({"detail": "Friend request declined."})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_user(request):
    username = request.data.get('username')
    current_user = request.user

    if not username:
        return Response({'error': 'Username is required'}, status=400)

    try:
        to_block = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    # Remove any existing friend/follow relationships in both directions
    Relationship.objects.filter(
        Q(from_user=current_user, to_user=to_block) |
        Q(from_user=to_block, to_user=current_user)
    ).exclude(status=Relationship.BLOCKED).delete()

    # Create or update block relationship
    Relationship.objects.update_or_create(
        from_user=current_user,
        to_user=to_block,
        defaults={'status': Relationship.BLOCKED}
    )

    return Response({'message': f'User {username} has been blocked.'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unblock_user(request):
    to_username = request.data.get("to_username")
    try:
        to_user = CustomUser.objects.get(username=to_username)
        Relationship.objects.filter(
            from_user=request.user,
            to_user=to_user,
            status=Relationship.BLOCKED
        ).delete()
        return Response({"message": "User unblocked"}, status=200)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def check_block_status(request):
#     other_username = request.GET.get('username')
#     current_user = request.user

#     if not other_username:
#         return Response({'error': 'Username is required'}, status=400)

#     try:
#         other_user = CustomUser.objects.get(username=other_username)
#     except CustomUser.DoesNotExist:
#         return Response({'error': 'User not found'}, status=404)

#     is_blocked = Relationship.objects.filter(
#         Q(from_user=current_user, to_user=other_user, status='blocked') |
#         Q(from_user=other_user, to_user=current_user, status='blocked')
#     ).exists()

#     return Response({'is_blocked': is_blocked})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_block_status(request):
    username = request.GET.get('username')
    try:
        target_user = User.objects.get(username=username)
        is_blocked = Block.objects.filter(blocker=request.user, blocked=target_user).exists()
        return Response({'is_blocked': is_blocked})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_relationships(request, rel_type):
    if rel_type == "followers":
        rels = Relationship.objects.filter(to_user=request.user, status=Relationship.FOLLOWING)
    elif rel_type == "following":
        rels = Relationship.objects.filter(from_user=request.user, status=Relationship.FOLLOWING)
    elif rel_type == "friends":
        rels = Relationship.objects.filter(from_user=request.user, status=Relationship.FRIENDS)
    else:
        return Response({"error": "Invalid relationship type"}, status=400)

    users = [rel.from_user if rel.to_user == request.user else rel.to_user for rel in rels]
    return Response(UserSerializer(users, many=True).data)
from rest_framework.decorators import action
from .models import FriendRequest

class FriendRequestViewSet(viewsets.ModelViewSet):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FriendRequest.objects.filter(to_user=self.request.user, status='pending')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friend_request = self.get_object()
        if friend_request.to_user != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        friend_request.status = 'accepted'
        friend_request.save()
        # Optionally add both users as friends in a Friend model
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        friend_request = self.get_object()
        if friend_request.to_user != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        friend_request.status = 'declined'
        friend_request.save()
        return Response({'status': 'declined'})
    
    
    @api_view(['POST'])
    def cancel_friend_request(request, pk):
        try:
            friend_request = FriendRequest.objects.get(pk=pk, from_user=request.user, status='pending')
        except FriendRequest.DoesNotExist:
            return Response({"detail": "Friend request not found or cannot be cancelled."}, status=404)

        friend_request.status = 'cancelled'
        friend_request.save()

        return Response({"detail": "Friend request cancelled."})
    
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def list_friends(request):
    user = request.user
    friends = Relationship.objects.filter(
        from_user=user, status='friends'
    ).values_list('to_user', flat=True)
    
    # Add reverse relationships (friendship is mutual)
    reverse_friends = Relationship.objects.filter(
        to_user=user, status='friends'
    ).values_list('from_user', flat=True)
    
    all_friend_ids = list(friends) + list(reverse_friends)
    friends_data = User.objects.filter(id__in=all_friend_ids)

    serialized = UserSerializer(friends_data, many=True)
    return Response(serialized.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_friend(request):
    from_user = request.user
    to_user_id = request.data.get("to_user_id")

    if not to_user_id:
        return Response({"error": "to_user_id is required."}, status=400)

    try:
        to_user = CustomUser.objects.get(id=to_user_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    # Delete mutual 'friends' relationships
    Relationship.objects.filter(
        Q(from_user=from_user, to_user=to_user, status='friends') |
        Q(from_user=to_user, to_user=from_user, status='friends')
    ).delete()

    # Delete any accepted friend requests between them
    FriendRequest.objects.filter(
        Q(from_user=from_user, to_user=to_user, status='accepted') |
        Q(from_user=to_user, to_user=from_user, status='accepted')
    ).delete()

    return Response({'message': f'Unfriended {to_user.username}'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_relationship(request):
    from_user = request.user
    to_user_id = request.data.get("to_user_id")
    action = request.data.get("action")

    if not to_user_id or not action:
        return Response({"error": "to_user_id and action are required."}, status=400)

    try:
        to_user = CustomUser.objects.get(id=to_user_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    if action == "remove":
        # Remove mutual friendship and accepted friend requests
        Relationship.objects.filter(
            Q(from_user=from_user, to_user=to_user, status='friends') |
            Q(from_user=to_user, to_user=from_user, status='friends')
        ).delete()

        FriendRequest.objects.filter(
            Q(from_user=from_user, to_user=to_user, status='accepted') |
            Q(from_user=to_user, to_user=from_user, status='accepted')
        ).delete()

        return Response({"message": f"Unfriended {to_user.username}"})

    elif action == "block":
        # Remove any friendship or request
        Relationship.objects.filter(
            Q(from_user=from_user, to_user=to_user) |
            Q(from_user=to_user, to_user=from_user)
        ).delete()
        FriendRequest.objects.filter(
            Q(from_user=from_user, to_user=to_user) |
            Q(from_user=to_user, to_user=from_user)
        ).delete()

        # Create or update block relationship
        Relationship.objects.update_or_create(
            from_user=from_user,
            to_user=to_user,
            defaults={'status': Relationship.BLOCKED}
        )

        return Response({"message": f"You have blocked {to_user.username}."})

    elif action == "report":
        # Save report (assumes you have a Report model)
        reason = request.data.get("reason", "No reason provided.")
        Report.objects.create(reported_by=from_user, reported_user=to_user, reason=reason)
        return Response({"message": f"{to_user.username} has been reported."})

    else:
        return Response({"error": "Invalid action."}, status=400)