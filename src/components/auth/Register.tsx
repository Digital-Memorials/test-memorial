import React from 'react';
import { RegisterForm } from './RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-warm from-cream-50 via-cream-100 to-sepia-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-elegant">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display text-charcoal-800">
            Create an Account
          </h2>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register; 