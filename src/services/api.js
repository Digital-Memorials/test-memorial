import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

export const getMemories = () => api.get('/memories');
export const addMemory = (memory) => api.post('/memories', memory);
export const deleteMemory = (id) => api.delete(`/memories/${id}`);

export const getCondolences = () => api.get('/condolences');
export const addCondolence = (condolence) => api.post('/condolences', condolence);
export const deleteCondolence = (id) => api.delete(`/condolences/${id}`);

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/users?email=${credentials.email}`);
    const users = await response.json();
    
    const user = users[0];
    if (user && user.password === credentials.password) { // Note: This is just for local testing
      const { password, ...userWithoutPassword } = user;
      return { data: userWithoutPassword };
    }
    throw new Error('Invalid credentials');
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const registerUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUsers = await fetch(`${API_URL}/users?email=${userData.email}`);
    const users = await existingUsers.json();
    
    if (users.length > 0) {
      throw new Error('User already exists');
    }

    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const newUser = await response.json();
    const { password, ...userWithoutPassword } = newUser;
    return { data: userWithoutPassword };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

export default api; 