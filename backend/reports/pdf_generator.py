"""
Professional PDF Report Generator

Creates professional PDF reports with:
- TESC branding header with logo
- Dynamic data tables with styling
- Pagination with footer
- Support for both detailed and aggregated reports
"""

import os
import requests
from datetime import datetime
from io import BytesIO

from django.conf import settings
from django.core.cache import cache

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, HRFlowable
)
from reportlab.pdfgen import canvas


# TESC Brand Colors - Blue theme to match TESC logo
TESC_BLUE = colors.HexColor('#1e3a5f')  # Dark blue for headers
TESC_BLUE_LIGHT = colors.HexColor('#3b82f6')  # Lighter blue for accents
TESC_BLUE_ACCENT = colors.HexColor('#0ea5e9')  # Sky blue for highlights
HEADER_BG = colors.HexColor('#1e3a5f')  # Dark blue header background
ROW_ALT = colors.HexColor('#f0f9ff')  # Light blue tint for alternating rows
WHITE = colors.white
BLACK = colors.black
GRAY = colors.HexColor('#64748b')  # Slate gray

# TESC Logo URL
TESC_LOGO_URL = 'https://tesc.co.zw/wp-content/uploads/2025/04/tesc-logo.jpg'


def get_tesc_logo():
    """
    Fetch and cache the TESC logo from the URL.
    Returns a BytesIO object with the image data, or None if failed.
    """
    cache_key = 'tesc_logo_image'
    cached_logo = cache.get(cache_key)

    if cached_logo:
        return BytesIO(cached_logo)

    try:
        response = requests.get(TESC_LOGO_URL, timeout=10)
        if response.status_code == 200:
            image_data = response.content
            # Cache for 24 hours
            cache.set(cache_key, image_data, 60 * 60 * 24)
            return BytesIO(image_data)
    except Exception as e:
        print(f"Failed to fetch TESC logo: {e}")

    return None


class NumberedCanvas(canvas.Canvas):
    """Custom canvas that adds page numbers and footer to each page."""

    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []
        self.institution_name = kwargs.pop('institution_name', '')
        self.report_title = kwargs.pop('report_title', 'Report')

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        """Add page numbers to all pages."""
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_footer(self, page_count):
        """Draw footer with page number and confidentiality notice."""
        page_width, page_height = self._pagesize

        # Footer line
        self.setStrokeColor(TESC_BLUE)
        self.setLineWidth(0.5)
        self.line(30, 40, page_width - 30, 40)

        # Page number - right side
        self.setFont('Helvetica', 9)
        self.setFillColor(GRAY)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(page_width - 30, 25, page_text)

        # Confidentiality notice - left side
        self.drawString(30, 25, "Confidential - For Internal Use Only")

        # Generation timestamp - center
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.drawCentredString(page_width / 2, 25, f"Generated: {timestamp}")


