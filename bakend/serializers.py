from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Post
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'amount', 'vendor_code']


# Класс сериализатор для изображения
class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'


# Класс сериализатор для токенов
class TokenObtainSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(TokenObtainSerializer, cls).get_token(user)

        # Добавляем в наш токен имя пользователя
        token['username'] = user.username
        return token


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
