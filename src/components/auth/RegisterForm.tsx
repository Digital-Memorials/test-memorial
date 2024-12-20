import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { resendSignUpCode } from 'aws-amplify/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { register, verifyEmail, login, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(email, password, name);
      setShowVerification(true);
    } catch (err) {
      console.error('Registration error:', err);
      setVerificationError(
        err instanceof Error ? err.message : 'Failed to register'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setVerificationError(null);
    try {
      await verifyEmail(email, verificationCode);
      // Only after verification is confirmed, attempt login
      try {
        await login(email, password);
        onSuccess?.();
      } catch (loginErr) {
        console.error('Login error after verification:', loginErr);
        setVerificationError('Verification successful. Please proceed to login.');
        // Redirect to login page instead of auto-login
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationError(
        err instanceof Error ? err.message : 'Failed to verify email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    
    try {
      setResendLoading(true);
      await resendSignUpCode({ username: email });
      // Start cooldown timer
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error resending code:', err);
      setVerificationError(
        err instanceof Error ? err.message : 'Failed to resend verification code'
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Verify Your Email
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>We've sent a verification code to {email}.</p>
                <p>Please enter it below to complete your registration.</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerification} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sepia-500 focus:ring-sepia-500 sm:text-sm"
              required
            />
          </div>

          {verificationError && (
            <p className="mt-2 text-sm text-red-600">{verificationError}</p>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sepia-600 hover:bg-sepia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sepia-500 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || resendLoading}
              className="w-full flex justify-center py-2 px-4 border border-sepia-300 rounded-md shadow-sm text-sm font-medium text-sepia-700 bg-white hover:bg-sepia-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sepia-500 disabled:opacity-50"
            >
              {resendCooldown > 0
                ? `Resend Code (${resendCooldown}s)`
                : resendLoading
                ? 'Sending...'
                : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sepia-500 focus:ring-sepia-500 sm:text-sm"
          required
        />
      </div>
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
          minLength={8}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sepia-600 hover:bg-sepia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sepia-500 disabled:opacity-50"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}