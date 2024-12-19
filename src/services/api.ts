import { get, post, del } from '@aws-amplify/api';
import { uploadData, remove } from '@aws-amplify/storage';

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
    return { data: response as unknown as Memory[] };
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
      const uploadResult = await uploadData({
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
    return { data: response as unknown as Memory };
  } catch (error) {
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