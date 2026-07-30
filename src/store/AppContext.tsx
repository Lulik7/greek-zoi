import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../api/client';
import type { Database, Level, SiteSettings, Topic, Track, User, VisitEvent } from '../types';

interface AppContextValue {
  db: Database | null;
  loading: boolean;
  /** Ошибка соединения с сервером — например, бэкенд не запущен */
  connectionError: string;
  user: User | null;
  isAdmin: boolean;
  /** Настоящая подписка — для отображения статуса в кабинете и шапке */
  hasSubscription: boolean;
  /**
   * Открыт ли платный материал. У администратора открыт всегда: он ведёт
   * каталог, и требовать с него подписку бессмысленно. Сервер считает так же
   * (см. hasAccess в server/index.js).
   */
  hasAccess: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  /** Возвращает ссылку подтверждения, если письма не настроены (дев-режим) */
  register: (email: string, password: string, name: string) => Promise<string | undefined>;
  logout: () => Promise<void>;
  /** Ведёт на платёжную страницу Stripe */
  checkout: (planId: string) => Promise<void>;
  resendVerification: () => Promise<string | undefined>;
  saveTrack: (t: Track) => Promise<void>;
  createTrack: (t: Omit<Track, 'id' | 'createdAt'>) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  saveLevels: (l: Level[]) => Promise<void>;
  saveTopics: (t: Topic[]) => Promise<void>;
  saveSettings: (s: SiteSettings) => Promise<void>;
  saveUser: (u: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  /** Загружает файл на сервер и возвращает постоянную ссылку */
  uploadFile: (file: File) => Promise<string>;
  logEvent: (e: Omit<VisitEvent, 'id' | 'at'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const { user: current, ...data } = await api.bootstrap();
      setDb(data);
      setUser(current);
      setConnectionError('');
    } catch (e) {
      setConnectionError(
        e instanceof Error && e.message.includes('Failed to fetch')
          ? 'Не удалось связаться с сервером. Запустите его командой npm run dev (или npm run server).'
          : e instanceof Error
            ? e.message
            : 'Неизвестная ошибка',
      );
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const wrap = useCallback(
    <A extends unknown[]>(fn: (...args: A) => Promise<unknown>) =>
      async (...args: A) => {
        await fn(...args);
        await refresh();
      },
    [refresh],
  );

  const value = useMemo<AppContextValue>(() => {
    const sub = user?.subscription;
    const active = !!sub?.active && (!sub.until || new Date(sub.until).getTime() > Date.now());
    const admin = user?.role === 'admin';

    return {
      db,
      loading,
      connectionError,
      user,
      isAdmin: admin,
      hasSubscription: active,
      hasAccess: active || admin,
      refresh,
      login: wrap(api.login),
      register: async (email, password, name) => {
        const created = await api.register(email, password, name);
        await refresh();
        return created.verificationLink;
      },
      logout: wrap(api.logout),
      checkout: async (planId) => {
        const result = await api.checkout(planId);
        if (result.url) {
          // уходим на платёжную страницу Stripe
          window.location.assign(result.url);
          return;
        }
        await refresh();
      },
      resendVerification: async () => {
        const res = await api.resendVerification();
        await refresh();
        return res.verificationLink;
      },
      saveTrack: wrap(api.saveTrack),
      createTrack: wrap(api.createTrack),
      deleteTrack: wrap(api.deleteTrack),
      saveLevels: wrap(api.saveLevels),
      saveTopics: wrap(api.saveTopics),
      saveSettings: wrap(api.saveSettings),
      saveUser: wrap(api.saveUser),
      deleteUser: wrap(api.deleteUser),
      uploadFile: async (file: File) => (await api.uploadFile(file)).url,
      logEvent: (e) => {
        // статистика не должна ломать страницу, если сервер недоступен
        void api.trackEvent(e).catch(() => {});
      },
    };
  }, [db, loading, connectionError, user, refresh, wrap]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp должен использоваться внутри <AppProvider>');
  return ctx;
}
