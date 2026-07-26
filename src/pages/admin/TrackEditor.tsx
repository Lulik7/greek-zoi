import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import type { Level, LyricLine, Topic, Track } from '../../types';
import { useApp } from '../../store/AppContext';

interface Props {
  open: boolean;
  track: Track | null;
  levels: Level[];
  topics: Topic[];
  onClose: () => void;
  onSave: (t: Track) => void;
}

/** Служебный id для варианта «создать новую тему» в списке */
const NEW_TOPIC = '__new__';

const EMPTY: Track = {
  id: '',
  title: '',
  titleRu: '',
  artist: '',
  kind: 'song',
  levelIds: [],
  topicIds: [],
  audioUrl: '',
  free: false,
  lyrics: [],
  note: '',
  createdAt: '',
  published: true,
};

export default function TrackEditor({ open, track, levels, topics, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Track>(EMPTY);
  const [bulk, setBulk] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const { uploadFile, saveTopics } = useApp();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  /** Создаёт новую тему и возвращает её id */
  const addTopic = async (title: string): Promise<string | null> => {
    const clean = title.trim();
    if (!clean) return null;
    const id = `top-${Date.now().toString(36)}`;
    const next = [
      ...topics,
      { id, slug: id, title: clean, emoji: '⭐', order: topics.length + 1 },
    ];
    try {
      await saveTopics(next);
      return id;
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Не удалось добавить тему');
      return null;
    }
  };

  useEffect(() => {
    if (open) {
      setDraft(track ? { ...track, lyrics: track.lyrics.map((l) => ({ ...l })) } : { ...EMPTY });
      setUploaded(null);
      setUploadError('');
      setBulk('');
      setBulkOpen(false);
    }
  }, [open, track]);

  const set = <K extends keyof Track>(key: K, value: Track[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setLine = (i: number, patch: Partial<LyricLine>) =>
    setDraft((d) => ({
      ...d,
      lyrics: d.lyrics.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }));

  const addLine = () =>
    setDraft((d) => ({ ...d, lyrics: [...d.lyrics, { el: '', ru: '', time: undefined }] }));

  const removeLine = (i: number) =>
    setDraft((d) => ({ ...d, lyrics: d.lyrics.filter((_, idx) => idx !== i) }));

  /**
   * Массовая вставка текста: строки вида
   *   0:12 | Καλημέρα | Доброе утро
   * Время и перевод не обязательны.
   */
  const applyBulk = () => {
    const lines: LyricLine[] = bulk
      .split('\n')
      .map((raw) => raw.trim())
      .filter(Boolean)
      .map((raw) => {
        const parts = raw.split('|').map((p) => p.trim());
        let time: number | undefined;
        let el = parts[0] ?? '';
        let ru = parts[1] ?? '';
        const stamp = /^(\d{1,2}):(\d{2})(?:\.(\d+))?$/.exec(parts[0] ?? '');
        if (stamp && parts.length >= 2) {
          time = Number(stamp[1]) * 60 + Number(stamp[2]);
          el = parts[1] ?? '';
          ru = parts[2] ?? '';
        } else if (/^\d+(\.\d+)?$/.test(parts[0] ?? '') && parts.length >= 2) {
          time = Number(parts[0]);
          el = parts[1] ?? '';
          ru = parts[2] ?? '';
        }
        return { time, el, ru };
      });
    setDraft((d) => ({ ...d, lyrics: lines }));
    setBulkOpen(false);
  };

  const pickFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadFile(file);
      setUploaded(file.name);
      set('audioUrl', url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Не удалось загрузить файл');
    } finally {
      setUploading(false);
    }
  };

  const valid = draft.title.trim() && draft.audioUrl.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{track ? 'Редактирование материала' : 'Новый материал'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Название (по-гречески)"
              value={draft.title}
              onChange={(e) => set('title', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Перевод названия"
              value={draft.titleRu}
              onChange={(e) => set('titleRu', e.target.value)}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Исполнитель / участники диалога"
              value={draft.artist}
              onChange={(e) => set('artist', e.target.value)}
              fullWidth
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Тип</InputLabel>
              <Select
                label="Тип"
                value={draft.kind}
                onChange={(e) => set('kind', e.target.value as Track['kind'])}
              >
                <MenuItem value="song">Песня</MenuItem>
                <MenuItem value="dialogue">Диалог</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Уровни</InputLabel>
              <Select
                multiple
                label="Уровни"
                value={draft.levelIds}
                onChange={(e) => set('levelIds', e.target.value as string[])}
                input={<OutlinedInput label="Уровни" />}
                renderValue={(sel) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(sel as string[]).map((id) => (
                      <Chip key={id} size="small" label={levels.find((l) => l.id === id)?.code} />
                    ))}
                  </Box>
                )}
              >
                {levels.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.code} — {l.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Тему можно выбрать из списка или придумать свою: впишите название и
                нажмите «Добавить» — она сразу появится и в списке, и на сайте */}
            <Autocomplete
              multiple
              freeSolo
              fullWidth
              // стрелка-треугольник и раскрытие списка по щелчку — как у обычного списка
              forcePopupIcon
              openOnFocus
              options={topics}
              value={topics.filter((t) => draft.topicIds.includes(t.id))}
              getOptionLabel={(o) => (typeof o === 'string' ? o : `${o.emoji} ${o.title}`)}
              isOptionEqualToValue={(o, v) => (o as Topic).id === (v as Topic).id}
              filterOptions={(options, state) => {
                const q = state.inputValue.trim().toLowerCase();
                const found = options.filter((o) => o.title.toLowerCase().includes(q));
                const exists = options.some((o) => o.title.toLowerCase() === q);
                if (q && !exists) {
                  found.push({ id: NEW_TOPIC, slug: '', title: state.inputValue.trim(), emoji: '⭐', order: 0 });
                }
                return found;
              }}
              renderOption={(props, option) => {
                const t = option as Topic;
                return (
                  <li {...props} key={t.id === NEW_TOPIC ? 'new' : t.id}>
                    {t.id === NEW_TOPIC ? `➕ Добавить тему «${t.title}»` : `${t.emoji} ${t.title}`}
                  </li>
                );
              }}
              onChange={(_, values) => {
                const picked = values.filter((v): v is Topic => typeof v !== 'string');
                const fresh = picked.find((v) => v.id === NEW_TOPIC);
                if (fresh) {
                  void addTopic(fresh.title).then((id) => {
                    if (id) {
                      set('topicIds', [
                        ...picked.filter((v) => v.id !== NEW_TOPIC).map((v) => v.id),
                        id,
                      ]);
                    }
                  });
                  return;
                }
                set('topicIds', picked.map((v) => v.id));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Темы"
                  helperText="Нет нужной темы? Впишите своё название и нажмите «Добавить тему»"
                />
              )}
            />
          </Stack>

          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
              <TextField
                label="Ссылка на аудио (mp3)"
                value={draft.audioUrl}
                onChange={(e) => {
                  setUploaded(null);
                  set('audioUrl', e.target.value);
                }}
                fullWidth
                required
                helperText="Загрузите файл кнопкой справа или вставьте ссылку из внешнего хранилища"
              />
              <Button
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={18} /> : <UploadFileIcon />}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                sx={{ whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
              >
                {uploading ? 'Загрузка…' : 'Загрузить файл'}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
                hidden
                onChange={(e) => {
                  void pickFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </Stack>
            {uploaded && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Файл «{uploaded}» загружен на сервер. Ссылка подставлена в поле выше.
              </Alert>
            )}
            {uploadError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {uploadError}
              </Alert>
            )}
            {draft.audioUrl && (
              <Box component="audio" src={draft.audioUrl} controls sx={{ width: '100%', mt: 1.5 }} />
            )}
          </Box>

          <Stack direction="row" spacing={3}>
            <FormControlLabel
              control={
                <Switch checked={draft.free} onChange={(e) => set('free', e.target.checked)} />
              }
              label="Бесплатный (доступен без подписки)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={draft.published}
                  onChange={(e) => set('published', e.target.checked)}
                />
              }
              label="Опубликован"
            />
          </Stack>

          <TextField
            label="Заметка преподавателя"
            value={draft.note}
            onChange={(e) => set('note', e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <Divider />

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">Текст с переводом ({draft.lyrics.length})</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<ContentPasteIcon />} onClick={() => setBulkOpen((v) => !v)}>
                Вставить текст целиком
              </Button>
              <Button size="small" startIcon={<AddIcon />} onClick={addLine}>
                Строка
              </Button>
            </Stack>
          </Stack>

          {bulkOpen && (
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                По одной строке. Формат: <code>0:12 | Καλημέρα | Доброе утро</code>. Время и
                перевод не обязательны.
              </Typography>
              <TextField
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                fullWidth
                multiline
                minRows={5}
                sx={{ mt: 1, bgcolor: 'background.paper' }}
              />
              <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={applyBulk}>
                Разобрать и заменить текст
              </Button>
            </Box>
          )}

          <Stack spacing={1}>
            {draft.lyrics.map((line, i) => (
              <Stack
                key={i}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{
                  alignItems: { sm: 'flex-start' },
                  p: { xs: 1.5, sm: 0 },
                  borderRadius: 2,
                  bgcolor: { xs: 'action.hover', sm: 'transparent' },
                }}
              >
                <TextField
                  label="сек"
                  size="small"
                  value={line.time ?? ''}
                  onChange={(e) =>
                    setLine(i, { time: e.target.value === '' ? undefined : Number(e.target.value) })
                  }
                  sx={{ width: { xs: '100%', sm: 90 } }}
                  type="number"
                />
                <TextField
                  label="Греческий"
                  size="small"
                  value={line.el}
                  onChange={(e) => setLine(i, { el: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Перевод"
                  size="small"
                  value={line.ru}
                  onChange={(e) => setLine(i, { ru: e.target.value })}
                  fullWidth
                />
                <Tooltip title="Удалить строку">
                  <IconButton onClick={() => removeLine(i)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" disabled={!valid} onClick={() => onSave(draft)}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
