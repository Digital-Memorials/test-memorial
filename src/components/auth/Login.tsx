import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from './LoginForm';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-warm from-cream-50 via-cream-100 to-sepia-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-elegant">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display text-charcoal-800">
            Sign in to your account
          </h2>
        </div>
        <LoginForm onSuccess={() => navigate(from, { replace: true })} />
        <div className="text-center">
          <p className="text-sm text-charcoal-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-sepia-600 hover:text-sepia-500"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 