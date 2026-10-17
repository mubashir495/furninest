import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

const ACCESS_TOKEN_KEY = 'furninest_access_token';
const REFRESH_TOKEN_KEY = 'furninest_refresh_token';
const USER_KEY = 'furninest_user';

// ---------------- Session ----------------

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveSession(
  accessToken: string,
  refreshToken: string,
) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function saveUser(user: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T = unknown>(): T | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function clearSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function emitSessionExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('furninest:session-expired'),
    );
  }
}

// ---------------- Axios ----------------

const api = axios.create({
  baseURL: API_URL,
});

// ---------------- Request ----------------

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // IMPORTANT
    // Let browser automatically set multipart/form-data boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
);

// ---------------- Refresh Token ----------------

let isRefreshing = false;

let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((promise) => {
    if (token) promise.resolve(token);
    else promise.reject(error);
  });

  pendingQueue = [];
}

// ---------------- Response ----------------

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/signup') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      isAuthRoute
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearSession();
      emitSessionExpired();
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearSession();
      emitSessionExpired();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_URL}/auth/refresh`,
        {
          refreshToken,
        },
      );

      saveSession(data.accessToken, data.refreshToken);

      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);

      clearSession();
      emitSessionExpired();

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

// ---------------- Error Helper ----------------

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string | string[];
        }
      | undefined;

    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }

    if (typeof data?.message === 'string') {
      return data.message;
    }

    if (error.message === 'Network Error') {
      return 'Cannot connect to server.';
    }
  }

  return fallback;
}

export default api;