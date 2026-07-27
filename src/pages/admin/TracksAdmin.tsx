import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useApp } from '../../store/AppContext';
import TrackEditor from './TrackEditor';
import type { Track } from '../../types';
import { normalize } from '../../lib/search';

export default function TracksAdmin() {
  const { db, saveTrack, createTrack, deleteTrack } = useApp();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const [editing, setEditing] = useState<Track | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const rows = useMemo(() => {
    if (!db) return [];
    const needle = normalize(q);
    return db.tracks
      .filter((t) => (levelFilter === 'all' ? true : t.levelIds.includes(levelFilter)))
      .filter((t) => (needle ? normalize(`${t.title} ${t.titleRu} ${t.artist}`).includes(needle) : true));
  }, [db, q, levelFilter]);

  if (!db) return null;

  const handleSave = async (t: Track) => {
    if (t.id) await saveTrack(t);
    else {
      const { id: _id, createdAt: _createdAt, ...rest } = t;
      await createTrack(rest);
    }
    setOpen(false);
  };

  const duplicate = (t: Track) => {
    const { id: _id, createdAt: _createdAt, ...rest } = t;
    void createTrack({ ...rest, title: `${t.title} (копия)`, published: false });
  };

  const remove = (t: Track) => {
    if (confirm(`Удалить «${t.title}»? Действие необратимо.`)) void deleteTrack(t.id);
  };

  const levelChips = (t: Track) =>
    db.levels.filter((l) => t.levelIds.includes(l.id)).map((l) => (
      <Chip key={l.id} size="small" label={l.code} />
    ));

  const topicChips = (t: Track) =>
    db.topics.filter((tp) => t.topicIds.includes(tp.id)).map((tp) => (
      <Chip key={tp.id} size="small" variant="outlined" label={tp.title} />
    ));

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 2, alignItems: { md: 'center' } }}
      >
        <TextField
          size="small"
          placeholder="Поиск по названию"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ minWidth: { sm: 240 } }}
          fullWidth={compact}
        />
        <Select
          size="small"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          fullWidth={compact}
        >
          <MenuItem value="all">Все уровни</MenuItem>
          {db.levels.map((l) => (
            <MenuItem key={l.id} value={l.id}>
              {l.code}
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth={compact}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Добавить материал
        </Button>
      </Stack>

      {compact ? (
        <Stack spacing={1.5}>
          {rows.map((t) => (
            <Card key={t.id}>
              <CardContent>
                <Typography sx={{ fontWeight: 600 }}>{t.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.titleRu} · строк текста: {t.lyrics.length}
                </Typography>
                <Stack direction="row" spacing={0.5} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
                  {levelChips(t)}
                  {topicChips(t)}
                </Stack>
                <Stack
                  direction="row"
                  useFlexGap
                  sx={{ mt: 1, flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={t.free}
                        onChange={(e) => saveTrack({ ...t, free: e.target.checked })}
                      />
                    }
                    label="Бесплатно"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={t.published}
                        onChange={(e) => saveTrack({ ...t, published: e.target.checked })}
                      />
                    }
                    label="Опубликован"
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    onClick={() => {
                      setEditing(t);
                      setOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => duplicate(t)}>
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => remove(t)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Уровни</TableCell>
                <TableCell>Темы</TableCell>
                <TableCell align="center">Бесплатно</TableCell>
                <TableCell align="center">Опубликован</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {t.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.titleRu} · {t.kind === 'song' ? 'песня' : 'диалог'} · строк текста:{' '}
                      {t.lyrics.length}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {levelChips(t)}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {topicChips(t)}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={t.free}
                      onChange={(e) => saveTrack({ ...t, free: e.target.checked })}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={t.published}
                      onChange={(e) => saveTrack({ ...t, published: e.target.checked })}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Редактировать">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(t);
                          setOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Дублировать">
                      <IconButton size="small" onClick={() => duplicate(t)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton size="small" color="error" onClick={() => remove(t)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TrackEditor
        open={open}
        track={editing}
        levels={db.levels}
        topics={db.topics}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
