import { JSX } from 'react';
import { QuestionTypeMeta } from './types';

interface Props {
  types: QuestionTypeMeta[];
  onAdd: (typeId: QuestionTypeMeta['id']) => void;
}

export default function SidebarQuestionPicker({ types, onAdd }: Props): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Question</h3>
      <p className="text-sm text-gray-600 mb-4">Choose a question type to add to your survey:</p>
      <div className="space-y-3">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => onAdd(type.id)}
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
  );
}

