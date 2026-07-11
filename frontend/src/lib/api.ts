const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

export async function apiFetchAll<T>(path: string, options?: RequestInit): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []) as T[];
  } catch {
    return [];
  }
}

export async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiPatch<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  return apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}
