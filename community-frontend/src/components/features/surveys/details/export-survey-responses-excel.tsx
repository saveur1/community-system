import { spacer } from '@/utility/logicFunctions';
import { saveAs } from "file-saver";

// Types for survey response data
interface SurveyResponse {
  id: string;
  user: {
    name: string;
    email: string;
    roles?: Array<{ id: string; name: string }>;
  };
  answers: Array<{
    questionId: string;
    answerText?: string;
    answerOptions?: string[];
  }>;
  createdAt: string;
}

interface SurveyQuestion {
  id: string;
  title: string;
  type: string;
  description?: string;
  required?: boolean;
  options?: string;
  ratingLabel?: string;
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  organization?: {
    name: string;
  };
  questionItems: SurveyQuestion[];
}

interface ExportOptions {
  survey: Survey;
  responses: SurveyResponse[];
  fileName: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

// Helper function to get answer for a question
const getAnswerForQuestion = (questionId: string, answers: SurveyResponse['answers']) => {
  return answers.find(answer => answer.questionId === questionId);
};

// Helper function to format answer text
const formatAnswerText = (answer: SurveyResponse['answers'][0] | undefined): string => {
  if (!answer) return 'No answer provided';
  
  if (answer.answerText) {
    return answer.answerText;
  }
  
  if (answer.answerOptions && answer.answerOptions.length > 0) {
    return answer.answerOptions.join(', ');
  }
  
  return 'No answer provided';
};

// Main Excel generation function
export const generateSurveyResponsesExcel = async (options: ExportOptions): Promise<void> => {
  const { survey, responses, fileName, dateRange } = options;

  if (!responses || responses.length === 0) {
    throw new Error('No responses available to export');
  }

  try {
    // Filter responses by date range if provided
    const filteredResponses = dateRange?.start || dateRange?.end
      ? responses.filter(response => {
          const responseDate = new Date(response.createdAt);
          const startDate = dateRange.start;
          const endDate = dateRange.end;
          
          if (startDate && responseDate < startDate) return false;
          if (endDate && responseDate > endDate) return false;
          return true;
        })
      : responses;

    // Dynamic imports for ExcelJS and FileSaver
    const ExcelJS = await import('exceljs');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Survey Responses');

    // Prepare table headers
    const headers = ['Responder', ...survey.questionItems.map(q => q.title)];
    const colCount = headers.length;

    // Add company header information
    const companyRow1 = worksheet.addRow(['RICH CLS']);
    worksheet.addRow(['Address: 332M+24C, KN 14 Ave, Kigali']);
    worksheet.addRow(['Phone: 0784 390 384']);
    worksheet.addRow(['Email: richrwanda@gmail.com']);
    worksheet.addRow([]);
    const titleRow = worksheet.addRow([`${survey.title} - Survey Responses Report`]);
    const dateRow = worksheet.addRow([`Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`]);
    worksheet.addRow([]); // Empty row

    // Merge cells for header rows to span across all columns
    worksheet.mergeCells(1, 1, 1, colCount); // Company name
    worksheet.mergeCells(2, 1, 2, colCount); // Address
    worksheet.mergeCells(3, 1, 3, colCount); // Phone
    worksheet.mergeCells(4, 1, 4, colCount); // Email
    worksheet.mergeCells(5, 1, 5, colCount); // Empty row
    worksheet.mergeCells(6, 1, 6, colCount); // Title
    worksheet.mergeCells(7, 1, 7, colCount); // Date
    worksheet.mergeCells(8, 1, 8, colCount); // Empty row

    // Style the header rows
    companyRow1.font = { bold: true, size: 16 };
    companyRow1.alignment = { horizontal: 'left' };
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    dateRow.font = { italic: true, size: 10 };
    dateRow.alignment = { horizontal: 'center' };

    // Add table headers starting from row 9
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF9FAFB' }
    };

    // Add response data
    filteredResponses.forEach((response) => {
      // Format responder info
      const responderInfo = `${response.user.name} (${response.user.email})${
        response.user.roles && response.user.roles.length > 0 
          ? ` - ${response.user.roles.map(role => spacer(role.name)).join(', ')}` 
          : ''
      }`;

      // Get answers for each question
      const answerValues = survey.questionItems.map(question => {
        const answer = getAnswerForQuestion(question.id, response.answers);
        return formatAnswerText(answer);
      });

      // Add row with responder info and answers
      const rowData = [responderInfo, ...answerValues];
      worksheet.addRow(rowData);
    });

    // Auto-size columns
    worksheet.columns?.forEach((col: any, index: number) => {
      let max = String(headers[index] || '').length;
      
      // Check all cells in this column
      col.eachCell?.({ includeEmpty: true }, (cell: any) => {
        const val = cell?.value ?? '';
        const len = String(val).length;
        if (len > max) max = len;
      });
      
      // Set column width with reasonable limits
      col.width = Math.min(Math.max(max + 2, 15), 80);
    });

    // Set specific width for responder column (first column)
    if (worksheet.columns && worksheet.columns[0]) {
      (worksheet.columns[0] as any).width = 40;
    }

    // Add borders to data table
    const dataStartRow = 9; // Header row
    const dataEndRow = dataStartRow + filteredResponses.length;
    
    for (let row = dataStartRow; row <= dataEndRow; row++) {
      for (let col = 1; col <= colCount; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }

    // Remove any duplicate 'id' appearing at top
    worksheet.getCell('A1').value = 'RICH CLS';

    // Generate and download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, `${fileName}_responses.xlsx`);

  } catch (err) {
    console.error('Failed to export survey responses Excel:', err);
    throw new Error('Failed to export Excel. Please try again.');
  }
};
