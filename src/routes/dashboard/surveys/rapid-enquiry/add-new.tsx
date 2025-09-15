import { useState, useEffect, useRef, type FC, type DragEvent } from 'react'
import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import Breadcrumb from '@/components/ui/breadcrum'
import RapidEnquiryForm from '@/components/features/surveys/rapid-enquiry/RapidEnquiryForm'
import QuestionsSection from '@/components/features/surveys/add-survey/QuestionsSection'
import SidebarQuestionPicker from '@/components/features/surveys/add-survey/SidebarQuestionPicker'
import type { Question, Section } from '@/components/features/surveys/types'
import { FaPlus, FaTimes } from 'react-icons/fa'

const STORAGE_KEY = 'rapid_enquiries'
const LOCAL_STORAGE_KEY = 'rapid-enquiry-draft'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const Route = createFileRoute('/dashboard/surveys/rapid-enquiry/add-new')({
  component: CreateRapidEnquiryComponent,
});


function CreateRapidEnquiryComponent() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const mobileFloatingRef = useRef<HTMLDivElement>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'active'>('draft')
  const [isSaving, setIsSaving] = useState(false)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([])
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [mobileQuestionPickerOpen, setMobileQuestionPickerOpen] = useState(false)

  // Single section for rapid enquiry (simplified)
  const sectionId = 'rapid-enquiry-section'
  const sections: Section[] = [{ id: sectionId, title: 'Questions' }]

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setTitle(data.title || '')
        setScheduledAt(data.scheduledAt ? new Date(data.scheduledAt) : null)
        setStatus(data.status || 'draft')
        setQuestions(data.questions || [])
        toast.info('Restored your draft rapid enquiry')
      } catch (error) {
        console.error('Failed to restore draft:', error)
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (title || scheduledAt || status !== 'draft' || questions.length > 0) {
      const data = {
        title,
        scheduledAt: scheduledAt?.toISOString(),
        status,
        questions
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
    }
  }, [title, scheduledAt, status, questions])

  // Click outside handler for mobile floating panels
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileFloatingRef.current && !mobileFloatingRef.current.contains(event.target as Node)) {
        setMobilePreviewOpen(false)
        setMobileQuestionPickerOpen(false)
      }
    }

    if (mobilePreviewOpen || mobileQuestionPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobilePreviewOpen, mobileQuestionPickerOpen])

  // Question management functions
  const addQuestion = (type: Question['type']): void => {
    let base: any = {
      id: Date.now(),
      type,
      title: '',
      description: '',
      required: false,
      sectionId: sectionId,
      questionNumber: questions.length + 1,
    }

    // Initialize required fields per type
    switch (type) {
      case 'single_choice':
      case 'multiple_choice':
        base = { ...base, options: ['', ''] }
        break
      case 'text_input':
      case 'textarea':
        base = { ...base, placeholder: '' }
        break
      case 'file_upload':
        base = { ...base, allowedTypes: [], maxSize: 10 }
        break
      case 'rating':
        base = { ...base, maxRating: 5, ratingLabel: '' }
        break
      case 'linear_scale':
        base = { ...base, minValue: 1, maxValue: 5, minLabel: '', maxLabel: '' }
        break
    }

    setQuestions(prev => [...prev, base])
  }

  const updateQuestion = (questionId: number, field: string, value: any): void => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const deleteQuestion = (questionId: number): void => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const duplicateQuestion = (questionId: number): void => {
    const question = questions.find(q => q.id === questionId)
    if (question) {
      const duplicate = { ...question, id: Date.now(), title: `${question.title} (Copy)` }
      setQuestions(prev => [...prev, duplicate])
    }
  }

  const addOption = (questionId: number): void => {
    updateQuestion(questionId, 'options', [...((questions.find(q => q.id === questionId) as any)?.options || []), ''])
  }

  const updateOption = (questionId: number, optionIndex: number, value: string): void => {
    const question = questions.find(q => q.id === questionId) as any
    if (question?.options) {
      const newOptions = [...question.options]
      newOptions[optionIndex] = value
      updateQuestion(questionId, 'options', newOptions)
    }
  }

  const removeOption = (questionId: number, optionIndex: number): void => {
    const question = questions.find(q => q.id === questionId) as any
    if (question?.options && question.options.length > 2) {
      const newOptions = question.options.filter((_: any, index: number) => index !== optionIndex)
      updateQuestion(questionId, 'options', newOptions)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, questionId: number) => {
    setDraggedItem(questionId)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetQuestionId: number) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === targetQuestionId) return

    const draggedIndex = questions.findIndex(q => q.id === draggedItem)
    const targetIndex = questions.findIndex(q => q.id === targetQuestionId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newQuestions = [...questions]
    const [draggedQuestion] = newQuestions.splice(draggedIndex, 1)
    newQuestions.splice(targetIndex, 0, draggedQuestion)

    setQuestions(newQuestions)
    setDraggedItem(null)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setIsSaving(true)

    const item = {
      id: generateId(),
      title: title.trim(),
      scheduledAt: scheduledAt || null,
      status,
      questions,
      createdAt: new Date().toISOString(),
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const raw = localStorage.getItem(STORAGE_KEY)
      const arr = raw ? JSON.parse(raw) as any[] : []
      arr.unshift(item)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
      localStorage.removeItem(LOCAL_STORAGE_KEY) // Clear draft
      toast.success('Rapid enquiry created successfully!')
      navigate({ to: '/dashboard/surveys/rapid-enquiry' })
    } catch (err) {
      toast.error('Failed to save rapid enquiry')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setTitle('')
    setScheduledAt(null)
    setStatus('draft')
    setQuestions([])
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  }

  const handleCancel = () => {
    navigate({ to: '/dashboard/surveys/rapid-enquiry' })
  }

  // Simplified section update (not needed for rapid enquiry but required by QuestionsSection)
  const updateSection = (sectionId: string, title: string) => {
    // No-op for rapid enquiry since we have only one section
  }

  // Add section (not needed for rapid enquiry but required by SidebarQuestionPicker)
  const addSection = () => {
    // No-op for rapid enquiry since we have only one section
  }

  return (
    <div className="pb-10">
      <Breadcrumb 
        items={['Dashboard', 'Surveys', 'Rapid Enquiry', 'Add New']} 
        title="Create Rapid Enquiry" 
        className="absolute top-0 left-0 w-full" 
      />

      {/* Content with Sidebar Layout */}
      <div className="flex gap-6 pt-20">
        {/* Main Content */}
        <div className="flex-1 lg:max-w-3xl">
          <RapidEnquiryForm
            title={title}
            scheduledAt={scheduledAt}
            status={status}
            onTitleChange={setTitle}
            onScheduledAtChange={setScheduledAt}
            onStatusChange={setStatus}
          />

          {/* Questions Section */}
          <QuestionsSection
            questions={questions}
            sections={sections}
            currentSectionId={sectionId}
            onUpdateSection={updateSection}
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

          {/* Footer Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Rapid Enquiry'}
            </button>
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <SidebarQuestionPicker
              onAdd={addQuestion}
              sections={sections}
              currentSectionId={sectionId}
              onSectionChange={() => {}} // No-op for rapid enquiry
              onAddSection={addSection}
            />

            {/* Rapid Enquiry Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Enquiry Preview</h3>
              <div className="space-y-4">
                {title ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">How it will appear to visitors:</p>
                    <p className="font-medium text-gray-900">
                      {title}{' '}
                      <a 
                        href="/answers/preview-rapid-enquiry" 
                        className="text-primary hover:text-primary-dark underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        here
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500">Enter a title to see preview</p>
                  </div>
                )}
                
                <div className="space-y-2 text-sm pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required:</span>
                    <span className="font-medium">{questions.filter(q => q.required).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'active' ? 'bg-green-100 text-green-800' :
                      status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  {scheduledAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scheduled:</span>
                      <span className="font-medium text-right flex-1 ml-2 text-xs">
                        {scheduledAt.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                    addQuestion(type)
                    setMobileQuestionPickerOpen(false)
                  }}
                  sections={sections}
                  currentSectionId={sectionId}
                  onSectionChange={() => {}} // No-op for rapid enquiry
                  onAddSection={addSection}
                />
              </div>
              
              {/* Mobile Summary */}
              {questions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Summary</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Questions:</span>
                      <span className="font-medium">{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required Questions:</span>
                      <span className="font-medium">{questions.filter(q => q.required).length}</span>
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
