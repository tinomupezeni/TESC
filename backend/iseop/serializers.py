from rest_framework import serializers
from .models import IseopProgram

class IseopProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = IseopProgram
        fields = '__all__'