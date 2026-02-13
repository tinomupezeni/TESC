from rest_framework import serializers
from .models import IseopProgram, IseopStudent

class IseopProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = IseopProgram
        fields = '__all__'

class IseopStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = IseopStudent
        fields = '__all__'