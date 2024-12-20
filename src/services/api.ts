import { get, post, del } from '@aws-amplify/api';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Condolence } from '../types';

// Types
export interface Memory {
  id: string;
  userId: string;
  name: string;
  message: string;
  mediaType: string;
  mediaUrl: string;
  createdAt: string;
}

interface AmplifyResponse {
  response: Promise<{ body: string | object }>;
  body?: string | object;
}

interface MemoryResponse {
  success: boolean;
  data: Memory;
}

interface CondolenceResponse {
  success: boolean;
  data: Condolence;
}

// Type guard functions
const isMemory = (obj: any): obj is Memory => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.mediaType === 'string' &&
    typeof obj.mediaUrl === 'string' &&
    typeof obj.createdAt === 'string' &&
    new Date(obj.createdAt).toString() !== 'Invalid Date'
  );
};

const isCondolence = (obj: any): obj is Condolence => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.userName === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.relation === 'string' &&
    typeof obj.createdAt === 'string' &&
    new Date(obj.createdAt).toString() !== 'Invalid Date'
  );
};

// Memories API
export const getMemories = async (): Promise<{ data: Memory[] }> => {
  try {
    const response = await get({
      apiName: 'memorialAPI',
      path: '/api/memories',
      options: {
        headers: {
          'Accept': 'application/json'
        }
      }
    }) as AmplifyResponse;

    console.log('Raw memories response:', response);

    // Handle Amplify response format
    let jsonData: { success: boolean; data: any[] };
    
    if (response?.response instanceof Promise) {
      const resolvedResponse = await response.response;
      console.log('Resolved response:', resolvedResponse);
      if (resolvedResponse?.body) {
        if (resolvedResponse.body instanceof ReadableStream) {
          const reader = resolvedResponse.body.getReader();
          const chunks = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          
          const decoder = new TextDecoder();
          const text = chunks.map(chunk => decoder.decode(chunk)).join('');
          jsonData = JSON.parse(text);
        } else {
          jsonData = typeof resolvedResponse.body === 'string' 
            ? JSON.parse(resolvedResponse.body) 
            : resolvedResponse.body;
        }
      } else {
        throw new Error('No response body received');
      }
    } else if (response?.body) {
      jsonData = typeof response.body === 'string' 
        ? JSON.parse(response.body) 
        : response.body;
    } else {
      throw new Error('Invalid response format');
    }

    console.log('Parsed memories data:', jsonData);

    if (jsonData.success && Array.isArray(jsonData.data)) {
      return { data: jsonData.data.filter(isMemory) };
    }

    console.error('Invalid response format:', jsonData);
    return { data: [] };
  } catch (error) {
    console.error('Error in getMemories:', error);
    return { data: [] };
  }
};

export const addMemory = async (memory: Omit<Memory, 'id'>): Promise<{ data: Memory }> => {
  try {
    console.log('Sending memory data:', memory);

    // If there's media, upload to S3 first
    if (memory.mediaType !== 'none' && memory.mediaUrl) {
      try {
        // Check authentication before any S3 operations
        const authSession = await fetchAuthSession();
        if (!authSession.tokens) {
          throw new Error('Authentication required for media uploads');
        }
        
        const file = await fetch(memory.mediaUrl).then(r => r.blob());
        const filename = `public/memories/${Date.now()}-${memory.userId}${memory.mediaType === 'image' ? '.jpg' : '.mp4'}`;
        
        console.log('Starting S3 upload with filename:', filename);
        console.log('Auth session:', authSession.tokens ? 'Valid' : 'Invalid');

        try {
          const uploadResult = await uploadData({
            data: file,
            path: filename,
            options: {
              contentType: memory.mediaType === 'image' ? 'image/jpeg' : 'video/mp4'
            }
          }).result;

          console.log('Upload result:', uploadResult);

          if (uploadResult?.path) {
            const urlResult = await getUrl({
              key: uploadResult.path
            });
            const url = new URL(urlResult.url.toString());
            const cleanPath = url.pathname.replace(/\/public\/public\//, '/public/');
            memory.mediaUrl = `${url.origin}${cleanPath}`;
            console.log('Got clean URL:', memory.mediaUrl);
          } else {
            throw new Error('Upload failed - no key returned');
          }
        } catch (uploadError) {
          console.error('S3 upload error:', uploadError);
          throw new Error('Failed to upload to S3: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error'));
        }
      } catch (authError) {
        console.error('Auth error during upload:', authError);
        if (authError instanceof Error) {
          if (authError.message.includes('Authentication required')) {
            throw new Error('Please sign in to upload media');
          }
          throw new Error(`Failed to upload media: ${authError.message}`);
        }
        throw new Error('Failed to upload media');
      }
    }

    // Proceed with memory creation (works for both text-only and media memories)
    const response = await post({
      apiName: 'memorialAPI',
      path: '/api/memories',
      options: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: memory
      }
    }) as AmplifyResponse;

    console.log('Raw response:', response);

    // Handle Amplify response format
    let jsonData: MemoryResponse;
    
    if (response?.response instanceof Promise) {
      const resolvedResponse = await response.response;
      console.log('Resolved response:', resolvedResponse);
      if (resolvedResponse?.body) {
        if (resolvedResponse.body instanceof ReadableStream) {
          const reader = resolvedResponse.body.getReader();
          const chunks = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          
          const decoder = new TextDecoder();
          const text = chunks.map(chunk => decoder.decode(chunk)).join('');
          jsonData = JSON.parse(text);
        } else {
          jsonData = typeof resolvedResponse.body === 'string' 
            ? JSON.parse(resolvedResponse.body) 
            : resolvedResponse.body;
        }
      } else {
        throw new Error('No response body received');
      }
    } else if (response?.body) {
      jsonData = typeof response.body === 'string' 
        ? JSON.parse(response.body) 
        : response.body;
    } else {
      throw new Error('Invalid response format');
    }

    console.log('Parsed response data:', jsonData);

    if (jsonData.success && isMemory(jsonData.data)) {
      console.log('Valid memory');
      return { data: jsonData.data };
    }

    throw new Error('Invalid response format or missing required fields');
  } catch (error) {
    console.error('Error in addMemory:', error);
    throw error;
  }
};

