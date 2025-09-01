import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type DragEvent, type FC, type JSX } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { useSurvey, useUpdateSurvey } from '@/hooks/useSurveys';
import { useProjectsList } from '@/hooks/useProjects';
import SurveyInfoForm from '@/components/features/surveys/SurveyInfoForm';
import QuestionsSection from '@/components/features/surveys/QuestionsSection';
import SidebarQuestionPicker from '@/components/features/surveys/SidebarQuestionPicker';
import SurveyFooterActions from '@/components/features/surveys/SurveyFooterActions';
import { Question, SurveyDraft, ChoiceQuestion, TextQuestion } from '@/components/features/surveys/types';
import { toast } from 'react-toastify';

export const Route = createFileRoute('/dashboard/surveys/edit/$edit-id')({
  component: EditSurveyComponent,
});

const LOCAL_STORAGE_KEY_PREFIX = 'edit-survey-';

function mapFromServerToDraft(entity: any): SurveyDraft {
  const questions: Question[] = (entity?.questionItems || []).map((qi: any) => {
    if (qi.type === 'single_choice' || qi.type === 'multiple_choice') {
      return {
        id: Date.now() + Math.random(),
        type: qi.type,
        title: qi.title,
        description: qi.description,
        required: qi.required,
        options: qi.options ?? [],
      } as ChoiceQuestion;
    }
    return {
      id: Date.now() + Math.random(),
      type: qi.type,
      title: qi.title,
      description: qi.description,
      required: qi.required,
      placeholder: qi.placeholder ?? '',
    } as TextQuestion;
  });

  return {
    title: entity?.title ?? '',
    description: entity?.description ?? '',
    project: entity?.project ?? '',
    estimatedTime: entity?.estimatedTime ?? '',
    questions,
  };
}

function mapDraftToUpdatePayload(draft: SurveyDraft) {
  return {
    title: draft.title,
    description: draft.description,
    project: draft.project,
    estimatedTime: draft.estimatedTime,
    questions: draft.questions.map(q => {
      if (q.type === 'single_choice' || q.type === 'multiple_choice') {
        const c = q as ChoiceQuestion;
        return {
          id: 0,
          type: c.type,
          title: c.title,
          description: c.description,
          required: c.required,
          options: c.options,
        };
      }
      const t = q as TextQuestion;
      return {
        id: 0,
        type: t.type,
        title: t.title,
        description: t.description,
        required: t.required,
        placeholder: t.placeholder,
      };
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

  const visibleProjects = projectsData?.result.slice(0, 5) ?? [];
  const moreProjects = projectsData?.result.slice(5) ?? [];

  const [survey, setSurvey] = useState<SurveyDraft>({
    title: '',
    description: '',
    project: '',
    estimatedTime: '',
    questions: [],
  });

  // hydrate from server
  useEffect(() => {
    if (data?.result) {
      const key = LOCAL_STORAGE_KEY_PREFIX + surveyId;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setSurvey(JSON.parse(saved));
          return;
        } catch {}
      }
      setSurvey(mapFromServerToDraft(data.result));
    }
  }, [data, surveyId]);

  // persist draft per survey id
  useEffect(() => {
    const key = LOCAL_STORAGE_KEY_PREFIX + surveyId;
    if (survey.title || survey.description || survey.questions.length > 0) {
      localStorage.setItem(key, JSON.stringify(survey));
    }
  }, [survey, surveyId]);

  // question handlers (same as create)
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const addQuestion = (type: Question['type']): void => {
    const newQuestion: Question = {
      id: Date.now(),
      type,
      title: '',
      description: '',
      required: false,
      ...(type === 'single_choice' || type === 'multiple_choice' ? { options: ['', ''] } : { placeholder: '' }),
    } as any;
    setSurvey(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const updateQuestion = <K extends keyof Question>(questionId: number, field: K, value: Question[K]): void => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => (q.id === questionId ? { ...q, [field]: value } : q)),
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
          return { ...(q as ChoiceQuestion), options: ([...(q as ChoiceQuestion).options, '']) } as Question;
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
          const options = (q as ChoiceQuestion).options.map((opt, idx) => (idx === optionIndex ? value : opt));
          return { ...(q as ChoiceQuestion), options } as Question;
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
          const options = (q as ChoiceQuestion).options.filter((_, idx) => idx !== optionIndex);
          return { ...(q as ChoiceQuestion), options } as Question;
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
    if (!survey.project) { toast.error('Please select a project.'); return; }
    if (survey.questions.length === 0) { toast.error('Please add at least one question.'); return; }
    const hasEmptyTitle = survey.questions.some(q => !q.title.trim());
    if (hasEmptyTitle) { toast.error('All questions must have a title.'); return; }
    const hasEmptyOption = survey.questions.some(q => (q.type === 'single_choice' || q.type === 'multiple_choice') && (q as ChoiceQuestion).options.some(opt => !opt.trim()));
    if (hasEmptyOption) { toast.error('All options in choice questions must have a value.'); return; }

    const payload = mapDraftToUpdatePayload(survey);
    updateSurvey.mutate(payload as any, {
      onSuccess: () => {
        toast.success('Survey updated successfully');
        localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + surveyId);
        navigate({ to: '/dashboard/surveys' });
      },
    });
  };

  const handleCancel = (): void => { navigate({ to: '/dashboard/surveys' }); };

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
            project={survey.project}
            estimatedTime={survey.estimatedTime}
            onChange={(fields) => setSurvey(prev => ({ ...prev, ...fields }))}
            visibleProjects={visibleProjects}
            moreProjects={moreProjects}
          />

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

          <SurveyFooterActions
            questionsCount={survey.questions.length}
            estimatedTime={survey.estimatedTime}
            isSaving={updateSurvey.isPending}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>

        <div className="w-80 flex-shrink-0">
          <div className="sticky top-20">
            <SidebarQuestionPicker types={[
              { id: 'single_choice', label: 'Single Choice', icon: '◉' },
              { id: 'multiple_choice', label: 'Multiple Choice', icon: '☑' },
              { id: 'text_input', label: 'Text Input', icon: '📝' },
              { id: 'textarea', label: 'Long Text', icon: '📄' }
            ]} onAdd={addQuestion} />
          </div>
        </div>
      </div>
    </div>
  );
}
