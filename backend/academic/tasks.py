import base64
import pandas as pd
import io
from celery import shared_task
from django.core.files.base import ContentFile
from .services.student_services import StudentIngestionService
from instauth.models import Institution
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def process_student_csv_upload(self, base64_csv_data, institution_id, user_email):
    """
    Celery task to asynchronously process massive CSV files.
    Notice how we pass base64 data, because Celery cannot serialize raw Python File objects over Redis!
    """
    try:
        logger.info(f"Starting async CSV processing for institution {institution_id}")
        
        # Decode the file
        csv_bytes = base64.b64decode(base64_csv_data)
        file_obj = io.BytesIO(csv_bytes)
        file_obj.name = "upload.csv"
        
        # In a real heavy task, you could update the state so the frontend can poll it:
        # self.update_state(state='PROGRESS', meta={'current': 0, 'total': 10000})
        
        institution = Institution.objects.get(id=institution_id)
        
        # Run the heavy ingestion
        result = StudentIngestionService.process_student_upload(file_obj, institution)
        
        # When done, you could send an email to user_email:
        # send_mail("Upload Complete", f"Successfully imported {result['imported']} students.", "system@tesc.com", [user_email])
        
        return {
            "status": "success",
            "imported": result.get("imported", 0),
            "errors": result.get("errors", [])
        }
        
    except Exception as e:
        logger.exception("Failed to process async CSV upload")
        # Sentry will automatically catch this exception!
        raise
