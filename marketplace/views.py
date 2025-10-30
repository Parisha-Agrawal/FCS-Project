from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from rest_framework import viewsets, permissions
from .models import Product, Category, Order, Artifact
from .serializers import ProductSerializer, CategorySerializer, OrderSerializer

from django.http import JsonResponse
from .models import Artifact
from django.shortcuts import get_object_or_404

def artifact_list(request):
    artifacts = Artifact.objects.all()
    data = [
        {
            "id": artifact.id,
            "name": artifact.name,
            "description": artifact.description,
            "price": float(artifact.price),
        }
        for artifact in artifacts
    ]
    return JsonResponse(data, safe=False)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def process_payment(request):
    product_id = request.data.get('product_id')
    # Mock payment logic
    # You can store this info in an `Order` model
    return Response({"message": "Payment successful"})

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


def artifact_detail(request, artifact_id):
    artifact = get_object_or_404(Artifact, id=artifact_id)
    return JsonResponse({
        "id": artifact.id,
        "name": artifact.name,
        "description": artifact.description,
        "price": float(artifact.price),  
    })

@api_view(['GET'])
def public_product_list(request):
    products = Product.objects.all().order_by('-created_at')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_products(request):
    products = Product.objects.filter(owner=request.user)
    serializer = ProductSerializer(products, many=True)
    return JsonResponse(serializer.data, safe=False)

def perform_create(self, serializer):
    serializer.save(owner=self.request.user)
