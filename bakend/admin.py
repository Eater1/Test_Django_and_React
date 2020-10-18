from django.contrib import admin
from .models import Product, Post

# Register your models here.
admin.site.register(Post)
admin.site.register(Product)