from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

from .serializers import UserSerializer
from user_auth.models import CustomUser, Report
from django.contrib.auth import authenticate
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from user_auth.models import CustomUser
import json

@api_view(["GET"])
@permission_classes([IsAdminUser])  # Only allow admin users
def get_users(request):
    users = CustomUser.objects.all()  # Fetch all users
    users_data = [
        {"id": user.id, "username": user.username, "email": user.email, "is_superuser": user.is_superuser, "is_verified": user.is_verified}
        for user in users
    ]
    return JsonResponse(users_data, safe=False)

# user = User.objects.all()
# @api_view(["POST"])
# def admin_login(request):
#     email = request.data.get("email")
#     password = request.data.get("password")

#     user = authenticate(username=email, password=password)

#     if user and user.is_staff: 
#         token, _ = Token.objects.get_or_create(user=user)
#         return JsonResponse({"token": str(token), "admin": True})

#     return JsonResponse({"error": "Invalid credentials"}, status=400)

User = get_user_model()

@api_view(["POST"])
def admin_login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    try:
        user = User.objects.get(email=email)  # Fetch user by email
        user = authenticate(username=user.username, password=password)  # Authenticate using username
    except User.DoesNotExist:
        return JsonResponse({"error": "Invalid credentials"}, status=400)

    if user and user.is_staff:
        token, _ = Token.objects.get_or_create(user=user)
        return JsonResponse({"token": str(token), "admin": True})

    return JsonResponse({"error": "Invalid credentials"}, status=400)


@csrf_exempt
def verify_user(request, user_id):
    if request.method == "POST":
        try:
            user = CustomUser.objects.get(id=user_id)
            data = json.loads(request.body)
            if data.get("status") == "approve":
                user.is_verified = True
            elif data.get("status") == "reject":
                user.is_verified = False
            user.save()
            return JsonResponse({"message": "User verification updated successfully."}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
        
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
def admin_reports_list(request):
    reports = Report.objects.select_related("reported_by", "reported_user").order_by("-timestamp")
    data = [
        {
            "id": report.id,
            "from_user": report.reported_by.username,
            "to_user": report.reported_user.username,
            "reason": report.reason,
            "timestamp": report.timestamp.isoformat(),
        }
        for report in reports
    ]
    return JsonResponse(data, safe=False)