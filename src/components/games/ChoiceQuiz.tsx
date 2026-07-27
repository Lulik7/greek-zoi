import { useCallback, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import WinCelebration from './WinCelebration';
import { cartoonTitle, HERO_VIOLET, INK, TEXT_MUTED, YELLOW } from '../../theme';

export type QuizItem = { q: string; a: string };

/** Сколько верных подряд нужно, чтобы получить салют */
const GOAL = 5;
const OPTIONS = 4;

function pickWrong(pool: QuizItem[], correct: string): string[] {
  const others = pool.filter((p) => p.a !== correct);
  const out: string[] = [];
  while (out.length < OPTIONS - 1 && others.length) {
    const i = Math.floor(Math.random() * others.length);
    const [taken] = others.splice(i, 1);
    if (!out.includes(taken.a)) out.push(taken.a);
  }
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Викторина с выбором ответа. Один движок на три игры:
 * перевод слов, названия букв, числа. Данные приходят пропсами.
 */
export default function ChoiceQuiz({
  title,
  subtitle,
  promptHint,
  pool,
  bigPrompt = false,
}: {
  title: string;
  subtitle: string;
  /** подпись над вопросом, например «Что значит слово?» */
  promptHint: string;
  pool: QuizItem[];
  /** крупный вопрос — для одиночных букв и цифр */
  bigPrompt?: boolean;
}) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * pool.length));
  const [chosen, setChosen] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [party, setParty] = useState(false);

  const item = pool[index];
  const options = useMemo(
    () => shuffle([item.a, ...pickWrong(pool, item.a)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- новый набор только при смене вопроса
    [index],
  );

  const answer = useCallback(
    (opt: string) => {
      if (chosen) return;
      setChosen(opt);
      const ok = opt === item.a;
      const next = ok ? streak + 1 : 0;
      setStreak(next);
      if (ok && next >= GOAL) setParty(true);

      window.setTimeout(() => {
        setChosen(null);
        setIndex((prev) => {
          let i = Math.floor(Math.random() * pool.length);
          if (i === prev && pool.length > 1) i = (i + 1) % pool.length;
          return i;
        });
        if (ok && next >= GOAL) setStreak(0);
      }, 900);
    },
    [chosen, item.a, pool, streak],
  );

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
        {title}
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
        {subtitle} · подряд верно: {streak} из {GOAL}
      </Typography>

      <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: INK }}>
        {promptHint}
      </Typography>
      <Typography
        sx={{
          textAlign: 'center',
          fontWeight: 900,
          color: HERO_VIOLET,
          fontSize: bigPrompt ? { xs: 52, sm: 68 } : { xs: 26, sm: 32 },
          lineHeight: 1.1,
          my: 1.5,
        }}
      >
        {item.q}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.25,
          maxWidth: 560,
          mx: 'auto',
        }}
      >
        {options.map((opt) => {
          const picked = chosen === opt;
          const showRight = chosen && opt === item.a;
          const showWrong = picked && opt !== item.a;
          return (
            <Box
              key={opt}
              component="button"
              type="button"
              disabled={!!chosen}
              onClick={() => answer(opt)}
              sx={{
                py: 1.25,
                px: 1.5,
                cursor: chosen ? 'default' : 'pointer',
                borderRadius: 2.5,
                border: `3px solid ${INK}`,
                bgcolor: showRight ? '#C8E6C9' : showWrong ? '#FFCDD2' : '#FFFDF2',
                color: INK,
                fontFamily: 'inherit',
                fontWeight: 900,
                fontSize: { xs: 15, sm: 16 },
                transition: 'background-color 0.2s ease, transform 0.15s ease',
                '&:hover': chosen ? {} : { bgcolor: YELLOW, transform: 'translateY(-2px)' },
              }}
            >
              {opt}
            </Box>
          );
        })}
      </Box>

      <WinCelebration open={party} onClose={() => setParty(false)} />
    </Box>
  );
}
