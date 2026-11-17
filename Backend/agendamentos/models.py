
from django.db import models
from tutores.models import Tutor
from pets.models import Pet


class Agendamento(models.Model):

    STATUS_CHOICES = [
        ('Agendado', 'Agendado'),
        ('Concluído', 'Concluído'),
        ('Cancelado', 'Cancelado'),
    ]

    tutor = models.ForeignKey(
        Tutor,
        on_delete=models.CASCADE,
        related_name='agendamentos'
    )

    pet = models.ForeignKey(
        Pet,
        on_delete=models.CASCADE,
        related_name='agendamentos'
    )

    data_agendamento = models.DateField()
    horario = models.TimeField()
    descricao = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Agendado'
    )

    class Meta:
        ordering = ['data_agendamento', 'horario']

    def __str__(self):
        return f'{self.pet.nome} - {self.data_agendamento}'
