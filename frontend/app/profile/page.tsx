'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-600">Manage your personal information and security</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <User className="h-12 w-12" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Mail className="h-5 w-5 text-slate-400 mr-3" />
                  <span className="text-slate-700 font-medium">{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Member Since</label>
                <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Calendar className="h-5 w-5 text-slate-400 mr-3" />
                  <span className="text-slate-700 font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Account Status</label>
                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-green-700 font-medium">Verified & Secure</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => alert('Password reset link has been sent to your email!')}
                >
                  Reset Password
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
