import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { VerifyEmailForm } from './VerifyEmailForm';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error && err.message === 'Email verification required') {
        setNeedsVerification(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <VerifyEmailForm 
        email={email}
        onSuccess={() => {
          setNeedsVerification(false);
          handleSubmit(new Event('submit') as any);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sepia-500 focus:ring-sepia-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sepia-500 focus:ring-sepia-500 sm:text-sm"
          required
        />
      </div>
      {error && !needsVerification && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sepia-600 hover:bg-sepia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sepia-500 disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
} 