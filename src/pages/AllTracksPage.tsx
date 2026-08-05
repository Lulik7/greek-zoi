import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ForumIcon from '@mui/icons-material/Forum';
import { useApp } from '../store/AppContext';
import { normalize } from '../lib/search';
import { usePageMeta } from '../lib/pageMeta';
import type { Track } from '../types';

export default function AllTracksPage() {
  const { db, hasAccess, logEvent } = useApp();
  const nav = useNavigate();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const [q, setQ] = useState('');

  usePageMeta(
    'Все материалы',
    'Полный список песен и диалогов школы: название, уровень, тема и доступ. Поиск по всему собранию.',
  );

  useEffect(() => {
    logEvent({ type: 'page', path: '/all' });
  }, [logEvent]);

  const rows = useMemo(() => {
    if (!db) return [];
    const needle = normalize(q);
    return db.tracks
      .filter((t) => t.published)
      .filter((t) => (needle ? normalize(`${t.title} ${t.titleRu} ${t.artist}`).includes(needle) : true))
      .sort((a, b) => a.titleRu.localeCompare(b.titleRu, 'ru'));
  }, [db, q]);

  if (!db) return null;

  const isOpen = (t: Track) => (t.locked === undefined ? t.free || hasAccess : !t.locked);
  const levelsOf = (t: Track) => db.levels.filter((l) => t.levelIds.includes(l.id));
  const topicsOf = (t: Track) => db.topics.filter((tp) => t.topicIds.includes(tp.id));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 1, fontSize: { xs: 26, md: 34 } }}>
        Полный список материалов
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Все материалы школы — {rows.length} шт. Нажмите, чтобы открыть материал.
      </Typography>

      <TextField
        fullWidth
        placeholder="Фильтр по названию"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        sx={{ mb: 2 }}
      />

      {compact ? (
        <Stack spacing={1.5}>
          {rows.map((t) => (
            <Card key={t.id}>
              <CardActionArea onClick={() => nav(`/catalog?track=${t.id}`)} sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                  {t.kind === 'song' ? (
                    <MusicNoteIcon color="primary" />
                  ) : (
                    <ForumIcon color="action" />
                  )}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>{t.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.titleRu}
                    </Typography>
                    <Stack direction="row" spacing={0.5} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
                      {levelsOf(t).map((l) => (
                        <Chip key={l.id} size="small" color="primary" variant="outlined" label={l.code} />
                      ))}
                      {topicsOf(t).map((tp) => (
                        <Chip key={tp.id} size="small" variant="outlined" label={tp.title} />
                      ))}
                    </Stack>
                  </Box>
                  {isOpen(t) ? (
                    <LockOpenIcon fontSize="small" color="success" />
                  ) : (
                    <LockIcon fontSize="small" color="disabled" />
                  )}
                </Stack>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Название</TableCell>
                <TableCell>Перевод</TableCell>
                <TableCell>Уровни</TableCell>
                <TableCell>Темы</TableCell>
                <TableCell align="right">Доступ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/catalog?track=${t.id}`)}
                >
                  <TableCell sx={{ width: 40 }}>
                    {t.kind === 'song' ? (
                      <MusicNoteIcon fontSize="small" color="primary" />
                    ) : (
                      <ForumIcon fontSize="small" color="action" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {t.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.artist}
                    </Typography>
                  </TableCell>
                  <TableCell>{t.titleRu}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {levelsOf(t).map((l) => (
                        <Chip key={l.id} size="small" label={l.code} variant="outlined" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {topicsOf(t).map((tp) => (
                        <Chip key={tp.id} size="small" label={tp.title} variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {isOpen(t) ? (
                      <LockOpenIcon fontSize="small" color="success" />
                    ) : (
                      <LockIcon fontSize="small" color="disabled" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
