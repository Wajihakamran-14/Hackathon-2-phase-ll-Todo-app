'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Task } from '@/types/task';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Grid3X3, List } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
    }

    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch tasks from the API only if user is authenticated
  useEffect(() => {
    if (user) {
      const fetchTasks = async () => {
        try {
          const data = await apiClient.getTasks();
          setTasks(data);
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchTasks();
    }
  }, [user]);

  const handleTaskSubmit = async (task: {
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent'
  }) => {
    try {
      console.log('DEBUG: Submitting task:', task);
      const newTask = await apiClient.createTask(task);
      console.log('DEBUG: Task created successfully:', newTask);
      setTasks([newTask, ...tasks]); // Add new task at the top
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const updated = await apiClient.updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed
      });

      setTasks(tasks.map(task => task.id === updated.id ? updated : task));
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleTaskDelete = async (id: string) => {
    try {
      await apiClient.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    try {
      const updated = await apiClient.toggleTaskCompletion(id);
      setTasks(tasks.map(task => task.id === id ? updated : task));
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  // Filter tasks based on search term and filter status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filter === 'active') return !task.completed && matchesSearch;
    if (filter === 'completed') return task.completed && matchesSearch;
    return matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled by useEffect
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">My Tasks</h1>
        <p className="text-slate-600">Manage your daily activities</p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <button
            className={`p-2 rounded-lg border ${viewMode === 'list' ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-600'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-600'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="mb-6 bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg border border-slate-200 p-6 transform transition-all hover:shadow-xl">
        <TaskForm onSubmit={handleTaskSubmit} />
      </div>

      {/* Tasks Count */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
        </h2>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl border-2 border-dashed border-slate-300 animate-fade-in">
            <div className="mb-4 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
              <Plus className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-1">No tasks found</h3>
            <p className="text-slate-600 max-w-md">
              {searchTerm || filter !== 'all'
                ? 'Try changing your search or filter criteria'
                : 'Get started by creating your first task'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4 animate-fade-in">
            {filteredTasks.map((task, index) => (
              <div 
                key={task.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                  onToggleCompletion={toggleTaskCompletion}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {filteredTasks.map((task, index) => (
              <div 
                key={task.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                  onToggleCompletion={toggleTaskCompletion}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}