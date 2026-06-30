from celery import shared_task
from .dynamic_service import DynamicReportService
from .pdf_generator import generate_dynamic_report_pdf
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import time
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def generate_async_pdf_report(self, report_type, config, user_email):
    """
    Celery task to generate heavy PDFs.
    Instead of returning the PDF to the HTTP request, it saves it to disk (or S3)
    and we could email the user a secure download link.
    """
    logger.info(f"Starting background PDF generation for {report_type}")
    
    try:
        # 1. Heavy Database Aggregation
        report_data = DynamicReportService.generate_report_data(config)
        
        # 2. Heavy CPU PDF Generation
        pdf_buffer = generate_dynamic_report_pdf(
            report_type=report_type,
            config=config,
            report_data=report_data
        )
        
        # 3. Save the PDF to permanent storage
        filename = f"reports/async_{report_type}_{int(time.time())}.pdf"
        saved_path = default_storage.save(filename, ContentFile(pdf_buffer.getvalue()))
        
        # 4. Notify the user (Pseudo-code)
        # download_link = f"https://tesc.zchpc.ac.zw/media/{saved_path}"
        # send_email("Your Report is Ready", f"Download here: {download_link}", user_email)
        
        return {
            "status": "success",
            "file_path": saved_path
        }
        
    except Exception as e:
        logger.exception("Failed to generate background PDF")
        raise
