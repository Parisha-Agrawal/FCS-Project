from django.contrib import admin

from user_auth.models import Report
from .models import Product, Order, Category

from .models import Artifact

admin.site.register(Artifact)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(Category)
admin.site.register(Report)