import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import WinCelebration from './WinCelebration';
import { cartoonTitle, HERO_VIOLET, INK, TEXT_MUTED, YELLOW } from '../../theme';

/** Фразы разбиты на слова — их и надо расставить по порядку */
const PHRASES: { words: string[]; ru: string }[] = [
  { words: ['Καλημέρα,', 'τι', 'κάνεις;'], ru: 'Доброе утро, как дела?' },
  { words: ['Πώς', 'σε', 'λένε;'], ru: 'Как тебя зовут?' },
  { words: ['Μιλάς', 'ελληνικά;'], ru: 'Ты говоришь по-гречески?' },
  { words: ['Θέλω', 'έναν', 'καφέ,', 'παρακαλώ.'], ru: 'Я хочу кофе, пожалуйста.' },
  { words: ['Πόσο', 'κάνει', 'αυτό;'], ru: 'Сколько это стоит?' },
  { words: ['Δεν', 'καταλαβαίνω,', 'συγγνώμη.'], ru: 'Я не понимаю, извините.' },
  { words: ['Η', 'θάλασσα', 'είναι', 'πολύ', 'όμορφη.'], ru: 'Море очень красивое.' },
  { words: ['Με', 'λένε', 'Ζωή.'], ru: 'Меня зовут Зоя.' },
  { words: ['Πού', 'είναι', 'η', 'αγορά;'], ru: 'Где рынок?' },
  { words: ['Ευχαριστώ', 'πολύ!'], ru: 'Большое спасибо!' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Собери фразу: слова перемешаны, подсказка — перевод */
export default function PhraseBuilderGame() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * PHRASES.length));
  const phrase = PHRASES[index];
  const [tiles, setTiles] = useState<string[]>(() => shuffle(phrase.words));
  const [picked, setPicked] = useState<number[]>([]);
  const [party, setParty] = useState(false);

  const built = useMemo(() => picked.map((i) => tiles[i]), [picked, tiles]);
  const full = built.length === phrase.words.length;
  const right = full && built.join(' ') === phrase.words.join(' ');

  const pick = useCallback(
    (i: number) => {
      if (picked.includes(i) || full) return;
      const next = [...picked, i];
      setPicked(next);
      if (
        next.length === phrase.words.length &&
        next.map((k) => tiles[k]).join(' ') === phrase.words.join(' ')
      ) {
        setParty(true);
      }
    },
    [picked, full, phrase.words, tiles],
  );

  const undo = useCallback(() => setPicked((prev) => prev.slice(0, -1)), []);

  const next = useCallback(() => {
    setParty(false);
    setPicked([]);
    setIndex((prev) => {
      let i = Math.floor(Math.random() * PHRASES.length);
      if (i === prev && PHRASES.length > 1) i = (i + 1) % PHRASES.length;
      setTiles(shuffle(PHRASES[i].words));
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
        Собери фразу
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
        Слова перепутались. Поставьте их по порядку.
      </Typography>

      <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: 15, color: INK, mb: 1.5 }}>
        Перевод: <Box component="span" sx={{ color: HERO_VIOLET }}>{phrase.ru}</Box>
      </Typography>

      {/* собранная строка */}
      <Box
        sx={{
          minHeight: 58,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75,
          justifyContent: 'center',
          alignItems: 'center',
          p: 1.25,
          mb: 2,
          borderRadius: 2.5,
          border: `3px dashed ${full ? (right ? '#2E7D32' : '#C62828') : HERO_VIOLET}`,
          bgcolor: full ? (right ? '#E8F5E9' : '#FFEBEE') : '#FFFDF2',
        }}
      >
        {built.length === 0 ? (
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_MUTED }}>
            нажимайте слова по очереди
          </Typography>
        ) : (
          built.map((w, i) => (
            <Box
              key={`${w}-${i}`}
              sx={{ fontWeight: 900, fontSize: { xs: 16, sm: 19 }, color: INK }}
            >
              {w}
            </Box>
          ))
        )}
      </Box>

      {/* перемешанные слова */}
      <Stack
        direction="row"
        spacing={1}
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
              sx={{
                px: 1.5,
                py: 1,
                cursor: used ? 'default' : 'pointer',
                borderRadius: 2,
                border: `3px solid ${INK}`,
                bgcolor: used ? '#EDE7F6' : YELLOW,
                color: used ? 'transparent' : INK,
                opacity: used ? 0.5 : 1,
                fontFamily: 'inherit',
                fontWeight: 900,
                fontSize: { xs: 15, sm: 17 },
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
          Другая фраза
        </Button>
      </Stack>

      {full && !right && (
        <Typography
          sx={{ mt: 1.5, textAlign: 'center', fontWeight: 900, fontSize: 14, color: '#C62828' }}
        >
          Порядок не тот — сотрите и попробуйте иначе.
        </Typography>
      )}

      <WinCelebration open={party} onClose={() => setParty(false)} />
    </Box>
  );
}
