import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type DragEvent, type FC, type JSX } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { useSurvey, useUpdateSurvey } from '@/hooks/useSurveys';
import { useProjectsList } from '@/hooks/useProjects';
import { useRolesList } from '@/hooks/useRoles';
import SurveyInfoForm from '@/components/features/surveys/SurveyInfoForm';
import QuestionsSection from '@/components/features/surveys/add-survey/QuestionsSection';
import SidebarQuestionPicker from '@/components/features/surveys/add-survey/SidebarQuestionPicker';
import SurveyFooterActions from '@/components/features/surveys/SurveyFooterActions';
import { Question, SurveyDraft, Section } from '@/components/features/surveys/types';
import { toast } from 'react-toastify';
import Modal, { ModalFooter, ModalButton } from '@/components/ui/modal';
import { FaX } from 'react-icons/fa6';

export const Route = createFileRoute('/dashboard/surveys/edit/$edit-id')({
  component: EditSurveyComponent,
});

const LOCAL_STORAGE_KEY_PREFIX = 'edit-survey-';

function mapFromServerToDraft(entity: any): SurveyDraft {
  const questions: Question[] = (entity?.questionItems || []).map((qi: any) => {
    const base: any = {
      id: Date.now() + Math.random(),
      type: qi.type,
      title: qi.title,
      description: qi.description,
      required: qi.required,
      sectionId: qi.sectionId ?? undefined,
      questionNumber: qi.questionNumber ?? undefined,
    };
    if (qi.type === 'single_choice' || qi.type === 'multiple_choice') {
      return { ...base, options: qi.options ?? [] } as Question;
    }
    if (qi.type === 'text_input' || qi.type === 'textarea') {
      return { ...base, placeholder: qi.placeholder ?? '' } as Question;
    }
    if (qi.type === 'file_upload') {
      return { ...base, allowedTypes: qi.allowedTypes ?? [], maxSize: qi.maxSize ?? 10 } as Question;
    }
    if (qi.type === 'rating') {
      return { ...base, maxRating: qi.maxRating ?? 5, ratingLabel: qi.ratingLabel ?? '' } as Question;
    }
    if (qi.type === 'linear_scale') {
      return {
        ...base,
        minValue: qi.minValue ?? 1,
        maxValue: qi.maxValue ?? 5,
        minLabel: qi.minLabel ?? '',
        maxLabel: qi.maxLabel ?? '',
      } as Question;
    }
    return base as Question;
  });

  return {
    title: entity?.title ?? '',
    sections: (entity?.sections ?? []).map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? '',
    })),
    description: entity?.description ?? '',
    projectId: entity?.projectId ?? '',
    estimatedTime: entity?.estimatedTime ?? '',
    questions,
  };
}

function mapDraftToUpdatePayload(draft: SurveyDraft) {
  return {
    title: draft.title,
    description: draft.description,
    projectId: draft.projectId,
    estimatedTime: draft.estimatedTime,
    sections: (draft.sections ?? []).map((s: any) => ({ id: s.id, title: s.title, description: s.description ?? '' })),
    questions: draft.questions.map((q: any) => {
      const common = {
        id: 0,
        type: q.type,
        title: q.title,
        description: q.description ?? '',
        required: !!q.required,
        sectionId: q.sectionId,
        questionNumber: q.questionNumber ?? null,
      };
      switch (q.type) {
        case 'single_choice':
        case 'multiple_choice':
          return { ...common, options: (q.options ?? []).map((o: any) => String(o)) };
        case 'text_input':
        case 'textarea':
          return { ...common, placeholder: q.placeholder ?? '' };
        case 'file_upload':
          return {
            ...common,
            allowedTypes: Array.isArray(q.allowedTypes) ? q.allowedTypes.map((t: any) => String(t)) : [],
            maxSize: typeof q.maxSize === 'number' ? q.maxSize : 10,
          };
        case 'rating':
          return { ...common, maxRating: typeof q.maxRating === 'number' ? q.maxRating : 5, ratingLabel: q.ratingLabel ?? '' };
        case 'linear_scale':
          return {
            ...common,
            minValue: typeof q.minValue === 'number' ? q.minValue : 1,
            maxValue: typeof q.maxValue === 'number' ? q.maxValue : 5,
            minLabel: q.minLabel ?? '',
            maxLabel: q.maxLabel ?? '',
          };
        default:
          return common;
      }
    }),
  };
}

