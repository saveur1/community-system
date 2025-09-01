import { JSX, DragEvent } from 'react';
import QuestionEditor from './QuestionEditor';
import { Question } from './types';

interface Props {
  questions: Question[];
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

export default function QuestionsSection({ questions, onUpdate, onDelete, onDuplicate, onAddOption, onUpdateOption, onRemoveOption, onDragStart, onDragOver, onDrop }: Props): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Questions ({questions.length})</h3>
      </div>
      <div>
        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No questions added yet</p>
            <p className="text-sm">Use the sidebar on the right to add questions</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <QuestionEditor
              key={q.id}
              question={q}
              index={index}
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
          ))
        )}
      </div>
    </div>
  );
}

