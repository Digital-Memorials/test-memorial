import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMemories, addMemory, Memory } from '../services/api';
import '../styles/MemoryWall.css';

const MemoryWall: React.FC = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const response = await getMemories();
      setMemories(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load memories');
      console.error('Error loading memories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const memoryData: Omit<Memory, 'id'> = {
        userId: user.id,
        name: user.name || 'Anonymous',
        message: message.trim(),
        mediaType: mediaFile ? (mediaFile.type.startsWith('image/') ? 'image' : 'video') : 'none',
        mediaUrl: mediaFile ? URL.createObjectURL(mediaFile) : '',
        createdAt: new Date().toISOString()
      };

      const newMemory = await addMemory(memoryData);

      if (newMemory) {
        setMemories(prev => [newMemory.data, ...prev]);
        setMessage('');
        setMediaFile(null);
      } else {
        setError('Failed to add memory');
      }
    } catch (err) {
      setError('Error adding memory');
      console.error('Error adding memory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setMediaFile(file);
        setError(null);
      } else {
        setError('Please select an image or video file');
        setMediaFile(null);
      }
    }
  };

  return (
    <div className="memory-wall">
      <h2>Memory Wall</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {user && (
        <form onSubmit={handleSubmit} className="memory-form">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your memory..."
            required
          />
          <div className="form-actions">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Posting...' : 'Share Memory'}
            </button>
          </div>
        </form>
      )}

      <div className="memories-grid">
        {memories.map((memory) => (
          <div key={memory.id} className="memory-card">
            <div className="memory-header">
              <span className="memory-author">{memory.name}</span>
              <span className="memory-date">
                {new Date(memory.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="memory-message">{memory.message}</p>
            {memory.mediaType === 'image' && (
              <img src={memory.mediaUrl} alt="Memory" className="memory-media" />
            )}
            {memory.mediaType === 'video' && (
              <video src={memory.mediaUrl} controls className="memory-media" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryWall; 