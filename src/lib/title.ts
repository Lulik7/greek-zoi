import { useApp } from '../store/AppContext';

/**
 * Название сайта в две строки: «СЛУШАЮ ГРЕЧЕСКИЙ» / «ГОВОРЮ ПО-ГРЕЧЕСКИ».
 * Делим только по тире, отделённому пробелами, — дефис внутри «ПО-ГРЕЧЕСКИ»
 * остаётся на месте. Текст берётся из настроек, поэтому админ может его менять.
 */
export function useLogoLines(): [string, string] {
  const { db } = useApp();
  const title = db?.settings.title ?? 'СЛУШАЮ ГРЕЧЕСКИЙ — ГОВОРЮ ПО-ГРЕЧЕСКИ';
  const [first, ...rest] = title.split(/\s+[—–-]\s+/);
  return [first.trim(), rest.join(' — ').trim()];
}
