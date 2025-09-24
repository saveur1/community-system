import type { FC, DragEvent } from "react"
import type { Question, Section } from "../types"
import QuestionCard from "./QuestionCard";
import { useState } from "react"
import { FaEdit, FaTrash } from "react-icons/fa"

interface QuestionsSectionProps {
  questions: Question[]
  sections: Section[]
  currentSectionId: string
  onUpdateSection: (sectionId: string, title: string) => void
  onDeleteSection: (sectionId: string) => void
  onUpdate: (questionId: number, field: string, value: any) => void
  onDelete: (questionId: number) => void
  onDuplicate: (questionId: number) => void
  onAddOption: (questionId: number) => void
  onUpdateOption: (questionId: number, optionIndex: number, value: string) => void
  onRemoveOption: (questionId: number, optionIndex: number) => void
  onDragStart: (e: DragEvent<HTMLDivElement>, questionId: number) => void
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDrop: (e: DragEvent<HTMLDivElement>, questionId: number) => void
}

const QuestionsSection: FC<QuestionsSectionProps> = ({
  questions,
  sections,
  currentSectionId,
  onUpdateSection,
  onDeleteSection,
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
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState("")

  const currentSectionQuestions = questions.filter((q) => q.sectionId === currentSectionId)
  const currentSection = sections?.find((s) => s.id === currentSectionId)

  const handleSectionTitleEdit = () => {
    if (currentSection) {
      setEditTitle(currentSection.title)
      setIsEditingTitle(true)
    }
  }

  const handleSectionTitleSave = () => {
    if (currentSection && editTitle.trim()) {
      onUpdateSection(currentSection.id, editTitle.trim())
    }
    setIsEditingTitle(false)
  }

  const handleSectionTitleCancel = () => {
    setIsEditingTitle(false)
    setEditTitle("")
  }

  const getQuestionStartNumber = () => {
    let startNumber = 1
    const currentSectionIndex = sections?.findIndex((s) => s.id === currentSectionId)

    for (let i = 0; i < currentSectionIndex; i++) {
      const sectionQuestions = questions.filter((q) => q.sectionId === sections[i].id)
      startNumber += sectionQuestions.length
    }

    return startNumber
  }

  const startNumber = getQuestionStartNumber()

  return (
    <div className="space-y-6">
      <div className="bg-primary dark:bg-primary/90 rounded-lg shadow-sm border border-primary dark:border-primary/70 p-6 text-white">
        {isEditingTitle ? (
          <div className="space-y-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Section title..."
              className="w-full border border-primary dark:border-primary/70 px-3 py-2 rounded text-primary-dark dark:text-gray-900 bg-white dark:bg-gray-100 placeholder-primary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/70"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSectionTitleSave()
                if (e.key === "Escape") handleSectionTitleCancel()
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSectionTitleSave}
                className="px-4 py-2 bg-white dark:bg-gray-100 text-primary dark:text-primary rounded hover:bg-blue-50 dark:hover:bg-gray-200 transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={handleSectionTitleCancel}
                className="px-4 py-2 border border-blue-300 dark:border-blue-400 text-white rounded hover:bg-primary dark:hover:bg-primary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-xl font-semibold mb-2 cursor-pointer hover:text-blue-100 dark:hover:text-blue-200 transition-colors"
                onClick={handleSectionTitleEdit}
              >
                {currentSection?.title || "Untitled Section"}
              </h2>
              <div className="text-blue-100 dark:text-blue-200 text-sm">
                {currentSectionQuestions?.length || 0} question{currentSectionQuestions?.length !== 1 ? "s" : ""} in
                this section
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSectionTitleEdit}
                className="p-2 rounded hover:bg-primary dark:hover:bg-primary/80 transition-colors"
                title="Edit section title"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              {currentSection && (
                <button
                  onClick={() => onDeleteSection(currentSection.id)}
                  className="p-2 rounded hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors"
                  title="Delete section"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {currentSectionQuestions?.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-2">No questions in this section yet</div>
          <div className="text-sm text-gray-400 dark:text-gray-500">Use the sidebar to add your first question to this section</div>
        </div>
      ) : (
        <div className="space-y-4">
          {currentSectionQuestions?.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={startNumber + index}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onAddOption={onAddOption}
              onUpdateOption={onUpdateOption}
              onRemoveOption={onRemoveOption}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default QuestionsSection