
from django.db import models
from .fields import EncryptedCPFField, gerar_hash_cpf


class Tutor(models.Model):
    nome = models.CharField(max_length=150)
    cpf = EncryptedCPFField(max_length=255)
    cpf_hash = models.CharField(max_length=64, unique=True, editable=False)
    telefone = models.CharField(max_length=20)
    email = models.EmailField()
    endereco = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        self.cpf_hash = gerar_hash_cpf(self.cpf)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome
