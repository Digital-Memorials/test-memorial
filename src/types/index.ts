export interface Condolence {
  id: string;
  userId: string;
  userName: string;
  text: string;
  relation: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  isAdmin: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  name: string;
}

export interface MemorialData {
  id: string;
  title: string;
  description: string;
  dateCreated: string;
  createdBy: string;
  // Add other necessary fields
} 