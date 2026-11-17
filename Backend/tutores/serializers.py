
import re
from rest_framework import serializers
from .models import Tutor
from .fields import gerar_hash_cpf


class TutorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tutor
        fields = [
            'id',
            'nome',
            'cpf',
            'telefone',
            'email',
            'endereco',
        ]

    def validate_cpf(self, value):
        cpf = re.sub(r'\D', '', value)

        if len(cpf) != 11:
            raise serializers.ValidationError(
                'O CPF deve possuir 11 números.'
            )

        if cpf == cpf[0] * 11:
            raise serializers.ValidationError('CPF inválido.')

        if self.instance:
            if self.instance.cpf == cpf:
                return cpf

        cpf_hash = gerar_hash_cpf(cpf)

        consulta = Tutor.objects.filter(cpf_hash=cpf_hash)

        if self.instance:
            consulta = consulta.exclude(pk=self.instance.pk)

        if consulta.exists():
            raise serializers.ValidationError(
                'Este CPF já está cadastrado.'
            )

        return cpf
