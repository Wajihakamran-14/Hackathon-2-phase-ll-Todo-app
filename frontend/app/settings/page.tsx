'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Globe, Shield, Sun, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isPrivate, setIsPrivate] = useState(false);

  // Initialize settings from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        { 
          name: 'Notifications', 
          icon: Bell, 
          description: 'Manage how you receive alerts', 
          action: notifications ? 'Enabled' : 'Disabled',
          onClick: () => setNotifications(!notifications),
          active: notifications
        },
        { 
          name: 'Appearance', 
          icon: darkMode ? Moon : Sun, 
          description: 'Dark mode and UI themes', 
          action: darkMode ? 'Dark' : 'Light',
          onClick: toggleDarkMode,
          active: darkMode
        },
        { 
          name: 'Language', 
          icon: Globe, 
          description: 'Set your preferred language', 
          action: language,
          onClick: () => setLanguage(language === 'English' ? 'Spanish' : 'English'),
          active: true
        },
      ]
    },
    {
      title: 'Security',
      items: [
        { 
          name: 'Privacy', 
          icon: Shield, 
          description: 'Manage your data and visibility', 
          action: isPrivate ? 'Private' : 'Public',
          onClick: () => setIsPrivate(!isPrivate),
          active: isPrivate
        },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Personalize your Todo Desktop experience</p>
      </div>

      <div className="space-y-8">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{group.title}</h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 divide-y dark:divide-slate-800">
              {group.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl mr-4 transition-colors ${
                      item.active 
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant={item.active ? "default" : "outline"} 
                    size="sm"
                    className={`min-w-[100px] ${!item.active ? 'dark:border-slate-700 dark:text-slate-300' : ''}`}
                    onClick={() => {
                      item.onClick();
                    }}
                  >
                    {item.active && <Check className="h-3 w-3 mr-1" />}
                    {item.action}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-indigo-600 rounded-2xl text-white flex items-center justify-between shadow-xl shadow-indigo-200">
        <div>
          <h3 className="text-xl font-bold">Cloud Sync</h3>
          <p className="text-indigo-100 text-sm">Your settings are synced across all your devices automatically.</p>
        </div>
        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-none">
          Sync Now
        </Button>
      </div>
    </div>
  );
}
