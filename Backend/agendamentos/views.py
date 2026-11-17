from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Agendamento
from .serializers import AgendamentoSerializer


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.select_related(
        'tutor', 'pet'
    ).all().order_by('data_agendamento', 'horario')

    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]