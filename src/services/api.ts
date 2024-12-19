import { get, post, del } from '@aws-amplify/api';
import { uploadData, remove, getUrl } from '@aws-amplify/storage';

// Types
export interface Memory {
  id: string;
  userId: string;
  name: string;
  message: string;
  mediaType: string;
  mediaUrl: string;
}

export interface Condolence {
  id: string;
  userId: string;
  name: string;
  relation: string;
  message: string;
}

// Memories API
export const getMemories = async (): Promise<{ data: Memory[] }> => {
  try {
    const response = await get({ apiName: 'memorialAPI', path: '/api/memories' });
    const memories = response as unknown as Memory[];
    
    // Get signed URLs for all media
    const memoriesWithUrls = await Promise.all(
      memories.map(async (memory) => {
        if (memory.mediaType === 'image' && memory.mediaUrl) {
          try {
            const signedUrl = await getUrl({
              key: memory.mediaUrl,
              options: {
                expiresIn: 3600 // URL expires in 1 hour
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
    
    return { data: memoriesWithUrls };
  } catch (error) {
    throw new Error('Failed to fetch memories');
  }
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
        body: memory
      }
    });
    
    const newMemory = response as unknown as Memory;
    
    // Get signed URL for the newly added memory
    if (newMemory.mediaType === 'image' && newMemory.mediaUrl) {
      const signedUrl = await getUrl({
        key: newMemory.mediaUrl,
        options: {
          expiresIn: 3600
        }
      });
      return { data: { ...newMemory, mediaUrl: signedUrl.url.toString() } };
    }
    
    return { data: newMemory };
  } catch (error) {
    console.error('Memory upload error:', error);
    throw new Error('Failed to add memory');
  }
};

export const deleteMemory = async (id: string): Promise<void> => {
  try {
    // Get the memory first to check if it has media to delete
    const memory = await get({ 
      apiName: 'memorialAPI', 
      path: `/api/memories/${id}` 
    }) as unknown as Memory;
    
    if (memory.mediaType !== 'none' && memory.mediaUrl) {
      await remove({ key: memory.mediaUrl });
    }

    await del({ apiName: 'memorialAPI', path: `/api/memories/${id}` });
  } catch (error) {
    throw new Error('Failed to delete memory');
  }
};

// Condolences API
export const getCondolences = async (): Promise<{ data: Condolence[] }> => {
  try {
    const response = await get({ apiName: 'memorialAPI', path: '/api/condolences' });
    return { data: response as unknown as Condolence[] };
  } catch (error) {
    throw new Error('Failed to fetch condolences');
  }
};

export const addCondolence = async (condolence: Omit<Condolence, 'id'>): Promise<{ data: Condolence }> => {
  try {
    const response = await post({
      apiName: 'memorialAPI',
      path: '/api/condolences',
      options: {
        body: condolence
      }
    });
    return { data: response as unknown as Condolence };
  } catch (error) {
    throw new Error('Failed to add condolence');
  }
};

export const deleteCondolence = async (id: string): Promise<void> => {
  try {
    await del({ apiName: 'memorialAPI', path: `/api/condolences/${id}` });
  } catch (error) {
    throw new Error('Failed to delete condolence');
  }
}; 