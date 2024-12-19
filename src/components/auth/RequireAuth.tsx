import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-charcoal-600 mb-4">Please sign in to share your message</p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center space-x-2 px-6 py-2 bg-sepia-600 text-cream-50 rounded-lg hover:bg-sepia-700 transition-colors duration-300"
        >
          <span>Sign In</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    );
  }

  return <>{children}</>;
}; 