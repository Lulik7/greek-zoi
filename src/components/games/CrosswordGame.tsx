import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/LightbulbOutlined';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import WinCelebration from './WinCelebration';
import { cartoonTitle, HERO_VIOLET, INK, TEXT_MUTED, YELLOW } from '../../theme';

type Dir = 'across' | 'down';

type Entry = {
  answer: string;
  /** подсказка по-русски */
  clue: string;
  row: number;
  col: number;
  dir: Dir;
};

type Level = { id: string; label: string; cols: number; rows: number; entries: Entry[] };

/**
 * Сетки собраны вручную: длинное слово по горизонтали в первой строке,
 * остальные свисают с него вниз. Все пересечения — только с первой строкой,
 * поэтому буквы гарантированно сходятся.
 */
const LEVELS: Level[] = [
  {
    id: 'A1',
    label: 'A1 — первые слова',
    cols: 8,
    rows: 5,
    entries: [
      { answer: 'ΚΑΛΗΜΕΡΑ', clue: 'Доброе утро', row: 0, col: 0, dir: 'across' },
      { answer: 'ΚΑΦΕΣ', clue: 'Кофе', row: 0, col: 0, dir: 'down' },
      { answer: 'ΜΑΜΑ', clue: 'Мама', row: 0, col: 4, dir: 'down' },
      { answer: 'ΕΝΑ', clue: 'Один', row: 0, col: 5, dir: 'down' },
      { answer: 'ΑΓΑΠΗ', clue: 'Любовь', row: 0, col: 7, dir: 'down' },
    ],
  },
  {
    id: 'A2',
    label: 'A2 — про жизнь',
    cols: 7,
    rows: 6,
    entries: [
      { answer: 'ΘΑΛΑΣΣΑ', clue: 'Море', row: 0, col: 0, dir: 'across' },
      { answer: 'ΑΕΡΑΣ', clue: 'Воздух', row: 0, col: 1, dir: 'down' },
      { answer: 'ΛΕΜΟΝΙ', clue: 'Лимон', row: 0, col: 2, dir: 'down' },
      { answer: 'ΣΠΙΤΙ', clue: 'Дом', row: 0, col: 4, dir: 'down' },
      { answer: 'ΑΓΟΡΑ', clue: 'Рынок', row: 0, col: 6, dir: 'down' },
    ],
  },
  {
    id: 'B1',
    label: 'B1 — свободнее',
    cols: 6,
    rows: 8,
    entries: [
      { answer: 'ΤΑΞΙΔΙ', clue: 'Путешествие', row: 0, col: 0, dir: 'across' },
      { answer: 'ΤΡΑΓΟΥΔΙ', clue: 'Песня', row: 0, col: 0, dir: 'down' },
      { answer: 'ΑΔΕΛΦΗ', clue: 'Сестра', row: 0, col: 1, dir: 'down' },
      { answer: 'ΔΟΥΛΕΙΑ', clue: 'Работа', row: 0, col: 4, dir: 'down' },
    ],
  },
];

const key = (r: number, c: number) => `${r}:${c}`;

/** Все клетки уровня: где какая буква и где начинается слово */
function buildGrid(level: Level) {
  const cells = new Map<string, { letter: string; num?: number }>();
  for (const e of level.entries) {
    for (let i = 0; i < e.answer.length; i++) {
      const r = e.dir === 'down' ? e.row + i : e.row;
      const c = e.dir === 'across' ? e.col + i : e.col;
      cells.set(key(r, c), { letter: e.answer[i] });
    }
  }
  // нумерация — по порядку чтения, как в обычном кроссворде
  const starts = new Map<string, number>();
  let n = 0;
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      if (level.entries.some((e) => e.row === r && e.col === c)) {
        n += 1;
        starts.set(key(r, c), n);
        const cell = cells.get(key(r, c));
        if (cell) cell.num = n;
      }
    }
  }
  return { cells, starts };
}

/** Лёгкая подсказка: первая буква каждого слова открыта сразу */
function initialValues(level: Level) {
  const v: Record<string, string> = {};
  for (const e of level.entries) v[key(e.row, e.col)] = e.answer[0];
  return v;
}

/**
 * Разноуровневый кроссворд: греческие слова, подсказки по-русски.
 * Первая буква каждого слова открыта, есть кнопка «подсказка» и проверка.
 */
