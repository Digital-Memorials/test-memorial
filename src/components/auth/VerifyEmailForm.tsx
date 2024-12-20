import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface VerifyEmailFormProps {
  email: string;
  onSuccess?: () => void;
}

export function VerifyEmailForm({ email, onSuccess }: VerifyEmailFormProps) {
  const [code, setCode] = useState('');
  const { verifyEmail, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyEmail(email, code);
      onSuccess?.();
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-900">Verify your email</h3>
      <p className="mt-1 text-sm text-gray-600">
        Please enter the verification code sent to {email}
      </p>
      <form onSubmit={handleSubmit} className="mt-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sepia-500 focus:ring-sepia-500 sm:text-sm"
            required
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sepia-600 hover:bg-sepia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sepia-500 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  );
} 