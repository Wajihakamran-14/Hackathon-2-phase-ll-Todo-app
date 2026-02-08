'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckSquare, Calendar, Star, Users, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const features = [
    {
      title: 'Task Management',
      description: 'Organize and manage your tasks efficiently with our intuitive interface.',
      icon: <CheckSquare className="h-8 w-8 text-indigo-600" />,
    },
    {
      title: 'Secure Authentication',
      description: 'Protect your data with our robust authentication system.',
      icon: <Star className="h-8 w-8 text-indigo-600" />,
    },
    {
      title: 'Collaboration',
      description: 'Work together with your team seamlessly on shared projects.',
      icon: <Users className="h-8 w-8 text-indigo-600" />,
    },
    {
      title: 'Calendar Integration',
      description: 'Sync your tasks with calendar for better time management.',
      icon: <Calendar className="h-8 w-8 text-indigo-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gradient-to-b from-slate-50 to-indigo-100 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl animate-fade-in">
                  <span className="block">Get things done with</span>
                  <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Todo Desktop</span>
                </h1>
                <p className="mt-3 text-base text-slate-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 animate-fade-in delay-100">
                  A modern, secure todo application that helps you stay organized and productive. Manage your tasks efficiently with our intuitive interface and powerful features.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start animate-fade-in delay-200">
                  <div className="rounded-md shadow-lg">
                    <Button 
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white md:py-4 md:text-lg md:px-10"
                      onClick={() => setShowSignup(true)}
                    >
                      Get started
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-slate-700 md:py-4 md:text-lg md:px-10"
                      onClick={() => setShowLogin(true)}
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center animate-slide-in-right">
            <div className="text-white text-center p-8">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-2xl">
                <CheckSquare className="h-16 w-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-2">Ready to be Productive?</h3>
                <p className="text-indigo-50">Log in or sign up to start managing your daily workflow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Everything you need to stay organized
            </p>
            <p className="mt-4 max-w-2xl text-xl text-slate-600 mx-auto">
              Powerful features designed to help you manage your tasks efficiently and effectively.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="pt-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flow-root bg-gradient-to-b from-white to-slate-50 rounded-2xl px-6 pb-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="-mt-6">
                      <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg mb-6">
                        {feature.icon}
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-800 tracking-tight">{feature.title}</h3>
                      <p className="mt-3 text-base text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8 lg:flex lg:items-center lg:justify-between animate-fade-in">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-200">Start organizing your life today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow-lg">
              <Button 
                className="py-3 px-6 text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                onClick={() => setShowSignup(true)}
              >
                Get started
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow-lg">
              <Button 
                variant="outline" 
                className="py-3 px-6 text-base font-medium rounded-lg text-white border-2 border-white hover:bg-white hover:text-indigo-600"
                onClick={() => setShowLogin(true)}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <CheckSquare className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Todo Desktop</span>
          </div>
          <p className="text-[11px] text-slate-400 uppercase tracking-tight">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
          <div className="flex space-x-4 text-[11px] font-medium text-slate-400">
            <button className="hover:text-indigo-600 transition-colors">Privacy</button>
            <button className="hover:text-indigo-600 transition-colors">Terms</button>
            <button className="hover:text-indigo-600 transition-colors">Support</button>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <Dialog onClick={() => setShowLogin(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
          <DialogContent className="animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            <LoginForm onSuccess={() => setShowLogin(false)} />
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <button 
                onClick={() => { setShowLogin(false); setShowSignup(true); }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </button>
            </p>
          </DialogContent>
        </Dialog>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <Dialog onClick={() => setShowSignup(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSignup(false)} />
          <DialogContent className="animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowSignup(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            <SignupForm onSuccess={() => setShowSignup(false)} />
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <button 
                onClick={() => { setShowSignup(false); setShowLogin(true); }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </button>
            </p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}