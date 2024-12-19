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
    
    // Handle different possible response formats
    let memories: Memory[];
    
    if (typeof response === 'object' && response !== null) {
      // Try to extract the memories data from different possible locations
      memories = (response as any).body || // AWS API Gateway format
                (response as any).data ||   // Standard REST format
                response;                   // Direct response
      
      // Ensure we have an array
      if (!Array.isArray(memories)) {
        console.error('Response is not an array:', memories);
        return { data: [] };
      }
      
      // Validate each memory
      memories = memories.filter(memory => 
        memory &&
        typeof memory === 'object' &&
        'id' in memory &&
        'userId' in memory &&
        'message' in memory
      );

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
    } else {
      console.error('Invalid response:', response);
      return { data: [] };
    }
  } catch (error) {
    console.error('Error in getMemories:', error);
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
    
    // Handle different possible response formats
    let newMemory: Memory;
    
    if (typeof response === 'object' && response !== null) {
      // Try to extract the memory data from different possible locations
      newMemory = (response as any).body || // AWS API Gateway format
                 (response as any).data ||   // Standard REST format
                 response;                   // Direct response
      
      // Validate the memory data
      if (!newMemory.id || !newMemory.userId || !newMemory.message) {
        console.error('Invalid memory data:', newMemory);
        throw new Error('Invalid response format');
      }

      // Get signed URL if it's an image
      if (newMemory.mediaType === 'image' && newMemory.mediaUrl) {
        try {
          const signedUrl = await getUrl({
            key: newMemory.mediaUrl,
            options: {
              expiresIn: 3600
            }
          });
          newMemory = { ...newMemory, mediaUrl: signedUrl.url.toString() };
        } catch (err) {
          console.error('Failed to get signed URL:', err);
        }
      }
    } else {
      console.error('Invalid response:', response);
      throw new Error('Invalid response format');
    }

    return { data: newMemory };
  } catch (error) {
    console.error('Memory upload error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to add memory');
  }
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
    const response = await get({ apiName: 'memorialAPI', path: '/api/condolences' });
    
    // Handle different possible response formats
    let condolences: Condolence[];
    
    if (typeof response === 'object' && response !== null) {
      // Try to extract the condolences data from different possible locations
      condolences = (response as any).body || // AWS API Gateway format
                   (response as any).data ||   // Standard REST format
                   response;                   // Direct response
      
      // Ensure we have an array
      if (!Array.isArray(condolences)) {
        console.error('Response is not an array:', condolences);
        return { data: [] };
      }
      
      // Validate each condolence
      condolences = condolences.filter(condolence => 
        condolence &&
        typeof condolence === 'object' &&
        'id' in condolence &&
        'userId' in condolence &&
        'message' in condolence
      );
    } else {
      console.error('Invalid response:', response);
      return { data: [] };
    }

    return { data: condolences };
  } catch (error) {
    console.error('Error in getCondolences:', error);
    throw new Error('Failed to fetch condolences');
  }
};

export const addCondolence = async (condolence: Omit<Condolence, 'id'>): Promise<{ data: Condolence }> => {
  try {
    const response = await post({
      apiName: 'memorialAPI',
      path: '/api/condolences',
      options: {
        headers: {
          'Content-Type': 'application/json'
        },
        body: condolence
      }
    }) as any; // Type assertion for AWS API Gateway response

    if (response && typeof response === 'object') {
      const newCondolence = response.body || response;
      
      if (newCondolence && typeof newCondolence === 'object') {
        return { data: newCondolence as Condolence };
      }
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