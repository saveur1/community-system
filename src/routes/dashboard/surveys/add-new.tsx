import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCreateSurvey } from '@/hooks/useSurveys';
import { useProjectsList } from '@/hooks/useProjects';
import { useState, DragEvent, FC, useEffect } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import SurveyInfoForm from '@/components/features/surveys/SurveyInfoForm';
import QuestionsSection from '@/components/features/surveys/QuestionsSection';
import SidebarQuestionPicker from '@/components/features/surveys/SidebarQuestionPicker';
import SurveyFooterActions from '@/components/features/surveys/SurveyFooterActions';
import { Question, SurveyDraft } from '@/components/features/surveys/types';

// moved types to components/features/surveys/types

interface QuestionType {
    id: Question['type'];
    label: string;
    icon: string;
}

const CreateSurveyComponent: FC = () => {
    const navigate = useNavigate();
  const createSurveyMutation = useCreateSurvey();
    const { data: projectsData, isLoading: areProjectsLoading, isError: areProjectsError } = useProjectsList({ page: 1, limit: 100 });

    const visibleProjects = projectsData?.result.slice(0, 5) ?? [];
    const moreProjects = projectsData?.result.slice(5) ?? [];

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

        createSurveyMutation.mutate(survey, {
            onSuccess: () => {
                toast.success(t('Survey created successfully!'));
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                navigate({ to: '/dashboard/surveys' });
            },
        });
    };

    const handleCancel = (): void => {
        navigate({ to: '/dashboard/surveys' });
    };

    // modularized: inline question editor moved to components/features/surveys

    return (
        <div className="pb-10">
            <Breadcrumb
                items={["Community", "Surveys", "Create Survey"]}
                title="Create New Survey"
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
                        isSaving={createSurveyMutation.isPending}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
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