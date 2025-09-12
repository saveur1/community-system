import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useCreateSurvey } from "@/hooks/useSurveys"
import { useProjectsList } from "@/hooks/useProjects"
import { useRolesList } from "@/hooks/useRoles"
import { useState, useRef, useEffect, useMemo, type DragEvent, type FC } from "react"
import Breadcrumb from "@/components/ui/breadcrum"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import SurveyInfoForm from "@/components/features/surveys/SurveyInfoForm"
import QuestionsSection from "@/components/features/surveys/add-survey/QuestionsSection"
import SidebarQuestionPicker from "@/components/features/surveys/add-survey/SidebarQuestionPicker"
import SurveyFooterActions from "@/components/features/surveys/SurveyFooterActions"
import type { Question, SurveyDraft, Section } from "@/components/features/surveys/types"
import Modal, { ModalBody, ModalFooter, ModalButton } from "@/components/ui/modal"
import CustomCalendar from "@/components/ui/calendar"
import { SelectDropdown } from "@/components/ui/select"
import { CustomDropdown } from "@/components/ui/dropdown"
import { FaPlus, FaTimes } from "react-icons/fa"

// moved types to components/features/surveys/types

interface QuestionType {
  id: Question["type"]
  label: string
  icon: string
}

const CreateSurveyComponent: FC = () => {
  const navigate = useNavigate()
  const createSurveyMutation = useCreateSurvey()
  const { data: projectsData } = useProjectsList({ page: 1, limit: 100 })
  const { data: rolesData, isLoading: rolesLoading, isError: rolesError } = useRolesList({ page: 1, limit: 200 })
  const mobileFloatingRef = useRef<HTMLDivElement>(null)

  // Detect "type=report" from search params (client-side)
  const isReport =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("type") === "report" : false

  // Breadcrumbs / titles vary based on isReport
  const breadcrumbItems = isReport
    ? ["Dashboard", "Report Form", "Create Report form"]
    : ["Dashboard", "Surveys", "Create Survey"]
  const pageTitle = isReport ? "Create Report form" : "Create New Survey"
  const infoHeading = isReport ? "Report form information" : "Survey information";

  const visibleProjects = projectsData?.result.slice(0, 5) ?? []
  const moreProjects = projectsData?.result.slice(5) ?? []

  // Roles modal / selection state
  const [rolesModalOpen, setRolesModalOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  // Group roles by category for the modal (same grouping used elsewhere)
  const roleGroups = useMemo(() => {
    const list = rolesData?.result ?? []
    const toLabel = (name: string) =>
      name
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    const map = new Map<string, { title: string; options: { value: string; label: string }[] }>()
    for (const r of list) {
      const cat = r.category?.trim() || "Other"
      if (!map.has(cat)) {
        map.set(cat, { title: cat, options: [] })
      }
      map.get(cat)!.options.push({ value: r.id, label: toLabel(r.name) })
    }
    return Array.from(map.values()).map((g) => ({
      title: g.title,
      options: g.options.sort((a, b) => a.label.localeCompare(b.label)),
    }))
  }, [rolesData])

  const handleRoleToggle = (roleId: string) => {
    if (isReport) {
      // radio behavior: single selection
      setSelectedRoles([roleId])
    } else {
      setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]))
    }
  }

  const toggleGroupRoles = (roleValues: string[], selectAll: boolean) => {
    setSelectedRoles((prev) => {
      const set = new Set(prev)
      if (selectAll) {
        roleValues.forEach((v) => set.add(v))
      } else {
        roleValues.forEach((v) => set.delete(v))
      }
      return Array.from(set)
    })
  }

  const removeSelectedRole = (roleId: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== roleId))
  }

  // Helper to get label by id
  const roleLabelById = (id: string) => {
    const r = rolesData?.result?.find((x: any) => x.id === id)
    if (r)
      return r.name
        .split("_")
        .map((w: string) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
    return id
  }

  const [survey, setSurvey] = useState<SurveyDraft>({
    title: "",
    description: "",
    projectId: "",
    estimatedTime: "",
    sections: [],
    questions: [],
  })

  // Generate UUID function
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const initialSectionId = generateUUID();
  const [sections, setSections] = useState<Section[]>([{ id: initialSectionId, title: "Section 1" }])
  const [currentSectionId, setCurrentSectionId] = useState<string>(initialSectionId)

  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false) // Flag to prevent saving after submission
  const { t } = useTranslation()

  const LOCAL_STORAGE_KEY = "in-progress-survey"
  const backLink = isReport ? "/dashboard/surveys/report-forms" : "/dashboard/surveys"

  // availability window (start/end) state + modal visibility
  const now = new Date()

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [startHour, setStartHour] = useState<string>(String(now.getHours()).padStart(2, "0"))
  const [startMinute, setStartMinute] = useState<string>(String(now.getMinutes()).padStart(2, "0"))
  const [startPickerOpen, setStartPickerOpen] = useState(false)

  const [endDate, setEndDate] = useState<Date | null>(null)
  const [endHour, setEndHour] = useState<string>(String(now.getHours()).padStart(2, "0"))
  const [endMinute, setEndMinute] = useState<string>(String(now.getMinutes()).padStart(2, "0"))
  const [endPickerOpen, setEndPickerOpen] = useState(false)
  const [mobileQuestionPickerOpen, setMobileQuestionPickerOpen] = useState(false)

  // Click outside handler for mobile floating panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileFloatingRef.current && !mobileFloatingRef.current.contains(event.target as Node)) {
        setMobileQuestionPickerOpen(false)
      }
    }

    if (mobileQuestionPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileQuestionPickerOpen])

  // Load survey from local storage on component mount
  useEffect(() => {
    const savedSurveyJson = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedSurveyJson) {
      try {
        const savedSurvey = JSON.parse(savedSurveyJson)
        
        // Check if this is old data with numeric section IDs and migrate it
        if (savedSurvey.sections && savedSurvey.sections.some((s: any) => s.id === '1' || s.id === '2' || s.id === '3')) {
          console.log("Migrating old survey data with numeric section IDs to UUIDs")
          // Clear old data and start fresh
          localStorage.removeItem(LOCAL_STORAGE_KEY)
          toast.info("Cleared old survey data. Please start a new survey.")
          setIsRestoring(false)
          return
        }
        
        // Restore survey data
        console.log("Restoring survey from localStorage:", savedSurvey)
        setSurvey(savedSurvey)
        
        // Restore sections if they exist in saved data
        if (savedSurvey.sections && savedSurvey.sections.length > 0) {
          console.log("Restoring sections:", savedSurvey.sections)
          setSections(savedSurvey.sections)
          
          // Set current section to the section with the most questions, or first section if no questions
          const sectionQuestionCounts = savedSurvey.sections.map((section: Section) => ({
            id: section.id,
            count: savedSurvey.questions.filter((q: Question) => q.sectionId === section.id).length
          }))
          
          const sectionWithMostQuestions = sectionQuestionCounts.reduce((max: {id: string, count: number}, current: {id: string, count: number}) => 
            current.count > max.count ? current : max
          )
          
          // If there are questions, go to the section with most questions, otherwise first section
          const targetSectionId = sectionWithMostQuestions.count > 0 
            ? sectionWithMostQuestions.id 
            : savedSurvey.sections[0].id
            
          console.log("Setting current section to:", targetSectionId)
          setCurrentSectionId(targetSectionId)
        }
        
        toast.info("Restored your in-progress survey.")
      } catch (e) {
        console.error("Could not restore survey from local storage", e)
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
    }
    setIsRestoring(false)
  }, [])

  // Sync sections state with survey state
  useEffect(() => {
    setSurvey(prev => ({
      ...prev,
      sections: sections
    }))
  }, [sections])

  // Save survey to local storage on change (but not after submission)
  useEffect(() => {
    if (!isSubmitted && (survey.title || survey.description || survey.questions.length > 0)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(survey))
    }
  }, [survey, isSubmitted])

  // Cleanup localStorage on unmount if submitted
  useEffect(() => {
    return () => {
      if (isSubmitted) {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
    }
  }, [isSubmitted])


  const calculateQuestionNumbers = (questions: Question[], sections: Section[]): Question[] => {
    const questionsWithNumbers = [...questions]
    let currentNumber = 1

    // Sort sections by their order in the sections array to ensure consistent ordering
    const sortedSections = [...sections]

    for (const section of sortedSections) {
      const sectionQuestions = questionsWithNumbers.filter((q) => q.sectionId === section.id)

      // Assign question numbers to questions in this section
      sectionQuestions.forEach((question) => {
        question.questionNumber = currentNumber
        currentNumber++
      })
    }

    return questionsWithNumbers
  }

  useEffect(() => {
    setSurvey((prev) => ({
      ...prev,
      questions: calculateQuestionNumbers(prev.questions, sections),
    }))
  }, [sections, currentSectionId]) // Removed survey.questions from dependencies to prevent infinite loop

  const addQuestion = (type: Question["type"]): void => {
    let base: any = {
      id: Date.now(),
      type,
      title: "",
      description: "",
      required: false,
      sectionId: currentSectionId,
      questionNumber: 1,
    }

    // Initialize required fields per type to satisfy backend validation
    switch (type) {
      case "single_choice":
      case "multiple_choice":
        base = { ...base, options: ["", ""] }
        break
      case "text_input":
      case "textarea":
        base = { ...base, placeholder: "" }
        break
      case "file_upload":
        base = { ...base, allowedTypes: [], maxSize: 10 }
        break
      case "rating":
        base = { ...base, maxRating: 5, ratingLabel: "" }
        break
      case "linear_scale":
        base = { ...base, minValue: 1, maxValue: 5, minLabel: "", maxLabel: "" }
        break
      default:
        break
    }

    const newQuestion: Question = base as Question

    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
  }

  const updateQuestion = (questionId: number, field: string, value: any): void => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)),
    }))
  }

  const deleteQuestion = (questionId: number): void => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }))
  }

  const duplicateQuestion = (questionId: number): void => {
    const questionToDuplicate = survey.questions.find((q) => q.id === questionId)
    if (!questionToDuplicate) return

    const duplicatedQuestion: Question = {
      ...questionToDuplicate,
      id: Date.now(),
      title: questionToDuplicate.title + " (Copy)",
      questionNumber: 1, // Initialize with temporary number, will be recalculated
    }

    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, duplicatedQuestion],
    }))
  }

  const addSection = (): void => {
    const newSectionNumber = sections.length + 1
    const newSection: Section = {
      id: generateUUID(),
      title: `Section ${newSectionNumber}`,
    }
    setSections((prev) => [...prev, newSection])
    setCurrentSectionId(newSection.id)
  }

  const updateSectionTitle = (sectionId: string, title: string): void => {
    console.log("[v0] updateSectionTitle called with:", sectionId, title)
    console.log("[v0] Current sections before update:", sections)

    setSections((prev) => {
      const updated = prev.map((section) => (section.id === sectionId ? { ...section, title } : section))
      console.log("[v0] Updated sections:", updated)
      return updated
    })
  }

  const deleteSection = (sectionId: string): void => {
    if (sections.length <= 1) return // Don't delete the last section

    // Remove questions from this section
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.sectionId !== sectionId),
    }))

    // Remove the section
    setSections((prev) => prev.filter((s) => s.id !== sectionId))

    // Switch to first available section if current section is deleted
    if (currentSectionId === sectionId) {
      const remainingSections = sections.filter((s) => s.id !== sectionId)
      setCurrentSectionId(remainingSections[0]?.id || initialSectionId)
    }
  }

  const addOption = (questionId: number): void => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id === questionId && (q.type === "single_choice" || q.type === "multiple_choice")) {
          return { ...q, options: [...q.options, ""] }
        }
        return q
      }),
    }))
  }

  const updateOption = (questionId: number, optionIndex: number, value: string): void => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id === questionId && (q.type === "single_choice" || q.type === "multiple_choice")) {
          return {
            ...q,
            options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)),
          }
        }
        return q
      }),
    }))
  }

  const removeOption = (questionId: number, optionIndex: number): void => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id === questionId && (q.type === "single_choice" || q.type === "multiple_choice")) {
          return { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        }
        return q
      }),
    }))
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, questionId: number): void => {
    setDraggedItem(questionId)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropTargetId: number): void => {
    e.preventDefault()
    if (draggedItem === dropTargetId) return

    const draggedIndex = survey.questions.findIndex((q) => q.id === draggedItem)
    const targetIndex = survey.questions.findIndex((q) => q.id === dropTargetId)

    const newQuestions = [...survey.questions]
    const [draggedQuestion] = newQuestions.splice(draggedIndex, 1)
    newQuestions.splice(targetIndex, 0, draggedQuestion)

    setSurvey((prev) => ({ ...prev, questions: newQuestions }))
    setDraggedItem(null)
  }

  const handleSave = (): void => {
    // Basic validation
    if (!survey.title.trim()) {
      toast.error("Survey title is required.")
      return
    }
    if (!survey.projectId) {
      toast.error("Please select a project.")
      return
    }
    if (survey.questions.length === 0) {
      toast.error("Please add at least one question.")
      return
    }

    // validate availability window
    if (!startDate || !endDate) {
      toast.error("Please set both start and end times for the survey availability.")
      return
    }
    const composedStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      Number(startHour || "0"),
      Number(startMinute || "0"),
      0,
      0,
    )
    const composedEnd = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      Number(endHour || "0"),
      Number(endMinute || "0"),
      0,
      0,
    )
    if (isNaN(composedStart.getTime()) || isNaN(composedEnd.getTime()) || composedEnd <= composedStart) {
      toast.error("Invalid availability window. Ensure end time is after start time.")
      return
    }

    // Check for empty question titles
    const hasEmptyTitle = survey.questions.some((q) => !q.title.trim())
    if (hasEmptyTitle) {
      toast.error("All questions must have a title.")
      return
    }

    // Check for empty options in choice questions
    const hasEmptyOption = survey.questions.some(
      (q) => (q.type === "single_choice" || q.type === "multiple_choice") && q.options.some((opt) => !opt.trim()),
    )
    if (hasEmptyOption) {
      toast.error("All options in choice questions must have a value.")
      return
    }

    // include selectedRoles as allowedRoles in the created payload
    // set surveyType if report form
    // Normalize questions to match backend TSOA union exactly
    const normalizedQuestions = survey.questions.map((q: any) => {
      const common = {
        id: q.id,
        type: q.type,
        title: q.title,
        description: q.description ?? "",
        required: !!q.required,
        sectionId: q.sectionId,
        questionNumber: q.questionNumber ?? null,
      }
      switch (q.type) {
        case "single_choice":
        case "multiple_choice":
          return {
            ...common,
            options: (q.options ?? []).map((o: any) => String(o)),
          }
        case "text_input":
        case "textarea":
          return {
            ...common,
            placeholder: q.placeholder ?? "",
          }
        case "file_upload":
          return {
            ...common,
            allowedTypes: Array.isArray(q.allowedTypes) ? q.allowedTypes.map((t: any) => String(t)) : [],
            maxSize: typeof q.maxSize === "number" ? q.maxSize : 10,
          }
        case "rating":
          return {
            ...common,
            maxRating: typeof q.maxRating === "number" ? q.maxRating : 5,
            ratingLabel: q.ratingLabel ?? "",
          }
        case "linear_scale":
          return {
            ...common,
            minValue: typeof q.minValue === "number" ? q.minValue : 1,
            maxValue: typeof q.maxValue === "number" ? q.maxValue : 5,
            minLabel: q.minLabel ?? "",
            maxLabel: q.maxLabel ?? "",
          }
        default:
          return common
      }
    })

    const payload = {
      ...(survey as any),
      questions: normalizedQuestions,
      allowedRoles: selectedRoles && selectedRoles.length ? selectedRoles : [],
      ...(isReport ? { surveyType: "report-form" } : { surveyType: "general" }),
      startAt: composedStart.toISOString(),
      endAt: composedEnd.toISOString(),
    }

    // Debug log to check section IDs
    console.log("Survey payload sections:", payload.sections)
    console.log("Survey payload questions sectionIds:", payload.questions.map((q: any) => q.sectionId))

    createSurveyMutation.mutate(payload, {
      onSuccess: () => {
        setIsSubmitted(true) // Set flag to prevent further saves
        localStorage.removeItem(LOCAL_STORAGE_KEY) // Clear immediately
        toast.success(t("Survey created successfully!"))
        navigate({ to: backLink })
      },
    })
  }

  const handleCancel = (): void => {
    navigate({ to: backLink })
  }

  // Show loading state while restoring from localStorage
  if (isRestoring) {
    return (
      <div className="pb-10">
        <Breadcrumb items={breadcrumbItems} title={pageTitle} className="absolute top-0 left-0 w-full" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Restoring your survey...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-10">
      <Breadcrumb items={breadcrumbItems} title={pageTitle} className="absolute top-0 left-0 w-full" />

      {/* Content with Sidebar Layout */}
      <div className="flex gap-6 pt-20">
        {/* Main Content */}
        <div className="flex-1 lg:max-w-3xl">
          <SurveyInfoForm
            title={survey.title}
            description={survey.description}
            projectId={survey.projectId}
            estimatedTime={survey.estimatedTime}
            onChange={(fields) => setSurvey((prev) => ({ ...prev, ...fields }))}
            visibleProjects={visibleProjects}
            moreProjects={moreProjects}
            startDate={startDate}
            endDate={endDate}
            startHour={startHour}
            startMinute={startMinute}
            endHour={endHour}
            endMinute={endMinute}
            selectedRoles={selectedRoles}
            onStartPickerOpen={() => setStartPickerOpen(true)}
            onEndPickerOpen={() => setEndPickerOpen(true)}
            onRolesModalOpen={() => setRolesModalOpen(true)}
            onRemoveRole={removeSelectedRole}
            roleLabelById={roleLabelById}
          />

          <QuestionsSection
            questions={survey.questions}
            sections={sections}
            currentSectionId={currentSectionId}
            onUpdateSection={updateSectionTitle}
            onUpdate={updateQuestion}
            onDelete={deleteQuestion}
            onDuplicate={duplicateQuestion}
            onAddOption={addOption}
            onUpdateOption={updateOption}
            onRemoveOption={removeOption}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />

          {/* Roles selection modal */}
          <Modal
            isOpen={rolesModalOpen}
            onClose={() => setRolesModalOpen(false)}
            title="Select Roles"
            size="lg"
            closeOnOverlayClick={true}
          >
            <ModalBody className="p-4 space-y-4 max-h-[57vh] overflow-auto">
              {rolesLoading && <div className="text-sm text-gray-500">Loading roles...</div>}
              {rolesError && <div className="text-sm text-red-600">Failed to load roles</div>}
              {!rolesLoading && !rolesError && roleGroups.length === 0 && (
                <div className="text-sm text-gray-500">No roles found.</div>
              )}
              {roleGroups.map((group) => (
                <div key={group.title} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{group.title}</h4>
                    {!isReport &&
                      (() => {
                        const groupValues = group.options.map((o) => o.value)
                        const allSelected = groupValues.every((v) => selectedRoles.includes(v))
                        const nextSelectAll = !allSelected
                        return (
                          <button
                            type="button"
                            onClick={() => toggleGroupRoles(groupValues, nextSelectAll)}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${allSelected ? `text-red-600 border-red-300 hover:bg-red-50` : `text-primary border-primary/40 hover:bg-primary/5`}`}
                          >
                            {allSelected ? "Clear all" : "Select all"}
                          </button>
                        )
                      })()}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type={isReport ? "radio" : "checkbox"}
                          name={isReport ? "allowedRoleSelect" : undefined}
                          checked={isReport ? selectedRoles[0] === option.value : selectedRoles.includes(option.value)}
                          onChange={() => handleRoleToggle(option.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </ModalBody>
            <ModalFooter className="py-2">
              <ModalButton onClick={() => setRolesModalOpen(false)} variant="secondary">
                Cancel
              </ModalButton>
              <ModalButton onClick={() => setRolesModalOpen(false)} variant="primary">
                Done
              </ModalButton>
            </ModalFooter>
          </Modal>

          {/* Start picker modal */}
          <Modal
            isOpen={startPickerOpen}
            onClose={() => setStartPickerOpen(false)}
            title="Pick start date & time"
            size="lg"
            closeOnOverlayClick
          >
            <ModalBody>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomCalendar selectedDate={startDate} setSelectedDate={setStartDate} />
                <div>
                  <div className="mb-3 text-sm text-gray-700 font-medium">Time</div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectDropdown
                      label="Hour"
                      value={startHour}
                      onChange={(v) => setStartHour(v)}
                      options={Array.from({ length: 24 }).map((_, i) => ({
                        label: String(i).padStart(2, "0"),
                        value: String(i).padStart(2, "0"),
                      }))}
                    />
                    <SelectDropdown
                      label="Minute"
                      value={startMinute}
                      onChange={(v) => setStartMinute(v)}
                      options={Array.from({ length: 60 }).map((_, i) => ({
                        label: String(i).padStart(2, "0"),
                        value: String(i).padStart(2, "0"),
                      }))}
                    />
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    {startDate
                      ? `Selected: ${startDate.toLocaleDateString()} ${startHour}:${startMinute}`
                      : "Pick a date"}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalButton variant="secondary" onClick={() => setStartPickerOpen(false)}>
                Close
              </ModalButton>
              <ModalButton onClick={() => setStartPickerOpen(false)}>Save</ModalButton>
            </ModalFooter>
          </Modal>

          {/* End picker modal */}
          <Modal
            isOpen={endPickerOpen}
            onClose={() => setEndPickerOpen(false)}
            title="Pick end date & time"
            size="lg"
            closeOnOverlayClick
          >
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomCalendar selectedDate={endDate} setSelectedDate={setEndDate} />
                <div>
                  <div className="mb-3 text-sm text-gray-700 font-medium">Time</div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectDropdown
                      label="Hour"
                      value={endHour}
                      onChange={(v) => setEndHour(v)}
                      options={Array.from({ length: 24 }).map((_, i) => ({
                        label: String(i).padStart(2, "0"),
                        value: String(i).padStart(2, "0"),
                      }))}
                    />
                    <SelectDropdown
                      label="Minute"
                      value={endMinute}
                      onChange={(v) => setEndMinute(v)}
                      options={Array.from({ length: 60 }).map((_, i) => ({
                        label: String(i).padStart(2, "0"),
                        value: String(i).padStart(2, "0"),
                      }))}
                    />
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    {endDate ? `Selected: ${endDate.toLocaleDateString()} ${endHour}:${endMinute}` : "Pick a date"}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalButton variant="secondary" onClick={() => setEndPickerOpen(false)}>
                Close
              </ModalButton>
              <ModalButton onClick={() => setEndPickerOpen(false)}>Save</ModalButton>
            </ModalFooter>
          </Modal>

          {/* Use default footer for surveys; for report form show custom Save label */}
          {isReport ? (
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-md">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={createSurveyMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                {createSurveyMutation.isPending ? "Saving..." : "Save report form"}
              </button>
            </div>
          ) : (
            <SurveyFooterActions
              questionsCount={survey.questions.length}
              estimatedTime={survey.estimatedTime}
              isSaving={createSurveyMutation.isPending}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>

        {/* Desktop Right Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-20">
            <SidebarQuestionPicker
              onAdd={addQuestion}
              sections={sections}
              currentSectionId={currentSectionId}
              onSectionChange={setCurrentSectionId}
              onAddSection={addSection}
            />

            {/* Survey Summary */}
            {survey.questions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions:</span>
                    <span className="font-medium">{survey.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Time:</span>
                    <span className="font-medium">{survey.estimatedTime || "0"} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required Questions:</span>
                    <span className="font-medium">{survey.questions.filter((q) => q.required).length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Button - Only visible on mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50" ref={mobileFloatingRef}>
        {/* Floating Button */}
        <button
          onClick={() => setMobileQuestionPickerOpen(!mobileQuestionPickerOpen)}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center"
          aria-label={mobileQuestionPickerOpen ? "Close question picker" : "Open question picker"}
        >
          {mobileQuestionPickerOpen ? (
            <FaTimes className="w-5 h-5" />
          ) : (
            <FaPlus className="w-5 h-5" />
          )}
        </button>

        {/* Floating Panel */}
        {mobileQuestionPickerOpen && (
          <div className="absolute bottom-16 right-0 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Questions</h3>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                <SidebarQuestionPicker
                  onAdd={(type) => {
                    addQuestion(type);
                    setMobileQuestionPickerOpen(false);
                  }}
                  sections={sections}
                  currentSectionId={currentSectionId}
                  onSectionChange={setCurrentSectionId}
                  onAddSection={addSection}
                />
              </div>
              
              {/* Mobile Survey Summary */}
              {survey.questions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Survey Summary</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Questions:</span>
                      <span className="font-medium">{survey.questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Time:</span>
                      <span className="font-medium">{survey.estimatedTime || "0"} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required Questions:</span>
                      <span className="font-medium">{survey.questions.filter((q) => q.required).length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateSurveyComponent

export const Route = createFileRoute("/dashboard/surveys/add-new")({
  component: CreateSurveyComponent,
})