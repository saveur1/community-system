
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
        <button type="button" className="text-primary underline bg-transparent px-0 py-0 font-medium text-sm cursor-pointer hover:text-primary-dark">
          {t("button.view_more")}
        </button>
      }
      dropdownClassName="min-w-96 rounded-md bg-white shadow-lg ring-1 ring-black/10 p-4"
      closeOnClick={true}
      position={dropDownPosition}
    >
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-800 mb-2">{t("feedback.programme_more")}</h4>
        <div className="grid grid-cols-1 gap-2">
          {projects.map(project => (
            <label key={project.id} className="flex items-center text-gray-700 gap-2 text-sm cursor-pointer hover:text-black">
              <input
                type="radio"
                name="more-projects"
                value={project.name}
                checked={selectedProject === project.name}
                onChange={() => onProjectSelect(project.name)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
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
