/*
 * Заголовок и описание страницы для поисковиков.
 *
 * Сайт — одно приложение на все адреса, и без этого у каждой страницы был бы
 * один и тот же заголовок из index.html: для Google это выглядело бы как один
 * документ вместо нескольких. Заодно проставляем canonical — адрес страницы
 * без лишних меток вроде ?paid=1, чтобы поисковик не считал их разными
 * страницами с одинаковым содержимым.
 */
import { useEffect } from 'react';

export const SITE_NAME = 'Слушаю греческий — говорю по-гречески';

function upsertMeta(kind: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${kind}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(kind, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function upsertCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

/** Заголовок страницы: на главной — только название сайта, на остальных с приставкой */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const full = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    const url = window.location.origin + window.location.pathname;

    document.title = full;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', full);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertCanonical(url);
  }, [title, description]);
}
