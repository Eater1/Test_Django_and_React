from django.db import models
from django.core.validators import FileExtensionValidator, MinValueValidator

class Post(models.Model):
    cover = models.FileField(upload_to='images/', validators=[FileExtensionValidator(['png', 'svg', 'jpg'])])

class Product(models.Model):
    name = models.CharField(verbose_name='Наименование', max_length=50)
    price = models.DecimalField(verbose_name='Цена', max_digits=10, decimal_places=2,
                                blank=True, null=True,
                                validators=[MinValueValidator(0)])
    amount = models.IntegerField(verbose_name='Колличество')
    vendor_code = models.CharField(verbose_name='Код товара', max_length=50)

    def __str__(self):
        return self.name
