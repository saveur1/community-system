import { ImmunizationReport, ReportAction } from '@/utility/types';
import { FaEye, FaDownload } from 'react-icons/fa';

interface ReportTableProps {
  reports: ImmunizationReport[];
  onAction: (action: ReportAction, id: number) => void;
}

export const ReportTable = ({ reports, onAction }: ReportTableProps) => {
  return (
    <div className="bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full">
        <thead className="border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Vaccine</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Reported At</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Tag</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-800">{report.vaccine}</td>
              <td className="px-6 py-4 text-sm text-gray-800">{report.reportedAt ?? '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-800">{report.tag ?? '-'}</td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <button onClick={() => onAction('view', report.id)} className="text-primary cursor-pointer hover:text-blue-700" title="View">
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onAction('download', report.id)} className="text-title hover:text-red-900 cursor-pointer" title="Download">
                    <FaDownload className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
