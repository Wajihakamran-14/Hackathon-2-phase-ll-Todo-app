'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { ChatMessage } from './ChatMessage';
import { Send, User, Bot, Loader2, Minimize2, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load conversation ID from localStorage
    const savedId = localStorage.getItem('chat_conversation_id');
    if (savedId) {
      setConversationId(savedId);
      // Fetch history
      apiClient.getChatHistory(savedId).then(history => {
        const formattedHistory: Message[] = history.map((m: any) => ({
          role: m.role,
          content: m.content
        }));
        setMessages(formattedHistory);
      }).catch(err => console.error('Failed to load chat history:', err));
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('chat_conversation_id', conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.chat(input, conversationId || undefined);
      const assistantMessage: Message = { role: 'assistant', content: response.response };
      
      // If the response indicates history was cleared, wipe frontend state
      if (response.response.includes('Cleared') || response.response.toLowerCase().includes('history cleared')) {
        setMessages([]);
        setConversationId(null);
        localStorage.removeItem('chat_conversation_id');
      } else {
        setMessages(prev => [...prev, assistantMessage]);
        setConversationId(response.conversation_id);
      }
      
      // Trigger a global refresh event after a short delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tasks-updated'));
      }, 500);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-500 transition-all transform hover:scale-110 z-[60] animate-bounce"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full h-[85vh] sm:bottom-6 sm:right-6 sm:w-96 sm:h-[500px] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border-t sm:border border-slate-200 dark:border-slate-800 z-[60] overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Assistant</h3>
            <p className="text-[10px] text-indigo-100 uppercase tracking-widest">Active</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full">
          <Minimize2 className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Bot className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">How can I help you manage your tasks today?</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 rounded-tl-none">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t dark:border-slate-800">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="pr-12 rounded-xl dark:bg-slate-800 dark:border-slate-700"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 transition-all hover:bg-indigo-500"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
