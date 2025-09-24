import React from 'react';
import ExportFilterModal from '@/components/common/export-filter-modal';
import { generateSurveyResponsesPDF } from './export-survey-responses-pdf';
import { generateSurveyResponsesExcel } from './export-survey-responses-excel';
import { toast } from 'react-toastify';

type ExportType = 'excel' | 'pdf';

interface ExportSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: ExportType;
  surveyTitle: string;
  survey?: any; // Use any to avoid type conflicts with existing survey entities
}

const ExportSurveyModal: React.FC<ExportSurveyModalProps> = ({
  isOpen,
  onClose,
  exportType,
  surveyTitle,
  survey
}) => {
  const handleConfirm = async (filters: { start: Date | null; end: Date | null }) => {
    try {
      if (exportType === 'pdf') {
        if (!survey || !survey.responses) {
          toast.error('Survey data not available for PDF export');
          return;
        }

        await generateSurveyResponsesPDF({
          survey: survey,
          responses: survey.responses,
          fileName: `${surveyTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
          dateRange: filters
        });
      } else if (exportType === 'excel') {
        if (!survey || !survey.responses) {
          toast.error('Survey data not available for Excel export');
          return;
        }

        await generateSurveyResponsesExcel({
          survey: survey,
          responses: survey.responses,
          fileName: `${surveyTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
          dateRange: filters
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Add proper error handling/toast notification
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <ExportFilterModal
      isOpen={isOpen}
      onClose={onClose}
      exportType={exportType}
      onConfirm={handleConfirm}
    />
  );
};

export default ExportSurveyModal;
