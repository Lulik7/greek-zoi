import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';
import { useApp } from '../../store/AppContext';
import type { Level, Topic } from '../../types';

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function TaxonomyAdmin() {
  const { db, saveLevels, saveTopics } = useApp();
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (db) {
      setLevels(db.levels);
      setTopics(db.topics);
    }
  }, [db]);

  if (!db) return null;

  const usedLevel = (id: string) => db.tracks.filter((t) => t.levelIds.includes(id)).length;
  const usedTopic = (id: string) => db.tracks.filter((t) => t.topicIds.includes(id)).length;

  const saveAll = async () => {
    await saveLevels(levels.map((l, i) => ({ ...l, order: i + 1 })));
    await saveTopics(topics.map((t, i) => ({ ...t, order: i + 1 })));
    setMsg('Сохранено');
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <Stack spacing={3}>
      {msg && <Alert severity="success">{msg}</Alert>}

      <Card>
        <CardContent>
          <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Уровни</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setLevels((l) => [
                  ...l,
                  {
                    id: `lvl-${Date.now()}`,
                    code: 'Новый',
                    title: '',
                    description: '',
                    order: l.length + 1,
                  },
                ])
              }
            >
              Добавить уровень
            </Button>
          </Stack>
          <Stack spacing={1}>
            {levels.map((l, i) => (
              <Stack
                key={l.id}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ alignItems: 'center' }}
              >
                <TextField
                  size="small"
                  label="Код"
                  value={l.code}
                  onChange={(e) =>
                    setLevels((arr) => arr.map((x, idx) => (idx === i ? { ...x, code: e.target.value } : x)))
                  }
                  sx={{ width: 110 }}
                />
                <TextField
                  size="small"
                  label="Описание"
                  value={l.description}
                  onChange={(e) =>
                    setLevels((arr) =>
                      arr.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)),
                    )
                  }
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary" sx={{ width: 110 }}>
                  {usedLevel(l.id)} матер.
                </Typography>
                <Box>
                  <IconButton size="small" onClick={() => setLevels((a) => move(a, i, i - 1))}>
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setLevels((a) => move(a, i, i + 1))}>
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <Tooltip title={usedLevel(l.id) ? 'Сначала снимите уровень с материалов' : 'Удалить'}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={usedLevel(l.id) > 0}
                        onClick={() => setLevels((a) => a.filter((_, idx) => idx !== i))}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Темы</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setTopics((t) => [
                  ...t,
                  {
                    id: `top-${Date.now()}`,
                    slug: `topic-${t.length + 1}`,
                    title: 'Новая тема',
                    emoji: '⭐',
                    order: t.length + 1,
                  },
                ])
              }
            >
              Добавить тему
            </Button>
          </Stack>
          <Stack spacing={1}>
            {topics.map((t, i) => (
              <Stack
                key={t.id}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ alignItems: 'center' }}
              >
                <TextField
                  size="small"
                  label="Значок"
                  value={t.emoji}
                  onChange={(e) =>
                    setTopics((arr) => arr.map((x, idx) => (idx === i ? { ...x, emoji: e.target.value } : x)))
                  }
                  sx={{ width: 90 }}
                />
                <TextField
                  size="small"
                  label="Название"
                  value={t.title}
                  onChange={(e) =>
                    setTopics((arr) => arr.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
                  }
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary" sx={{ width: 110 }}>
                  {usedTopic(t.id)} матер.
                </Typography>
                <Box>
                  <IconButton size="small" onClick={() => setTopics((a) => move(a, i, i - 1))}>
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setTopics((a) => move(a, i, i + 1))}>
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <Tooltip title={usedTopic(t.id) ? 'Сначала снимите тему с материалов' : 'Удалить'}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={usedTopic(t.id) > 0}
                        onClick={() => setTopics((a) => a.filter((_, idx) => idx !== i))}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Box>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={saveAll}>
          Сохранить уровни и темы
        </Button>
      </Box>
    </Stack>
  );
}
