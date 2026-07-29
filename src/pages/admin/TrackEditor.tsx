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
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { Level, LyricLine, Topic, Track } from '../../types';
import { useApp } from '../../store/AppContext';
import { isVideoPageUrl } from '../../lib/video';

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
    }
  }, [open, track]);

  const set = <K extends keyof Track>(key: K, value: Track[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  /*
   * Текст материала вводится целиком: в одно поле весь оригинал, в другое
   * весь перевод. Строки сопоставляются по порядку — первая с первой,
   * вторая со второй. Так текст песни просто вставляется из документа,
   * а не набивается по строчке.
   */
  const elText = draft.lyrics.map((l) => l.el).join('\n');
  const ruText = draft.lyrics.map((l) => l.ru).join('\n');

  const setLyrics = (nextEl: string, nextRu: string) => {
    const el = nextEl.split('\n');
    const ru = nextRu.split('\n');
    const lines: LyricLine[] = [];
    for (let i = 0; i < Math.max(el.length, ru.length); i += 1) {
      lines.push({ el: el[i] ?? '', ru: ru[i] ?? '' });
    }
    setDraft((d) => ({ ...d, lyrics: lines }));
  };

  /** Пустые строки в конце в базу не пишем — они появляются от лишних переносов */
  const handleSave = () => {
    const lyrics = [...draft.lyrics];
    while (lyrics.length && !lyrics[lyrics.length - 1].el.trim() && !lyrics[lyrics.length - 1].ru.trim()) {
      lyrics.pop();
    }
    onSave({ ...draft, lyrics });
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
              label="Исполнитель"
              value={draft.artist}
              onChange={(e) => set('artist', e.target.value)}
              fullWidth
            />
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
                error={isVideoPageUrl(draft.audioUrl)}
                helperText={
                  isVideoPageUrl(draft.audioUrl)
                    ? 'Это ссылка на страницу видео, а не на звуковой файл — плеер её не откроет. Загрузите mp3 кнопкой справа.'
                    : 'Загрузите файл кнопкой справа или вставьте ссылку из внешнего хранилища'
                }
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

          <Typography variant="subtitle1">Текст с переводом</Typography>
          <Typography variant="body2" color="text.secondary">
            Вставьте текст целиком в левое поле, перевод — в правое. Строки встают друг
            напротив друга: первая строка перевода относится к первой строке оригинала.
            Пустую строку можно оставить, чтобы отделить куплет.
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Текст на греческом"
              value={elText}
              onChange={(e) => setLyrics(e.target.value, ruText)}
              fullWidth
              multiline
              minRows={10}
              placeholder={'Καλημέρα, αγάπη μου\nΟ ήλιος βγήκε στο βουνό'}
            />
            <TextField
              label="Перевод"
              value={ruText}
              onChange={(e) => setLyrics(elText, e.target.value)}
              fullWidth
              multiline
              minRows={10}
              placeholder={'Доброе утро, любовь моя\nСолнце взошло над горой'}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Строк текста: {draft.lyrics.length}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" disabled={!valid} onClick={handleSave}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
