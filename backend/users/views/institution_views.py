# institutions/views.py
from rest_framework import generics, permissions
from ..models import Institution
from ..serializers.institution_serializers import InstitutionListSerializer

class InstitutionListView(generics.ListAPIView):
    queryset = Institution.objects.all().order_by('name')
    serializer_class = InstitutionListSerializer
    permission_classes = [permissions.AllowAny] # Anyone can see the list of institutions to sign up