class ProfessionalPDFGenerator:
    """
    Generates professional PDF reports with TESC branding.
    """

    def __init__(self, title: str, institution_name: str = None, orientation: str = 'portrait'):
        """
        Initialize PDF generator.

        Args:
            title: Report title
            institution_name: Name of institution (optional)
            orientation: 'portrait' or 'landscape'
        """
        self.title = title
        self.institution_name = institution_name or 'All Institutions'
        self.orientation = orientation
        self.pagesize = landscape(A4) if orientation == 'landscape' else A4
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        self._logo = None

    def _setup_custom_styles(self):
        """Setup custom paragraph styles."""
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=TESC_BLUE,
            spaceAfter=6,
            alignment=TA_CENTER
        ))

        self.styles.add(ParagraphStyle(
            name='SubTitle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=GRAY,
            spaceAfter=20,
            alignment=TA_CENTER
        ))

        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=TESC_BLUE,
            spaceBefore=15,
            spaceAfter=10
        ))

        self.styles.add(ParagraphStyle(
            name='StatLabel',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=GRAY
        ))

        self.styles.add(ParagraphStyle(
            name='StatValue',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=BLACK,
            fontName='Helvetica-Bold'
        ))

    def _get_logo(self):
        """Get the TESC logo image for the header."""
        if self._logo is None:
            logo_data = get_tesc_logo()
            if logo_data:
                try:
                    self._logo = Image(logo_data, width=50, height=50)
                except Exception as e:
                    print(f"Failed to create logo image: {e}")
                    self._logo = False  # Mark as failed
            else:
                self._logo = False

        return self._logo if self._logo else None

    def _create_header(self, institution_name: str = None) -> list:
        """Create the report header with TESC branding."""
        elements = []

        # Try to get logo
        logo = self._get_logo()

        if logo:
            # Header with actual logo
            header_data = [[
                logo,
                Paragraph("TERTIARY EDUCATION SUPPORT CENTER", ParagraphStyle(
                    'HeaderText',
                    parent=self.styles['Normal'],
                    fontSize=14,
                    textColor=WHITE,
                    fontName='Helvetica-Bold',
                    alignment=TA_CENTER
                ))
            ]]
        else:
            # Fallback: Text-based header
            header_data = [[
                Paragraph("TESC", ParagraphStyle(
                    'LogoText',
                    parent=self.styles['Normal'],
                    fontSize=24,
                    textColor=WHITE,
                    fontName='Helvetica-Bold'
                )),
                Paragraph("TERTIARY EDUCATION SUPPORT CENTER", ParagraphStyle(
                    'HeaderText',
                    parent=self.styles['Normal'],
                    fontSize=14,
                    textColor=WHITE,
                    fontName='Helvetica-Bold',
                    alignment=TA_CENTER
                ))
            ]]

        header_table = Table(header_data, colWidths=[80, None])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), TESC_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(header_table)

        # Institution name sub-header
        inst_name = institution_name or self.institution_name
        elements.append(Spacer(1, 5))
        inst_style = ParagraphStyle(
            'InstitutionName',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=TESC_BLUE,
            alignment=TA_CENTER,
            fontName='Helvetica-Oblique'
        )
        elements.append(Paragraph(inst_name, inst_style))
        elements.append(Spacer(1, 15))

        return elements

    def _create_title_section(self, record_count: int, group_by: str = None) -> list:
        """Create the title section with report name and metadata."""
        elements = []

        # Main title
        title_text = self.title
        if group_by:
            title_text = f"{self.title} - By {group_by}"
        elements.append(Paragraph(title_text, self.styles['ReportTitle']))

        # Subtitle with date and count
        date_str = datetime.now().strftime("%B %d, %Y")
        subtitle = f"Generated: {date_str}  |  Records: {record_count:,}"
        elements.append(Paragraph(subtitle, self.styles['SubTitle']))

        # Divider
        elements.append(HRFlowable(
            width="100%",
            thickness=1,
            color=TESC_BLUE_LIGHT,
            spaceBefore=5,
            spaceAfter=15
        ))

        return elements

    def _create_data_table(self, data: list, columns: list, is_aggregated: bool = False) -> Table:
        """
        Create a styled data table.

        Args:
            data: List of data dictionaries
            columns: List of column definitions with 'key' and 'label'
            is_aggregated: Whether this is an aggregated (grouped) table
        """
        if not data:
            return Paragraph("No data available", self.styles['Normal'])

        # Build table data
        header_row = [col['label'] for col in columns]
        table_data = [header_row]

        for record in data:
            row = []
            for col in columns:
                value = record.get(col['key'], '')
                # Handle None values
                if value is None:
                    value = ''
                # Truncate long values
                str_value = str(value)
                if len(str_value) > 50 and not is_aggregated:
                    str_value = str_value[:47] + '...'
                row.append(str_value)
            table_data.append(row)

        # Calculate column widths
        page_width = self.pagesize[0] - 60  # margins
        num_cols = len(columns)

        if is_aggregated:
            # For aggregated tables, group column is wider
            col_widths = [page_width * 0.7, page_width * 0.3]
        else:
            # For detail tables, distribute evenly with some intelligence
            col_widths = [page_width / num_cols] * num_cols

        table = Table(table_data, colWidths=col_widths, repeatRows=1)

        # Table styling - Blue theme
        style_commands = [
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), TESC_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),

            # Data row styling
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('TOPPADDING', (0, 1), (-1, -1), 6),

            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('BOX', (0, 0), (-1, -1), 1, TESC_BLUE),

            # Vertical alignment
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]

        # Alternating row colors - light blue tint
        for i in range(1, len(table_data)):
            if i % 2 == 0:
                style_commands.append(
                    ('BACKGROUND', (0, i), (-1, i), ROW_ALT)
                )

        # Right-align count column for aggregated tables
        if is_aggregated and len(columns) > 1:
            style_commands.append(('ALIGN', (-1, 1), (-1, -1), 'RIGHT'))

        table.setStyle(TableStyle(style_commands))
        return table

    def _create_summary_stats(self, total: int, group_label: str = None) -> list:
        """Create summary statistics section."""
        elements = []

        stats_data = [[
            Paragraph("Total Records", self.styles['StatLabel']),
            Paragraph(f"{total:,}", self.styles['StatValue'])
        ]]

        if group_label:
            stats_data[0].extend([
                Paragraph("Grouped By", self.styles['StatLabel']),
                Paragraph(group_label, self.styles['StatValue'])
            ])

        stats_table = Table(stats_data, colWidths=[100, 80, 100, 150])
        stats_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ]))

        elements.append(stats_table)
        elements.append(Spacer(1, 20))

        return elements

    def generate(self, report_data: dict) -> BytesIO:
        """
        Generate the PDF report.

        Args:
            report_data: Dictionary containing:
                - data: List of records
                - total: Total record count
                - columns: Column definitions
                - is_aggregated: Whether data is aggregated
                - group_by: Group by field (if aggregated)
                - group_label: Human-readable group label

        Returns:
            BytesIO buffer containing the PDF
        """
        buffer = BytesIO()

        # Determine if landscape is needed based on column count
        columns = report_data.get('columns', [])
        if len(columns) > 6 and self.orientation == 'portrait':
            self.pagesize = landscape(A4)

        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.pagesize,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=50
        )

        elements = []

        # Header
        elements.extend(self._create_header())

        # Title section
        elements.extend(self._create_title_section(
            record_count=report_data.get('total', 0),
            group_by=report_data.get('group_label')
        ))

        # Summary stats
        elements.extend(self._create_summary_stats(
            total=report_data.get('total', 0),
            group_label=report_data.get('group_label')
        ))

        # Data table
        data_table = self._create_data_table(
            data=report_data.get('data', []),
            columns=columns,
            is_aggregated=report_data.get('is_aggregated', False)
        )
        elements.append(data_table)

        # Build PDF
        doc.build(elements)

        buffer.seek(0)
        return buffer

    def generate_to_file(self, report_data: dict, file_path: str) -> str:
        """
        Generate PDF and save to file.

        Args:
            report_data: Report data dictionary
            file_path: Path to save the PDF

        Returns:
            Path to the saved file
        """
        buffer = self.generate(report_data)

        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, 'wb') as f:
            f.write(buffer.getvalue())

        return file_path


def generate_dynamic_report_pdf(
    report_type: str,
    title: str,
    report_data: dict,
    institution_name: str = None,
    orientation: str = 'auto'
) -> BytesIO:
    """
    Convenience function to generate a PDF report.

    Args:
        report_type: Type of report (staff, students, graduates)
        title: Report title
        report_data: Data from DynamicReportService.generate_report_data()
        institution_name: Optional institution name
        orientation: 'portrait', 'landscape', or 'auto'

    Returns:
        BytesIO buffer containing the PDF
    """
    # Auto-detect orientation based on columns
    if orientation == 'auto':
        num_columns = len(report_data.get('columns', []))
        orientation = 'landscape' if num_columns > 5 else 'portrait'

    generator = ProfessionalPDFGenerator(
        title=title,
        institution_name=institution_name,
        orientation=orientation
    )

    return generator.generate(report_data)
