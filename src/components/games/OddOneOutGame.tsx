import { useCallback, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import WinCelebration from './WinCelebration';
import { cartoonTitle, HERO_VIOLET, INK, TEXT_MUTED, YELLOW } from '../../theme';

type Word = { gr: string; ru: string };
type Group = { topic: string; same: Word[]; odd: Word };

const GROUPS: Group[] = [
  {
    topic: 'еда',
    same: [
      { gr: 'ψωμί', ru: 'хлеб' },
      { gr: 'τυρί', ru: 'сыр' },
      { gr: 'κρασί', ru: 'вино' },
    ],
    odd: { gr: 'σπίτι', ru: 'дом' },
  },
  {
    topic: 'природа',
    same: [
      { gr: 'θάλασσα', ru: 'море' },
      { gr: 'ήλιος', ru: 'солнце' },
      { gr: 'φεγγάρι', ru: 'луна' },
    ],
    odd: { gr: 'βιβλίο', ru: 'книга' },
  },
  {
    topic: 'семья',
    same: [
      { gr: 'μαμά', ru: 'мама' },
      { gr: 'μπαμπάς', ru: 'папа' },
      { gr: 'αδελφή', ru: 'сестра' },
    ],
    odd: { gr: 'καφές', ru: 'кофе' },
  },
  {
    topic: 'цвета',
    same: [
      { gr: 'κόκκινο', ru: 'красный' },
      { gr: 'μπλε', ru: 'синий' },
      { gr: 'πράσινο', ru: 'зелёный' },
    ],
    odd: { gr: 'νερό', ru: 'вода' },
  },
  {
    topic: 'животные',
    same: [
      { gr: 'γάτα', ru: 'кошка' },
      { gr: 'σκύλος', ru: 'собака' },
      { gr: 'ψάρι', ru: 'рыба' },
    ],
    odd: { gr: 'δρόμος', ru: 'дорога' },
  },
  {
    topic: 'время',
    same: [
      { gr: 'σήμερα', ru: 'сегодня' },
      { gr: 'αύριο', ru: 'завтра' },
      { gr: 'χθες', ru: 'вчера' },
    ],
    odd: { gr: 'λεμόνι', ru: 'лимон' },
  },
  {
    topic: 'числа',
    same: [
      { gr: 'ένα', ru: 'один' },
      { gr: 'δύο', ru: 'два' },
      { gr: 'τρία', ru: 'три' },
    ],
    odd: { gr: 'νησί', ru: 'остров' },
  },
];

const GOAL = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Найди лишнее: три слова одной темы и одно чужое */
export default function OddOneOutGame() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * GROUPS.length));
  const [chosen, setChosen] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [party, setParty] = useState(false);

  const group = GROUPS[index];
  const cards = useMemo(
    () => shuffle([...group.same, group.odd]),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- перемешиваем только при новой группе
    [index],
  );

  const answer = useCallback(
    (gr: string) => {
      if (chosen) return;
      setChosen(gr);
      const ok = gr === group.odd.gr;
      const next = ok ? streak + 1 : 0;
      setStreak(next);
      if (ok && next >= GOAL) setParty(true);

      window.setTimeout(() => {
        setChosen(null);
        setIndex((prev) => {
          let i = Math.floor(Math.random() * GROUPS.length);
          if (i === prev && GROUPS.length > 1) i = (i + 1) % GROUPS.length;
          return i;
        });
        if (ok && next >= GOAL) setStreak(0);
      }, 1200);
    },
    [chosen, group.odd.gr, streak],
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
        Найди лишнее
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
        Три слова из одной темы, одно — чужое. Подряд верно: {streak} из {GOAL}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 1.25,
        }}
      >
        {cards.map((w) => {
          const picked = chosen === w.gr;
          const isOdd = w.gr === group.odd.gr;
          const showRight = chosen && isOdd;
          const showWrong = picked && !isOdd;
          return (
            <Box
              key={w.gr}
              component="button"
              type="button"
              disabled={!!chosen}
              onClick={() => answer(w.gr)}
              sx={{
                py: 1.5,
                px: 1,
                cursor: chosen ? 'default' : 'pointer',
                borderRadius: 2.5,
                border: `3px solid ${INK}`,
                bgcolor: showRight ? '#C8E6C9' : showWrong ? '#FFCDD2' : '#FFFDF2',
                color: INK,
                fontFamily: 'inherit',
                transition: 'background-color 0.2s ease, transform 0.15s ease',
                '&:hover': chosen ? {} : { bgcolor: YELLOW, transform: 'translateY(-2px)' },
              }}
            >
              <Box sx={{ fontWeight: 900, fontSize: { xs: 16, sm: 18 } }}>{w.gr}</Box>
              {/* перевод открываем только после ответа — иначе игра слишком простая */}
              <Box sx={{ fontWeight: 700, fontSize: 12, opacity: chosen ? 0.7 : 0, mt: 0.5 }}>
                {w.ru}
              </Box>
            </Box>
          );
        })}
      </Box>

      {chosen && (
        <Typography
          sx={{
            mt: 1.5,
            textAlign: 'center',
            fontWeight: 900,
            fontSize: 14,
            color: chosen === group.odd.gr ? '#2E7D32' : '#C62828',
          }}
        >
          {chosen === group.odd.gr
            ? `Верно! Остальные — тема «${group.topic}».`
            : `Мимо. Тема была «${group.topic}», лишнее — ${group.odd.gr}.`}
        </Typography>
      )}

      <WinCelebration open={party} onClose={() => setParty(false)} />
    </Box>
  );
}
