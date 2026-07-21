import api, { getApiErrorMessage, saveSession, saveUser, clearSession, getStoredUser } from '@/lib/axios';
import { User } from '@/Type/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      const { data } = await api.post('/auth/login', payload);
      saveSession(data.accessToken, data.refreshToken);
      saveUser(data.user);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid email or password.'));
    }
  },

  async signup(payload: SignupPayload) {
    try {
      const { data } = await api.post('/auth/signup', payload);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not create your account.'));
    }
  },

  async verifyEmail(token: string) {
    try {
      const { data } = await api.post('/auth/verify-email', { token });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Verification link is invalid or has expired.'));
    }
  },

  async resendVerification(email: string) {
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  async forgotPassword(email: string) {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const { data } = await api.post('/auth/reset-password', { token, newPassword });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Reset link is invalid or has expired.'));
    }
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    try {
      const { data } = await api.patch('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout — clear local session regardless
    } finally {
      clearSession();
    }
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get('/auth/profile');
    return data.data;
  },

  getCachedUser(): User | null {
    return getStoredUser<User>();
  },
};
