'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Task } from '@/types/task';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Filter, Grid3X3, List, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
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

  const handleTaskSubmit = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const activeTasks = totalTasks - completedTasks;

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
    <div className="h-full flex flex-col">
      {/* Welcome Banner */}
      <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.email?.split('@')[0]}!</h1>
        <p className="opacity-90">Here's what you need to tackle today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg mr-4">
              <List className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">{activeTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <button
            className={`p-2 rounded-lg border ${viewMode === 'list' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'border-gray-300 text-gray-600'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'border-gray-300 text-gray-600'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center mb-3">
          <Plus className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Add New Task</h2>
        </div>
        <TaskForm onSubmit={handleTaskSubmit} />
      </div>

      {/* Tasks Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {filter === 'all' ? 'All Tasks' : filter === 'active' ? 'Active Tasks' : 'Completed Tasks'}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="mb-4 p-3 bg-indigo-100 rounded-full">
              <Plus className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-gray-500 max-w-md">
              {searchTerm || filter !== 'all'
                ? 'Try changing your search or filter criteria'
                : 'Get started by creating your first task'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onToggleCompletion={toggleTaskCompletion}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onToggleCompletion={toggleTaskCompletion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}