/**
 * Ссылки на видео.
 *
 * Люди копируют адрес из адресной строки — «youtube.com/watch?v=ID&list=...».
 * Вставить такую страницу в рамку на сайте нельзя: YouTube это запрещает
 * заголовком X-Frame-Options. Для встраивания нужен отдельный адрес вида
 * «youtube.com/embed/ID». Здесь и переводим одно в другое.
 */

/** Достаёт идентификатор ролика из любой привычной формы ссылки YouTube */
function youtubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([\w-]{6,})/i,
    /youtu\.be\/([\w-]{6,})/i,
    /youtube\.com\/embed\/([\w-]{6,})/i,
    /youtube\.com\/shorts\/([\w-]{6,})/i,
    /youtube\.com\/live\/([\w-]{6,})/i,
  ];
  for (const re of patterns) {
    const m = re.exec(url);
    if (m) return m[1];
  }
  return null;
}

function vimeoId(url: string): string | null {
  const m = /vimeo\.com\/(?:video\/)?(\d{6,})/i.exec(url);
  return m ? m[1] : null;
}

/**
 * Приводит ссылку к виду, пригодному для рамки.
 * Если это не видеосервис — возвращает исходную строку без изменений.
 */
export function toEmbedUrl(url: string): string {
  const raw = (url ?? '').trim();
  if (!raw) return raw;

  const yt = youtubeId(raw);
  if (yt) return `https://www.youtube.com/embed/${yt}`;

  const vm = vimeoId(raw);
  if (vm) return `https://player.vimeo.com/video/${vm}`;

  return raw;
}

/** Похоже ли на страницу видеосервиса — чтобы предупредить в админке */
export function isVideoPageUrl(url: string): boolean {
  const raw = (url ?? '').trim();
  if (!raw) return false;
  return !!youtubeId(raw) || !!vimeoId(raw) || /rutube\.ru|vk\.com\/video|dzen\.ru\/video/i.test(raw);
}
