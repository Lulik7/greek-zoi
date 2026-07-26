import type { Level, Topic, Track } from '../types';

/** Общая нормализация текста: регистр, «ё», лишние пробелы. */
export function normalize(s: string): string {
  return s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

/**
 * Нормализация кодов уровней: латиница, кириллица и греческий для «A1», «А1»,
 * «Α1» дают один и тот же результат. Замена посимвольная, длина строки не
 * меняется — это важно для вырезания кода из исходного запроса.
 */
const CODE_MAP: Record<string, string> = {
  а: 'a', α: 'a', ά: 'a',
  в: 'b', β: 'b',
  г: 'g', γ: 'g',
};

function normalizeCode(s: string): string {
  return normalize(s).replace(/[аαάвβгγ]/g, (ch) => CODE_MAP[ch] ?? ch);
}

export interface QueryIntent {
  levelIds: string[];
  topicIds: string[];
  /** Остаток запроса — ищем по названию, исполнителю и тексту */
  text: string;
  raw: string;
}

export function interpretQuery(raw: string, levels: Level[], topics: Topic[]): QueryIntent {
  const q = normalize(raw);
  const levelIds: string[] = [];
  const topicIds: string[] = [];
  // ищем коды уровней в «кодовой» версии запроса, а вырезаем из обычной:
  // позиции символов совпадают, потому что замена посимвольная
  let coded = normalizeCode(q);
  let rest = q;

  for (const lvl of levels) {
    const code = normalizeCode(lvl.code);
    const re = new RegExp(`(?<![a-zа-я0-9])${code}(?![a-zа-я0-9])`, 'i');
    const m = re.exec(coded);
    if (m) {
      levelIds.push(lvl.id);
      const blank = ' '.repeat(m[0].length);
      coded = coded.slice(0, m.index) + blank + coded.slice(m.index + m[0].length);
      rest = rest.slice(0, m.index) + blank + rest.slice(m.index + m[0].length);
    }
  }

  for (const topic of topics) {
    const title = normalize(topic.title);
    // «покупки» найдётся и по «покупк», и по «покупка»
    const stem = title.slice(0, Math.max(4, title.length - 2));
    if (rest.includes(stem) || rest.includes(normalize(topic.slug))) {
      topicIds.push(topic.id);
      rest = rest.replace(title, ' ').replace(stem, ' ');
    }
  }

  rest = rest.replace(/уровень|уровня|тема|темы|песня|песни|диалог|диалоги/g, ' ').trim();

  return { levelIds, topicIds, text: rest, raw };
}

export interface TrackFilter {
  levelIds?: string[];
  topicIds?: string[];
  text?: string;
  kind?: 'song' | 'dialogue' | 'all';
}

export function filterTracks(tracks: Track[], f: TrackFilter): Track[] {
  const text = f.text ? normalize(f.text) : '';
  return tracks.filter((t) => {
    if (!t.published) return false;
    if (f.levelIds?.length && !f.levelIds.some((id) => t.levelIds.includes(id))) return false;
    if (f.topicIds?.length && !f.topicIds.some((id) => t.topicIds.includes(id))) return false;
    if (f.kind && f.kind !== 'all' && t.kind !== f.kind) return false;
    if (text) {
      const haystack = normalize(
        [t.title, t.titleRu, t.artist, t.note, ...t.lyrics.flatMap((l) => [l.el, l.ru])].join(' '),
      );
      if (!haystack.includes(text)) return false;
    }
    return true;
  });
}

/** Подсказки для поля поиска */
export function buildSuggestions(levels: Level[], topics: Topic[], tracks: Track[]) {
  return [
    ...levels.map((l) => ({ label: `Уровень ${l.code}`, type: 'level' as const, id: l.id })),
    ...topics.map((t) => ({ label: `${t.emoji} ${t.title}`, type: 'topic' as const, id: t.id })),
    ...tracks
      .filter((t) => t.published)
      .map((t) => ({ label: `${t.title} — ${t.titleRu}`, type: 'track' as const, id: t.id })),
  ];
}
