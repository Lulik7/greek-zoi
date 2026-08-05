import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { api } from '../api/client';
import { useApp } from '../store/AppContext';

/*
 * Страница, на которую ведёт ссылка из письма с подтверждением почты.
 * Сам код подтверждения уходит на сервер отдельным запросом: раньше ссылка
 * вела прямо в API, и Google Safe Browsing помечал её как мошенническую —
 * ученик видел красный предупреждающий экран вместо сайта.
 */
export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { refresh } = useApp();
  const token = params.get('token') ?? '';
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  // строгий режим React вызывает эффект дважды, а код подтверждения одноразовый:
  // второй вызов получил бы «ссылка устарела» и затёр успешный ответ
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    (async () => {
      try {
        await api.confirmEmail(token);
        await refresh();
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не удалось подтвердить почту');
      }
    })();
  }, [token, refresh]);

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Подтверждение почты
          </Typography>

          {!token ? (
            <Alert severity="error">
              В ссылке нет кода подтверждения. Откройте письмо ещё раз и нажмите на ссылку
              целиком — она могла разорваться при переносе строки.
            </Alert>
          ) : error ? (
            <Stack spacing={2}>
              <Alert severity="error">{error}</Alert>
              <Typography color="text.secondary">
                Войдите в аккаунт и запросите письмо заново — ссылка действует ограниченное
                время и срабатывает один раз.
              </Typography>
              <Button variant="contained" onClick={() => nav('/')}>
                На главную
              </Button>
            </Stack>
          ) : done ? (
            <Stack spacing={2}>
              <Alert severity="success">Почта подтверждена, вы вошли в аккаунт.</Alert>
              <Button variant="contained" onClick={() => nav('/catalog')}>
                Перейти к материалам
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <CircularProgress size={22} />
              <Typography color="text.secondary">Подтверждаем почту…</Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
