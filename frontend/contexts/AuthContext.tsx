'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create a default context value to prevent errors during initialization
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  login: async () => { console.log('Login function'); },
  signup: async () => { console.log('Signup function'); },
  logout: () => { console.log('Logout function'); },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          apiClient.setToken(token);
          
          // Fetch user details to verify token and restore session
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token invalid or expired
            localStorage.removeItem('auth_token');
            apiClient.clearToken();
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      console.log(`DEBUG: Attempting login to ${API_BASE_URL}/auth/login`);
      // Call the backend login API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('DEBUG: Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('DEBUG: Login error data:', errorData);
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      console.log('DEBUG: Login success, received token');

      // Store the token in localStorage, cookie (for middleware), and API client
      localStorage.setItem('auth_token', data.access_token);
      document.cookie = `auth_token=${data.access_token}; path=/; max-age=2592000; SameSite=Lax`;
      apiClient.setToken(data.access_token);

      // Set the user data
      setUser(data.user);

      router.push('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);

    try {
      // Call the backend register API
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data: AuthResponse = await response.json();

      // Store the token in localStorage, cookie (for middleware), and API client
      localStorage.setItem('auth_token', data.access_token);
      document.cookie = `auth_token=${data.access_token}; path=/; max-age=2592000; SameSite=Lax`;
      apiClient.setToken(data.access_token);

      // Set the user data
      setUser(data.user);

      router.push('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear the token from localStorage, cookies, and API client
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    apiClient.clearToken();

    // Clear the user
    setUser(null);

    // Redirect to landing page
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}