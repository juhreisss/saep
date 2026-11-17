
from django.db import models
from tutores.models import Tutor


class Pet(models.Model):
    nome = models.CharField(max_length=100)
    especie = models.CharField(max_length=50)
    raca = models.CharField(max_length=100)
    data_nascimento = models.DateField(null=True, blank=True)

    tutor = models.ForeignKey(
        Tutor,
        on_delete=models.CASCADE,
        related_name='pets'
    )

    def __str__(self):
        return self.nome
