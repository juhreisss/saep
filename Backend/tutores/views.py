
import re

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Tutor
from .serializers import TutorSerializer
from .fields import gerar_hash_cpf


class TutorViewSet(viewsets.ModelViewSet):

    serializer_class = TutorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Tutor.objects.all().order_by('nome')

        termo = self.request.query_params.get('busca', '').strip()

        if termo:
            queryset = queryset.filter(
                nome__icontains=termo
            ) | queryset.filter(
                email__icontains=termo
            ) | queryset.filter(
                telefone__icontains=termo
            )

            cpf = re.sub(r'\D', '', termo)

            if cpf:
                if len(cpf) == 11:
                    cpf_hash = gerar_hash_cpf(cpf)
                    queryset = queryset | Tutor.objects.filter(
                        cpf_hash=cpf_hash
                    )

        return queryset.distinct()

