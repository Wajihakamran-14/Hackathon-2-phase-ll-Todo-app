'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/navigation/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Menu } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden bg-white dark:bg-[#0f172a] border-b dark:border-slate-800 p-4 flex items-center shadow-sm z-10">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 mr-4"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs p-1 rounded mr-2">
                ✓
              </span>
              Todo Desktop
            </h1>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}