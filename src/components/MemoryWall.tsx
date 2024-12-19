import React, { useState, useEffect } from 'react';
import { getMemories, addMemory, deleteMemory, Memory } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await getMemories();
      setMemories(response.data);
    } catch (err) {
      setError('Failed to fetch memories');
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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Memory Wall</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Message
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isLoading ? 'Adding...' : 'Add Memory'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memories.map((memory) => (
          <div key={memory.id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{memory.name}</h3>
            <p className="mt-2">{memory.message}</p>
            {memory.mediaType === 'image' && memory.mediaUrl && (
              <img src={memory.mediaUrl} alt="Memory" className="mt-2 max-w-full h-auto" />
            )}
            {user && user.id === memory.userId && (
              <button
                onClick={() => handleDelete(memory.id)}
                className="mt-2 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemoryWall; 