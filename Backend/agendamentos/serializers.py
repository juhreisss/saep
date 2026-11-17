from rest_framework import serializers
from .models import Agendamento


class AgendamentoSerializer(serializers.ModelSerializer):
    tutor_nome = serializers.CharField(source='tutor.nome', read_only=True)
    tutor_cpf = serializers.CharField(source='tutor.cpf', read_only=True)
    tutor_telefone = serializers.CharField(source='tutor.telefone', read_only=True)
    tutor_email = serializers.CharField(source='tutor.email', read_only=True)
    tutor_endereco = serializers.CharField(source='tutor.endereco', read_only=True)

    pet_nome = serializers.CharField(source='pet.nome', read_only=True)
    pet_especie = serializers.CharField(source='pet.especie', read_only=True)
    pet_raca = serializers.CharField(source='pet.raca', read_only=True)

    class Meta:
        model = Agendamento
        fields = [
            'id',
            'tutor',
            'tutor_nome',
            'tutor_cpf',
            'tutor_telefone',
            'tutor_email',
            'tutor_endereco',
            'pet',
            'pet_nome',
            'pet_especie',
            'pet_raca',
            'data_agendamento',
            'horario',
            'descricao',
            'status'
        ]

    def validate(self, data):
        tutor = data.get('tutor', getattr(self.instance, 'tutor', None))
        pet = data.get('pet', getattr(self.instance, 'pet', None))

        if tutor and pet and pet.tutor_id != tutor.id:
            raise serializers.ValidationError(
                'O pet selecionado não pertence ao tutor informado.'
            )

        return data