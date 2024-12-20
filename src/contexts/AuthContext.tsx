import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, fetchUserAttributes, confirmSignUp, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { AuthError } from 'aws-amplify/auth';
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

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const userData = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      setUser({
        id: userData.userId,
        name: attributes.name || 'Anonymous',
        email: attributes.email || '',
        emailVerified: attributes.email_verified === 'true'
      });
    } catch (err) {
      console.error('Error checking user:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { nextStep } = await signIn({ username: email, password });
      
      if (!nextStep) {
        throw new Error('No authentication step returned');
      }
      
      switch (nextStep.signInStep) {
        case 'DONE':
          await checkUser();
          break;
        case 'CONFIRM_SIGN_UP':
          setError('Please verify your email first');
          throw new Error('Email verification required');
        default:
          setError(`Authentication requires ${nextStep.signInStep}`);
          throw new Error(`Unexpected auth step: ${nextStep.signInStep}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Failed to sign in');
      }
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        throw new Error('Invalid email format');
      }
      
      // Validate password strength
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        throw new Error('Password too short');
      }
      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter');
        throw new Error('Password requires uppercase');
      }
      if (!/[a-z]/.test(password)) {
        setError('Password must contain at least one lowercase letter');
        throw new Error('Password requires lowercase');
      }
      if (!/[0-9]/.test(password)) {
        setError('Password must contain at least one number');
        throw new Error('Password requires number');
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        setError('Password must contain at least one special character');
        throw new Error('Password requires special character');
      }
      
      // Validate and format name field
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError('Name is required');
        throw new Error('Name is required');
      }
      
      // Ensure proper name format (at least one character, allow spaces and hyphens)
      const nameRegex = /^[A-Za-z\s-]+$/;
      if (!nameRegex.test(trimmedName)) {
        setError('Name can only contain letters, spaces, and hyphens');
        throw new Error('Invalid name format');
      }
      
      // Proper case handling (capitalize first letter of each word)
      const formattedName = trimmedName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: formattedName // Store properly formatted name
          },
          autoSignIn: true
        }
      });

      if (!nextStep) {
        throw new Error('No sign-up step returned');
      }

      switch (nextStep.signUpStep) {
        case 'CONFIRM_SIGN_UP':
          return { requiresVerification: true };
        case 'DONE':
          await login(email, password);
          return { requiresVerification: false };
        default:
          throw new Error(`Unexpected signup step: ${nextStep.signUpStep}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError(typeof err === 'string' ? err : 'Failed to register');
      }
      throw err;
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      setError(null);
      await confirmSignUp({ username: email, confirmationCode: code });
      // After verification, attempt to sign in if autoSignIn is enabled
      try {
        await checkUser();
      } catch (signInErr) {
        console.log('Auto sign-in after verification failed, manual login required');
      }
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