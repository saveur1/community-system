import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCreateSurvey } from '@/hooks/useSurveys';
import { useProjectsList } from '@/hooks/useProjects';
import { useRolesList } from '@/hooks/useRoles';
import { useState, DragEvent, FC, useEffect, useMemo } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import SurveyInfoForm from '@/components/features/surveys/SurveyInfoForm';
import QuestionsSection from '@/components/features/surveys/QuestionsSection';
import SidebarQuestionPicker from '@/components/features/surveys/SidebarQuestionPicker';
import SurveyFooterActions from '@/components/features/surveys/SurveyFooterActions';
import { Question, SurveyDraft } from '@/components/features/surveys/types';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import CustomCalendar from '@/components/ui/calendar';
import { SelectDropdown } from '@/components/ui/select';
import { FaX } from 'react-icons/fa6';

// moved types to components/features/surveys/types

interface QuestionType {
  id: Question['type'];
  label: string;
  icon: string;
}

const CreateSurveyComponent: FC = () => {
  const navigate = useNavigate();
  const createSurveyMutation = useCreateSurvey();
  const { data: projectsData } = useProjectsList({ page: 1, limit: 100 });
  const { data: rolesData, isLoading: rolesLoading, isError: rolesError } = useRolesList({ page: 1, limit: 200 });

  // Detect "type=report" from search params (client-side)
  const isReport = (typeof window !== 'undefined') ? new URLSearchParams(window.location.search).get('type') === 'report' : false;

  // Breadcrumbs / titles vary based on isReport
  const breadcrumbItems = isReport ? ["Dashboard", "Report Form", "Create Report form"] : ["Dashboard", "Surveys", "Create Survey"];
  const pageTitle = isReport ? 'Create Report form' : 'Create New Survey';
  const infoHeading = isReport ? 'Report form information' : 'Survey information';

  const visibleProjects = projectsData?.result.slice(0, 5) ?? [];
  const moreProjects = projectsData?.result.slice(5) ?? [];

  // Roles modal / selection state
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Group roles by category for the modal (same grouping used elsewhere)
  const roleGroups = useMemo(() => {
    const list = rolesData?.result ?? [];
    const toLabel = (name: string) =>
      name
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    const map = new Map<string, { title: string; options: { value: string; label: string }[] }>();
    for (const r of list) {
      const cat = r.category?.trim() || 'Other';
      if (!map.has(cat)) {
        map.set(cat, { title: cat, options: [] });
      }
      map.get(cat)!.options.push({ value: r.id, label: toLabel(r.name) });
    }
    return Array.from(map.values()).map(g => ({ title: g.title, options: g.options.sort((a, b) => a.label.localeCompare(b.label)) }));
  }, [rolesData]);

  const handleRoleToggle = (roleId: string) => {
    if (isReport) {
      // radio behavior: single selection
      setSelectedRoles([roleId]);
    } else {
      setSelectedRoles(prev => prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]);
    }
  };

  const toggleGroupRoles = (roleValues: string[], selectAll: boolean) => {
    setSelectedRoles(prev => {
      const set = new Set(prev);
      if (selectAll) {
        roleValues.forEach(v => set.add(v));
      } else {
        roleValues.forEach(v => set.delete(v));
      }
      return Array.from(set);
    });
  };

  const removeSelectedRole = (roleId: string) => {
    setSelectedRoles(prev => prev.filter(r => r !== roleId));
  };

  // Helper to get label by id
  const roleLabelById = (id: string) => {
    const r = rolesData?.result?.find((x: any) => x.id === id);
    if (r) return r.name.split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' ');
    return id;
  };

  const [survey, setSurvey] = useState<SurveyDraft>({
    title: '',
    description: '',
    project: '',
    estimatedTime: '',
    questions: []
  });

  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const { t } = useTranslation();

  const LOCAL_STORAGE_KEY = 'in-progress-survey';
  const backLink = isReport ? '/dashboard/surveys/report-forms' : '/dashboard/surveys';

  // availability window (start/end) state + modal visibility
  const now = new Date();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState<string>(String(now.getHours()).padStart(2, '0'));
  const [startMinute, setStartMinute] = useState<string>(String(now.getMinutes()).padStart(2, '0'));
  const [startPickerOpen, setStartPickerOpen] = useState(false);

  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endHour, setEndHour] = useState<string>(String(now.getHours()).padStart(2, '0'));
  const [endMinute, setEndMinute] = useState<string>(String(now.getMinutes()).padStart(2, '0'));
  const [endPickerOpen, setEndPickerOpen] = useState(false);

  // Load survey from local storage on component mount
  useEffect(() => {
    const savedSurveyJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSurveyJson) {
      try {
        const savedSurvey = JSON.parse(savedSurveyJson);
        setSurvey(savedSurvey);
        toast.info('Restored your in-progress survey.');
      } catch (e) {
        console.error('Could not restore survey from local storage', e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  // Save survey to local storage on change
  useEffect(() => {
    if (survey.title || survey.description || survey.questions.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(survey));
    }
  }, [survey]);

  const questionTypes: QuestionType[] = [
    { id: 'single_choice', label: 'Single Choice', icon: '◉' },
    { id: 'multiple_choice', label: 'Multiple Choice', icon: '☑' },
    { id: 'text_input', label: 'Text Input', icon: '📝' },
    { id: 'textarea', label: 'Long Text', icon: '📄' }
  ];

  const addQuestion = (type: Question['type']): void => {
    const newQuestion: Question = {
      id: Date.now(),
      type: type,
      title: '',
      description: '',
      required: false,
      ...(type === 'single_choice' || type === 'multiple_choice'
        ? { options: ['', ''] }
        : { placeholder: '' }
      )
    } as Question;

    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = <K extends keyof Question>(
    questionId: number,
    field: K,
    value: Question[K]
  ): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const deleteQuestion = (questionId: number): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const duplicateQuestion = (questionId: number): void => {
    const questionToDuplicate = survey.questions.find(q => q.id === questionId);
    if (!questionToDuplicate) return;

    const duplicatedQuestion: Question = {
      ...questionToDuplicate,
      id: Date.now(),
      title: questionToDuplicate.title + ' (Copy)'
    };

    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, duplicatedQuestion]
    }));
  };

  const addOption = (questionId: number): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single_choice' || q.type === 'multiple_choice')) {
          return { ...q, options: [...q.options, ''] };
        }
        return q;
      })
    }));
  };

  const updateOption = (questionId: number, optionIndex: number, value: string): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single_choice' || q.type === 'multiple_choice')) {
          return {
            ...q,
            options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
          };
        }
        return q;
      })
    }));
  };

  const removeOption = (questionId: number, optionIndex: number): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single_choice' || q.type === 'multiple_choice')) {
          return { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) };
        }
        return q;
      })
    }));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, questionId: number): void => {
    setDraggedItem(questionId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropTargetId: number): void => {
    e.preventDefault();
    if (draggedItem === dropTargetId) return;

    const draggedIndex = survey.questions.findIndex(q => q.id === draggedItem);
    const targetIndex = survey.questions.findIndex(q => q.id === dropTargetId);

    const newQuestions = [...survey.questions];
    const [draggedQuestion] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedQuestion);

    setSurvey(prev => ({ ...prev, questions: newQuestions }));
    setDraggedItem(null);
  };

  const handleSave = (): void => {
    // Basic validation
    if (!survey.title.trim()) {
      toast.error('Survey title is required.');
      return;
    }
    if (!survey.project) {
      toast.error('Please select a project.');
      return;
    }
    if (survey.questions.length === 0) {
      toast.error('Please add at least one question.');
      return;
    }

    // validate availability window
    if (!startDate || !endDate) {
      toast.error('Please set both start and end times for the survey availability.');
      return;
    }
    const composedStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      Number(startHour || '0'),
      Number(startMinute || '0'),
      0,
      0
    );
    const composedEnd = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      Number(endHour || '0'),
      Number(endMinute || '0'),
      0,
      0
    );
    if (isNaN(composedStart.getTime()) || isNaN(composedEnd.getTime()) || composedEnd <= composedStart) {
      toast.error('Invalid availability window. Ensure end time is after start time.');
      return;
    }

    // Check for empty question titles
    const hasEmptyTitle = survey.questions.some(q => !q.title.trim());
    if (hasEmptyTitle) {
      toast.error('All questions must have a title.');
      return;
    }

    // Check for empty options in choice questions
    const hasEmptyOption = survey.questions.some(q =>
      (q.type === 'single_choice' || q.type === 'multiple_choice') &&
      q.options.some(opt => !opt.trim())
    );
    if (hasEmptyOption) {
      toast.error('All options in choice questions must have a value.');
      return;
    }

    // include selectedRoles as allowedRoles in the created payload
    // set surveyType if report form
    const payload = {
      ...(survey as any),
      allowedRoles: (selectedRoles && selectedRoles.length) ? selectedRoles : [],
      ...(isReport ? { surveyType: 'report-form' } : { surveyType: 'general' }),
      startAt: composedStart.toISOString(),
      endAt: composedEnd.toISOString(),
    };

    createSurveyMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t('Survey created successfully!'));
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        navigate({ to: backLink });
      },
    });
  };

  const handleCancel = (): void => {
    navigate({ to: backLink });
  };

  return (
    <div className="pb-10">
      <Breadcrumb
        items={breadcrumbItems}
        title={pageTitle}
        className='absolute top-0 left-0 w-full'
      />

      {/* Content with Sidebar Layout */}
      <div className="flex gap-6 pt-20">
        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          <SurveyInfoForm
            title={survey.title}
            description={survey.description}
            project={survey.project}
            estimatedTime={survey.estimatedTime}
            onChange={(fields) => setSurvey(prev => ({ ...prev, ...fields }))}
            visibleProjects={visibleProjects}
            moreProjects={moreProjects}
          />

          {/* Availability window */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability window</label>
            <div className="flex gap-3 items-center w-full">
              <button
                type="button"
                onClick={() => setStartPickerOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-md w-52 bg-white hover:bg-gray-50"
              >
                {startDate ? `${startDate.toLocaleDateString()} ${startHour}:${startMinute}` : 'Set start time'}
              </button>
              <span className="text-sm text-gray-500">to</span>
              <button
                type="button"
                onClick={() => setEndPickerOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-md w-52 bg-white hover:bg-gray-50"
              >
                {endDate ? `${endDate.toLocaleDateString()} ${endHour}:${endMinute}` : 'Set end time'}
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">Set when this survey will be open to respondents.</div>
          </div>

          {/* Roles input (click to open modal) */}
          <div className="mt-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Roles (who can view)</label>
            <div
              onClick={() => setRolesModalOpen(true)}
              role="button"
              tabIndex={0}
              className="min-h-[44px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 flex items-center gap-2 flex-wrap cursor-pointer"
            >
              {selectedRoles.length === 0 ? (
                <span className="text-sm text-gray-400">Click to select roles...</span>
              ) : (
                selectedRoles.map(id => (
                  <span key={id} className="inline-flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs mr-2 mb-2">
                    <span className="mr-2 capitalize">{roleLabelById(id)}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeSelectedRole(id); }}
                      className="text-primary/80 hover:text-primary text-sm leading-none"
                      aria-label={`Remove ${id}`}
                    >
                      <FaX className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <QuestionsSection
            questions={survey.questions}
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
                {!rolesLoading && !rolesError && roleGroups.length === 0 && <div className="text-sm text-gray-500">No roles found.</div>}
                {roleGroups.map(group => (
                  <div key={group.title} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{group.title}</h4>
                      {/* hide select/clear for report forms (single-selection) */}
                      {!isReport && (() => {
                        const groupValues = group.options.map(o => o.value);
                        const allSelected = groupValues.every(v => selectedRoles.includes(v));
                        const nextSelectAll = !allSelected;
                        return (
                          <button
                            type="button"
                            onClick={() => toggleGroupRoles(groupValues, nextSelectAll)}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${allSelected ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-primary border-primary/40 hover:bg-primary/5'}`}
                          >
                            {allSelected ? 'Clear all' : 'Select all'}
                          </button>
                        );
                      })()}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.options.map(option => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <input
                            type={isReport ? 'radio' : 'checkbox'}
                            name={isReport ? 'allowedRoleSelect' : undefined}
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
              <ModalButton onClick={() => setRolesModalOpen(false)} variant="secondary">Cancel</ModalButton>
              <ModalButton onClick={() => setRolesModalOpen(false)} variant="primary">Done</ModalButton>
            </ModalFooter>
          </Modal>

          {/* Start picker modal */}
          <Modal isOpen={startPickerOpen} onClose={() => setStartPickerOpen(false)} title="Pick start date & time" size="lg" closeOnOverlayClick>
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
                      options={Array.from({ length: 24 }).map((_, i) => ({ label: String(i).padStart(2,'0'), value: String(i).padStart(2,'0') }))}
                    />
                    <SelectDropdown
                      label="Minute"
                      value={startMinute}
                      onChange={(v) => setStartMinute(v)}
                      options={Array.from({ length: 60 }).map((_, i) => ({ label: String(i).padStart(2,'0'), value: String(i).padStart(2,'0') }))}
                    />
                  </div>
                  <div className="mt-4 text-xs text-gray-500">{startDate ? `Selected: ${startDate.toLocaleDateString()} ${startHour}:${startMinute}` : 'Pick a date'}</div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalButton variant="secondary" onClick={() => setStartPickerOpen(false)}>Close</ModalButton>
              <ModalButton onClick={() => setStartPickerOpen(false)}>Save</ModalButton>
            </ModalFooter>
          </Modal>

          {/* End picker modal */}
          <Modal isOpen={endPickerOpen} onClose={() => setEndPickerOpen(false)} title="Pick end date & time" size="lg" closeOnOverlayClick>
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
                      options={Array.from({ length: 24 }).map((_, i) => ({ label: String(i).padStart(2,'0'), value: String(i).padStart(2,'0') }))}
                    />
                    <SelectDropdown
                      label="Minute"
                      value={endMinute}
                      onChange={(v) => setEndMinute(v)}
                      options={Array.from({ length: 60 }).map((_, i) => ({ label: String(i).padStart(2,'0'), value: String(i).padStart(2,'0') }))}
                    />
                  </div>
                  <div className="mt-4 text-xs text-gray-500">{endDate ? `Selected: ${endDate.toLocaleDateString()} ${endHour}:${endMinute}` : 'Pick a date'}</div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalButton variant="secondary" onClick={() => setEndPickerOpen(false)}>Close</ModalButton>
              <ModalButton onClick={() => setEndPickerOpen(false)}>Save</ModalButton>
            </ModalFooter>
          </Modal>

          {/* Use default footer for surveys; for report form show custom Save label */}
          {isReport ? (
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
              <button onClick={handleSave} disabled={createSurveyMutation.isPending} className="px-4 py-2 bg-primary text-white rounded-md">
                {createSurveyMutation.isPending ? 'Saving...' : 'Save report form'}
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

        {/* Fixed Right Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-20">
            <SidebarQuestionPicker
              types={questionTypes}
              onAdd={addQuestion}
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
                    <span className="font-medium">{survey.estimatedTime || '0'} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required Questions:</span>
                    <span className="font-medium">{survey.questions.filter(q => q.required).length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/surveys/add-new')({
  component: CreateSurveyComponent,
})