function EditSurveyComponent(): JSX.Element {
  const params = Route.useParams();
  const surveyId = params['edit-id'];
  const navigate = useNavigate();
  const { data } = useSurvey(surveyId, true);
  const updateSurvey = useUpdateSurvey(surveyId);
  const { data: projectsData } = useProjectsList({ page: 1, limit: 100 });
  const { data: rolesData, isLoading: rolesLoading, isError: rolesError } = useRolesList({ page: 1, limit: 200 });

  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const isReportForm = data?.result?.surveyType === 'report-form';
  const backHomeLink = isReportForm ? '/dashboard/surveys/report-forms' : '/dashboard/surveys';

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
      if (!map.has(cat)) map.set(cat, { title: cat, options: [] });
      map.get(cat)!.options.push({ value: r.id, label: toLabel(r.name) });
    }
    return Array.from(map.values()).map(g => ({ title: g.title, options: g.options.sort((a,b)=>a.label.localeCompare(b.label)) }));
  }, [rolesData]);

  // Replace previous simple toggle with report-form aware toggle
  const handleRoleToggle = (roleId: string) => {
    if (isReportForm) {
      // radio behavior: single selection
      setSelectedRoles([roleId]);
    } else {
      setSelectedRoles(prev => prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]);
    }
  };
  const toggleGroupRoles = (roleValues: string[], selectAll: boolean) => {
    setSelectedRoles(prev => {
      const set = new Set(prev);
      if (selectAll) roleValues.forEach(v => set.add(v)); else roleValues.forEach(v => set.delete(v));
      return Array.from(set);
    });
  };
  const removeSelectedRole = (roleId: string) => setSelectedRoles(prev => prev.filter(r => r !== roleId));
  const roleLabelById = (id: string) => {
    const r = rolesData?.result?.find((x:any) => x.id === id);
    if (r) return r.name.split('_').map((w:string)=>w[0].toUpperCase()+w.slice(1)).join(' ');
    return id;
  };

  const visibleProjects = projectsData?.result.slice(0, 5) ?? [];
  const moreProjects = projectsData?.result.slice(5) ?? [];

  const [survey, setSurvey] = useState<SurveyDraft>({
    title: '',
    description: '',
    projectId: '',
    estimatedTime: '',
    sections: [],
    questions: [],
  });

  // sections state (mirrors create page)
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionId, setCurrentSectionId] = useState<string>('');

  // hydrate from server
  useEffect(() => {
    if (data?.result) {
      const key = LOCAL_STORAGE_KEY_PREFIX + surveyId;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const savedDraft: SurveyDraft = JSON.parse(saved);
          setSurvey(savedDraft);
          setSections(savedDraft.sections ?? []);
          if ((savedDraft.sections ?? []).length > 0) setCurrentSectionId(savedDraft.sections[0].id);
          // attempt to prefill allowed roles from server if present
          const serverAllowed = (data.result as any)?.allowedRoles;
          if (Array.isArray(serverAllowed) && serverAllowed.length > 0) {
            setSelectedRoles(serverAllowed.map((r: any) => r.id ?? r));
          }
          return;
        } catch {}
      }
      const draft = mapFromServerToDraft(data.result);
      setSurvey(draft);
      const serverSections: Section[] = (data.result.sections ?? []).map((s: any) => ({ id: s.id, title: s.title }));
      setSections(serverSections);
      if (serverSections.length > 0) setCurrentSectionId(serverSections[0].id);
      // also prefill allowedRoles if present on server result
      const serverAllowed = (data.result as any)?.allowedRoles;
      if (Array.isArray(serverAllowed) && serverAllowed.length > 0) {
        setSelectedRoles(serverAllowed.map((r: any) => r.id ?? r));
      }
    }
  }, [data, surveyId]);

  // persist draft per survey id
  useEffect(() => {
    const key = LOCAL_STORAGE_KEY_PREFIX + surveyId;
    if (survey.title || survey.description || survey.questions.length > 0) {
      localStorage.setItem(key, JSON.stringify(survey));
    }
  }, [survey, surveyId]);

  // keep survey.sections in sync with sections state
  useEffect(() => {
    setSurvey(prev => ({ ...prev, sections }));
  }, [sections]);

  // question handlers (same as create)
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const addQuestion = (type: Question['type']): void => {
    let base: any = {
      id: Date.now(),
      type,
      title: '',
      description: '',
      required: false,
      sectionId: currentSectionId,
      questionNumber: 1,
    };
    switch (type) {
      case 'single_choice':
      case 'multiple_choice':
        base = { ...base, options: ['', ''] };
        break;
      case 'text_input':
      case 'textarea':
        base = { ...base, placeholder: '' };
        break;
      case 'file_upload':
        base = { ...base, allowedTypes: [], maxSize: 10 };
        break;
      case 'rating':
        base = { ...base, maxRating: 5, ratingLabel: '' };
        break;
      case 'linear_scale':
        base = { ...base, minValue: 1, maxValue: 5, minLabel: '', maxLabel: '' };
        break;
      default:
        break;
    }
    const newQuestion: Question = base as any;
    setSurvey(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  // Section handlers
  const addSection = (): void => {
    const newSectionNumber = sections.length + 1;
    const newSection: Section = { id: String(Date.now()), title: `Section ${newSectionNumber}` };
    setSections(prev => [...prev, newSection]);
    setCurrentSectionId(newSection.id);
  };
  const updateSectionTitle = (sectionId: string, title: string): void => {
    setSections(prev => prev.map(s => (s.id === sectionId ? { ...s, title } : s)));
  };
  const deleteSection = (sectionId: string): void => {
    if (sections.length <= 1) return;
    setSurvey(prev => ({ ...prev, questions: prev.questions.filter(q => q.sectionId !== sectionId) }));
    const remaining = sections.filter(s => s.id !== sectionId);
    setSections(remaining);
    if (remaining[0]) setCurrentSectionId(remaining[0].id);
  };

  const updateQuestion = (questionId: number, field: string, value: any): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => (q.id === questionId ? ({ ...(q as any), [field]: value } as any) : q)),
    }));
  };

  const deleteQuestion = (questionId: number): void => {
    setSurvey(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== questionId) }));
  };

  const duplicateQuestion = (questionId: number): void => {
    const q = survey.questions.find(x => x.id === questionId);
    if (!q) return;
    const duplicated = { ...q, id: Date.now(), title: q.title + ' (Copy)' } as Question;
    setSurvey(prev => ({ ...prev, questions: [...prev.questions, duplicated] }));
  };

  const addOption = (questionId: number): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single_choice' || q.type === 'multiple_choice')) {
          const options = Array.isArray((q as any).options) ? ([...((q as any).options), '']) : [''];
          return { ...(q as any), options } as Question;
        }
        return q;
      }),
    }));
  };

  const updateOption = (questionId: number, optionIndex: number, value: string): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single_choice' || q.type === 'multiple_choice')) {
          const options = (Array.isArray((q as any).options) ? (q as any).options : []).map((opt: string, idx: number) => (idx === optionIndex ? value : opt));
          return { ...(q as any), options } as Question;
        }
        return q;
      }),
    }));
  };

  const removeOption = (questionId: number, optionIndex: number): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && (q.type === 'single_choice' || q.type === 'multiple_choice')) {
          const options = (Array.isArray((q as any).options) ? (q as any).options : []).filter((_: string, idx: number) => idx !== optionIndex);
          return { ...(q as any), options } as Question;
        }
        return q;
      }),
    }));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, questionId: number): void => {
    setDraggedItem(questionId);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => { e.preventDefault(); };
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
    if (!survey.title.trim()) { toast.error('Survey title is required.'); return; }
    if (!survey.projectId) { toast.error('Please select a project.'); return; }
    if (survey.questions.length === 0) { toast.error('Please add at least one question.'); return; }
    const hasEmptyTitle = survey.questions.some(q => !q.title.trim());
    if (hasEmptyTitle) { toast.error('All questions must have a title.'); return; }
    const hasEmptyOption = survey.questions.some(q => (q.type === 'single_choice' || q.type === 'multiple_choice') && (Array.isArray((q as any).options) ? (q as any).options : []).some((opt: string) => !String(opt).trim()));
    if (hasEmptyOption) { toast.error('All options in choice questions must have a value.'); return; }

    const payload = mapDraftToUpdatePayload(survey);
    // include allowedRoles selected via modal
    updateSurvey.mutate({ ...(payload as any), allowedRoles: selectedRoles }, {
       onSuccess: () => {
         toast.success('Survey updated successfully');
         localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + surveyId);
         navigate({ to: backHomeLink });
       },
     });
  };

  const handleCancel = (): void => { navigate({ to: backHomeLink }); };

  return (
    <div className="pb-10">
      <Breadcrumb
        items={["Community", "Surveys", "Edit Survey"]}
        title="Edit Survey"
        className='absolute top-0 left-0 w-full'
      />

      <div className="flex gap-6 pt-20">
        <div className="flex-1 max-w-3xl">
          <SurveyInfoForm
            title={survey.title}
            description={survey.description}
            projectId={survey.projectId}
            estimatedTime={survey.estimatedTime}
            onChange={(fields) => setSurvey(prev => ({ ...prev, ...fields }))}
            visibleProjects={visibleProjects}
            moreProjects={moreProjects}
            startDate={null}
            endDate={null}
            startHour={"00"}
            startMinute={"00"}
            endHour={"00"}
            endMinute={"00"}
            selectedRoles={selectedRoles}
            onStartPickerOpen={() => {}}
            onEndPickerOpen={() => {}}
            onRolesModalOpen={() => setRolesModalOpen(true)}
            onRemoveRole={(id: string) => setSelectedRoles(prev => prev.filter(r => r !== id))}
            roleLabelById={(id: string) => roleLabelById(id)}
          />

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
                    <span className="mr-2">{roleLabelById(id)}</span>
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
            closeOnOverlayClick
            >
            <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
              {rolesLoading && <div className="text-sm text-gray-500">Loading roles...</div>}
              {rolesError && <div className="text-sm text-red-600">Failed to load roles</div>}
              {!rolesLoading && !rolesError && roleGroups.length === 0 && <div className="text-sm text-gray-500">No roles found.</div>}
              {roleGroups.map(group => (
                <div key={group.title} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{group.title}</h4>
                    {/* hide select/clear for report-forms (single-selection) */}
                    {!isReportForm && (() => {
                      const groupValues = group.options.map(o => o.value);
                      const allSelected = groupValues.every(v => selectedRoles.includes(v));
                      const nextSelectAll = !allSelected;
                      return (
                        <button type="button" onClick={() => toggleGroupRoles(groupValues, nextSelectAll)} className={`text-xs px-2 py-1 rounded border transition-colors ${allSelected ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-primary border-primary/40 hover:bg-primary/5'}`}>
                          {allSelected ? 'Clear all' : 'Select all'}
                        </button>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.options.map(option => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type={isReportForm ? 'radio' : 'checkbox'}
                          name={isReportForm ? 'allowedRoleSelect' : undefined}
                          checked={isReportForm ? selectedRoles[0] === option.value : selectedRoles.includes(option.value)}
                          onChange={() => handleRoleToggle(option.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <ModalFooter>
              <ModalButton onClick={() => setRolesModalOpen(false)} variant="secondary">Cancel</ModalButton>
              <ModalButton onClick={() => setRolesModalOpen(false)} variant="primary">Done</ModalButton>
            </ModalFooter>
          </Modal>

          <SurveyFooterActions
            questionsCount={survey.questions.length}
            estimatedTime={survey.estimatedTime}
            isSaving={updateSurvey.isPending}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>

        {/* Fixed Right Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-20">
            <SidebarQuestionPicker
              onAdd={addQuestion}
              sections={sections}
              currentSectionId={currentSectionId}
              onSectionChange={setCurrentSectionId}
              onAddSection={addSection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
