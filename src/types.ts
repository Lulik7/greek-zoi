// Доменная модель сайта «Слушаю греческий — говорю по-гречески»

export interface Level {
  id: string;
  /** Код уровня: A1, A2, B1, B2 */
  code: string;
  /** Подпись для карточки уровня */
  title: string;
  description: string;
  order: number;
}

export interface Topic {
  id: string;
  /** Часть URL: /catalog?topic=love */
  slug: string;
  title: string;
  emoji: string;
  order: number;
}

export interface LyricLine {
  /** Секунда начала строки. Если не задана — текст показывается целиком, без подсветки. */
  time?: number;
  /** Оригинал (греческий) */
  el: string;
  /** Перевод / транскрипция */
  ru: string;
}

export type TrackKind = 'song' | 'dialogue';

export interface Track {
  id: string;
  title: string;
  titleRu: string;
  artist: string;
  kind: TrackKind;
  levelIds: string[];
  topicIds: string[];
  /**
   * Для админа — исходная ссылка на файл. Для ученика сервер подменяет её на
   * `/api/audio/<id>` и отдаёт пустую строку, если материал закрыт.
   */
  audioUrl: string;
  /** true — доступен всем без подписки */
  free: boolean;
  lyrics: LyricLine[];
  /** Заметка преподавателя: грамматика, лексика */
  note: string;
  createdAt: string;
  published: boolean;
  /** Проставляется сервером: материал закрыт, аудио и текст не переданы */
  locked?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  priceEur: number;
  periodDays: number;
  features: string[];
  highlighted?: boolean;
}

export interface SiteSettings {
  title: string;
  subtitle: string;
  /** Номер для Viber / WhatsApp */
  contactPhone: string;
  contactEmail: string;
  contactTelegram: string;
  /** Имя страницы в Фейсбуке — как оно показывается в подвале */
  contactFacebook: string;
  /** Ссылка на страницу в Фейсбуке */
  contactFacebookUrl: string;
  instructionVideoUrl: string;
  instructionVideoTitle: string;
  featuredVideoUrl: string;
  featuredVideoDescription: string;
  plans: SubscriptionPlan[];
}

export interface Subscription {
  active: boolean;
  planId: string | null;
  /** ISO-дата окончания */
  until: string | null;
}

export type UserRole = 'admin' | 'student';

/** Пароль на клиент никогда не приходит: на сервере хранится только bcrypt-хеш. */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  subscription: Subscription;
  createdAt: string;
  /** Приходит только в дев-режиме, когда SMTP не настроен: ссылка вместо письма */
  verificationLink?: string;
}

export interface Payment {
  id: string;
  userId: string | null;
  planId: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'paid' | string;
  provider: string;
  createdAt: string;
}

/** Что подключено на сервере — влияет на тексты в интерфейсе */
export interface Features {
  /** true — оплата идёт через Stripe, false — демо-режим без списания */
  stripe: boolean;
  /** true — письма реально отправляются */
  email: boolean;
}

export interface VisitEvent {
  id: string;
  /** 'page' | 'play' | 'locked' */
  type: 'page' | 'play' | 'locked' | 'search';
  path: string;
  label?: string;
  at: string;
}

export interface Database {
  levels: Level[];
  topics: Topic[];
  tracks: Track[];
  users: User[];
  settings: SiteSettings;
  events: VisitEvent[];
  payments: Payment[];
  features: Features;
}
