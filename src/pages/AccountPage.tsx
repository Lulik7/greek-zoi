import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useApp } from '../store/AppContext';

export default function AccountPage() {
  const { db, user, hasSubscription } = useApp();

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="info">Войдите в аккаунт, чтобы увидеть личный кабинет.</Alert>
      </Container>
    );
  }

  const plan = db?.settings.plans.find((p) => p.id === user.subscription.planId);
  const free = db?.tracks.filter((t) => t.published && t.free) ?? [];

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Личный кабинет
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">{user.name}</Typography>
          <Typography color="text.secondary">{user.email}</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              color={hasSubscription ? 'success' : 'default'}
              label={hasSubscription ? 'Подписка активна' : 'Подписки нет'}
            />
            <Chip
              variant="outlined"
              color={user.emailVerified ? 'success' : 'warning'}
              label={user.emailVerified ? 'Почта подтверждена' : 'Почта не подтверждена'}
            />
            {plan && <Chip variant="outlined" label={`Тариф: ${plan.title}`} />}
            {user.subscription.until && (
              <Chip
                variant="outlined"
                label={`До ${new Date(user.subscription.until).toLocaleDateString('ru-RU')}`}
              />
            )}
          </Stack>
          {!hasSubscription && (
            <Button component={RouterLink} to="/subscribe" variant="contained" sx={{ mt: 2 }}>
              Оформить подписку
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Открыто без подписки
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {free.map((t) => (
              <Chip
                key={t.id}
                clickable
                component={RouterLink}
                to={`/catalog?track=${t.id}`}
                label={t.titleRu}
                variant="outlined"
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
