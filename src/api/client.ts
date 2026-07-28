/**
 * Клиент серверного API. Единственное место, где фронтенд ходит на бэкенд.
 * Сессия живёт в httpOnly-куке, поэтому во всех запросах credentials: 'include'.
 */
import type { Database, Level, SiteSettings, Topic, Track, User, VisitEvent } from '../types';

export interface Bootstrap extends Database {
  user: User | null;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: init?.body instanceof FormData ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    let message = `Ошибка ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* тело не JSON — оставляем код ошибки */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const json = (method: string, body?: unknown) => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  bootstrap: () => request<Bootstrap>('/api/bootstrap'),

  // ---------- аккаунт ----------
  login: (email: string, password: string) =>
    request<User>('/api/auth/login', json('POST', { email, password })),

  register: (email: string, password: string, name: string) =>
    request<User>('/api/auth/register', json('POST', { email, password, name })),

  logout: () => request<{ ok: true }>('/api/auth/logout', json('POST')),

  resendVerification: () =>
    request<{ ok: true; alreadyVerified?: boolean; verificationLink?: string }>(
      '/api/auth/resend-verification',
      json('POST'),
    ),

  forgotPassword: (email: string) =>
    request<{ ok: true; resetLink?: string }>('/api/auth/forgot', json('POST', { email })),

  resetPassword: (token: string, password: string) =>
    request<User>('/api/auth/reset', json('POST', { token, password })),

  /**
   * Оформление подписки. Если Stripe подключён, возвращает ссылку на платёжную
   * страницу; если нет — сервер включает подписку сразу (демо-режим).
   */
  checkout: (planId: string) =>
    request<{ url?: string; demo?: boolean; user?: User }>('/api/checkout', json('POST', { planId })),

  // ---------- контент (админка) ----------
  createTrack: (track: Omit<Track, 'id' | 'createdAt'>) =>
    request<Track>('/api/admin/tracks', json('POST', track)),

  saveTrack: (track: Track) =>
    request<Track>(`/api/admin/tracks/${track.id}`, json('PUT', track)),

  deleteTrack: (id: string) => request<{ ok: true }>(`/api/admin/tracks/${id}`, json('DELETE')),

  saveLevels: (levels: Level[]) => request<Level[]>('/api/admin/levels', json('PUT', levels)),

  saveTopics: (topics: Topic[]) => request<Topic[]>('/api/admin/topics', json('PUT', topics)),

  saveSettings: (settings: SiteSettings) =>
    request<SiteSettings>('/api/admin/settings', json('PUT', settings)),

  saveUser: (user: User) => request<User>(`/api/admin/users/${user.id}`, json('PUT', user)),

  deleteUser: (id: string) => request<{ ok: true }>(`/api/admin/users/${id}`, json('DELETE')),

  /** Загрузка файла (аудио или картинки) на сервер. Возвращает постоянную ссылку. */
  uploadFile: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ url: string; name: string; size: number }>('/api/admin/upload', {
      method: 'POST',
      body: form,
    });
  },

  // ---------- перенос и резервная копия ----------
  /** Скачивает выгрузку содержимого сайта файлом */
  exportContent: async () => {
    const res = await fetch('/api/admin/export', { credentials: 'include' });
    if (!res.ok) throw new Error(`Не удалось выгрузить содержимое (ошибка ${res.status})`);
    return res.blob();
  },

  /** Загружает выгрузку обратно. Возвращает, сколько чего получилось */
  importContent: (data: unknown) =>
    request<{ levels: number; topics: number; tracks: number }>(
      '/api/admin/import',
      json('POST', data),
    ),

  // ---------- статистика ----------
  trackEvent: (e: Omit<VisitEvent, 'id' | 'at'>) =>
    request<{ ok: true }>('/api/events', json('POST', e)),
};
