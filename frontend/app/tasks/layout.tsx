'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/navigation/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // If we are on login or signup pages, don't show the sidebar
  // This is a common pattern for auth pages
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
