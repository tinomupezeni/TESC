import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.http import HttpResponse
from ..services.ingestion_service import IngestionService

class TemplateDownloadView(APIView):
    def get(self, request, module_type):
        try:
            wb = IngestionService.generate_template(module_type)
            output = io.BytesIO()
            wb.save(output)
            output.seek(0)
            
            response = HttpResponse(
                output,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename={module_type}_template.xlsx'
            return response
        except ValueError as e:
            return Response({'error': str(e)}, status=400)

class ValidateUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, module_type):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)
            
        # Save file temporarily to validate
        import os
        from django.core.files.storage import default_storage
        file_path = default_storage.save(f'temp_{file.name}', file)
        
        try:
            results = IngestionService.validate_upload(module_type, default_storage.path(file_path))
            return Response(results)
        finally:
            os.remove(default_storage.path(file_path))

class CommitUploadView(APIView):
    def post(self, request, module_type):
        data = request.data.get('data')
        institution_id = request.data.get('institution_id') # Assume frontend sends institution_id
        if not institution_id and hasattr(request.user, 'institution'):
            institution_id = request.user.institution.id

        if not data:
            return Response({'error': 'No data provided'}, status=400)
        if not institution_id:
            return Response({'error': 'Institution ID is required'}, status=400)
            
        success_count = IngestionService.commit_upload(module_type, data, institution_id)
        return Response({'success': True, 'imported': success_count})