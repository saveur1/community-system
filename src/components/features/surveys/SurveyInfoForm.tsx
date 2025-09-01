import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import ViewMoreProjects from '@/components/features/landing-page/view-more-programes';
import { type ProjectEntity as Project } from '@/api/projects';

interface Props {
  title: string;
  description: string;
  project: string;
  estimatedTime: string;
  onChange: (fields: Partial<{ title: string; description: string; project: string; estimatedTime: string }>) => void;
  visibleProjects: Project[];
  moreProjects: Project[];
}

export default function SurveyInfoForm({ title, description, project, estimatedTime, onChange, visibleProjects, moreProjects }: Props): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Survey Title *</label>
          <input
            type="text"
            placeholder="Enter survey title"
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (minutes)</label>
          <input
            type="number"
            placeholder="e.g., 5"
            value={estimatedTime}
            onChange={(e) => onChange({ estimatedTime: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          placeholder="Brief description of the survey"
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          {t('feedback.project')} <span className="text-red-500">*</span>
        </label>

        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          {visibleProjects.length === 0 && moreProjects.length === 0 ? (
            <p>Loading projects...</p>
          ) : (
            <>
              {visibleProjects.map((p: Project) => (
                <div key={p.id} className="flex items-center">
                  <input
                    type="radio"
                    id={`project-${p.id}`}
                    name="project"
                    value={p.name}
                    checked={project === p.name}
                    onChange={(e) => onChange({ project: e.target.value })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor={`project-${p.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                    {p.name}
                  </label>
                </div>
              ))}

              {moreProjects.length > 0 && (
                <div className="flex items-center">
                  <ViewMoreProjects
                    projects={moreProjects}
                    selectedProject={project}
                    onProjectSelect={(projectName: string) => onChange({ project: projectName })}
                    dropDownPosition="bottom-left"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

