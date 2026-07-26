import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { api } from '../api/client';
import { useApp } from '../store/AppContext';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { refresh } = useApp();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (password.length < 6) return setError('Пароль должен быть не короче 6 символов');
    if (password !== repeat) return setError('Пароли не совпадают');
    setBusy(true);
    setError('');
    try {
      await api.resetPassword(token, password);
      await refresh();
      nav('/?password=changed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сменить пароль');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Новый пароль
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Придумайте пароль — и мы сразу впустим вас в аккаунт.
          </Typography>

          {!token ? (
            <Alert severity="error">
              В ссылке нет кода восстановления. Запросите письмо заново на странице входа.
            </Alert>
          ) : (
            <Stack spacing={2}>
              <TextField
                label="Новый пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                fullWidth
              />
              <TextField
                label="Повторите пароль"
                type="password"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                autoComplete="new-password"
                fullWidth
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button variant="contained" size="large" onClick={submit} disabled={busy}>
                Сохранить пароль
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
