import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, DragEvent, JSX, FC } from 'react';
import { FaPlus, FaTrash, FaCopy, FaGripVertical, FaSave, FaArrowLeft, FaTimes } from 'react-icons/fa';
import Breadcrumb from '@/components/ui/breadcrum';
import ViewMorePrograms from '@/components/features/landing-page/view-more-programes';
import { useTranslation } from 'react-i18next';

interface BaseQuestion {
    id: number;
    type: 'single_choice' | 'multiple_choice' | 'text_input' | 'textarea';
    title: string;
    description: string;
    required: boolean;
}

interface ChoiceQuestion extends BaseQuestion {
    type: 'single_choice' | 'multiple_choice';
    options: string[];
    placeholder?: never;
}

interface TextQuestion extends BaseQuestion {
    type: 'text_input' | 'textarea';
    options?: never;
    placeholder: string;
}

type Question = ChoiceQuestion | TextQuestion;

interface Survey {
    title: string;
    description: string;
    program: string;
    estimatedTime: string;
    questions: Question[];
}

interface QuestionType {
    id: Question['type'];
    label: string;
    icon: string;
}

const CreateSurveyComponent: FC = () => {
    const navigate = useNavigate();

    const programOptions = [
        { value: "HIV/AIDS", label: "HIV/AIDS" },
        { value: "Immunization", label: "Immunization (SUGIRA MWANA)" },
        { value: "Mental Health", label: "Mental Health (Baho Neza)" },
        { value: "Malaria", label: "Malaria SBC" },
        { value: "Data-Driven Health", label: "Data-Driven Health" }
    ];

    const [survey, setSurvey] = useState<Survey>({
        title: '',
        description: '',
        program: '',
        estimatedTime: '',
        questions: []
    });

    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const { t } = useTranslation();

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
        if (!survey.title.trim()) {
            alert('Please enter a survey title');
            return;
        }
        if (survey.questions.length === 0) {
            alert('Please add at least one question');
            return;
        }

        // Validate questions
        for (let question of survey.questions) {
            if (!question.title.trim()) {
                alert('Please fill in all question titles');
                return;
            }
            if ((question.type === 'single_choice' || question.type === 'multiple_choice') &&
                question.options.some(opt => !opt.trim())) {
                alert('Please fill in all option values');
                return;
            }
        }

        // Save survey logic here
        console.log('Saving survey:', survey);
        alert('Survey saved successfully!');
        navigate({ to: '/dashboard/surveys' });
    };

    const handleCancel = (): void => {
        navigate({ to: '/dashboard/surveys' });
    };

    const renderQuestionEditor = (question: Question, index: number): JSX.Element => {
        return (
            <div
                key={question.id}
                className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm"
                draggable
                onDragStart={(e) => handleDragStart(e, question.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, question.id)}
            >
                <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                        <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">
                            {index + 1}
                        </span>
                        <FaGripVertical className="text-gray-400 cursor-move" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Question title *"
                            value={question.title}
                            onChange={(e) => updateQuestion(question.id, 'title', e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Question description (optional)"
                            value={question.description}
                            onChange={(e) => updateQuestion(question.id, 'description', e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                                className="mr-1"
                            />
                            Required
                        </label>
                        <button
                            onClick={() => duplicateQuestion(question.id)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Duplicate"
                        >
                            <FaCopy />
                        </button>
                        <button
                            onClick={() => deleteQuestion(question.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>

                {/* Question Type Indicator */}
                <div className="mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {questionTypes.find(t => t.id === question.type)?.icon} {questionTypes.find(t => t.id === question.type)?.label}
                    </span>
                </div>

                {/* Question-specific inputs */}
                {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Options:</label>
                        {(question as ChoiceQuestion).options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <span className="text-gray-400 w-6 text-center">
                                    {question.type === 'single_choice' ? '◉' : '☑'}
                                </span>
                                <input
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(question.id, index, e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {(question as ChoiceQuestion).options.length > 2 && (
                                    <button
                                        onClick={() => removeOption(question.id, index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addOption(question.id)}
                            className="text-blue-500 hover:text-blue-700 text-sm flex items-center mt-2"
                        >
                            <FaPlus className="mr-1" /> Add Option
                        </button>
                    </div>
                )}

                {(question.type === 'text_input' || question.type === 'textarea') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder text:</label>
                        <input
                            type="text"
                            placeholder="Enter placeholder text..."
                            value={(question as TextQuestion).placeholder || ''}
                            onChange={(e) => updateQuestion(question.id, 'placeholder', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            {question.type === 'text_input' ? (
                                <input
                                    type="text"
                                    placeholder={(question as TextQuestion).placeholder || 'Text input preview'}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    disabled
                                />
                            ) : (
                                <textarea
                                    placeholder={(question as TextQuestion).placeholder || 'Long text input preview'}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none"
                                    disabled
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

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
                    {/* Survey Basic Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Survey Title *</label>
                                <input
                                    type="text"
                                    placeholder="Enter survey title"
                                    value={survey.title}
                                    onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (minutes)</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 5"
                                    value={survey.estimatedTime}
                                    onChange={(e) => setSurvey(prev => ({ ...prev, estimatedTime: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                placeholder="Brief description of the survey"
                                value={survey.description}
                                onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                        {/* Programme Selection (checkboxes preserved) */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">
                                {t('feedback.programme')} <span className="text-red-500">*</span>
                            </label>

                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                {programOptions.map((option) => (
                                    <div key={option.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`programme-${option.value}`}
                                            name="programmes"
                                            value={option.value}
                                            checked={survey.program.includes(option.value)}
                                            onChange={() => setSurvey(prev => ({ ...prev, program: option.value }))}
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                        />
                                        <label
                                            htmlFor={`programme-${option.value}`}
                                            className="ml-3 block text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                                        >
                                            {option.label}
                                        </label>
                                    </div>
                                ))}

                                {/* Others option with text input */}
                                <div className="flex items-center">
                                    <ViewMorePrograms dropDownPosition="bottom-left" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Questions ({survey.questions.length})</h3>
                        </div>

                        {/* Questions List */}
                        <div>
                            {survey.questions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="text-lg mb-2">No questions added yet</p>
                                    <p className="text-sm">Use the sidebar on the right to add questions</p>
                                </div>
                            ) : (
                                survey.questions.map((question, index) => renderQuestionEditor(question, index))
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''} •
                                Estimated time: {survey.estimatedTime || '0'} minutes
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 font-medium flex items-center"
                                >
                                    <FaSave className="mr-2" />
                                    Save Survey
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Right Sidebar */}
                <div className="w-80 flex-shrink-0">
                    <div className="sticky top-20">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Question</h3>
                            <p className="text-sm text-gray-600 mb-4">Choose a question type to add to your survey:</p>

                            {/* Add Question Buttons */}
                            <div className="space-y-3">
                                {questionTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => addQuestion(type.id)}
                                        className="w-full flex items-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                                    >
                                        <span className="text-2xl mr-3">{type.icon}</span>
                                        <div>
                                            <div className="text-sm font-medium text-gray-700">{type.label}</div>
                                            <div className="text-xs text-gray-500">
                                                {type.id === 'single_choice' && 'Choose one option'}
                                                {type.id === 'multiple_choice' && 'Choose multiple options'}
                                                {type.id === 'text_input' && 'Short text response'}
                                                {type.id === 'textarea' && 'Long text response'}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

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