import { useState, type JSX } from "react"
import { useTranslation } from "react-i18next"
import ViewMoreProjects from "@/components/features/landing-page/view-more-programes"
import type { ProjectEntity as Project } from "@/api/projects"

// ✅ Replaced lucide-react with react-icons/fa
import { FaClock, FaFileAlt, FaBullseye } from "react-icons/fa"
import { FaChevronDown, FaChevronUp, FaX } from "react-icons/fa6"

interface SurveyInfoFormProps {
  title: string
  description: string
  projectId: string
  estimatedTime: string
  onChange: (fields: any) => void
  visibleProjects: any[]
  moreProjects: any[]
  startDate: Date | null
  endDate: Date | null
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  selectedRoles: string[]
  onStartPickerOpen: () => void
  onEndPickerOpen: () => void
  onRolesModalOpen: () => void
  onRemoveRole: (roleId: string) => void
  roleLabelById: (id: string) => string
}

const SurveyInfoForm: React.FC<SurveyInfoFormProps> = ({
  title,
  description,
  projectId,
  estimatedTime,
  onChange,
  visibleProjects,
  moreProjects,
  startDate,
  endDate,
  startHour,
  startMinute,
  endHour,
  endMinute,
  selectedRoles,
  onStartPickerOpen,
  onEndPickerOpen,
  onRolesModalOpen,
  onRemoveRole,
  roleLabelById,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <div
        className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 hover:rounded-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaFileAlt className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Survey Information</h2>
        </div>
        {isExpanded ? (
          <FaChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <FaChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FaBullseye className="w-4 h-4" />
              Survey Title
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter a descriptive title for your survey"
              value={title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            {!title && (
              <p className="text-xs text-gray-500 mt-1">
                A clear, descriptive title helps participants understand your survey's purpose
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
            <textarea
              placeholder="Provide a brief description of what this survey is about and why you're conducting it"
              value={description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Help participants understand the context and importance of your survey
              </p>
              <span className="text-xs text-gray-400">{description.length}/500</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FaClock className="w-4 h-4" />
              Estimated Completion Time
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="5"
                value={estimatedTime}
                onChange={(e) => onChange({ estimatedTime: e.target.value })}
                min="1"
                max="120"
                className="w-20 sm:w-24 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <span className="text-sm text-gray-600">minutes</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Realistic time estimates improve response rates</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t("feedback.project")} <span className="text-red-500">*</span>
            </label>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
              {visibleProjects.length === 0 && moreProjects.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaBullseye className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Loading projects...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleProjects.map((p: Project) => (
                    <label
                      key={p.id}
                      htmlFor={`project-${p.id}`}
                      className="flex items-center p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200"
                    >
                      <input
                        type="radio"
                        id={`project-${p.id}`}
                        name="project"
                        value={p.id}
                        checked={projectId === p.id}
                        onChange={(e) => onChange({ projectId: e.target.value })}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">{p.name}</span>
                    </label>
                  ))}

                  {moreProjects.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <ViewMoreProjects
                        projects={moreProjects}
                        selectedProject={projectId}
                        onProjectSelect={(projectId: string) => onChange({ projectId })}
                        dropDownPosition="bottom-left"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            {!projectId && (
              <p className="text-xs text-red-500 mt-2">Please select a project to associate with this survey</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability window</label>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full">
              <button
                type="button"
                onClick={onStartPickerOpen}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md w-full sm:w-52 bg-white hover:bg-gray-50 text-left"
              >
                {startDate ? `${startDate.toLocaleDateString()} ${startHour}:${startMinute}` : `Set start time`}
              </button>
              <span className="text-sm text-gray-500 self-center">to</span>
              <button
                type="button"
                onClick={onEndPickerOpen}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md w-full sm:w-52 bg-white hover:bg-gray-50 text-left"
              >
                {endDate ? `${endDate.toLocaleDateString()} ${endHour}:${endMinute}` : `Set end time`}
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">Set when this survey will be open to respondents.</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Roles (who can view)</label>
            <div
              onClick={onRolesModalOpen}
              role="button"
              tabIndex={0}
              className="min-h-[44px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 flex items-center gap-2 flex-wrap cursor-pointer touch-manipulation"
            >
              {selectedRoles?.length === 0 ? (
                <span className="text-sm text-gray-400">Click to select roles...</span>
              ) : (
                selectedRoles?.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs mr-1 sm:mr-2 mb-2"
                  >
                    <span className="mr-1 sm:mr-2 capitalize">{roleLabelById(id)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveRole(id)
                      }}
                      className="text-primary/80 hover:text-primary text-sm leading-none p-0.5 touch-manipulation"
                      aria-label={`Remove ${id}`}
                    >
                      <FaX className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SurveyInfoForm;
