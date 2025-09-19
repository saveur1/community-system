"use client"

import { type FC, useState } from "react"
import type { QuestionType, Section } from "../types"
import { FaPlus, FaX } from "react-icons/fa6"
import { CustomDropdown, DropdownItem } from "@/components/ui/dropdown"
import {SelectDropdown} from "@/components/ui/select"

interface QuestionTypeOption {
  id: QuestionType
  label: string
  icon: string
  description: string
}

interface SidebarQuestionPickerProps {
  onAdd: (type: QuestionType) => void
  sections: Section[]
  currentSectionId: string
  onSectionChange: (sectionId: string) => void
  onAddSection: () => void
}

const SidebarQuestionPicker: FC<SidebarQuestionPickerProps> = ({
  onAdd,
  sections,
  currentSectionId,
  onSectionChange,
  onAddSection,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const questionTypes: QuestionTypeOption[] = [
    { id: "single_choice", label: "Single choice", icon: "◉", description: "Single selection from options" },
    { id: "multiple_choice", label: "Multiple choice", icon: "☑", description: "Multiple selections allowed" },
    { id: "text_input", label: "Short answer", icon: "📝", description: "Brief text response" },
    { id: "textarea", label: "Paragraph", icon: "📄", description: "Long text response" },
    { id: "file_upload", label: "File upload", icon: "📎", description: "Upload documents or images" },
    { id: "rating", label: "Rating", icon: "⭐", description: "Star rating system" },
    { id: "linear_scale", label: "Linear scale", icon: "📊", description: "Numbered scale rating" },
  ]

  const sectionOptions = sections?.map((section) => ({
    label: section.title,
    value: section.id,
  }))

  const Panel = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <CustomDropdown
        trigger={
          <button className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            <FaPlus className="w-4 h-4" />
            Add Question
          </button>
        }
        dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-64 h-80 overflow-y-auto"
        position="bottom-left"
        closeOnClick={true}
      >
        {questionTypes.map((type) => (
          <DropdownItem
            key={type.id}
            onClick={() => { onAdd(type.id); setMobileOpen(false) }}
            icon={<span className="text-lg">{type.icon}</span>}
            className="px-4 py-3 hover:bg-gray-50"
          >
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{type.label}</span>
              <span className="text-xs text-gray-500">{type.description}</span>
            </div>
          </DropdownItem>
        ))}
      </CustomDropdown>

      <div className="mt-6 pt-1">
        <div className="space-y-3">
          <SelectDropdown
            options={sectionOptions}
            value={currentSectionId}
            onChange={onSectionChange}
            placeholder="Select section..."
            className="w-full"
          />

          <button
            onClick={onAddSection}
            className="w-full flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <FaPlus className="w-3 h-3" />
            Add Section
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop/Tablet panel */}
      <div className="hidden md:block">
        {Panel}
      </div>

      {/* Mobile floating toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden fixed bottom-6 right-6 z-40 rounded-full shadow-lg bg-primary text-white w-12 h-12 flex items-center justify-center hover:bg-primary/90 focus:outline-none"
        aria-label={mobileOpen ? "Close question picker" : "Open question picker"}
      >
        {mobileOpen ? <FaX className="w-5 h-5" /> : <FaPlus className="w-5 h-5" />}
      </button>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-white rounded-t-xl shadow-2xl p-4 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-800">Add questions</h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <FaX className="w-4 h-4" />
              </button>
            </div>
            {Panel}
          </div>
        </div>
      )}
    </>
  )
}

export default SidebarQuestionPicker