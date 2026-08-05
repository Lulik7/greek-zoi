import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Container, Link, Stack } from '@mui/material';
import { useApp } from '../store/AppContext';

/**
 * Полоса уведомлений над содержимым: смена пароля и напоминание подтвердить
 * почту. Результат подтверждения показывает сама страница /verify.
 */
export default function StatusBanners() {
  const { user, db, resendVerification } = useApp();
  const [params, setParams] = useSearchParams();
  const [sent, setSent] = useState('');
  const [devLink, setDevLink] = useState('');
  const [hidden, setHidden] = useState(false);

  const passwordChanged = params.get('password') === 'changed';

  const clear = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    setParams(next, { replace: true });
  };

  const needsVerification = !!user && !user.emailVerified && !hidden;
  if (!passwordChanged && !needsVerification) return null;

  return (
    <Container maxWidth="lg" sx={{ pt: 2 }}>
      <Stack spacing={1.5}>
        {passwordChanged && (
          <Alert severity="success" onClose={() => clear('password')}>
            Пароль изменён, вы вошли в аккаунт.
          </Alert>
        )}

        {needsVerification && (
          <Alert
            severity="info"
            onClose={() => setHidden(true)}
            action={
              !sent && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={async () => {
                    try {
                      const link = await resendVerification();
                      if (link) setDevLink(link);
                      setSent('Письмо отправлено');
                    } catch (e) {
                      setSent(e instanceof Error ? e.message : 'Не получилось отправить');
                    }
                  }}
                >
                  Выслать письмо
                </Button>
              )
            }
          >
            Подтвердите почту — без этого нельзя оформить подписку.{' '}
            {sent && <b>{sent}.</b>}
            {devLink && (
              <>
                {' '}
                <Link href={devLink} sx={{ wordBreak: 'break-all' }}>
                  {db?.features.email ? 'Ссылка' : devLink}
                </Link>
              </>
            )}
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
