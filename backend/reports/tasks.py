# reports/tasks.py
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from django.core.files.base import ContentFile
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import io
import json
import logging

logger = logging.getLogger(__name__)

from .models import GeneratedReport, ReportTemplate
from institutions.models import Institution
from faculties.models import Program, Department  # Update based on your apps
from students.models import Student, Enrollment  # Update based on your apps


@shared_task
def generate_report_task(report_id):
    """Async task to generate a report"""
    try:
        with transaction.atomic():
            report = GeneratedReport.objects.select_for_update().get(id=report_id)
            
            # Update status
            report.status = 'generating'
            report.started_at = timezone.now()
            report.save()
            
            try:
                # Generate report based on template
                if report.template.category == 'enrollment':
                    file_content = generate_enrollment_report(report)
                elif report.template.category == 'academic':
                    file_content = generate_academic_report(report)
                elif report.template.category == 'staff':
                    file_content = generate_staff_report(report)
                elif report.template.category == 'financial':
                    file_content = generate_financial_report(report)
                else:
                    raise ValueError(f"Unknown report category: {report.template.category}")
                
                # Save file
                filename = f"{report.title.replace(' ', '_')}.{report.format}"
                report.file.save(filename, ContentFile(file_content))
                
                # Update status
                report.status = 'completed'
                report.completed_at = timezone.now()
                report.save()
                
                logger.info(f"Report {report_id} generated successfully")
                
            except Exception as e:
                report.status = 'failed'
                report.error_message = str(e)
                report.save()
                logger.error(f"Failed to generate report {report_id}: {e}")
                raise
                
    except GeneratedReport.DoesNotExist:
        logger.error(f"Report {report_id} not found")
    except Exception as e:
        logger.error(f"Unexpected error generating report {report_id}: {e}")


def generate_enrollment_report(report):
    """Generate enrollment statistics report"""
    institution = report.institution
    params = report.parameters
    
    # Query enrollment data
    programs = Program.objects.filter(department__institution=institution)
    
    if report.format == 'pdf':
        return generate_enrollment_pdf(report, programs, params)
    elif report.format == 'excel':
        return generate_enrollment_excel(report, programs, params)
    elif report.format == 'csv':
        return generate_enrollment_csv(report, programs, params)
    else:
        raise ValueError(f"Unsupported format: {report.format}")


def generate_enrollment_pdf(report, programs, params):
    """Generate PDF enrollment report"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center
    )
    story.append(Paragraph(report.title, title_style))
    
    # Institution info
    story.append(Paragraph(f"Institution: {report.institution.name}", styles['Normal']))
    story.append(Paragraph(f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Summary table
    summary_data = [
        ['Program', 'Total Students', 'Male', 'Female', 'International']
    ]
    
    for program in programs:
        # This would be actual queries in production
        summary_data.append([
            program.name,
            '150',  # Placeholder
            '80',   # Placeholder
            '70',   # Placeholder
            '10'    # Placeholder
        ])
    
    table = Table(summary_data, colWidths=[2.5*inch, inch, inch, inch, inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 30))
    
    # Add more sections as needed...
    
    doc.build(story)
    return buffer.getvalue()


def generate_enrollment_excel(report, programs, params):
    """Generate Excel enrollment report"""
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Summary sheet
        summary_data = []
        for program in programs:
            summary_data.append({
                'Program Name': program.name,
                'Program Code': program.code,
                'Department': program.department.name if program.department else '',
                'Total Students': 150,  # Placeholder
                'Male': 80,             # Placeholder
                'Female': 70,           # Placeholder
                'International': 10     # Placeholder
            })
        
        df_summary = pd.DataFrame(summary_data)
        df_summary.to_excel(writer, sheet_name='Summary', index=False)
        
        # Detailed sheet (placeholder)
        df_details = pd.DataFrame({
            'Student ID': ['S001', 'S002', 'S003'],
            'Name': ['John Doe', 'Jane Smith', 'Bob Johnson'],
            'Program': ['Computer Science', 'Business', 'Engineering'],
            'Enrollment Date': ['2024-01-15', '2024-01-20', '2024-02-01']
        })
        df_details.to_excel(writer, sheet_name='Details', index=False)
    
    return output.getvalue()


def generate_enrollment_csv(report, programs, params):
    """Generate CSV enrollment report"""
    output = io.StringIO()
    
    # Write header
    output.write('Program,Code,Department,Total_Students,Male,Female,International\n')
    
    for program in programs:
        output.write(f'{program.name},{program.code},')
        output.write(f'{program.department.name if program.department else ""},')
        output.write('150,80,70,10\n')  # Placeholder data
    
    return output.getvalue().encode('utf-8')


def generate_academic_report(report):
    """Generate academic performance report"""
    # Similar structure to enrollment report
    # Implement based on your academic data models
    return b"Academic report placeholder"


def generate_staff_report(report):
    """Generate staff analytics report"""
    # Similar structure to enrollment report
    # Implement based on your staff data models
    return b"Staff report placeholder"


def generate_financial_report(report):
    """Generate financial overview report"""
    # Similar structure to enrollment report
    # Implement based on your financial data models
    return b"Financial report placeholder"