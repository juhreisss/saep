from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Pet
from .serializers import PetSerializer


class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.select_related('tutor').all().order_by('nome')
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated]