import React, { useState, useEffect } from 'react';
import { getCondolences, addCondolence, deleteCondolence } from '../services/api';
import { RequireAuth } from './auth/RequireAuth';
import { useAuth } from '../contexts/AuthContext';

function Condolences() {
  const { user } = useAuth();
  const [condolences, setCondolences] = useState([]);
  const [newCondolence, setNewCondolence] = useState({
    name: '',
    relation: '',
    message: '',
    userId: user?.id || 'guest'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCondolences();
  }, []);

  useEffect(() => {
    setNewCondolence(prev => ({
      ...prev,
      userId: user?.id || 'guest',
      name: user?.name || ''
    }));
  }, [user]);

  const fetchCondolences = async () => {
    try {
      const response = await getCondolences();
      setCondolences(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load condolences');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const condolenceToAdd = {
        ...newCondolence,
        userId: user?.id || 'guest',
        name: user?.name || newCondolence.name
      };

      const response = await addCondolence(condolenceToAdd);
      setCondolences([response.data, ...condolences]);
      setNewCondolence({
        name: user?.name || '',
        relation: '',
        message: '',
        userId: user?.id || 'guest'
      });
    } catch (err) {
      setError('Failed to add condolence');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, condolenceUserId) => {
    if (user?.id !== condolenceUserId) {
      setError('You can only delete your own condolences');
      return;
    }

    try {
      await deleteCondolence(id);
      setCondolences(condolences.filter(condolence => condolence.id !== id));
    } catch (err) {
      setError('Failed to delete condolence');
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!user?.name && (
          <div>
            <label htmlFor="name" className="block font-display text-lg text-charcoal-800 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={newCondolence.name}
              onChange={(e) => setNewCondolence({ ...newCondolence, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:border-sepia-400 focus:ring focus:ring-sepia-200 focus:ring-opacity-50 bg-cream-50/50"
              required
            />
          </div>
        )}
        <div>
          <label htmlFor="relation" className="block font-display text-lg text-charcoal-800 mb-2">
            Relationship
          </label>
          <input
            type="text"
            id="relation"
            value={newCondolence.relation}
            onChange={(e) => setNewCondolence({ ...newCondolence, relation: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:border-sepia-400 focus:ring focus:ring-sepia-200 focus:ring-opacity-50 bg-cream-50/50"
            placeholder="Friend, Family, Colleague..."
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block font-display text-lg text-charcoal-800 mb-2">
          Your Message
        </label>
        <textarea
          id="message"
          value={newCondolence.message}
          onChange={(e) => setNewCondolence({ ...newCondolence, message: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:border-sepia-400 focus:ring focus:ring-sepia-200 focus:ring-opacity-50 bg-cream-50/50 font-serif"
          placeholder="Share your condolences, memories, or words of comfort..."
          required
        />
      </div>

      <div className="text-center pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 px-8 py-3 bg-sepia-600 text-cream-50 rounded-full hover:bg-sepia-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Sign the Book</span>
          {!isSubmitting && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
          {isSubmitting && (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );

  if (isLoading) return (
    <div className="text-center py-12">
      <div className="inline-flex items-center space-x-2">
        <div className="w-3 h-3 bg-sepia-500 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-sepia-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-3 h-3 bg-sepia-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );

  return (
    <div className="flex max-w-[calc(100vw-2rem)] mx-auto">
      {/* Left book edge */}
      <div className="w-12 bg-sepia-200 relative">
        {/* Spine texture and shadow */}
        <div className="absolute inset-0 bg-gradient-to-r from-sepia-300/70 to-transparent"></div>
        <div className="absolute inset-0 bg-noise-pattern opacity-[0.2]"></div>
        {/* Spine edge shadow */}
        <div className="absolute right-0 inset-y-0 w-[2px] bg-sepia-400/40"></div>
        {/* Spine decorative lines */}
        <div className="absolute inset-x-0 top-8 h-[1px] bg-sepia-400/20"></div>
        <div className="absolute inset-x-0 bottom-8 h-[1px] bg-sepia-400/20"></div>
      </div>

      {/* Main content - white background only for the page area */}
      <div className="flex-1 bg-white relative min-w-0 shadow-2xl">
        <div className="px-8 py-12 md:p-16">
          {/* Enhanced page corner fold effect */}
          <div className="absolute top-0 right-0 w-16 h-16">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-charcoal-100/10 to-transparent transform -scale-x-100"></div>
            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-charcoal-100/20 to-transparent"></div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-8 text-center">
              <p className="text-red-500 font-serif italic">{error}</p>
            </div>
          )}

          {/* Header */}
          <header className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-charcoal-800 mb-6">
              Book of Condolences
            </h2>
            <div className="flex items-center justify-center space-x-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-sepia-300/50"></div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
            </div>
            <p className="mt-8 font-serif text-lg text-charcoal-600 max-w-2xl mx-auto">
              Share your condolences, memories, and messages of support for the family in this digital book of remembrance.
            </p>
          </header>

          {/* Form Section */}
          <div className="mt-16 mb-24">
            <RequireAuth>
              {renderForm()}
            </RequireAuth>
          </div>

          {/* Decorative divider */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sepia-200/30"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="px-4 bg-white">
                  <div className="w-2 h-2 rounded-full bg-sepia-200/50"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Condolences Display */}
          <div className="max-w-3xl mx-auto space-y-8">
            {condolences.map((condolence) => (
              <article 
                key={condolence.id}
                className="relative group bg-cream-50/30 rounded-lg p-6 transition-all duration-300"
              >
                {/* Quote Icon */}
                <div className="absolute -top-3 left-6 w-6 h-6 flex items-center justify-center rounded-full bg-sepia-100">
                  <svg className="w-3 h-3 text-sepia-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <blockquote className="font-serif text-lg text-charcoal-700 leading-relaxed pl-4">
                    {condolence.message}
                  </blockquote>

                  {/* Author Info */}
                  <footer className="flex items-center justify-between pt-4 border-t border-sepia-100">
                    <div>
                      <cite className="font-display text-lg text-charcoal-800 not-italic">
                        {condolence.name}
                      </cite>
                      {condolence.relation && (
                        <p className="text-sm text-sepia-600">
                          {condolence.relation}
                        </p>
                      )}
                    </div>
                    
                    {/* Delete button - only shown to owner */}
                    {user && user.id === condolence.userId && (
                      <button
                        onClick={() => handleDelete(condolence.id, condolence.userId)}
                        className="text-charcoal-400 hover:text-red-500 transition-colors duration-200"
                        title="Delete condolence"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </footer>
                </div>
              </article>
            ))}
          </div>

          {/* Decorative bottom flourish */}
          <div className="mt-16 flex items-center justify-center">
            <div className="relative w-24 h-px bg-sepia-200/30">
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3">
                <div className="w-full h-full border-b-2 border-r-2 border-sepia-200/30 transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced page shadow effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left shadow (book spine side) */}
          <div className="absolute inset-y-0 left-0 w-[6px]">
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/15 via-transparent to-transparent transform scale-x-[2]"></div>
          </div>
          {/* Right shadow (page edge side) */}
          <div className="absolute inset-y-0 right-0 w-[6px]">
            <div className="absolute inset-0 bg-gradient-to-l from-charcoal-900/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-charcoal-900/15 via-transparent to-transparent transform scale-x-[2]"></div>
          </div>
          {/* Bottom shadow */}
          <div className="absolute inset-x-0 bottom-0 h-[6px]">
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/15 via-transparent to-transparent transform scale-y-[2]"></div>
          </div>
          {/* Top shadow */}
          <div className="absolute inset-x-0 top-0 h-[6px]">
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/15 via-transparent to-transparent transform scale-y-[2]"></div>
          </div>
        </div>
      </div>

      {/* Right book edge */}
      <div className="w-12 bg-cream-100 relative overflow-hidden">
        {/* Vertical lines for page effect */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: `repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, transparent 2px)`,
          backgroundSize: '3px 100%'
        }}></div>
        
        {/* Horizontal page lines */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-full bg-sepia-200/30"
              style={{
                height: '1px',
                top: `${(i + 1) * 8}%`,
                transform: `translateX(${i * 0.3}px)`,
                boxShadow: '0 -1px 0 rgba(0,0,0,0.02)'
              }}
            ></div>
          ))}
        </div>

        {/* Page edge texture */}
        <div className="absolute inset-0 bg-gradient-to-l from-sepia-200/20 to-transparent"></div>
        <div className="absolute inset-0 bg-noise-pattern opacity-[0.15]"></div>
        
        {/* Edge shadow */}
        <div className="absolute left-0 inset-y-0 w-[2px] bg-sepia-400/40"></div>
      </div>
    </div>
  );
}

export default Condolences; 