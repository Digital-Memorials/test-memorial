import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addCondolence, getCondolences, deleteCondolence } from '../services/api';
import { Condolence } from '../types/index';
import { Link, useLocation } from 'react-router-dom';
import './Condolences.css';

const Condolences: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [condolences, setCondolences] = useState<Condolence[]>([]);
  const [newCondolence, setNewCondolence] = useState('');
  const [relation, setRelation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retryOperation = async (operation: () => Promise<any>, maxAttempts: number) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (err) {
        const isLastAttempt = attempt === maxAttempts - 1;
        if (isLastAttempt) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  };

  const loadCondolences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await retryOperation(async () => {
        const response = await getCondolences();
        if (response?.data) {
          const sortedCondolences = response.data.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return sortedCondolences;
        }
        throw new Error('No data received');
      }, 3);
      
      setCondolences(result);
    } catch (error) {
      console.error('Error loading condolences:', error);
      setError('Failed to load condolences. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCondolences();
  }, [loadCondolences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCondolence.trim() || !relation.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const condolenceData = {
        text: newCondolence.trim(),
        userId: user.id,
        userName: user.name || 'Anonymous',
        relation: relation.trim(),
        createdAt: new Date().toISOString()
      };

      await retryOperation(async () => {
        const response = await addCondolence(condolenceData);
        if (response?.data) {
          setCondolences(prev => [response.data, ...prev]);
          setNewCondolence('');
          setRelation('');
          await loadCondolences();
          return response.data;
        }
        throw new Error('No data received');
      }, 3);
    } catch (error) {
      console.error('Error adding condolence:', error);
      setError('Failed to add condolence. Please try again later.');
      await loadCondolences();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteCondolence(id);
      setCondolences(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting condolence:', error);
      setError('Failed to delete condolence. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="book-container">
      <div className="book-spine" />
      <div className="main-content">
        <div className="header">
          <h2 className="title">Book of Condolences</h2>
          <p className="subtitle">
            Share your condolences and messages of support in this
            digital book of remembrance.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {user ? (
          <div className="form-section">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="Friend, Family, Colleague..."
                  required
                  disabled={isLoading}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Your Message</label>
                <textarea
                  value={newCondolence}
                  onChange={(e) => setNewCondolence(e.target.value)}
                  placeholder="Share your condolences, memories, or words of comfort..."
                  required
                  disabled={isLoading}
                  className="textarea"
                />
              </div>
              <div className="button-container">
                <button type="submit" disabled={isLoading} className="button">
                  {isLoading ? 'Signing...' : 'Sign the Book'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="sign-in-prompt">
            <p className="prompt-text">
              Sign in to share your condolences and messages of support with the family.
            </p>
            <Link to="/login" state={{ from: location }} className="sign-in-button">
              Sign In to Share
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}

        {isLoading && !condolences.length ? (
          <div className="loading-message">Loading messages of condolence...</div>
        ) : (
          <div className="condolence-list">
            {condolences.map((condolence, index) => (
              <article key={condolence.id} className="condolence-card" style={{ '--index': index } as React.CSSProperties}>
                <div className="card-content">
                  <div className="quote-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <div className="condolence-message">
                    <blockquote className="message-text">{condolence.text}</blockquote>
                  </div>
                  <div className="card-footer">
                    <div className="author-details">
                      <cite className="author-name">{condolence.userName}</cite>
                      {condolence.relation && (
                        <p className="relation-text">{condolence.relation}</p>
                      )}
                    </div>
                    {user && (user.id === condolence.userId || user.isAdmin) && (
                      <button
                        onClick={() => handleDelete(condolence.id)}
                        className="card-delete-button"
                        title="Delete condolence"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="book-edge" />
    </div>
  );
};

export default Condolences; 