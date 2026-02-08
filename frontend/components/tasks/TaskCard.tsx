import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Task } from '@/types/task';
import { Edit3, Trash2, Save, X } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete, onToggleCompletion }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const handleSave = () => {
    onUpdate({
      ...task,
      title,
      description: description || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const priorityConfig = {
    low: { color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Low' },
    medium: { color: 'bg-blue-100 text-blue-600 border-blue-200', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-600 border-orange-200', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-600 border-red-200', label: 'Urgent' },
  };

  const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
        task.completed 
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50' 
          : 'border-indigo-100 bg-gradient-to-br from-white to-indigo-50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="pt-1.5">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggleCompletion(task.id)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${currentPriority.color}`}>
              {currentPriority.label}
            </span>
          </div>
          {isEditing ? (
            <div className="space-y-3 animate-fade-in">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-indigo-200 rounded-lg text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                autoFocus
                onKeyDown={handleKeyDown}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                rows={2}
                onKeyDown={handleKeyDown}
              />
              <div className="flex gap-2 mt-2">
                <Button type="button" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h3 className={`text-lg font-semibold break-words ${
                task.completed
                  ? 'line-through text-emerald-700'
                  : 'text-slate-800'
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`mt-2 text-sm break-words ${
                  task.completed
                    ? 'line-through text-emerald-600/80'
                    : 'text-slate-600'
                }`}>
                  {task.description}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-[10px] text-slate-400 flex justify-between items-center border-t border-slate-50 pt-3">
        <span>Created: {formatDate(task.createdAt)}</span>
        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <span>Updated: {formatDate(task.updatedAt)}</span>
        )}
      </div>
    </div>
  );
}