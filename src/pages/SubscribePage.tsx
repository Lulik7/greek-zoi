import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import { useApp } from '../store/AppContext';
import AuthDialog from '../components/AuthDialog';

export default function SubscribePage() {
  const { db, user, isAdmin, hasSubscription, checkout, resendVerification, logEvent } = useApp();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const paid = params.get('paid') === '1';
  const canceled = params.get('canceled') === '1';

  useEffect(() => {
    logEvent({ type: 'page', path: '/subscribe' });
  }, [logEvent]);

  if (!db) return null;

  /*
   * Пока ключи Stripe не заданы, оплата картой не работает: подписку школа
   * включает вручную тому, кто заплатил переводом. Поэтому кнопка тарифа
   * ведёт не на оплату, а в переписку — Telegram, иначе WhatsApp, иначе почта.
   */
  const cardPayment = db.features.stripe;
  const s = db.settings;
  const contactHref = s.contactTelegram
    ? `https://t.me/${s.contactTelegram.replace('@', '')}`
    : s.contactPhone
      ? `https://wa.me/${s.contactPhone.replace(/[^\d]/g, '')}`
      : `mailto:${s.contactEmail}`;

  const buy = async (planId: string) => {
    if (!user) {
      setPendingPlan(planId);
      setAuthOpen(true);
      return;
    }
    setBusy(planId);
    setError('');
    try {
      await checkout(planId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось оформить подписку');
    } finally {
      setBusy('');
    }
  };

  const clearParams = () => {
    const next = new URLSearchParams(params);
    next.delete('paid');
    next.delete('canceled');
    setParams(next, { replace: true });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h4" sx={{ fontSize: { xs: 26, md: 34 } }}>
        Подписка
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        Часть материалов открыта для всех. Подписка открывает весь каталог: песни,
        тексты с переводом и новые материалы каждую неделю.
      </Typography>

      {paid && !hasSubscription && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={clearParams}>
          Оплата принята. Подписка включится в течение нескольких секунд — обновите страницу,
          если статус ещё не изменился.
        </Alert>
      )}
      {canceled && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={clearParams}>
          Оплата отменена — с карты ничего не списано.
        </Alert>
      )}
      {/* администратор ведёт каталог — подписка ему не нужна */}
      {isAdmin && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Вы вошли как администратор — все материалы открыты без подписки.
        </Alert>
      )}
      {hasSubscription && !isAdmin && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Подписка активна до{' '}
          {user?.subscription.until
            ? new Date(user.subscription.until).toLocaleDateString('ru-RU')
            : '—'}
          . Все материалы открыты.
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            db.features.email && user && !user.emailVerified ? (
              <Button
                color="inherit"
                size="small"
                onClick={async () => {
                  await resendVerification();
                  setNotice('Письмо отправлено ещё раз — проверьте почту.');
                  setError('');
                }}
              >
                Выслать письмо
              </Button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        }}
      >
        {db.settings.plans.map((p) => (
          <Card
            key={p.id}
            sx={{
              borderColor: p.highlighted ? 'secondary.main' : undefined,
              borderWidth: p.highlighted ? 2 : 1,
            }}
          >
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{p.title}</Typography>
                {p.highlighted && <Chip size="small" color="secondary" label="Выгодно" />}
              </Stack>
              <Typography variant="h3" sx={{ my: 2, fontWeight: 800 }}>
                {p.priceEur} €
              </Typography>
              <Typography variant="caption" color="text.secondary">
                на {p.periodDays} дней
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense disablePadding>
                {p.features.map((f) => (
                  <ListItem key={f} disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={f} />
                  </ListItem>
                ))}
              </List>
              {!cardPayment && !hasSubscription && !isAdmin ? (
                <Button
                  fullWidth
                  size="large"
                  variant={p.highlighted ? 'contained' : 'outlined'}
                  sx={{ mt: 2 }}
                  component="a"
                  href={contactHref}
                  target="_blank"
                  rel="noopener"
                >
                  Написать для оплаты
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="large"
                  variant={p.highlighted ? 'contained' : 'outlined'}
                  sx={{ mt: 2 }}
                  onClick={() => buy(p.id)}
                  disabled={hasSubscription || isAdmin || busy === p.id}
                >
                  {isAdmin ? 'Не требуется' : hasSubscription ? 'Уже активна' : busy === p.id ? 'Открываем оплату…' : 'Оформить'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {cardPayment ? (
        <Alert icon={<LockIcon />} severity="info" sx={{ mt: 4 }}>
          Оплата проходит на защищённой странице Stripe. Данные карты на наш сайт не попадают,
          доступ открывается автоматически сразу после подтверждения платежа.
        </Alert>
      ) : (
        !hasSubscription &&
        !isAdmin && (
          <Alert severity="info" sx={{ mt: 4 }}>
            Оплата картой на сайте пока не подключена. Напишите нам — подскажем, как перевести
            оплату, и откроем доступ ко всем материалам.
            {s.contactTelegram && ` Telegram: ${s.contactTelegram}.`}
            {s.contactPhone && ` Viber / WhatsApp: ${s.contactPhone}.`}
            {s.contactEmail && ` Почта: ${s.contactEmail}.`}
          </Alert>
        )
      )}

      {hasSubscription && (
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={() => nav('/catalog')}>
            Перейти к материалам
          </Button>
        </Box>
      )}

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        reason="Чтобы оформить подписку, войдите или создайте аккаунт."
        onSuccess={() => {
          if (pendingPlan) void buy(pendingPlan);
        }}
      />
    </Container>
  );
}
