import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useApp } from '../../store/AppContext';
import type { SiteSettings } from '../../types';
import VideoBlock from '../../components/VideoBlock';

export default function SettingsAdmin() {
  const { db, saveSettings, uploadFile } = useApp();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (db) setS(db.settings);
  }, [db]);

  if (!s) return null;

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setS((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async () => {
    await saveSettings(s);
    setMsg('Сохранено');
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <Stack spacing={3}>
      {msg && <Alert severity="success">{msg}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Заголовок и контакты
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Название сайта"
              value={s.title}
              onChange={(e) => set('title', e.target.value)}
              fullWidth
              helperText="Тире делит название на две строки в шапке: «СЛУШАЮ ГРЕЧЕСКИЙ — ГОВОРЮ ПО-ГРЕЧЕСКИ»"
            />
            <TextField
              label="Название школы (показывается под названием сайта)"
              value={s.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Телефон"
                value={s.contactPhone}
                onChange={(e) => set('contactPhone', e.target.value)}
                fullWidth
              />
              <TextField
                label="Почта"
                value={s.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Telegram"
                value={s.contactTelegram}
                onChange={(e) => set('contactTelegram', e.target.value)}
                fullWidth
              />
              <TextField
                label="Instagram"
                value={s.contactInstagram}
                onChange={(e) => set('contactInstagram', e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Цитата в самой верхней полосе
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Показывается на всех страницах рядом с меню. Держите строки короткими — длинные
            обрезаются на узких экранах.
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Цитата по-гречески"
              value={s.heroQuoteEl}
              onChange={(e) => set('heroQuoteEl', e.target.value)}
              fullWidth
            />
            <TextField
              label="Перевод по-русски"
              value={s.heroQuoteRu}
              onChange={(e) => set('heroQuoteRu', e.target.value)}
              fullWidth
            />
            <TextField
              label="Источник (например, «греческая народная мудрость»)"
              value={s.heroQuoteSource}
              onChange={(e) => set('heroQuoteSource', e.target.value)}
              fullWidth
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Фотография в блоке с названием школы
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Фото станет фоном синего блока на главной. Поверх него ляжет затемнение, чтобы
            надписи оставались читаемыми. Лучше всего подходит горизонтальный снимок шириной
            от 1600 точек. Если фото не выбрано, остаётся однотонный фон.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
            <TextField
              label="Ссылка на фото"
              value={s.heroImageUrl}
              onChange={(e) => set('heroImageUrl', e.target.value)}
              fullWidth
              placeholder="Загрузите файл кнопкой справа или вставьте адрес"
            />
            <Button
              variant="outlined"
              startIcon={uploading ? <CircularProgress size={18} /> : <UploadFileIcon />}
              onClick={() => imageRef.current?.click()}
              disabled={uploading}
              sx={{ whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
            >
              {uploading ? 'Загрузка…' : 'Загрузить фото'}
            </Button>
            {s.heroImageUrl && (
              <Button color="error" onClick={() => set('heroImageUrl', '')}>
                Убрать
              </Button>
            )}
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                setUploading(true);
                setUploadError('');
                try {
                  set('heroImageUrl', await uploadFile(file));
                } catch (err) {
                  setUploadError(err instanceof Error ? err.message : 'Не удалось загрузить фото');
                } finally {
                  setUploading(false);
                }
              }}
            />
          </Stack>
          {uploadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {uploadError}
            </Alert>
          )}
          {s.heroImageUrl && (
            <Box
              sx={{
                mt: 2,
                height: 220,
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                backgroundImage: `url(${s.heroImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 26,
                  textAlign: 'center',
                  background:
                    'linear-gradient(180deg, rgba(33,25,95,.72) 0%, rgba(124,122,207,.55) 100%)',
                }}
              >
                Так это будет выглядеть
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Видео на главной
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Для YouTube нужна ссылка вида <code>https://www.youtube.com/embed/КОД</code>. Код —
            это часть после <code>watch?v=</code> в обычной ссылке.
          </Alert>
          <Stack spacing={2}>
            <TextField
              label="Заголовок видео-инструкции"
              value={s.instructionVideoTitle}
              onChange={(e) => set('instructionVideoTitle', e.target.value)}
              fullWidth
            />
            <TextField
              label="Ссылка на видео-инструкцию"
              value={s.instructionVideoUrl}
              onChange={(e) => set('instructionVideoUrl', e.target.value)}
              fullWidth
            />
            <TextField
              label="Заголовок сменного видео (песня месяца)"
              value={s.featuredVideoTitle}
              onChange={(e) => set('featuredVideoTitle', e.target.value)}
              fullWidth
            />
            <TextField
              label="Ссылка на сменное видео"
              value={s.featuredVideoUrl}
              onChange={(e) => set('featuredVideoUrl', e.target.value)}
              fullWidth
            />
            <TextField
              label="Описание сменного видео"
              value={s.featuredVideoDescription}
              onChange={(e) => set('featuredVideoDescription', e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>

          <Box
            sx={{
              mt: 3,
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            <VideoBlock title={s.instructionVideoTitle} url={s.instructionVideoUrl} badge="Предпросмотр" />
            <VideoBlock title={s.featuredVideoTitle} url={s.featuredVideoUrl} badge="Предпросмотр" />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Тарифы подписки</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                set('plans', [
                  ...s.plans,
                  {
                    id: `plan-${Date.now()}`,
                    title: 'Новый тариф',
                    priceEur: 10,
                    periodDays: 30,
                    features: [],
                  },
                ])
              }
            >
              Добавить тариф
            </Button>
          </Stack>
          <Stack spacing={2}>
            {s.plans.map((p, i) => (
              <Stack
                key={p.id}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ alignItems: 'center' }}
              >
                <TextField
                  size="small"
                  label="Название"
                  value={p.title}
                  onChange={(e) =>
                    set('plans', s.plans.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
                  }
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Цена, €"
                  type="number"
                  value={p.priceEur}
                  onChange={(e) =>
                    set(
                      'plans',
                      s.plans.map((x, idx) => (idx === i ? { ...x, priceEur: Number(e.target.value) } : x)),
                    )
                  }
                  sx={{ width: 120 }}
                />
                <TextField
                  size="small"
                  label="Дней"
                  type="number"
                  value={p.periodDays}
                  onChange={(e) =>
                    set(
                      'plans',
                      s.plans.map((x, idx) => (idx === i ? { ...x, periodDays: Number(e.target.value) } : x)),
                    )
                  }
                  sx={{ width: 110 }}
                />
                <TextField
                  size="small"
                  label="Что входит (через ;)"
                  value={p.features.join('; ')}
                  onChange={(e) =>
                    set(
                      'plans',
                      s.plans.map((x, idx) =>
                        idx === i
                          ? { ...x, features: e.target.value.split(';').map((f) => f.trim()).filter(Boolean) }
                          : x,
                      ),
                    )
                  }
                  fullWidth
                />
                <IconButton
                  color="error"
                  onClick={() => set('plans', s.plans.filter((_, idx) => idx !== i))}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Box>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={save}>
          Сохранить настройки
        </Button>
      </Box>
    </Stack>
  );
}
