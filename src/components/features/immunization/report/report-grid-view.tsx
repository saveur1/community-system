import { ImmunizationReport, ReportAction } from '@/utility/types';
import { FaEye, FaDownload } from 'react-icons/fa';

interface ReportGridProps {
  reports: ImmunizationReport[];
  onAction: (action: ReportAction, id: number) => void;
}

export const ReportGrid = ({ reports, onAction }: ReportGridProps) => {
  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => (
        <div key={report.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-600"><strong>Vaccine:</strong> {report.vaccine}</div>
              <div className="text-sm text-gray-600"><strong>Reported At:</strong> {report.reportedAt ?? '-'}</div>
              <div className="text-sm text-gray-600"><strong>Tag:</strong> {report.tag ?? '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onAction('view', report.id)} className="text-primary hover:text-blue-700" title="View">
                <FaEye className="w-4 h-4" />
              </button>
              <button onClick={() => onAction('download', report.id)} className="text-green-600 hover:text-green-700" title="Download">
                <FaDownload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
