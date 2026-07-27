import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WinCelebration from './WinCelebration';
import { cartoonTitle, HERO_VIOLET, INK, TEXT_MUTED, YELLOW } from '../../theme';

/** Греческий алфавит в верхнем регистре — им и играем */
const ALPHABET = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'.split('');

const MAX_ERRORS = 6;

/** Слова без ударений: в верхнем регистре греки ударения не ставят */
const WORDS: { word: string; ru: string }[] = [
  { word: 'ΘΑΛΑΣΣΑ', ru: 'море' },
  { word: 'ΣΠΙΤΙ', ru: 'дом' },
  { word: 'ΝΕΡΟ', ru: 'вода' },
  { word: 'ΨΩΜΙ', ru: 'хлеб' },
  { word: 'ΑΓΑΠΗ', ru: 'любовь' },
  { word: 'ΚΑΦΕΣ', ru: 'кофе' },
  { word: 'ΗΛΙΟΣ', ru: 'солнце' },
  { word: 'ΦΕΓΓΑΡΙ', ru: 'луна' },
  { word: 'ΛΕΜΟΝΙ', ru: 'лимон' },
  { word: 'ΕΛΙΑ', ru: 'олива' },
  { word: 'ΤΡΑΓΟΥΔΙ', ru: 'песня' },
  { word: 'ΦΙΛΟΣ', ru: 'друг' },
  { word: 'ΟΙΚΟΓΕΝΕΙΑ', ru: 'семья' },
  { word: 'ΤΑΞΙΔΙ', ru: 'путешествие' },
  { word: 'ΔΟΥΛΕΙΑ', ru: 'работа' },
  { word: 'ΣΧΟΛΕΙΟ', ru: 'школа' },
  { word: 'ΒΙΒΛΙΟ', ru: 'книга' },
  { word: 'ΓΑΤΑ', ru: 'кошка' },
  { word: 'ΣΚΥΛΟΣ', ru: 'собака' },
  { word: 'ΛΟΥΛΟΥΔΙ', ru: 'цветок' },
  { word: 'ΚΑΡΔΙΑ', ru: 'сердце' },
  { word: 'ΟΥΡΑΝΟΣ', ru: 'небо' },
  { word: 'ΑΕΡΑΣ', ru: 'воздух' },
  { word: 'ΝΗΣΙ', ru: 'остров' },
  { word: 'ΚΡΑΣΙ', ru: 'вино' },
  { word: 'ΤΥΡΙ', ru: 'сыр' },
  { word: 'ΑΓΟΡΑ', ru: 'рынок' },
  { word: 'ΔΡΟΜΟΣ', ru: 'дорога' },
  { word: 'ΜΟΥΣΙΚΗ', ru: 'музыка' },
  { word: 'ΧΑΡΑ', ru: 'радость' },
];

/** Части виселицы появляются по одной за каждую ошибку */
function Gallows({ errors }: { errors: number }) {
  const show = (n: number) => (errors >= n ? 1 : 0);
  return (
    <Box
      component="svg"
      viewBox="0 0 160 180"
      aria-hidden
      sx={{ width: { xs: 130, sm: 160 }, height: 'auto', flexShrink: 0 }}
    >
      {/* столбы стоят всегда */}
      <g stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M 10 172 L 110 172" />
        <path d="M 40 172 L 40 12" />
        <path d="M 40 12 L 110 12" />
        <path d="M 110 12 L 110 34" />
      </g>
      <g stroke={HERO_VIOLET} strokeWidth="6" strokeLinecap="round" fill="none">
        <circle cx="110" cy="52" r="18" opacity={show(1)} fill="#fff" />
        <path d="M 110 70 L 110 118" opacity={show(2)} />
        <path d="M 110 82 L 86 104" opacity={show(3)} />
        <path d="M 110 82 L 134 104" opacity={show(4)} />
        <path d="M 110 118 L 90 150" opacity={show(5)} />
        <path d="M 110 118 L 130 150" opacity={show(6)} />
      </g>
    </Box>
  );
}

