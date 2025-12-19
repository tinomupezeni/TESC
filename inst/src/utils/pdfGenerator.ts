// frontend/src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';

export interface PDFReportData {
  title: string;
  generated_at: string;
  parameters?: Record<string, any>;
  data?: any; // Make data optional
  summary?: Record<string, any>;
}

export class PDFGenerator {
  static generateReport(reportData: PDFReportData, filename: string): void {
    const doc = new jsPDF();
    let yPos = 20;
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(reportData.title || "Untitled Report", 105, yPos, { align: 'center' });
    yPos += 15;
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date(reportData.generated_at).toLocaleString()}`, 14, yPos);
    yPos += 10;
    
    // Add summary if available
    if (reportData.summary && Object.keys(reportData.summary).length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Summary', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      Object.entries(reportData.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, yPos);
        yPos += 7;
      });
    } else {
      // Show message if no summary
      doc.setFontSize(12);
      doc.text('No summary data available', 14, yPos);
      yPos += 15;
    }
    
    // Add data tables if available - FIXED WITH BETTER CHECKING
    if (reportData.data && 
        Array.isArray(reportData.data) && 
        reportData.data.length > 0 && 
        reportData.data[0] && 
        typeof reportData.data[0] === 'object') {
      
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Report Data', 14, yPos);
      yPos += 10;
      
      try {
        // Get headers safely
        const firstRow = reportData.data[0];
        const headers = Object.keys(firstRow);
        
        if (headers.length > 0) {
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          
          // Calculate column widths
          const colWidth = 180 / headers.length; // Distribute across page width
          
          headers.forEach((header, index) => {
            doc.text(header, 14 + (index * colWidth), yPos);
          });
          yPos += 7;
          doc.setFont(undefined, 'normal');
          
          // Add table rows
          reportData.data.forEach((row: any, rowIndex: number) => {
            headers.forEach((header, index) => {
              const value = row[header] !== undefined ? String(row[header]) : '';
              doc.text(value, 14 + (index * colWidth), yPos);
            });
            yPos += 7;
            
            // Add new page if needed
            if (yPos > 270 && rowIndex < reportData.data.length - 1) {
              doc.addPage();
              yPos = 20;
            }
          });
        }
      } catch (error) {
        console.error("Error generating table:", error);
        doc.text('Error displaying table data', 14, yPos);
        yPos += 10;
      }
    } else if (reportData.data && typeof reportData.data === 'object') {
      // Handle non-array data objects
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Report Information', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      Object.entries(reportData.data).forEach(([key, value]) => {
        doc.text(`${key}: ${JSON.stringify(value)}`, 20, yPos);
        yPos += 7;
      });
    }
    
    // Save PDF
    doc.save(`${(filename || 'report').replace(/[^a-z0-9]/gi, '_')}.pdf`);
  }
  
  static generateEnrollmentReport(data: any): void {
    const doc = new jsPDF();
    let yPos = 20;
    
    // Title
    doc.setFontSize(18);
    doc.text(data.title || 'Enrollment Report', 105, yPos, { align: 'center' });
    yPos += 15;
    
    // Summary section
    if (data.summary && Object.keys(data.summary).length > 0) {
      doc.setFontSize(12);
      doc.text('Summary Statistics', 14, yPos);
      yPos += 10;
      
      Object.entries(data.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, yPos);
        yPos += 7;
      });
    }
    
    // Program distribution table
    if (data.by_program && Array.isArray(data.by_program) && data.by_program.length > 0) {
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Program Distribution', 14, yPos);
      yPos += 10;
      
      // Table headers
      doc.setFont(undefined, 'bold');
      doc.text('Program', 20, yPos);
      doc.text('Students', 100, yPos);
      yPos += 7;
      doc.setFont(undefined, 'normal');
      
      // Table rows
      data.by_program.forEach((item: any) => {
        doc.text(item.program || 'Unknown', 20, yPos);
        doc.text(String(item.count || 0), 100, yPos);
        yPos += 7;
      });
    }
    
    // Trends chart (if available)
    if (data.trends && Array.isArray(data.trends) && data.trends.length > 0) {
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Monthly Trends', 14, yPos);
      yPos += 10;
      
      data.trends.forEach((trend: any) => {
        doc.text(`${trend.month || 'Unknown'}: ${trend.enrollments || 0} enrollments`, 20, yPos);
        yPos += 7;
      });
    }
    
    // Fallback if no specific data found
    if (yPos <= 35) { // Only title has been added
      doc.setFontSize(12);
      doc.text('No enrollment data available', 14, yPos);
      yPos += 15;
    }
    
    doc.save('enrollment_report.pdf');
  }
  
  static generateAcademicReport(data: any): void {
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(18);
    doc.text(data.title || 'Academic Performance Report', 105, yPos, { align: 'center' });
    yPos += 15;
    
    if (data.summary && Object.keys(data.summary).length > 0) {
      doc.setFontSize(12);
      doc.text('Overall Performance', 14, yPos);
      yPos += 10;
      
      Object.entries(data.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, yPos);
        yPos += 7;
      });
    }
    
    if (data.performance_by_subject && Array.isArray(data.performance_by_subject) && data.performance_by_subject.length > 0) {
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Performance by Subject', 14, yPos);
      yPos += 10;
      
      // Table headers
      doc.setFont(undefined, 'bold');
      doc.text('Subject', 20, yPos);
      doc.text('Average', 80, yPos);
      doc.text('Pass Rate', 140, yPos);
      yPos += 7;
      doc.setFont(undefined, 'normal');
      
      // Table rows
      data.performance_by_subject.forEach((item: any) => {
        doc.text(item.subject || 'Unknown', 20, yPos);
        doc.text(String(item.average || 0), 80, yPos);
        doc.text(`${item.pass_rate || 0}%`, 140, yPos);
        yPos += 7;
      });
    }
    
    // Fallback if no data
    if (yPos <= 35) {
      doc.setFontSize(12);
      doc.text('No academic performance data available', 14, yPos);
    }
    
    doc.save('academic_report.pdf');
  }
  
  static generateStaffReport(data: any): void {
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(18);
    doc.text(data.title || 'Staff Analytics Report', 105, yPos, { align: 'center' });
    yPos += 15;
    
    if (data.summary && Object.keys(data.summary).length > 0) {
      doc.setFontSize(12);
      doc.text('Staff Summary', 14, yPos);
      yPos += 10;
      
      Object.entries(data.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, yPos);
        yPos += 7;
      });
    }
    
    if (data.by_department && Array.isArray(data.by_department) && data.by_department.length > 0) {
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Staff by Department', 14, yPos);
      yPos += 10;
      
      data.by_department.forEach((item: any) => {
        doc.text(`${item.department || 'Unknown'}: ${item.count || 0} staff`, 20, yPos);
        yPos += 7;
      });
    }
    
    // Fallback if no data
    if (yPos <= 35) {
      doc.setFontSize(12);
      doc.text('No staff data available', 14, yPos);
    }
    
    doc.save('staff_report.pdf');
  }
  
  static generateFinancialReport(data: any): void {
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(18);
    doc.text(data.title || 'Financial Overview Report', 105, yPos, { align: 'center' });
    yPos += 15;
    
    if (data.summary && Object.keys(data.summary).length > 0) {
      doc.setFontSize(12);
      doc.text('Financial Summary', 14, yPos);
      yPos += 10;
      
      // Format currency values
      Object.entries(data.summary).forEach(([key, value]) => {
        let displayValue = String(value);
        if (['revenue', 'expenses', 'profit'].some(term => key.toLowerCase().includes(term))) {
          displayValue = `$${Number(value).toLocaleString()}`;
        }
        doc.text(`${key}: ${displayValue}`, 20, yPos);
        yPos += 7;
      });
    }
    
    if (data.revenue_by_program && Array.isArray(data.revenue_by_program) && data.revenue_by_program.length > 0) {
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Revenue by Program', 14, yPos);
      yPos += 10;
      
      data.revenue_by_program.forEach((item: any) => {
        doc.text(`${item.program || 'Unknown'}: $${Number(item.revenue || 0).toLocaleString()}`, 20, yPos);
        yPos += 7;
      });
    }
    
    // Fallback if no data
    if (yPos <= 35) {
      doc.setFontSize(12);
      doc.text('No financial data available', 14, yPos);
    }
    
    doc.save('financial_report.pdf');
  }
}