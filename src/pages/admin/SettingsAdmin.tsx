import { useEffect, useState } from 'react';
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
import SendIcon from '@mui/icons-material/Send';
import { api } from '../../api/client';
import { useApp } from '../../store/AppContext';
import type { SiteSettings } from '../../types';
import VideoBlock from '../../components/VideoBlock';

export default function SettingsAdmin() {
  const { db, user, saveSettings } = useApp();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [msg, setMsg] = useState('');
  const [mailTo, setMailTo] = useState('');
  const [mailBusy, setMailBusy] = useState(false);
  const [mailResult, setMailResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (db) setS(db.settings);
  }, [db]);

  // по умолчанию проверяем на почту администратора — её точно видно
  useEffect(() => {
    if (user?.email) setMailTo((prev) => prev || user.email);
  }, [user]);

  const testMail = async () => {
    setMailBusy(true);
    setMailResult(null);
    try {
      const res = await api.testMail(mailTo);
      setMailResult({
        ok: true,
        text: `Письмо отправлено на ${res.to}. Проверьте почту, загляните и в «Спам».`,
      });
    } catch (e) {
      setMailResult({
        ok: false,
        text: e instanceof Error ? e.message : 'Письмо не отправилось',
      });
    } finally {
      setMailBusy(false);
    }
  };

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
                label="Viber / WhatsApp"
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
                label="Facebook — имя страницы"
                value={s.contactFacebook}
                onChange={(e) => set('contactFacebook', e.target.value)}
                fullWidth
              />
            </Stack>
            <TextField
              label="Facebook — ссылка"
              value={s.contactFacebookUrl}
              onChange={(e) => set('contactFacebookUrl', e.target.value)}
              fullWidth
              helperText="Сюда же ведёт жёлтая надпись с названием школы на главной"
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Проверка почты
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Сайт отправляет ученикам подтверждение адреса и восстановление пароля.
            Нажмите кнопку — придёт пробное письмо. Если что-то не так, здесь же
            появится причина.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
            <TextField
              label="Кому отправить"
              value={mailTo}
              onChange={(e) => setMailTo(e.target.value)}
              fullWidth
              placeholder="ваша почта"
            />
            <Button
              variant="outlined"
              startIcon={mailBusy ? <CircularProgress size={18} /> : <SendIcon />}
              onClick={testMail}
              disabled={mailBusy}
              sx={{ whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
            >
              {mailBusy ? 'Отправляю…' : 'Отправить пробное письмо'}
            </Button>
          </Stack>
          {/* ответ сервиса приходит второй строкой — переносы не съедаем */}
          {mailResult && (
            <Alert
              severity={mailResult.ok ? 'success' : 'error'}
              sx={{ mt: 2, whiteSpace: 'pre-line' }}
            >
              {mailResult.text}
            </Alert>
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
            <VideoBlock title="" url={s.featuredVideoUrl} badge="Предпросмотр" />
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
