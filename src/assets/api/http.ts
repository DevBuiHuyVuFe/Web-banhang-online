export const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) ;

function joinUrl(base: string, path: string) {
  if (!base.endsWith('/')) base += '/';
  if (path.startsWith('/')) path = path.slice(1);
  return base + path;
}

export async function httpGet<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const fullUrl = joinUrl(API_BASE_URL, path);
  const url = new URL(fullUrl);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
  }
  const res = await fetch(url.toString(), { credentials: 'include' });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export async function httpPost<T>(path: string, body?: any): Promise<T> {
  const fullUrl = joinUrl(API_BASE_URL, path);
  const url = new URL(fullUrl);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
} 