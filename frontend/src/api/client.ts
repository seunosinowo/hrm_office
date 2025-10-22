// Lightweight API client using fetch with JWT support
// Reads base URL from Vite env `VITE_API_BASE_URL` or defaults to localhost

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  try {
    return localStorage.getItem('jwt_token');
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string> } = {}): Promise<T> {
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

  const resp = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

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