/**
 * Виселица на греческих словах: слово загадывается случайно,
 * подсказка — перевод. Буквы выбираются мышкой, клавиатура не нужна.
 */
export default function HangmanGame() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * WORDS.length));
  const [used, setUsed] = useState<string[]>([]);

  const current = WORDS[index];
  const letters = useMemo(() => current.word.split(''), [current.word]);

  const errors = used.filter((l) => !letters.includes(l)).length;
  const lost = errors >= MAX_ERRORS;
  const won = letters.every((l) => used.includes(l));
  const over = lost || won;

  const pick = useCallback(
    (letter: string) => {
      if (over || used.includes(letter)) return;
      setUsed((prev) => [...prev, letter]);
    },
    [over, used],
  );

  const [party, setParty] = useState(false);
  useEffect(() => {
    if (won) setParty(true);
  }, [won]);

  const next = useCallback(() => {
    setParty(false);
    setUsed([]);
    setIndex((prev) => {
      if (WORDS.length < 2) return prev;
      let i = Math.floor(Math.random() * WORDS.length);
      if (i === prev) i = (i + 1) % WORDS.length;
      return i;
    });
  }, []);

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
        Виселица
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
        Отгадайте греческое слово по буквам. Шесть ошибок — и всё.
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 3 }}
        sx={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <Gallows errors={errors} />

        <Box sx={{ flex: 1, minWidth: 0, width: '100%', maxWidth: 520 }}>
          <Typography
            sx={{ fontWeight: 800, fontSize: 14, color: INK, textAlign: 'center', mb: 1 }}
          >
            Подсказка: <Box component="span" sx={{ color: HERO_VIOLET }}>{current.ru}</Box>
          </Typography>

          {/* само слово: открытые буквы и прочерки */}
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1, mb: 2 }}
          >
            {letters.map((l, i) => {
              const open = used.includes(l) || lost;
              return (
                <Box
                  key={`${l}-${i}`}
                  sx={{
                    width: { xs: 26, sm: 30 },
                    height: { xs: 34, sm: 38 },
                    display: 'grid',
                    placeItems: 'center',
                    borderBottom: `3px solid ${INK}`,
                    fontWeight: 900,
                    fontSize: { xs: 19, sm: 22 },
                    color: open && lost && !used.includes(l) ? '#C62828' : INK,
                  }}
                >
                  {open ? l : ''}
                </Box>
              );
            })}
          </Stack>

          {over ? (
            <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 15, sm: 17 },
                  color: won ? '#2E7D32' : '#C62828',
                  textAlign: 'center',
                }}
              >
                {won
                  ? 'Μπράβο! Слово отгадано.'
                  : `Не в этот раз. Слово: ${current.word} — ${current.ru}.`}
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={next}
                sx={{
                  bgcolor: YELLOW,
                  color: INK,
                  fontWeight: 900,
                  border: `2px solid ${INK}`,
                  boxShadow: `0 3px 0 ${INK}`,
                  '&:hover': { bgcolor: '#FFE056' },
                }}
              >
                Новое слово
              </Button>
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(34px, 1fr))',
                gap: 0.75,
              }}
            >
              {ALPHABET.map((l) => {
                const isUsed = used.includes(l);
                const hit = isUsed && letters.includes(l);
                return (
                  <Box
                    key={l}
                    component="button"
                    type="button"
                    disabled={isUsed}
                    onClick={() => pick(l)}
                    aria-label={`Буква ${l}`}
                    sx={{
                      height: 34,
                      cursor: isUsed ? 'default' : 'pointer',
                      borderRadius: 1.5,
                      border: `2px solid ${INK}`,
                      bgcolor: isUsed ? (hit ? '#C8E6C9' : '#FFCDD2') : '#fff',
                      color: INK,
                      opacity: isUsed ? 0.75 : 1,
                      fontWeight: 900,
                      fontSize: 15,
                      fontFamily: 'inherit',
                      '&:hover': isUsed ? {} : { bgcolor: YELLOW },
                    }}
                  >
                    {l}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Stack>

      <WinCelebration open={party} onClose={() => setParty(false)} />
    </Box>
  );
}
