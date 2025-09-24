import type { FC, DragEvent } from "react"
import type { Question, QuestionType } from "../types"
import { FaRegStar, FaTrash, FaCopy, FaGripVertical, FaX } from "react-icons/fa6"
import { SelectDropdown } from "@/components/ui/select"
import { getOptions } from "@/utility/logicFunctions"

interface QuestionCardProps {
  question: Question
  questionNumber: number // Added question number prop
  onUpdate: (questionId: number, field: string, value: any) => void
  onDelete: (questionId: number) => void
  onDuplicate: (questionId: number) => void
  onAddOption?: (questionId: number) => void
  onUpdateOption?: (questionId: number, optionIndex: number, value: string) => void
  onRemoveOption?: (questionId: number, optionIndex: number) => void
  onDragStart: (e: DragEvent<HTMLDivElement>, questionId: number) => void
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDrop: (e: DragEvent<HTMLDivElement>, questionId: number) => void
}

const questionTypeOptions = [
  { value: "single_choice", label: "Single choice" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "text_input", label: "Short answer" },
  { value: "textarea", label: "Paragraph" },
  { value: "file_upload", label: "File upload" },
  { value: "rating", label: "Rating" },
  { value: "linear_scale", label: "Linear scale" },
]

const QuestionCard: FC<QuestionCardProps> = ({
  question,
  questionNumber, // Added questionNumber prop
  onUpdate,
  onDelete,
  onDuplicate,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const handleTypeChange = (newType: string) => {
    const type = newType as QuestionType
    let updatedQuestion: Partial<Question> = { type }

    switch (type) {
      case "single_choice":
      case "multiple_choice":
        // Keep existing options if switching between choice types, otherwise create default options
        if (question.type === "single_choice" || question.type === "multiple_choice") {
          // Preserve existing options when switching between choice question types
          updatedQuestion = { ...updatedQuestion, options: getOptions(question.options) }
        } else {
          // Create default options when switching from non-choice to choice type
          updatedQuestion = { ...updatedQuestion, options: ["Option 1", ""] }
        }
        break
      case "text_input":
      case "textarea":
        updatedQuestion = { ...updatedQuestion, placeholder: "" }
        break
      case "file_upload":
        updatedQuestion = { ...updatedQuestion, allowedTypes: ["*"], maxSize: 10 }
        break
      case "rating":
        updatedQuestion = { ...updatedQuestion, maxRating: 5, ratingLabel: "Rating" }
        break
      case "linear_scale":
        updatedQuestion = { ...updatedQuestion, minValue: 1, maxValue: 5, minLabel: "", maxLabel: "" }
        break
    }

    // Update all fields at once
    Object.entries(updatedQuestion).forEach(([field, value]) => {
      onUpdate(question.id, field as keyof Question, value)
    })
  }

  const addOption = () => {
    if (question.type === "single_choice" || question.type === "multiple_choice") {
      onAddOption?.(question.id)
    }
  }

  const updateArrayItem = (type: "options" | "rows" | "columns", index: number, value: string) => {
    if (question.type === "single_choice" || (question.type === "multiple_choice" && type === "options")) {
      onUpdateOption?.(question.id, index, value)
    }
  }

  const removeArrayItem = (type: "options" | "rows" | "columns", index: number) => {
    if (question.type === "single_choice" || (question.type === "multiple_choice" && type === "options")) {
      onRemoveOption?.(question.id, index)
    }
  }

  const renderQuestionContent = () => {
    switch (question.type) {
      case "single_choice":
      case "multiple_choice":
        return (
          <div className="space-y-2">
            {getOptions(question.options).map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 ${question.type === "single_choice" ? "rounded-full" : "rounded"}`}
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateArrayItem("options", index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 border border-gray-200 dark:border-gray-600 rounded px-3 py-2 text-sm outline-none focus:border-primary dark:focus:border-primary-400 focus:ring-1 focus:ring-primary dark:focus:ring-primary-400 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                {getOptions(question.options)?.length > 1 && (
                  <button
                    onClick={() => removeArrayItem("options", index)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                  >
                    <FaX className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 ${question.type === "single_choice" ? "rounded-full" : "rounded"}`}
              />
              <button
                onClick={() => addOption()}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-2 transition-colors"
              >
                Add option
              </button>
            </div>
          </div>
        )

      case "text_input":
        return (
          <input
            type="text"
            placeholder="Short answer text"
            disabled
            className="w-full border-b border-gray-300 dark:border-gray-600 pb-2 text-sm bg-transparent text-gray-500 dark:text-gray-400"
          />
        )

      case "textarea":
        return (
          <textarea
            placeholder="Long answer text"
            disabled
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          />
        )

      case "file_upload":
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">File upload area</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max file size (MB)</label>
                <input
                  type="number"
                  value={question.maxSize}
                  onChange={(e) => onUpdate(question.id, "maxSize", Number.parseInt(e.target.value) || 10)}
                  className="w-full sm:w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        )

      case "rating":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: question.maxRating }).map((_, index) => (
                <FaRegStar key={index} className="w-6 h-6 text-gray-300 dark:text-gray-600" />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max rating</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={question.maxRating}
                  onChange={(e) => onUpdate(question.id, "maxRating", Number.parseInt(e.target.value) || 5)}
                  className="w-full sm:w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Rating label</label>
                <input
                  type="text"
                  value={question.ratingLabel || ""}
                  onChange={(e) => onUpdate(question.id, "ratingLabel", e.target.value)}
                  placeholder="e.g., Satisfaction"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        )

      case "linear_scale":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{question.minValue}</span>
              <div className="flex gap-1 sm:gap-2 mx-2">
                {Array.from({ length: question.maxValue - question.minValue + 1 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs sm:text-sm flex-shrink-0 text-gray-700 dark:text-gray-300"
                  >
                    {question.minValue + index}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{question.maxValue}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min value</label>
                <input
                  type="number"
                  value={question.minValue}
                  onChange={(e) => onUpdate(question.id, "minValue", Number.parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max value</label>
                <input
                  type="number"
                  value={question.maxValue}
                  onChange={(e) => onUpdate(question.id, "maxValue", Number.parseInt(e.target.value) || 5)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min label (optional)</label>
                <input
                  type="text"
                  value={question.minLabel || ""}
                  onChange={(e) => onUpdate(question.id, "minLabel", e.target.value)}
                  placeholder="e.g., Poor"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max label (optional)</label>
                <input
                  type="text"
                  value={question.maxLabel || ""}
                  onChange={(e) => onUpdate(question.id, "maxLabel", e.target.value)}
                  placeholder="e.g., Excellent"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 hover:shadow-md dark:hover:shadow-lg transition-shadow relative"
      draggable
      onDragStart={(e) => onDragStart(e, question.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, question.id)}
    >
      <div className="absolute -top-2 -left-2 w-7 h-7 sm:w-8 sm:h-8 bg-primary dark:bg-primary/90 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium shadow-md">
        {questionNumber}
      </div>

      {/* Question Header */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 mb-4">
        <div className="hidden lg:flex flex-shrink-0 mt-2 cursor-grab">
          <FaGripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={question.title}
            onChange={(e) => onUpdate(question.id, "title", e.target.value)}
            placeholder="Question title"
            className="w-full text-base lg:text-lg font-medium border border-gray-300 dark:border-gray-600 rounded px-3 py-2 outline-none focus:border-primary dark:focus:border-primary-400 focus:ring-1 focus:ring-primary dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="text"
            value={question.description}
            onChange={(e) => onUpdate(question.id, "description", e.target.value)}
            placeholder="Question description (optional)"
            className="w-full text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 outline-none focus:border-primary dark:focus:border-primary-400 focus:ring-1 focus:ring-primary dark:focus:ring-primary-400 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex-shrink-0 w-full lg:w-48">
          <SelectDropdown
            value={question.type}
            onChange={handleTypeChange}
            options={questionTypeOptions}
            placeholder="Question type"
          />
        </div>
      </div>

      {/* Question Configuration */}
      <div className="mb-6">{renderQuestionContent()}</div>

      {/* Question Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate(question.id, "required", e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-primary dark:text-primary-200 focus:ring-primary dark:focus:ring-primary-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
        </label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onDuplicate(question.id)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Duplicate question"
          >
            <FaCopy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete question"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard