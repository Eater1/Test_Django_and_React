from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import permissions, status
from rest_framework.response import Response
from .serializers import ProductSerializer, FileSerializer, \
    TokenObtainSerializer, UserSerializer
from .models import Product, Post
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from cv2 import cvtColor, imread, COLOR_RGB2BGR
from pyzbar.pyzbar import decode, ZBarSymbol
from os import path, mkdir
from numpy import array
from PIL import Image
from cairosvg import svg2png
from io import BytesIO
from rest_framework_simplejwt.tokens import RefreshToken


# Класс отвечающий за вывод данных продукта через ручной ввод
class ProductTextCode(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        product_data = Product.objects.filter(vendor_code=request.data['vendor_code'][7:12])
        if product_data.exists():
            flag = self.CheckDigitCheck(request.data['vendor_code'])
            if flag == True:
                product_date_seriali = ProductSerializer(product_data, many=True)
                return Response(product_date_seriali.data)
            elif flag == False:
                return Response(data={"err": "Штрих код не подлинный"},
                                status=status.HTTP_200_OK)
        else:
            return Response(data={"err": "Такого товара нету в базе"},
                            status=status.HTTP_200_OK)


    # Метод отвечающий за проверку штрих кода на подлинность
    def CheckDigitCheck(self, num):
        one_step = sum([int(i) for k, i in enumerate(num, start=1) if not k % 2])
        two_step = one_step * 3
        three_step = sum([int(i) for k, i in enumerate(num, start=1) if k % 2 and k < 13])
        four_step = two_step + three_step
        final = 10 - int(str(four_step)[-1:])
        if num[12:] == str(final):
            flag = True
            return flag
        else:
            flag = False
            return flag


# Класс отвечающий за вывод данных продукта через изображение
class ProductCode(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        posts_serializer = FileSerializer(data=request.data)
        if posts_serializer.is_valid():
            posts_serializer.save()
            # Тут производиться подмена ответа post запроса при загрузки изображения
            # Ответ на запрос будет информация о товаре
            # -----------------------------------------------------------------------
            serializer = FileSerializer(Post.objects.all(), many=True)
            path_file = serializer.data[0]['cover']
            code = self.Decoder_barcode(path_file[1:])
            product = Product.objects.filter(vendor_code=code.decode('utf-8')[7:12])

            if product.exists():
                product_date = ProductSerializer(product, many=True)
                Post.objects.all().delete()
                return Response(product_date.data)
            else:
                Post.objects.all().delete()
                return Response(data={"err": "Такого товара нету в базе"},
                                status=status.HTTP_200_OK)
            # ----------------------------------------------------------------------------
        else:
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    # Метод отвечающий за распознование штрих кода.
    # Этот метод использунт возможности бибилиотеки pyzbar и opencv
    def Decoder_barcode(self, filename):

        if not path.exists('images'):
            mkdir('images/')

        files, file_extension = path.splitext(filename)
        # Если приходит файл формата .svg
        # то используем библиотеки PIL и cairosvg для перевода
        # изображения в удобный для opencv формат
        # -----------------------------------------------------------------
        if file_extension == '.svg':

            with open(filename, 'r') as file:
                svg = file.read()

            png = svg2png(bytestring=svg)
            pil_img = Image.open(BytesIO(png))
            image = cvtColor(array(pil_img), COLOR_RGB2BGR)
        # ------------------------------------------------------------------
        else:
            image = imread(filename)
        detectBarcode = decode(image, symbols=[ZBarSymbol.EAN13])

        for barcode in detectBarcode:
            return barcode.data


# Класс отвечающий за выдачу токена при входе
class ObtainToken(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = TokenObtainSerializer


# Класс отвечающий за создание пользователя
class CustomUserCreate(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request, format='json'):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Класс отправляющий сообщение при успешной авторизации
class Message(APIView):

    def get(self, request):
        return Response(data={"hello": "Вы успешно вошли в сервис"},
                        status=status.HTTP_200_OK)


# Класс отвечающий за занесение устаревших токенов в черный лист
class BlacklistToken(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as erro:
            return Response(status=status.HTTP_400_BAD_REQUEST)
