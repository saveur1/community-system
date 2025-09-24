
import { CustomDropdown } from "@/components/ui/dropdown";
import { useTranslation } from "react-i18next";
import { type ProjectEntity as Project } from '@/api/projects';

interface ViewMoreProjectsProps {
  projects: Project[];
  selectedProject: string;
  onProjectSelect: (projectName: string) => void;
  dropDownPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

const ViewMoreProjects = ({ 
  projects,
  selectedProject,
  onProjectSelect,
  dropDownPosition = "bottom-right" 
}: ViewMoreProjectsProps) => {
  const { t } = useTranslation();

  return (
    <CustomDropdown
      trigger={
        <button type="button" className="text-primary dark:text-primary-200 underline bg-transparent px-0 py-0 font-medium text-sm cursor-pointer hover:text-primary-dark dark:hover:text-primary-300 transition-colors">
          {t("button.view_more")}
        </button>
      }
      dropdownClassName="min-w-96 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/10 dark:ring-gray-600 p-4"
      closeOnClick={true}
      position={dropDownPosition}
    >
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{t("feedback.programme_more")}</h4>
        <div className="grid grid-cols-1 gap-2">
          {projects.map(project => (
            <label key={project.id} className="flex items-center text-gray-700 dark:text-gray-300 gap-2 text-sm cursor-pointer hover:text-black dark:hover:text-gray-100 transition-colors">
              <input
                type="radio"
                name="more-projects"
                value={project.name}
                checked={selectedProject === project.name}
                onChange={() => onProjectSelect(project.name)}
                className="h-4 w-4 text-primary dark:text-primary-200 focus:ring-primary dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 dark:bg-gray-600 cursor-pointer"
              />
              {project.name}
            </label>
          ))}
        </div>
      </div>
    </CustomDropdown>
  );
};

export default ViewMoreProjects;
