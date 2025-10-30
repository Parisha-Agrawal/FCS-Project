from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet, CategoryViewSet, artifact_list, artifact_detail, public_product_list, my_products
from django.conf import settings
from django.conf.urls.static import static
router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("artifacts/", artifact_list, name="artifact-list"),
    path("payment/<int:artifact_id>/", artifact_detail, name="artifact-detail"),
    path("artifacts/<int:artifact_id>/", artifact_detail, name="artifact-detail"),
    path('public-products/', public_product_list, name='public-products'),
    path('my-products/', my_products, name='my-products'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

