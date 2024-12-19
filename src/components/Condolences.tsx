import React, { useState, useEffect } from 'react';
import { getCondolences, addCondolence, deleteCondolence, Condolence } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CondolenceFormData {
  name: string;
  relation: string;
  message: string;
}

function Condolences() {
  const [condolences, setCondolences] = useState<Condolence[]>([]);
  const [formData, setFormData] = useState<CondolenceFormData>({
    name: '',
    relation: '',
    message: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCondolences();
  }, []);

  const fetchCondolences = async () => {
    try {
      const response = await getCondolences();
      setCondolences(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching condolences:', err);
      setError('Failed to fetch condolences');
      setCondolences([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to add a condolence');
      }

      const condolenceData = {
        ...formData,
        name: user.name,
        userId: user.id,
      };

      await addCondolence(condolenceData);
      await fetchCondolences();
      setFormData({
        name: '',
        relation: '',
        message: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add condolence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCondolence(id);
      await fetchCondolences();
    } catch (err) {
      setError('Failed to delete condolence');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-display text-center mb-4">Book of Condolences</h2>
      <p className="text-center text-gray-600 mb-8">
        Share your condolences, memories, and messages of support for the family in this
        digital book of remembrance.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
          <div>
            <label className="block text-gray-700 mb-2">
              Relationship
              <input
                type="text"
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="Friend, Family, Colleague..."
                required
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              Your Message
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                rows={6}
                placeholder="Share your condolences, memories, or words of comfort..."
                required
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8B6B4D] text-white py-3 px-6 rounded hover:bg-[#75593F] transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : (
              <span className="flex items-center">
                Sign the Book
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/login')}
            className="bg-[#8B6B4D] text-white py-3 px-6 rounded hover:bg-[#75593F] transition-colors inline-flex items-center"
          >
            Sign in to Share a Condolence
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

      <div className="space-y-8">
        {condolences.map((condolence) => (
          <div key={condolence.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 text-[#8B6B4D] text-4xl font-serif">"</div>
              <p className="text-gray-700 italic mb-4">{condolence.message}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{condolence.name}</p>
                  <p className="text-sm text-gray-600">{condolence.relation}</p>
                </div>
                {user && user.id === condolence.userId && (
                  <button
                    onClick={() => handleDelete(condolence.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Condolences; 