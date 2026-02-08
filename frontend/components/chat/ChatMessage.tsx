'use client';

import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
          <Bot className="h-5 w-5" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm transition-all hover:shadow-md ${
        !isAssistant 
          ? 'bg-indigo-600 text-white rounded-tr-none' 
          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
      }`}>
        {content}
      </div>
      {!isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 shrink-0">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
