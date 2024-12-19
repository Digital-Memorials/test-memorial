import React, { useState, useEffect } from 'react';
import { getMemories, addMemory, deleteMemory, Memory } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface MemoryFormData {
  name: string;
  message: string;
  mediaType: string;
  mediaUrl: string;
}

function MemoryWall() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [formData, setFormData] = useState<MemoryFormData>({
    name: '',
    message: '',
    mediaType: 'none',
    mediaUrl: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await getMemories();
      setMemories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching memories:', err);
      setError('Failed to fetch memories');
      setMemories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to add a memory');
      }

      const memoryData = {
        ...formData,
        name: user.name || 'Anonymous',
        userId: user.id,
      };

      await addMemory(memoryData);
      await fetchMemories();
      setFormData({
        name: '',
        message: '',
        mediaType: 'none',
        mediaUrl: '',
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add memory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMemory(id);
      await fetchMemories();
    } catch (err) {
      setError('Failed to delete memory');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display mb-4">Memory Wall</h2>
        <p className="text-gray-600">
          Share your cherished memories and stories about John
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {user ? (
        <div className="mb-12 text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#8B6B4D] text-white py-3 px-6 rounded hover:bg-[#75593F] transition-colors inline-flex items-center"
          >
            {showForm ? 'Hide Form' : 'Post Memory'}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/login')}
            className="bg-[#8B6B4D] text-white py-3 px-6 rounded hover:bg-[#75593F] transition-colors inline-flex items-center"
          >
            Sign in to Share a Memory
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

      {showForm && user && (
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-lg p-8">
            <div>
              <label className="block text-gray-700 mb-2">
                Add Media (Optional)
                <select
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                >
                  <option value="none">No Media</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </label>
              {formData.mediaType !== 'none' && (
                <input
                  type="text"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-2"
                  placeholder="Enter media URL..."
                />
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Your Memory
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  rows={4}
                  placeholder="Share your cherished memories and stories..."
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
                'Post Memory'
              )}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {memories.map((memory) => (
          <div key={memory.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {memory.mediaType === 'image' && memory.mediaUrl && (
              <div className="aspect-w-4 aspect-h-3">
                <img src={memory.mediaUrl} alt="Memory" className="w-full h-full object-cover" />
              </div>
            )}
            {memory.mediaType === 'video' && memory.mediaUrl && (
              <div className="aspect-w-16 aspect-h-9">
                <video src={memory.mediaUrl} controls className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <p className="text-gray-700 mb-4">{memory.message}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{memory.name}</p>
                </div>
                {user && user.id === memory.userId && (
                  <button
                    onClick={() => handleDelete(memory.id)}
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

export default MemoryWall; 