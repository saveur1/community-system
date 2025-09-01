import { JSX, DragEvent } from 'react';
import { FaGripVertical, FaCopy, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { ChoiceQuestion, Question, TextQuestion } from './types';

interface Props {
  question: Question;
  index: number;
  onUpdate: <K extends keyof Question>(questionId: number, field: K, value: Question[K]) => void;
  onDelete: (questionId: number) => void;
  onDuplicate: (questionId: number) => void;
  onAddOption: (questionId: number) => void;
  onUpdateOption: (questionId: number, optionIndex: number, value: string) => void;
  onRemoveOption: (questionId: number, optionIndex: number) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, questionId: number) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, dropTargetId: number) => void;
}

export default function QuestionEditor({ question, index, onUpdate, onDelete, onDuplicate, onAddOption, onUpdateOption, onRemoveOption, onDragStart, onDragOver, onDrop }: Props): JSX.Element {
  const questionTypes = [
    { id: 'single_choice', label: 'Single Choice', icon: '◉' },
    { id: 'multiple_choice', label: 'Multiple Choice', icon: '☑' },
    { id: 'text_input', label: 'Text Input', icon: '📝' },
    { id: 'textarea', label: 'Long Text', icon: '📄' }
  ] as const;

  const typeMeta = questionTypes.find(t => t.id === question.type)!;

  return (
    <div
      key={question.id}
      className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm"
      draggable
      onDragStart={(e) => onDragStart(e, question.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, question.id)}
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
            onChange={(e) => onUpdate(question.id, 'title', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Question description (optional)"
            value={question.description}
            onChange={(e) => onUpdate(question.id, 'description', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate(question.id, 'required', e.target.checked)}
              className="mr-1"
            />
            Required
          </label>
          <button onClick={() => onDuplicate(question.id)} className="text-gray-500 hover:text-gray-700" title="Duplicate">
            <FaCopy />
          </button>
          <button onClick={() => onDelete(question.id)} className="text-red-500 hover:text-red-700" title="Delete">
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {typeMeta.icon} {typeMeta.label}
        </span>
      </div>

      {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Options:</label>
          {(question as ChoiceQuestion).options.map((option, optIndex) => (
            <div key={optIndex} className="flex items-center space-x-2">
              <span className="text-gray-400 w-6 text-center">
                {question.type === 'single_choice' ? '◉' : '☑'}
              </span>
              <input
                type="text"
                placeholder={`Option ${optIndex + 1}`}
                value={option}
                onChange={(e) => onUpdateOption(question.id, optIndex, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {(question as ChoiceQuestion).options.length > 2 && (
                <button onClick={() => onRemoveOption(question.id, optIndex)} className="text-red-500 hover:text-red-700">
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => onAddOption(question.id)} className="text-blue-500 hover:text-blue-700 text-sm flex items-center mt-2">
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
            onChange={(e) => onUpdate(question.id, 'placeholder', e.target.value as any)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            {question.type === 'text_input' ? (
              <input type="text" placeholder={(question as TextQuestion).placeholder || 'Text input preview'} className="w-full border border-gray-300 rounded-md px-3 py-2" disabled />
            ) : (
              <textarea placeholder={(question as TextQuestion).placeholder || 'Long text input preview'} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none" disabled />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

