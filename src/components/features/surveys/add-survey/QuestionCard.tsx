"use client"

import type { FC, DragEvent } from "react"
import type { Question, QuestionType } from "../types"
import { FaRegStar, FaTrash, FaCopy, FaGripVertical, FaX } from "react-icons/fa6"
import { SelectDropdown } from "@/components/ui/select"

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
          updatedQuestion = { ...updatedQuestion, options: question.options }
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

  const addOption = (type: "options" | "rows" | "columns") => {
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
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 border-2 border-gray-300 flex-shrink-0 ${question.type === "single_choice" ? "rounded-full" : "rounded"}`}
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateArrayItem("options", index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary hover:border-gray-300 transition-colors bg-gray-50 hover:bg-white focus:bg-white"
                />
                {question.options.length > 1 && (
                  <button
                    onClick={() => removeArrayItem("options", index)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <FaX className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 border-2 border-gray-300 flex-shrink-0 ${question.type === "single_choice" ? "rounded-full" : "rounded"}`}
              />
              <button
                onClick={() => addOption("options")}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
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
            className="w-full border-b border-gray-300 pb-2 text-sm bg-transparent"
          />
        )

      case "textarea":
        return (
          <textarea
            placeholder="Long answer text"
            disabled
            rows={3}
            className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50"
          />
        )

      case "file_upload":
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-sm text-gray-500">File upload area</div>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max file size (MB)</label>
                <input
                  type="number"
                  value={question.maxSize}
                  onChange={(e) => onUpdate(question.id, "maxSize", Number.parseInt(e.target.value) || 10)}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
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
                <FaRegStar key={index} className="w-6 h-6 text-gray-300" />
              ))}
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max rating</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={question.maxRating}
                  onChange={(e) => onUpdate(question.id, "maxRating", Number.parseInt(e.target.value) || 5)}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Rating label</label>
                <input
                  type="text"
                  value={question.ratingLabel || ""}
                  onChange={(e) => onUpdate(question.id, "ratingLabel", e.target.value)}
                  placeholder="e.g., Satisfaction"
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        )

      case "linear_scale":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{question.minValue}</span>
              <div className="flex gap-2">
                {Array.from({ length: question.maxValue - question.minValue + 1 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm"
                  >
                    {question.minValue + index}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600">{question.maxValue}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min value</label>
                <input
                  type="number"
                  value={question.minValue}
                  onChange={(e) => onUpdate(question.id, "minValue", Number.parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max value</label>
                <input
                  type="number"
                  value={question.maxValue}
                  onChange={(e) => onUpdate(question.id, "maxValue", Number.parseInt(e.target.value) || 5)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min label (optional)</label>
                <input
                  type="text"
                  value={question.minLabel || ""}
                  onChange={(e) => onUpdate(question.id, "minLabel", e.target.value)}
                  placeholder="e.g., Poor"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max label (optional)</label>
                <input
                  type="text"
                  value={question.maxLabel || ""}
                  onChange={(e) => onUpdate(question.id, "maxLabel", e.target.value)}
                  placeholder="e.g., Excellent"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
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
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 hover:shadow-md transition-shadow relative"
      draggable
      onDragStart={(e) => onDragStart(e, question.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, question.id)}
    >
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium shadow-md">
        {questionNumber}
      </div>

      {/* Question Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 mt-2 cursor-grab">
          <FaGripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={question.title}
            onChange={(e) => onUpdate(question.id, "title", e.target.value)}
            placeholder="Question title"
            className="w-full text-lg font-medium border border-gray-300 rounded px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            type="text"
            value={question.description}
            onChange={(e) => onUpdate(question.id, "description", e.target.value)}
            placeholder="Question description (optional)"
            className="w-full text-sm text-gray-600 border border-gray-300 rounded px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex-shrink-0 w-48">
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
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate(question.id, "required", e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Required</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDuplicate(question.id)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Duplicate question"
          >
            <FaCopy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
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