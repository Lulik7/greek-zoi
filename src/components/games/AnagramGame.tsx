import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import LightbulbIcon from '@mui/icons-material/LightbulbOutlined';
import WinCelebration from './WinCelebration';
import { cartoonTitle, HERO_VIOLET, INK, TEXT_MUTED, YELLOW } from '../../theme';

const WORDS: { word: string; ru: string }[] = [
  { word: 'ΘΑΛΑΣΣΑ', ru: 'море' },
  { word: 'ΚΑΛΗΜΕΡΑ', ru: 'доброе утро' },
  { word: 'ΕΥΧΑΡΙΣΤΩ', ru: 'спасибо' },
  { word: 'ΣΠΙΤΙ', ru: 'дом' },
  { word: 'ΑΓΑΠΗ', ru: 'любовь' },
  { word: 'ΤΡΑΓΟΥΔΙ', ru: 'песня' },
  { word: 'ΦΙΛΟΣ', ru: 'друг' },
  { word: 'ΟΥΡΑΝΟΣ', ru: 'небо' },
  { word: 'ΛΕΜΟΝΙ', ru: 'лимон' },
  { word: 'ΚΑΡΔΙΑ', ru: 'сердце' },
  { word: 'ΤΑΞΙΔΙ', ru: 'путешествие' },
  { word: 'ΣΧΟΛΕΙΟ', ru: 'школа' },
  { word: 'ΜΟΥΣΙΚΗ', ru: 'музыка' },
  { word: 'ΦΕΓΓΑΡΙ', ru: 'луна' },
  { word: 'ΔΡΟΜΟΣ', ru: 'дорога' },
  { word: 'ΝΗΣΙ', ru: 'остров' },
];

function shuffled(word: string): string[] {
  const a = word.split('');
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // если перемешалось «в исходное», подвинем — иначе игры нет
  if (a.join('') === word && word.length > 1) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

/**
 * Собери слово: буквы перемешаны, подсказка — перевод.
 * Собирается кликами, поэтому греческая раскладка не нужна.
 */
export default function AnagramGame() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * WORDS.length));
  const current = WORDS[index];
  const [tiles, setTiles] = useState<string[]>(() => shuffled(current.word));
  /** индексы использованных плиток, по порядку набора */
  const [picked, setPicked] = useState<number[]>([]);

  const built = useMemo(() => picked.map((i) => tiles[i]).join(''), [picked, tiles]);
  const full = built.length === current.word.length;
  const right = full && built === current.word;

  const pick = useCallback(
    (i: number) => {
      if (picked.includes(i) || full) return;
      setPicked((prev) => [...prev, i]);
    },
    [picked, full],
  );

  const [party, setParty] = useState(false);
  useEffect(() => {
    if (right) setParty(true);
  }, [right]);

  const undo = useCallback(() => setPicked((prev) => prev.slice(0, -1)), []);

  const next = useCallback(() => {
    setParty(false);
    setIndex((prev) => {
      let i = Math.floor(Math.random() * WORDS.length);
      if (i === prev && WORDS.length > 1) i = (i + 1) % WORDS.length;
      setTiles(shuffled(WORDS[i].word));
      return i;
    });
    setPicked([]);
  }, []);

  /** подсказка: ставим следующую правильную букву */
  const hint = useCallback(() => {
    if (full) return;
    const need = current.word[built.length];
    const free = tiles.findIndex((t, i) => t === need && !picked.includes(i));
    if (free >= 0) setPicked((prev) => [...prev, free]);
  }, [built.length, current.word, full, picked, tiles]);

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
        Собери слово
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
        Буквы перепутались. Соберите греческое слово по переводу.
      </Typography>

      <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: 15, color: INK, mb: 1.5 }}>
        Подсказка: <Box component="span" sx={{ color: HERO_VIOLET }}>{current.ru}</Box>
      </Typography>

      {/* набранное слово */}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1, mb: 2 }}
      >
        {current.word.split('').map((_, i) => {
          const ch = built[i] ?? '';
          return (
            <Box
              key={i}
              sx={{
                width: { xs: 32, sm: 38 },
                height: { xs: 40, sm: 46 },
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1.5,
                border: `3px solid ${INK}`,
                bgcolor: full ? (right ? '#C8E6C9' : '#FFCDD2') : '#FFFDF2',
                fontWeight: 900,
                fontSize: { xs: 18, sm: 21 },
                color: INK,
              }}
            >
              {ch}
            </Box>
          );
        })}
      </Stack>

      {/* перемешанные буквы */}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1, mb: 2 }}
      >
        {tiles.map((t, i) => {
          const used = picked.includes(i);
          return (
            <Box
              key={`${t}-${i}`}
              component="button"
              type="button"
              disabled={used}
              onClick={() => pick(i)}
              aria-label={`Буква ${t}`}
              sx={{
                width: { xs: 32, sm: 38 },
                height: { xs: 40, sm: 46 },
                cursor: used ? 'default' : 'pointer',
                borderRadius: 1.5,
                border: `3px solid ${INK}`,
                bgcolor: used ? '#EDE7F6' : YELLOW,
                color: used ? 'transparent' : INK,
                fontFamily: 'inherit',
                fontWeight: 900,
                fontSize: { xs: 18, sm: 21 },
                opacity: used ? 0.5 : 1,
                '&:hover': used ? {} : { bgcolor: '#FFE056' },
              }}
            >
              {t}
            </Box>
          );
        })}
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1 }}
      >
        <Button
          variant="outlined"
          startIcon={<BackspaceIcon />}
          onClick={undo}
          disabled={!picked.length}
          sx={{ color: INK, borderColor: INK, borderWidth: 2, fontWeight: 900 }}
        >
          Стереть
        </Button>
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
          variant="text"
          startIcon={<RefreshIcon />}
          onClick={next}
          sx={{ color: INK, fontWeight: 800 }}
        >
          Другое слово
        </Button>
      </Stack>

      {full && (
        <Typography
          sx={{
            mt: 1.5,
            textAlign: 'center',
            fontWeight: 900,
            fontSize: 15,
            color: right ? '#2E7D32' : '#C62828',
          }}
        >
          {right ? 'Μπράβο! Слово собрано.' : 'Не сходится — сотрите и попробуйте иначе.'}
        </Typography>
      )}

      <WinCelebration open={party} onClose={() => setParty(false)} />
    </Box>
  );
}
