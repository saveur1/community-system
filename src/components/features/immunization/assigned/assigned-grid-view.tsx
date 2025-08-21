import { AssignedImmunization, ImmunizationAction } from '@/utility/types';
import { FaEye, FaEllipsisV } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';

interface AssignedGridProps {
  immunizations: AssignedImmunization[];
  onAction: (action: ImmunizationAction, id: number) => void;
}

export const AssignedGrid = ({ immunizations, onAction }: AssignedGridProps) => {
  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
      {immunizations.map((item) => (
        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-600"><strong>Vaccine:</strong> {item.vaccine}</div>
              <div className="text-sm text-gray-600"><strong>Quantity:</strong> {(item as any).quantity ?? '-'}</div>
              <div className="text-sm text-gray-600"><strong>Assigned By:</strong> {(item as any).assignedBy ?? '-'}</div>
              <div className="my-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Received' ? 'bg-green-100 text-green-800' : item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {item.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
          </div>
        </div>
      ))}
    </div>
  );
};
