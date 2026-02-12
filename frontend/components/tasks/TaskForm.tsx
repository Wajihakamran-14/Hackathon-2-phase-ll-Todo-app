'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (task: { 
    title: string; 
    description?: string; 
    completed: boolean; 
    priority: 'low' | 'medium' | 'high' | 'urgent' 
  }) => Promise<void>;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-600 border-red-200' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="text-lg py-5 px-4 rounded-xl border-2 border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300"
            autoFocus
          />
        </div>

        <div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="rounded-xl border-2 border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300"
            rows={2}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-sm font-medium text-slate-500 mr-2 whitespace-nowrap">Priority:</span>
              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 min-w-max">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      priority === opt.value 
                        ? `${opt.color} shadow-sm ring-2 ring-offset-1 ring-indigo-500/20` 
                        : 'bg-transparent text-slate-400 border-transparent hover:bg-white hover:text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !title.trim()} 
            className="w-full sm:w-auto px-8 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Adding...' : 'Add Task'}
          </Button>
        </div>
      </div>
    </form>
  );
}