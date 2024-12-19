import React, { useState, useEffect } from 'react';
import { getUrl } from '@aws-amplify/storage';
import { getMemories, addMemory, deleteMemory } from '../services/api';
import { RequireAuth } from './auth/RequireAuth';
import { useAuth } from '../contexts/AuthContext';

function MemoryWall() {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newMemory, setNewMemory] = useState({
    name: '',
    message: '',
    mediaType: 'none',
    mediaUrl: '',
    userId: user?.id || 'guest'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchMemories();
  }, []);

  useEffect(() => {
    setNewMemory(prev => ({
      ...prev,
      userId: user?.id || 'guest',
      name: user?.name || ''
    }));
  }, [user]);

  const fetchMemories = async () => {
    try {
      const response = await getMemories();
      // Get signed URLs for all media
      const memoriesWithUrls = await Promise.all(
        response.data.map(async (memory) => {
          if (memory.mediaType === 'image' && memory.mediaUrl) {
            try {
              const signedUrl = await Storage.get(memory.mediaUrl, { 
                expires: 3600 // URL expires in 1 hour
              });
              return { ...memory, mediaUrl: signedUrl };
            } catch (err) {
              console.error('Failed to get signed URL:', err);
              return memory;
            }
          }
          return memory;
        })
      );
      setMemories(memoriesWithUrls);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load memories');
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Update form state
      setNewMemory(prev => ({
        ...prev,
        mediaType: file.type.startsWith('image/') ? 'image' : 'video',
        mediaUrl: URL.createObjectURL(file)
      }));
    } catch (err) {
      setError('Failed to process file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUploadProgress(0);

    try {
      const memoryToAdd = {
        ...newMemory,
        userId: user?.id || 'guest',
        name: user?.name || newMemory.name
      };
      
      const response = await addMemory(memoryToAdd);
      
      // Get the signed URL for the newly added memory if it has media
      let newMemoryWithUrl = response.data;
      if (newMemoryWithUrl.mediaType === 'image' && newMemoryWithUrl.mediaUrl) {
        const signedUrl = await Storage.get(newMemoryWithUrl.mediaUrl);
        newMemoryWithUrl = { ...newMemoryWithUrl, mediaUrl: signedUrl };
      }

      setMemories([newMemoryWithUrl, ...memories]);
      setNewMemory({
        name: user?.name || '',
        message: '',
        mediaType: 'none',
        mediaUrl: '',
        userId: user?.id || 'guest'
      });
      setShowForm(false);
      setUploadProgress(0);
    } catch (err) {
      setError('Failed to add memory');
    }
  };

  const handleDelete = async (id, memoryUserId) => {
    if (user?.id !== memoryUserId) {
      setError('You can only delete your own memories');
      return;
    }

    try {
      await deleteMemory(id);
      setMemories(memories.filter(memory => memory.id !== id));
    } catch (err) {
      setError('Failed to delete memory');
    }
  };

  const renderMedia = (memory) => {
    if (!memory.mediaUrl || memory.mediaType === 'none') return null;

    if (memory.mediaType === 'image') {
      return (
        <div className="relative">
          <img
            src={memory.mediaUrl}
            alt="Memory"
            className="w-full h-56 object-cover rounded-lg mb-6"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'placeholder-image.jpg'; // Add a placeholder image
            }}
          />
        </div>
      );
    }

    if (memory.mediaType === 'video') {
      return (
        <div className="relative">
          <video
            src={memory.mediaUrl}
            controls
            className="w-full h-56 object-cover rounded-lg mb-6"
            onError={(e) => {
              e.target.onerror = null;
              // Handle video error
            }}
          />
        </div>
      );
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-xl bg-cream-50/60 backdrop-blur-sm border border-sepia-200/30">
      {!user?.name && (
        <div>
          <label htmlFor="name" className="block font-display text-lg text-charcoal-800 mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={newMemory.name}
            onChange={(e) => setNewMemory({ ...newMemory, name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:border-sepia-400 focus:ring focus:ring-sepia-200 focus:ring-opacity-50 bg-cream-50/50 backdrop-blur-sm transition-colors duration-200"
            required
          />
        </div>
      )}
      
      <div>
        <label htmlFor="media" className="block font-display text-lg text-charcoal-800 mb-2">
          Add Media (Optional)
        </label>
        <input
          type="file"
          id="media"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:border-sepia-400 focus:ring focus:ring-sepia-200 focus:ring-opacity-50 bg-cream-50/50 backdrop-blur-sm transition-colors duration-200"
        />
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-2">
            <div className="h-2 bg-sepia-100 rounded-full">
              <div 
                className="h-full bg-sepia-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="message" className="block font-display text-lg text-charcoal-800 mb-2">
          Your Memory
        </label>
        <textarea
          id="message"
          value={newMemory.message}
          onChange={(e) => setNewMemory({ ...newMemory, message: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:border-sepia-400 focus:ring focus:ring-sepia-200 focus:ring-opacity-50 bg-cream-50/50 backdrop-blur-sm transition-colors duration-200"
          required
        />
      </div>

      <div className="text-center pt-4">
        <button
          type="submit"
          disabled={uploadProgress > 0 && uploadProgress < 100}
          className="inline-flex items-center space-x-2 px-8 py-3 bg-sepia-600 text-cream-50 rounded-full hover:bg-sepia-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Post Memory</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
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

  if (error) return (
    <div className="text-red-500 text-center py-12 font-serif italic">
      {error}
    </div>
  );

  return (
    <section className="max-w-6xl mx-auto px-4">
      {/* Section Header */}
      <div className="mb-16 text-center">
        <h2 className="font-display text-5xl text-charcoal-800 mb-6">Memory Wall</h2>
        <div className="flex items-center justify-center space-x-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-sepia-300/50"></div>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
        </div>
      </div>

      {error && (
        <div className="mb-8 text-center">
          <p className="text-red-500 font-serif italic">{error}</p>
        </div>
      )}

      {/* Memory Wall Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {memories.map((memory, index) => (
          <div 
            key={memory.id}
            className="transform hover:-translate-y-1 transition-all duration-700 opacity-0 animate-fade-in"
            style={{
              animationDelay: `${index * 200}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <div className="bg-cream-50/20 backdrop-blur-sm rounded-xl p-6 border border-sepia-200/10 shadow-elegant hover:shadow-elegant-lg h-full flex flex-col">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden opacity-30">
                <div className="absolute top-0 right-0 w-[1px] h-8 bg-gradient-to-b from-sepia-200/30 to-transparent transform rotate-45 translate-x-4"></div>
              </div>
              
              {/* Media content if present */}
              <div className="flex-grow">
                {renderMedia(memory)}
              </div>

              {/* Main content */}
              <div className="mt-auto">
                <div className="prose prose-sepia">
                  <blockquote className="text-charcoal-600 italic mb-4">"{memory.message}"</blockquote>
                </div>

                {/* Meta information */}
                <div className="flex items-center justify-between text-sm text-charcoal-500 mt-4 pt-4 border-t border-sepia-200/20">
                  <div>
                    <span className="font-semibold text-sepia-700">{memory.name}</span>
                  </div>
                  {user && user.id === memory.userId && (
                    <button
                      onClick={() => handleDelete(memory.id, memory.userId)}
                      className="text-charcoal-400 hover:text-red-500 transition-colors duration-200"
                      title="Delete memory"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Memory Button */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-3 px-8 py-4 border-2 border-sepia-200 rounded-full text-sepia-700 hover:bg-sepia-50 transition-all duration-300 transform hover:scale-105"
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-display text-lg">
            {showForm ? 'Hide Form' : 'Share a Memory'}
          </span>
        </button>
      </div>

      {/* Collapsible Form */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <RequireAuth>
          {renderForm()}
        </RequireAuth>
      </div>
    </section>
  );
}

export default MemoryWall; 