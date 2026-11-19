import type { ApiError } from '@/types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

export class ApiRequestError extends Error {
  status: number;
  errors?: ApiError['errors'];

  constructor(message: string, status: number, errors?: ApiError['errors']) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined | null>;
};

function buildUrl(path: string, params?: RequestOptions['params']) {
  const base = API_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const absoluteBase =
    base.startsWith('http://') || base.startsWith('https://')
      ? base
      : typeof window !== 'undefined'
        ? `${window.location.origin}${base.startsWith('/') ? base : `/${base}`}`
        : `http://localhost:3000${base.startsWith('/') ? base : `/${base}`}`;

  const url = new URL(`${absoluteBase}${normalizedPath}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;

  const res = await fetch(buildUrl(path, params), {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!res.ok) {
    const err = payload as ApiError;
    throw new ApiRequestError(err?.message || 'Request failed', res.status, err?.errors);
  }

  return payload as T;
}