export default function CrosswordGame() {
  const [levelId, setLevelId] = useState(LEVELS[0].id);
  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0];

  const { cells, starts } = useMemo(() => buildGrid(level), [level]);
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(level));
  const [checked, setChecked] = useState(false);

  const [party, setParty] = useState(false);

  const reset = useCallback((next: Level) => {
    setParty(false);
    setValues(initialValues(next));
    setChecked(false);
    setLevelId(next.id);
  }, []);

  const solved = useMemo(
    () => [...cells.entries()].every(([k, cell]) => values[k] === cell.letter),
    [cells, values],
  );

  useEffect(() => {
    if (solved) setParty(true);
  }, [solved]);

  const hint = useCallback(() => {
    const empty = [...cells.entries()].filter(([k, cell]) => values[k] !== cell.letter);
    if (!empty.length) return;
    const [k, cell] = empty[Math.floor(Math.random() * empty.length)];
    setValues((prev) => ({ ...prev, [k]: cell.letter }));
  }, [cells, values]);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        bgcolor: '#fff',
        border: `3px solid ${HERO_VIOLET}`,
        boxShadow: '0 12px 28px rgba(33,25,95,0.18)',
      }}
    >
      <Typography
        component="h2"
        sx={{
          ...cartoonTitle,
          fontWeight: 900,
          WebkitTextStroke: `1.2px ${INK}`,
          fontSize: { xs: 22, sm: 28 },
          textAlign: 'center',
        }}
      >
        Кроссворд
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          mb: 2,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: { xs: 13, sm: 14 },
          color: TEXT_MUTED,
        }}
      >
        Подсказки по-русски, ответы по-гречески. Первая буква каждого слова уже стоит.
      </Typography>

      {/* уровни */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1, mb: 2.5 }}
      >
        {LEVELS.map((l) => (
          <Box
            key={l.id}
            component="button"
            type="button"
            aria-pressed={l.id === levelId}
            onClick={() => reset(l)}
            sx={{
              px: 1.75,
              py: 0.75,
              cursor: 'pointer',
              borderRadius: 999,
              border: `2px solid ${INK}`,
              bgcolor: l.id === levelId ? YELLOW : '#fff',
              color: INK,
              fontWeight: 900,
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          >
            {l.label}
          </Box>
        ))}
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }}>
        {/* сетка */}
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${level.cols}, 38px)`,
              gap: '3px',
              mx: 'auto',
              width: 'max-content',
            }}
          >
            {Array.from({ length: level.rows }).flatMap((_, r) =>
              Array.from({ length: level.cols }).map((__, c) => {
                const k = key(r, c);
                const cell = cells.get(k);
                if (!cell) return <Box key={k} sx={{ width: 38, height: 38 }} />;
                const val = values[k] ?? '';
                const right = val === cell.letter;
                return (
                  <Box key={k} sx={{ position: 'relative', width: 38, height: 38 }}>
                    {cell.num != null && (
                      <Box
                        aria-hidden
                        sx={{
                          position: 'absolute',
                          top: 1,
                          left: 3,
                          fontSize: 9,
                          fontWeight: 900,
                          color: HERO_VIOLET,
                          zIndex: 1,
                          pointerEvents: 'none',
                        }}
                      >
                        {cell.num}
                      </Box>
                    )}
                    <Box
                      component="input"
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      aria-label={`Клетка ${r + 1}, ${c + 1}`}
                      value={val}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const ch = e.target.value.slice(-1).toUpperCase();
                        setValues((prev) => ({ ...prev, [k]: ch }));
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: 900,
                        fontFamily: 'inherit',
                        color: INK,
                        border: `2px solid ${INK}`,
                        borderRadius: '6px',
                        bgcolor: checked ? (right ? '#C8E6C9' : '#FFCDD2') : '#FFFDF2',
                        outline: 'none',
                        p: 0,
                        '&:focus': { borderColor: HERO_VIOLET, bgcolor: '#fff' },
                      }}
                    />
                  </Box>
                );
              }),
            )}
          </Box>
        </Box>

        {/* подсказки */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {(['across', 'down'] as Dir[]).map((dir) => {
            const list = level.entries.filter((e) => e.dir === dir);
            if (!list.length) return null;
            return (
              <Box key={dir} sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 900, color: HERO_VIOLET, fontSize: 14, mb: 0.75 }}>
                  {dir === 'across' ? 'По горизонтали' : 'По вертикали'}
                </Typography>
                <Stack spacing={0.5}>
                  {list.map((e) => (
                    <Typography
                      key={`${e.row}-${e.col}-${e.dir}`}
                      sx={{ fontSize: 13.5, fontWeight: 700, color: INK }}
                    >
                      <Box component="span" sx={{ color: HERO_VIOLET }}>
                        {starts.get(key(e.row, e.col))}.
                      </Box>{' '}
                      {e.clue}{' '}
                      <Box component="span" sx={{ color: TEXT_MUTED, fontWeight: 600 }}>
                        ({e.answer.length} букв)
                      </Box>
                    </Typography>
                  ))}
                </Stack>
              </Box>
            );
          })}

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Button
              variant="contained"
              startIcon={<LightbulbIcon />}
              onClick={hint}
              sx={{
                bgcolor: YELLOW,
                color: INK,
                fontWeight: 900,
                border: `2px solid ${INK}`,
                boxShadow: `0 3px 0 ${INK}`,
                '&:hover': { bgcolor: '#FFE056' },
              }}
            >
              Подсказка
            </Button>
            <Button
              variant="outlined"
              startIcon={<CheckIcon />}
              onClick={() => setChecked(true)}
              sx={{ color: INK, borderColor: INK, borderWidth: 2, fontWeight: 900 }}
            >
              Проверить
            </Button>
            <Button
              variant="text"
              startIcon={<RefreshIcon />}
              onClick={() => reset(level)}
              sx={{ color: INK, fontWeight: 800 }}
            >
              Заново
            </Button>
          </Stack>

          {solved && (
            <Typography sx={{ mt: 1.5, fontWeight: 900, color: '#2E7D32', fontSize: 15 }}>
              Μπράβο! Кроссворд решён.
            </Typography>
          )}
        </Box>
      </Stack>

      <WinCelebration open={party} onClose={() => setParty(false)} />
    </Box>
  );
}
