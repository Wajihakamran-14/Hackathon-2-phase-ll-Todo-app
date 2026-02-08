'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-md">
        <LoginForm />
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>For demo purposes, any credentials will work</p>
        </div>
      </div>
    </div>
  );
}