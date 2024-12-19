import React, { useState, useEffect } from 'react';
import { getCondolences, addCondolence, deleteCondolence, Condolence } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    fetchCondolences();
  }, []);

  const fetchCondolences = async () => {
    try {
      const response = await getCondolences();
      setCondolences(response.data);
    } catch (err) {
      setError('Failed to fetch condolences');
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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Condolences</h2>
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
              Relation
              <input
                type="text"
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
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
            {isLoading ? 'Adding...' : 'Add Condolence'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {condolences.map((condolence) => (
          <div key={condolence.id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{condolence.name}</h3>
            <p className="text-gray-600">{condolence.relation}</p>
            <p className="mt-2">{condolence.message}</p>
            {user && user.id === condolence.userId && (
              <button
                onClick={() => handleDelete(condolence.id)}
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

export default Condolences; 