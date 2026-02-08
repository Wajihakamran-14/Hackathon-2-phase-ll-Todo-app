'use client';

import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-md">
        <SignupForm />
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>By signing up, you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}