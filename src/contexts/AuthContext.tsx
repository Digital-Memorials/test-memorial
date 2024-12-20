import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, fetchUserAttributes, confirmSignUp, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { AuthError } from '@aws-amplify/auth';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ requiresVerification: boolean }>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // Initial session check
  useEffect(() => {
    checkSession();
  }, []);

  // Session persistence check
  const checkSession = async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      if (!attributes.email) {
        throw new Error('Email is required');
      }

      setUser({
        id: userData.userId,
        name: attributes.name || 'Anonymous',
        email: attributes.email,
        emailVerified: attributes.email_verified === 'true'
      });
    } catch (err) {
      if (err instanceof AuthError) {
        console.error('Auth error checking session:', err.message);
      } else {
        console.error('Error checking session:', err);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsSessionLoaded(true);
    }
  };

  // Periodic session check (every 30 minutes)
  useEffect(() => {
    const interval = setInterval(checkSession, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (!isSignedIn) {
        if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
          throw new Error('User is not confirmed');
        }
        throw new Error('Sign in failed');
      }

      // Even if sign in succeeds, we need to verify the email is confirmed
      const userData = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      if (attributes.email_verified !== 'true') {
        await signOut();
        throw new Error('User is not confirmed');
      }

      await checkSession();
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
        throw err;
      } else if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError('Failed to sign in');
        throw new Error('Failed to sign in');
      }
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      
      // Input validation
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError('Invalid email format');
        throw new Error('Invalid email format');
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        throw new Error('Password too short');
      }

      const trimmedName = name.trim();
      if (!trimmedName || !trimmedName.match(/^[A-Za-z\s-]+$/)) {
        setError('Name can only contain letters, spaces, and hyphens');
        throw new Error('Invalid name format');
      }

      const formattedName = trimmedName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      const { isSignUpComplete, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: formattedName
          }
        }
      });

      // Always return requiresVerification true after signup
      return { requiresVerification: true };
    } catch (err) {
      console.error('Registration error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to register');
      }
      throw err;
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      setError(null);
      await confirmSignUp({ username: email, confirmationCode: code });
    } catch (err) {
      console.error('Verification error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Failed to verify email');
      }
      throw err;
    }
  };

  const initiatePasswordReset = async (email: string) => {
    try {
      setError(null);
      await resetPassword({ username: email });
    } catch (err) {
      console.error('Password reset error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Failed to initiate password reset');
      }
      throw err;
    }
  };

  const confirmPasswordReset = async (email: string, code: string, newPassword: string) => {
    try {
      setError(null);
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
    } catch (err) {
      console.error('Password reset confirmation error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Failed to confirm password reset');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut({ global: true });
      setUser(null);
      // Force a session check after logout
      await checkSession();
    } catch (err) {
      console.error('Logout error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Failed to sign out');
      }
      throw err;
    }
  };

  // Don't render children until initial session check is complete
  if (!isSessionLoaded) {
    return null; // Or a loading spinner
  }

  const value = {
    user,
    login,
    register,
    logout,
    verifyEmail,
    resetPassword: initiatePasswordReset,
    confirmPasswordReset,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
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