export const deleteMemory = async (id: string): Promise<void> => {
  try {
    await del({ 
      apiName: 'memorialAPI', 
      path: `/api/memories/${id}` 
    });
  } catch (error) {
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
    }) as AmplifyResponse;

    console.log('Raw condolences response:', response);

    // Handle Amplify response format
    let jsonData: { success: boolean; data: any[] };
    
    if (response?.response instanceof Promise) {
      const resolvedResponse = await response.response;
      console.log('Resolved response:', resolvedResponse);
      if (resolvedResponse?.body) {
        if (resolvedResponse.body instanceof ReadableStream) {
          const reader = resolvedResponse.body.getReader();
          const chunks = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          
          const decoder = new TextDecoder();
          const text = chunks.map(chunk => decoder.decode(chunk)).join('');
          jsonData = JSON.parse(text);
        } else {
          jsonData = typeof resolvedResponse.body === 'string' 
            ? JSON.parse(resolvedResponse.body) 
            : resolvedResponse.body;
        }
      } else {
        throw new Error('No response body received');
      }
    } else if (response?.body) {
      jsonData = typeof response.body === 'string' 
        ? JSON.parse(response.body) 
        : response.body;
    } else {
      throw new Error('Invalid response format');
    }

    console.log('Parsed condolences data:', jsonData);

    if (jsonData.success && Array.isArray(jsonData.data)) {
      return { data: jsonData.data.filter(isCondolence) };
    }

    console.error('Invalid response format:', jsonData);
    return { data: [] };
  } catch (error) {
    console.error('Error in getCondolences:', error);
    return { data: [] };
  }
};

export const addCondolence = async (condolence: Omit<Condolence, 'id'>): Promise<{ data: Condolence }> => {
  try {
    console.log('Sending condolence data:', condolence);
    const response = await post({
      apiName: 'memorialAPI',
      path: '/api/condolences',
      options: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: condolence
      }
    }) as AmplifyResponse;

    console.log('Raw response:', response);

    // Handle Amplify response format
    let jsonData: CondolenceResponse;
    
    if (response?.response instanceof Promise) {
      const resolvedResponse = await response.response;
      console.log('Resolved response:', resolvedResponse);
      if (resolvedResponse?.body) {
        if (resolvedResponse.body instanceof ReadableStream) {
          const reader = resolvedResponse.body.getReader();
          const chunks = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          
          const decoder = new TextDecoder();
          const text = chunks.map(chunk => decoder.decode(chunk)).join('');
          jsonData = JSON.parse(text);
        } else {
          jsonData = typeof resolvedResponse.body === 'string' 
            ? JSON.parse(resolvedResponse.body) 
            : resolvedResponse.body;
        }
      } else {
        throw new Error('No response body received');
      }
    } else if (response?.body) {
      jsonData = typeof response.body === 'string' 
        ? JSON.parse(response.body) 
        : response.body;
    } else {
      throw new Error('Invalid response format');
    }

    console.log('Parsed response data:', jsonData);

    if (jsonData.success && isCondolence(jsonData.data)) {
      console.log('Valid condolence');
      return { data: jsonData.data };
    }

    throw new Error('Invalid response format or missing required fields');
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