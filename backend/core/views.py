from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from celery.result import AsyncResult

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_task_status(request, task_id):
    """
    Generic endpoint for the React frontend to poll the status of any background Celery task.
    Whether it's a PDF report or a massive CSV upload, React can ping this URL every 3 seconds.
    """
    task = AsyncResult(task_id)
    
    response_data = {
        'state': task.state,  # Will be 'PENDING', 'STARTED', 'SUCCESS', or 'FAILURE'
    }
    
    if task.state == 'SUCCESS':
        # This contains whatever your tasks.py function returned! 
        # (e.g. {"file_path": "/media/reports/..."})
        response_data['result'] = task.result
        
    elif task.state == 'FAILURE':
        # If the background code crashed, we can tell the frontend
        response_data['error'] = str(task.info)
        
    return Response(response_data)
