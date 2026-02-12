'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LogOut, Layout, CheckSquare, Calendar, Settings, User, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Layout },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0f172a] shadow-lg h-full flex flex-col border-r dark:border-slate-800 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-1 rounded mr-2">
              ✓
            </span>
            Todo Desktop
          </h1>
          {/* Close Button only on Mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.includes(item.href);

              return (
                <li key={item.name}>
                  <Link href={item.href as any} onClick={onClose}>
                    <div className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}>
                      <Icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t dark:border-slate-800 mt-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-slate-200 text-sm truncate max-w-[120px]">
                {user?.email ? user.email.split('@')[0] : 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Online</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
