import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Текст-подсказка, если окно открыли из закрытого материала */
  reason?: string;
  onSuccess?: () => void;
}

type Mode = 'login' | 'register' | 'forgot';

export default function AuthDialog({ open, onClose, reason, onSuccess }: Props) {
  const { login, register, db } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  /** Ссылка вместо письма — показывается, только если почта на сервере не настроена */
  const [devLink, setDevLink] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setError('');
    setDone('');
    setDevLink('');
  };

  const close = () => {
    reset();
    setPassword('');
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    reset();
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        onSuccess?.();
        close();
      } else if (mode === 'register') {
        const link = await register(email.trim(), password, name.trim());
        onSuccess?.();
        if (link) {
          setDevLink(link);
          setDone('Аккаунт создан. Письма на сервере не настроены — подтвердите почту по ссылке ниже.');
        } else {
          setDone(
            db?.features.email
              ? 'Аккаунт создан. Мы отправили письмо — подтвердите почту по ссылке из него.'
              : 'Аккаунт создан.',
          );
          setTimeout(close, 2500);
        }
      } else {
        const res = await api.forgotPassword(email.trim());
        setDone(
          'Если такая почта зарегистрирована, письмо со ссылкой уже отправлено. ' +
            'Ссылка действует час.',
        );
        if (res.resetLink) setDevLink(res.resetLink);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { m: { xs: 2, sm: 4 }, width: { xs: 'calc(100% - 32px)', sm: 'auto' } } } }}
    >
      <DialogTitle>Καλώς ήρθατε!</DialogTitle>
      <DialogContent>
        {reason && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {reason}
          </Alert>
        )}

        {mode === 'forgot' ? (
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Восстановление пароля
          </Typography>
        ) : (
          <Tabs
            value={mode === 'login' ? 0 : 1}
            onChange={(_, v) => {
              setMode(v === 0 ? 'login' : 'register');
              reset();
            }}
            sx={{ mb: 2 }}
          >
            <Tab label="Вход" />
            <Tab label="Регистрация" />
          </Tabs>
        )}

        <Stack spacing={2}>
          {mode === 'register' && (
            <TextField label="Имя" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          )}
          <TextField
            label="Электронная почта"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            autoComplete="email"
          />
          {mode !== 'forgot' && (
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              fullWidth
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              helperText={mode === 'register' ? 'Не короче 6 символов' : undefined}
            />
          )}

          {error && <Alert severity="error">{error}</Alert>}
          {done && <Alert severity="success">{done}</Alert>}
          {devLink && (
            <Alert severity="info" sx={{ wordBreak: 'break-all' }}>
              <Link href={devLink}>{devLink}</Link>
            </Alert>
          )}

          <Button variant="contained" size="large" onClick={submit} disabled={busy}>
            {mode === 'login' ? 'Войти' : mode === 'register' ? 'Создать аккаунт' : 'Прислать ссылку'}
          </Button>

          {mode === 'login' && (
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => {
                setMode('forgot');
                reset();
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              Забыли пароль?
            </Link>
          )}
          {mode === 'forgot' && (
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => {
                setMode('login');
                reset();
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              Вернуться ко входу
            </Link>
          )}

          <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Демо-доступы: <b>admin@zoi.gr / admin123</b> (администратор),{' '}
              <b>student@mail.ru / demo123</b> (ученик без подписки)
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
