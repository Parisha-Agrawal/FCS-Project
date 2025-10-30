from rest_framework import serializers
from .models import CustomUser, Message, GroupChat, GroupMessage, Transaction
from rest_framework_simplejwt.tokens import RefreshToken
from .models import FriendRequest

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email','bio', 'profile_picture', 'is_verified']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # user = CustomUser.objects.create_user(**validated_data)
        # return user
        user = CustomUser(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data['password']           
            
        )
        user.set_password(validated_data["password"])  # Hash password
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    # def validate(self, data):
    #     user = CustomUser.objects.filter(username=data['username']).first()
    #     if user and user.check_password(data['password']):
    #         return {'user': user, 'token': str(RefreshToken.for_user(user).access_token)}
    #     raise serializers.ValidationError("Invalid credentials")
    def validate(self, data):
        user = authenticate(username=data["username"], password=data["password"])
        if user:
            return {"user": user, "token": str(RefreshToken.for_user(user).access_token)}
        raise serializers.ValidationError("Invalid credentials")

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)
    decrypted_content = serializers.SerializerMethodField()
    formatted_timestamp = serializers.SerializerMethodField()
    media_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_username', 'receiver', 'receiver_username', 
                  'decrypted_content', 'media_url', 'formatted_timestamp', 'timestamp', 'expires_at', 'media']

        extra_kwargs = {
            'media': {'write_only': True}
        }

    def get_decrypted_content(self, obj):
        return obj.get_decrypted_content()
    
    def get_formatted_timestamp(self, obj):
        return obj.timestamp.strftime("%Y-%m-%d %H:%M:%S")

    def get_media_url(self, obj):
        request = self.context.get('request')
        if obj.media and request:
            return request.build_absolute_uri(obj.media.url)
        return None
    
class GroupChatSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(many=True, queryset=CustomUser.objects.all())

    class Meta:
        model = GroupChat
        fields = ['id', 'name', 'members']

class GroupMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True) 
    decrypted_content = serializers.SerializerMethodField()
    media_url = serializers.SerializerMethodField()

    class Meta:
        model = GroupMessage
        fields = ['id', 'group', 'sender', 'sender_username', 'decrypted_content', 'timestamp', 'expires_at', 'media_url']

    def get_decrypted_content(self, obj):
        return obj.get_decrypted_content()

    def get_media_url(self, obj):
        request = self.context.get('request')  # Get request context
        if obj.media and request:
            return request.build_absolute_uri(obj.media.url)  # Convert to full URL
        return None

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'sender', 'receiver', 'amount', 'timestamp']

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'status', 'timestamp']