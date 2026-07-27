import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useApp } from '../store/AppContext';
import SearchBar from '../components/SearchBar';
import FunFrame from '../components/FunFrame';
import TrackCard from '../components/TrackCard';
import LockedDialog from '../components/LockedDialog';
import { filterTracks, interpretQuery } from '../lib/search';
import type { Track } from '../types';
import { HERO_VIOLET, INK, YELLOW } from '../theme';

export default function CatalogPage() {
  const { db, logEvent } = useApp();
  const [params, setParams] = useSearchParams();
  const [locked, setLocked] = useState<Track | null>(null);

  const q = params.get('q') ?? '';
  const levelParam = params.get('level');
  const topicParam = params.get('topic');
  const trackParam = params.get('track');

  useEffect(() => {
    logEvent({ type: 'page', path: '/catalog', label: q || levelParam || topicParam || 'all' });
  }, [logEvent, q, levelParam, topicParam]);

  const intent = useMemo(
    () => (db ? interpretQuery(q, db.levels, db.topics) : null),
    [db, q],
  );

  const levelIds = useMemo(() => {
    const set = new Set<string>(intent?.levelIds ?? []);
    if (levelParam) set.add(levelParam);
    return [...set];
  }, [intent, levelParam]);

  const topicIds = useMemo(() => {
    const set = new Set<string>(intent?.topicIds ?? []);
    if (topicParam) set.add(topicParam);
    return [...set];
  }, [intent, topicParam]);

  const results = useMemo(() => {
    if (!db) return [];
    if (trackParam) return db.tracks.filter((t) => t.id === trackParam);
    return filterTracks(db.tracks, { levelIds, topicIds, text: intent?.text });
  }, [db, levelIds, topicIds, intent, trackParam]);

  if (!db) return null;

  const toggleParam = (key: 'level' | 'topic', value: string) => {
    const next = new URLSearchParams(params);
    next.delete('track');
    if (next.get(key) === value) next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const activeLevels = db.levels.filter((l) => levelIds.includes(l.id));
  const activeTopics = db.topics.filter((t) => topicIds.includes(t.id));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* древнегреческая нотация — картинка со свободной лицензией с Викисклада */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <FunFrame
            caption="Древнегреческая нотация: знаки для голоса и для инструмента"
            onLight
            tilt={-2}
            aspect="756 / 317"
            width={{ xs: 320, sm: 520, md: 700 }}
          >
            <Box
              component="img"
              src="/decor/greek-notation.png"
              alt="Таблица древнегреческой музыкальной нотации"
              loading="lazy"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </FunFrame>
        </Box>

        <SearchBar initial={q} />

        {/* Уровни и темы — с заливкой, чтобы выделялись на сиреневом фоне */}
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              bgcolor: '#ffffff',
              border: '1px solid rgba(33,25,95,0.1)',
              boxShadow: '0 8px 28px -18px rgba(33,25,95,0.35)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ mb: 1.5, fontWeight: 800, color: INK }}
            >
              Уровень
            </Typography>
            {/*
              Уровней ровно шесть и подписи короткие — на телефоне держим их
              в одну строку, иначе последний (Γ2) срывается на вторую.
              Перенос разрешаем только начиная с планшета.
            */}
            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1 }}
              useFlexGap
              sx={{ flexWrap: { xs: 'nowrap', sm: 'wrap' } }}
            >
              {db.levels.map((l) => {
                const on = levelIds.includes(l.id);
                return (
                  <Chip
                    key={l.id}
                    label={l.code}
                    clickable
                    onClick={() => toggleParam('level', l.id)}
                    sx={{
                      fontWeight: 800,
                      flex: { xs: '1 1 0', sm: '0 0 auto' },
                      minWidth: 0,
                      '& .MuiChip-label': { px: { xs: 0.75, sm: 1.5 } },
                      bgcolor: on ? HERO_VIOLET : 'rgba(124,122,207,0.12)',
                      color: on ? '#fff' : INK,
                      border: on ? 'none' : '1px solid rgba(124,122,207,0.35)',
                      '&:hover': {
                        bgcolor: on ? '#6B68C0' : 'rgba(124,122,207,0.22)',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              bgcolor: '#ffffff',
              border: '1px solid rgba(33,25,95,0.1)',
              boxShadow: '0 8px 28px -18px rgba(33,25,95,0.35)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ mb: 1.5, fontWeight: 800, color: INK }}
            >
              Тема
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {db.topics.map((t) => {
                const on = topicIds.includes(t.id);
                return (
                  <Chip
                    key={t.id}
                    label={`${t.emoji} ${t.title}`}
                    clickable
                    onClick={() => toggleParam('topic', t.id)}
                    sx={{
                      fontWeight: 700,
                      bgcolor: on ? YELLOW : 'rgba(250,218,27,0.18)',
                      color: INK,
                      border: on ? '1px solid rgba(33,25,95,0.2)' : '1px solid rgba(250,218,27,0.45)',
                      '&:hover': {
                        bgcolor: on ? '#FFE056' : 'rgba(250,218,27,0.32)',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Paper>
        </Stack>

        <Divider />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Typography variant="h5">
            {activeLevels.length || activeTopics.length
              ? `${[...activeLevels.map((l) => l.code), ...activeTopics.map((t) => t.title)].join(' · ')}`
              : q
                ? `Результаты по запросу «${q}»`
                : 'Все материалы'}
            <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
              ({results.length})
            </Typography>
          </Typography>

        </Stack>

        {results.length === 0 && (
          <Alert severity="info">
            Ничего не нашлось. Попробуйте выбрать уровень или тему кнопками выше — например
            «A1» или «Покупки».
          </Alert>
        )}

        <Stack spacing={2}>
          {results.map((t) => (
            <TrackCard
              key={t.id}
              track={t}
              levels={db.levels}
              topics={db.topics}
              onLocked={setLocked}
              defaultOpen={!!trackParam}
            />
          ))}
        </Stack>
      </Stack>

      <LockedDialog track={locked} onClose={() => setLocked(null)} />
    </Container>
  );
}
