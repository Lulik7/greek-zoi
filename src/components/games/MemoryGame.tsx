import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WinCelebration from './WinCelebration';
import { cartoonTitle, HERO_VIOLET, INK, TEXT_MUTED, YELLOW } from '../../theme';

/** Пары «греческое слово — перевод». Берём восемь случайных на партию. */
const PAIRS: { gr: string; ru: string }[] = [
  { gr: 'νερό', ru: 'вода' },
  { gr: 'ψωμί', ru: 'хлеб' },
  { gr: 'θάλασσα', ru: 'море' },
  { gr: 'σπίτι', ru: 'дом' },
  { gr: 'αγάπη', ru: 'любовь' },
  { gr: 'ήλιος', ru: 'солнце' },
  { gr: 'φεγγάρι', ru: 'луна' },
  { gr: 'λεμόνι', ru: 'лимон' },
  { gr: 'φίλος', ru: 'друг' },
  { gr: 'βιβλίο', ru: 'книга' },
  { gr: 'γάτα', ru: 'кошка' },
  { gr: 'καρδιά', ru: 'сердце' },
  { gr: 'κρασί', ru: 'вино' },
  { gr: 'τυρί', ru: 'сыр' },
  { gr: 'νησί', ru: 'остров' },
  { gr: 'δρόμος', ru: 'дорога' },
];

const ON_TABLE = 8;

type Card = { key: string; pair: number; text: string; greek: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function deal(): Card[] {
  const chosen = shuffle(PAIRS).slice(0, ON_TABLE);
  const cards: Card[] = [];
  chosen.forEach((p, i) => {
    cards.push({ key: `g${i}`, pair: i, text: p.gr, greek: true });
    cards.push({ key: `r${i}`, pair: i, text: p.ru, greek: false });
  });
  return shuffle(cards);
}

/**
 * Парочки: открыть греческое слово и его перевод.
 * Совпало — карточки остаются открытыми, нет — закрываются обратно.
 */
export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(deal);
  const [open, setOpen] = useState<string[]>([]);
  const [done, setDone] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  // две открытые карточки: совпали — оставляем, нет — прячем через паузу
  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((k) => cards.find((c) => c.key === k));
    if (a && b && a.pair === b.pair) {
      setDone((prev) => [...prev, a.pair]);
      setOpen([]);
      return;
    }
    const t = window.setTimeout(() => setOpen([]), 900);
    return () => window.clearTimeout(t);
  }, [open, cards]);

  const flip = useCallback(
    (card: Card) => {
      if (open.length === 2) return;
      if (open.includes(card.key) || done.includes(card.pair)) return;
      setOpen((prev) => [...prev, card.key]);
      if (open.length === 1) setMoves((m) => m + 1);
    },
    [open, done],
  );

  const [party, setParty] = useState(false);
  useEffect(() => {
    if (done.length === ON_TABLE) setParty(true);
  }, [done]);

  const restart = useCallback(() => {
    setParty(false);
    setCards(deal());
    setOpen([]);
    setDone([]);
    setMoves(0);
  }, []);

  const won = done.length === ON_TABLE;

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
        Парочки
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
        Найдите греческое слово и его перевод. Ходов: {moves}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        {cards.map((c) => {
          const shown = open.includes(c.key) || done.includes(c.pair);
          const matched = done.includes(c.pair);
          return (
            <Box
              key={c.key}
              component="button"
              type="button"
              onClick={() => flip(c)}
              aria-label={shown ? c.text : 'Закрытая карточка'}
              sx={{
                minHeight: { xs: 62, sm: 74 },
                px: 1,
                cursor: matched ? 'default' : 'pointer',
                borderRadius: 2.5,
                border: `3px solid ${INK}`,
                bgcolor: matched ? '#C8E6C9' : shown ? '#fff' : HERO_VIOLET,
                color: shown ? INK : 'transparent',
                fontFamily: 'inherit',
                fontWeight: 900,
                fontSize: { xs: 14, sm: 16 },
                lineHeight: 1.2,
                transition: 'background-color 0.25s ease, transform 0.15s ease',
                '&:hover': matched ? {} : { transform: 'translateY(-3px)' },
              }}
            >
              {shown ? c.text : '?'}
            </Box>
          );
        })}
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ mt: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={restart}
          sx={{
            bgcolor: YELLOW,
            color: INK,
            fontWeight: 900,
            border: `2px solid ${INK}`,
            boxShadow: `0 3px 0 ${INK}`,
            '&:hover': { bgcolor: '#FFE056' },
          }}
        >
          Заново
        </Button>
        {won && (
          <Typography sx={{ fontWeight: 900, color: '#2E7D32', fontSize: 15 }}>
            Μπράβο! Все пары собраны за {moves} ходов.
          </Typography>
        )}
      </Stack>

      <WinCelebration open={party} onClose={() => setParty(false)} />
    </Box>
  );
}
