import { AssignedImmunization, ImmunizationAction } from '@/utility/types';
import { FaEye, FaEllipsisV } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';

interface AssignedTableProps {
  immunizations: AssignedImmunization[];
  onAction: (action: ImmunizationAction, id: number) => void;
}

export const AssignedTable = ({ immunizations, onAction }: AssignedTableProps) => {
  return (
    <div className="bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full">
        <thead className="border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vaccine</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned By</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {immunizations.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-800">{item.vaccine}</td>
              <td className="px-6 py-4 text-sm text-gray-800">{(item as any).quantity ?? '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-800">{(item as any).assignedBy ?? '-'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Received' ? 'bg-green-100 text-green-800' : item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <button onClick={() => onAction('view', item.id)} className="text-primary hover:text-blue-700" title="View">
                    <FaEye className="w-4 h-4" />
                  </button>
                  <CustomDropdown
                    trigger={
                      <button className="text-gray-400 hover:text-gray-600 p-1" title="More actions">
                        <FaEllipsisV className="w-4 h-4" />
                      </button>
                    }
                    position="bottom-right"
                    dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
                  >
                    <DropdownItem onClick={() => onAction('confirm', item.id)}>
                      Confirm Receive
                    </DropdownItem>
                    <DropdownItem onClick={() => onAction('deny' as any as ImmunizationAction, item.id)} destructive>
                      Deny Receive
                    </DropdownItem>
                  </CustomDropdown>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
