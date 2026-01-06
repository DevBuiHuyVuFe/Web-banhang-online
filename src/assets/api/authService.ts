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
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return null;
      }
      const user = JSON.parse(userStr);
      // Kiểm tra user có đủ thông tin cần thiết không
      if (!user || typeof user.id !== 'number') {
        console.error('Invalid user object in localStorage:', user);
        // Xóa user không hợp lệ
        localStorage.removeItem('user');
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  clearUser(): void {
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null } }));
  },

  isLoggedIn(): boolean {
    return !!this.getUser();
  },
}; 