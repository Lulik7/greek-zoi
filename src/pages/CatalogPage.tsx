import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useApp } from '../store/AppContext';
import SearchBar from '../components/SearchBar';
import TrackCard from '../components/TrackCard';
import LockedDialog from '../components/LockedDialog';
import { filterTracks, interpretQuery } from '../lib/search';
import type { Track } from '../types';

export default function CatalogPage() {
  const { db, logEvent } = useApp();
  const [params, setParams] = useSearchParams();
  const [locked, setLocked] = useState<Track | null>(null);
  const [kind, setKind] = useState<'all' | 'song' | 'dialogue'>('all');

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
    return filterTracks(db.tracks, { levelIds, topicIds, text: intent?.text, kind });
  }, [db, levelIds, topicIds, intent, kind, trackParam]);

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
        <SearchBar initial={q} />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Уровень
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {db.levels.map((l) => (
              <Chip
                key={l.id}
                label={l.code}
                clickable
                color={levelIds.includes(l.id) ? 'primary' : 'default'}
                variant={levelIds.includes(l.id) ? 'filled' : 'outlined'}
                onClick={() => toggleParam('level', l.id)}
              />
            ))}
          </Stack>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
            Тема
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {db.topics.map((t) => (
              <Chip
                key={t.id}
                label={`${t.emoji} ${t.title}`}
                clickable
                color={topicIds.includes(t.id) ? 'primary' : 'default'}
                variant={topicIds.includes(t.id) ? 'filled' : 'outlined'}
                onClick={() => toggleParam('topic', t.id)}
              />
            ))}
          </Stack>
        </Box>

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

          <ToggleButtonGroup
            size="small"
            exclusive
            value={kind}
            onChange={(_, v) => v && setKind(v)}
          >
            <ToggleButton value="all">Все</ToggleButton>
            <ToggleButton value="song">Песни</ToggleButton>
            <ToggleButton value="dialogue">Диалоги</ToggleButton>
          </ToggleButtonGroup>
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
