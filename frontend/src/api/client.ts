// Lightweight API client using fetch with JWT support
// Reads base URL from Vite env `VITE_API_BASE_URL` or defaults to localhost

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Base URL resolution:
// - Prefer VITE_API_BASE_URL when set
// - If running on Vercel without env, default to Render API
// - Otherwise default to local dev
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL
  || (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')
    ? 'https://ecap-project.onrender.com/api'
    : 'http://localhost:4000/api');

// Default network timeout to prevent infinite spinners when the backend is slow or unreachable
const DEFAULT_TIMEOUT_MS = Number((import.meta as any).env?.VITE_API_TIMEOUT_MS) || 15000;

function getToken(): string | null {
  try {
    return localStorage.getItem('jwt_token');
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string>, timeoutMs?: number } = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store',
    'Pragma': 'no-cache',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
  clearTimeout(timeout);

  const contentType = resp.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await resp.json() : await resp.text();

  if (!resp.ok) {
    const message = (isJson && data && (data.error || data.message)) || resp.statusText || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T = any>(path: string, body?: any) => apiFetch<T>(path, { method: 'POST', body }),
  put: <T = any>(path: string, body?: any) => apiFetch<T>(path, { method: 'PUT', body }),
  delete: <T = any>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};

export function setToken(token?: string) {
  if (!token) {
    localStorage.removeItem('jwt_token');
    return;
  }
  localStorage.setItem('jwt_token', token);
}

// Multipart/form-data upload helper that preserves Authorization but lets the browser set Content-Type
export async function apiUploadForm<T = any>(path: string, formData: FormData): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { 'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers, // no Content-Type so the browser sets the multipart boundary
    body: formData,
    cache: 'no-store',
  });

  const contentType = resp.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await resp.json() : await resp.text();

  if (!resp.ok) {
    const message = (isJson && data && (data.error || data.message)) || resp.statusText || 'Upload failed';
    throw new Error(message);
  }

  return data as T;
}