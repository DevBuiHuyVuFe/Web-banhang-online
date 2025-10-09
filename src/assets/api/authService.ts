import { httpPost } from './http';
import type { User } from './types';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  message: string;
}

export const AuthService = {
  async login(data: LoginData): Promise<AuthResponse> {
    return httpPost<AuthResponse>('/auth/login', data);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return httpPost<AuthResponse>('/auth/register', data);
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  clearUser(): void {
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null } }));
  },

  isLoggedIn(): boolean {
    return !!this.getUser();
  },
}; 