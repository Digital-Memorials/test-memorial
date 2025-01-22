import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMemories, addMemory, deleteMemory, Memory } from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import './MemoryWall.css';

declare global {
  interface Document {
    webkitExitFullscreen: () => Promise<void>;
    mozCancelFullScreen: () => Promise<void>;
    msExitFullscreen: () => Promise<void>;
    webkitFullscreenElement: Element | null;
    mozFullScreenElement: Element | null;
    msFullscreenElement: Element | null;
  }

  interface HTMLElement {
    webkitRequestFullscreen: () => Promise<void>;
    mozRequestFullScreen: () => Promise<void>;
    msRequestFullscreen: () => Promise<void>;
  }
}

const MemoryWall: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const loadMemories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await retryOperation(async () => {
        const response = await getMemories();
        if (response?.data) {
          const sortedMemories = response.data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return sortedMemories;
        }
        throw new Error('No data received');
      }, 3);
      
      setMemories(result);
    } catch (err) {
      console.error('Error loading memories:', err);
      setError('Failed to load memories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedImage && event.key === 'Escape') {
        handleExitFullScreen();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleExitFullScreen();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [selectedImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    try {
      setIsLoading(true);
      setError(null);
      const memoryData = {
        userId: user.id,
        name: user.name || 'Anonymous',
        message: message.trim(),
        mediaType: mediaFile ? (mediaFile.type.startsWith('image/') ? 'image' : 'video') : null,
        mediaUrl: mediaFile ? URL.createObjectURL(mediaFile) : null,
        createdAt: new Date().toISOString()
      };
      await addMemory(memoryData);
      setMessage('');
      setMediaFile(null);
      setIsFormVisible(false);
      await loadMemories();
    } catch (err) {
      console.error('Error adding memory:', err);
      setError('Failed to add memory. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteMemory(id);
      await loadMemories();
    } catch (err) {
      console.error('Error deleting memory:', err);
      setError('Failed to delete memory. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const toggleForm = () => {
    if (!user) {
      return;
    }
    setIsFormVisible(!isFormVisible);
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'memory-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleFullScreen = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    document.body.style.overflow = 'hidden';
    const container = document.querySelector('.fullscreen-container');
    if (container && container.requestFullscreen) {
      container.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    }
  };

  const handleExitFullScreen = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
    
    if (document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  return (
    <div className="memory-wall-container">
      <div className="title-section">
        <h2 className="title">Memory Wall</h2>
        <div className="divider">
          <div className="divider-dot" />
          <div className="divider-dot" />
          <div className="divider-dot" />
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {isLoading && !memories.length ? (
        <div className="loading-message">Loading memories...</div>
      ) : (
        <div className="memories-grid">
          {memories.map((memory) => (
            <article key={memory.id} className="memory-card">
              {user && (user.id === memory.userId || user.isAdmin) && (
                <button
                  onClick={() => handleDelete(memory.id)}
                  className="delete-button"
                  title="Delete memory"
                  aria-label="Delete memory"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              )}
              {memory.mediaType === 'image' && memory.mediaUrl ? (
                <div className="media-container">
                  <div className="image-container">
                    <img 
                      src={memory.mediaUrl} 
                      alt="Memory" 
                      className="media" 
                      onClick={() => handleFullScreen(memory.mediaUrl!)}
                    />
                    <div className="image-controls">
                      <button
                        onClick={() => handleDownload(memory.mediaUrl!)}
                        className="image-control-button"
                        title="Download image"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleFullScreen(memory.mediaUrl!)}
                        className="image-control-button"
                        title="Full screen"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : memory.mediaType === 'video' && memory.mediaUrl ? (
                <div className="media-container">
                  <video src={memory.mediaUrl} controls className="video" />
                </div>
              ) : null}
              <div className="content-container">
                <div className="message-container">
                  <div className="message-content">
                    <blockquote className="message">{memory.message}</blockquote>
                  </div>
                </div>
                <div className="author-section">
                  <cite className="author-name">{memory.name}</cite>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="button-container">
        {user ? (
          <button onClick={toggleForm} className="upload-button">
            {isFormVisible ? 'Close Upload Form' : 'Upload a Memory'}
          </button>
        ) : (
          <Link to="/login" state={{ from: location }} className="sign-in-button">
            Sign In to Upload a Memory
          </Link>
        )}
      </div>

      <div className="form-container" style={{
        '--form-height': isFormVisible ? '1000px' : '0',
        '--form-opacity': isFormVisible ? '1' : '0',
        '--form-margin': isFormVisible ? '6rem' : '0',
        '--form-padding': isFormVisible ? '3rem' : '0'
      } as React.CSSProperties}>
        <form onSubmit={handleSubmit} className="memory-form">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your memory..."
            required
            className="memory-textarea"
          />
          <div className="form-actions">
            <div className="file-input-wrapper">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                required={false}
                className="hidden-file-input"
              />
              <label className="file-input-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {mediaFile ? (
                  <span className="file-name">{mediaFile.name}</span>
                ) : (
                  'Optional: Choose image or video'
                )}
              </label>
            </div>
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? 'Uploading...' : 'Share Memory'}
            </button>
          </div>
        </form>
      </div>

      <div className="fullscreen-image" style={{
        '--fullscreen-display': selectedImage ? 'flex' : 'none'
      } as React.CSSProperties} onClick={handleExitFullScreen}>
        {selectedImage && (
          <>
            <img 
              src={selectedImage} 
              alt="Memory" 
              onClick={(e) => e.stopPropagation()} 
            />
            <div className="image-controls">
              <button
                onClick={() => handleDownload(selectedImage)}
                className="image-control-button"
                title="Download image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button
                onClick={handleExitFullScreen}
                className="image-control-button"
                title="Exit full screen"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemoryWall; 