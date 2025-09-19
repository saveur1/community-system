import { createFileRoute, useParams } from '@tanstack/react-router';
import { useOrganization } from '@/hooks/useOrganizations';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaBuilding, FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { useNavigate } from '@tanstack/react-router';

const StakeholderViewComponent = () => {
  const { 'view-id': stakeholderId } = useParams({ from: '/dashboard/stakeholders/$view-id' });
  const navigate = useNavigate();
  const { data, isLoading, error } = useOrganization(stakeholderId);

  const stakeholder = data?.result;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        navigate({ to: '/dashboard/stakeholders/$edit-id', params: { 'edit-id': stakeholderId } });
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${stakeholder?.name}?`)) {
          // Handle delete
          alert('Delete functionality would be implemented here');
        }
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Breadcrumb 
          items={['Dashboard', 'Stakeholders']} 
          title="Stakeholder Details" 
          className='absolute top-0 px-6 left-0 w-full' 
        />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stakeholder) {
    return (
      <div className="w-full">
        <Breadcrumb 
          items={['Dashboard', 'Stakeholders']} 
          title="Stakeholder Details" 
          className='absolute top-0 px-6 left-0 w-full' 
        />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Stakeholder Not Found</h2>
              <p className="text-gray-600">The stakeholder you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumb 
        items={['Dashboard', 'Stakeholders']} 
        title="Stakeholder Details" 
        className='absolute top-0 px-6 left-0 w-full' 
      />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-semibold">
                    {stakeholder.logo ? (
                      <img 
                        src={stakeholder.logo} 
                        alt={`${stakeholder.name} logo`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(stakeholder.name)
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{stakeholder.name}</h1>
                    <p className="text-gray-600">Stakeholder Organization</p>
                  </div>
                </div>
                <CustomDropdown
                  trigger={
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <FaEllipsisV className="w-5 h-5 text-gray-600" />
                    </button>
                  }
                  position="bottom-right"
                  dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
                >
                  <DropdownItem
                    icon={<FaEdit className="w-4 h-4" />}
                    onClick={() => handleAction('edit')}
                  >
                    Edit Stakeholder
                  </DropdownItem>
                  <DropdownItem
                    icon={<FaTrash className="w-4 h-4" />}
                    destructive
                    onClick={() => handleAction('delete')}
                  >
                    Delete Stakeholder
                  </DropdownItem>
                </CustomDropdown>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                      <p className="text-gray-900">{stakeholder.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Logo</label>
                      {stakeholder.logo ? (
                        <div className="flex items-center space-x-3">
                          <img 
                            src={stakeholder.logo} 
                            alt={`${stakeholder.name} logo`}
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                          <span className="text-sm text-gray-600">Logo uploaded</span>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No logo uploaded</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                      <p className="text-gray-900">
                        {stakeholder.createdAt ? new Date(stakeholder.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                      <p className="text-gray-900">
                        {stakeholder.updatedAt ? new Date(stakeholder.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Associated Projects */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Associated Projects</h2>
                  <div className="space-y-3">
                    {stakeholder.projects && stakeholder.projects.length > 0 ? (
                      stakeholder.projects.map((project: any) => (
                        <div key={project.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <FaBuilding className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{project.name}</p>
                            <p className="text-sm text-gray-500">{project.status}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FaBuilding className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No projects associated with this stakeholder</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Total Projects</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {stakeholder.projects?.length ?? 0}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Active Projects</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {stakeholder.projects?.filter((p: any) => p.status === 'in_progress').length ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/stakeholders/$view-id')({
  component: StakeholderViewComponent,
});