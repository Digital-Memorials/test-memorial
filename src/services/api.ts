import { get, post, del } from '@aws-amplify/api';
import { uploadData, remove, getUrl } from '@aws-amplify/storage';
import { Condolence } from '../types';

// Types
export interface Memory {
  id: string;
  userId: string;
  name: string;
  message: string;
  mediaType: string;
  mediaUrl: string;
}

// Memories API
export const getMemories = async (): Promise<{ data: Memory[] }> => {
  try {
    const response = await get({ apiName: 'memorialAPI', path: '/api/memories' }) as any;
    
    // Handle ReadableStream response
    if (response?.body && typeof response.body.json === 'function') {
      const jsonData = await response.body.json();
      const memories = Array.isArray(jsonData) ? jsonData : [];
      return { data: await addSignedUrls(memories) };
    }
    
    // Handle direct JSON response
    if (response?.body) {
      const memories = Array.isArray(response.body) ? response.body : [];
      return { data: await addSignedUrls(memories) };
    }

    // Handle raw response
    if (Array.isArray(response)) {
      return { data: await addSignedUrls(response) };
    }

    console.error('Invalid response format:', response);
    return { data: [] };
  } catch (error) {
    console.error('Error in getMemories:', error);
    return { data: [] };
  }
};

// Helper function to add signed URLs to memories
const addSignedUrls = async (memories: Memory[]): Promise<Memory[]> => {
  return Promise.all(
    memories.map(async (memory) => {
      if (memory.mediaType === 'image' && memory.mediaUrl) {
        try {
          const signedUrl = await getUrl({
            key: memory.mediaUrl,
            options: {
              expiresIn: 3600
            }
          });
          return { ...memory, mediaUrl: signedUrl.url.toString() };
        } catch (err) {
          console.error('Failed to get signed URL:', err);
          return memory;
        }
      }
      return memory;
    })
  );
};

export const addMemory = async (memory: Omit<Memory, 'id'>): Promise<{ data: Memory }> => {
  try {
    // If there's media, upload to S3 first
    if (memory.mediaType !== 'none' && memory.mediaUrl) {
      const file = await fetch(memory.mediaUrl).then(r => r.blob());
      const filename = `memories/${Date.now()}-${memory.userId}`;
      await uploadData({
        key: filename,
        data: file,
        options: {
          contentType: file.type
        }
      });
      memory.mediaUrl = filename;
    }

    const response = await post({
      apiName: 'memorialAPI',
      path: '/api/memories',
      options: {
        headers: {
          'Content-Type': 'application/json'
        },
        body: memory
      }
    }) as any;

    // Handle ReadableStream response
    if (response?.body && typeof response.body.json === 'function') {
      const jsonData = await response.body.json();
      return { data: await addSignedUrl(jsonData) };
    }

    // Handle direct JSON response
    if (response?.body) {
      return { data: await addSignedUrl(response.body) };
    }

    // Handle raw response
    if (response && typeof response === 'object') {
      return { data: await addSignedUrl(response) };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Memory upload error:', error);
    throw error;
  }
};

// Helper function to add signed URL to a single memory
const addSignedUrl = async (memory: Memory): Promise<Memory> => {
  if (memory.mediaType === 'image' && memory.mediaUrl) {
    try {
      const signedUrl = await getUrl({
        key: memory.mediaUrl,
        options: {
          expiresIn: 3600
        }
      });
      return { ...memory, mediaUrl: signedUrl.url.toString() };
    } catch (err) {
      console.error('Failed to get signed URL:', err);
    }
  }
  return memory;
};

export const deleteMemory = async (id: string): Promise<void> => {
  try {
    // Get the memory first to check if it has media to delete
    const response = await get({ 
      apiName: 'memorialAPI', 
      path: `/api/memories/${id}` 
    });

    let memory: Memory | null = null;
    if (typeof response === 'object' && response !== null) {
      memory = (response as any).body || (response as any).data || response;
    }

    if (memory && memory.mediaType !== 'none' && memory.mediaUrl) {
      await remove({ key: memory.mediaUrl });
    }

    await del({ apiName: 'memorialAPI', path: `/api/memories/${id}` });
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw new Error('Failed to delete memory');
  }
};

// Condolences API
export const getCondolences = async (): Promise<{ data: Condolence[] }> => {
  try {
    const response = await get({
      apiName: 'memorialAPI',
      path: '/api/condolences',
      options: {
        headers: {
          'Accept': 'application/json'
        }
      }
    }) as any;
    
    // Handle AWS API Gateway response
    if (response?.data) {
      return { data: Array.isArray(response.data) ? response.data : [] };
    }

    if (response?.body) {
      // If body is a ReadableStream
      if (typeof response.body.json === 'function') {
        const jsonData = await response.body.json();
        return { data: Array.isArray(jsonData) ? jsonData : [] };
      }
      // If body is already parsed
      return { data: Array.isArray(response.body) ? response.body : [] };
    }

    // Handle direct response
    if (Array.isArray(response)) {
      return { data: response };
    }

    console.error('Invalid response format:', response);
    return { data: [] };
  } catch (error) {
    console.error('Error in getCondolences:', error);
    return { data: [] };
  }
};

export const addCondolence = async (condolence: Omit<Condolence, 'id'>): Promise<{ data: Condolence }> => {
  try {
    const response = await post({
      apiName: 'memorialAPI',
      path: '/api/condolences',
      options: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: {
          userId: condolence.userId,
          userName: condolence.userName,
          text: condolence.text,
          createdAt: condolence.createdAt
        }
      }
    }) as any;

    // Handle AWS API Gateway response
    if (response?.data) {
      return { data: response.data };
    }

    if (response?.body) {
      // If body is a ReadableStream
      if (typeof response.body.json === 'function') {
        const jsonData = await response.body.json();
        return { data: jsonData };
      }
      // If body is already parsed
      return { data: response.body };
    }

    // Handle direct response
    if (response && typeof response === 'object') {
      return { data: response };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error in addCondolence:', error);
    throw error;
  }
};

export const deleteCondolence = async (id: string): Promise<void> => {
  try {
    await del({ apiName: 'memorialAPI', path: `/api/condolences/${id}` });
  } catch (error) {
    throw new Error('Failed to delete condolence');
  }
}; 