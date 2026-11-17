from rest_framework import serializers
from .models import Pet


class PetSerializer(serializers.ModelSerializer):
    tutor_nome = serializers.CharField(source='tutor.nome', read_only=True)

    class Meta:
        model = Pet
        fields = [
            'id',
            'nome',
            'especie',
            'raca',
            'data_nascimento',
            'tutor',
            'tutor_nome'
        ]
        