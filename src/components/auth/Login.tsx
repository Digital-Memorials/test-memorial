import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm from-cream-50 via-cream-100 to-sepia-50">
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 bg-noise-pattern opacity-[0.015] pointer-events-none"></div>

      <div className="max-w-md mx-auto px-4 py-24">
        {/* Back to Memorial Link */}
        <div className="mb-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 text-sepia-600 hover:text-sepia-700 transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            <span className="font-serif">Back to Memorial</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl text-charcoal-800 mb-4">Welcome Back</h2>
          <p className="font-serif text-charcoal-600">Sign in to share your memories and condolences</p>
          <div className="mt-6 flex items-center justify-center space-x-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-sepia-300/50"></div>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute -inset-1 bg-gradient-to-r from-sepia-200/20 via-cream-200/20 to-sepia-200/20 rounded-xl blur"></div>
          <div className="relative bg-cream-50/80 backdrop-blur-sm rounded-xl p-8 shadow-elegant">
            {error && (
              <div className="p-4 mb-6 text-red-800 bg-red-100/80 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-serif">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block font-display text-lg text-charcoal-800 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:border-sepia-400 focus:ring focus:ring-sepia-200 focus:ring-opacity-50 bg-cream-50/50 backdrop-blur-sm transition-colors duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-display text-lg text-charcoal-800 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:border-sepia-400 focus:ring focus:ring-sepia-200 focus:ring-opacity-50 bg-cream-50/50 backdrop-blur-sm transition-colors duration-200"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-8 py-4 bg-sepia-600 text-cream-50 rounded-lg hover:bg-sepia-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cream-50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cream-50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-cream-50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  ) : (
                    <span className="font-display tracking-wide">Sign In</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-charcoal-600 font-serif">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-sepia-600 hover:text-sepia-700 transition-colors duration-300 font-display"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 