import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../../store/AppContext';
import type { User } from '../../types';

/** ISO-дата → значение для <input type="date"> (YYYY-MM-DD) в местном времени. */
const toInputDate = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Поле «Действует до». Сохраняет дату при уходе из поля (onBlur), а не на каждое нажатие —
 * иначе при вводе года с клавиатуры улетали бы промежуточные значения вроде 0002-10-11.
 * Доступ действует до конца выбранного дня.
 */
function SubUntilField({ user, onSave }: { user: User; onSave: (until: string) => void }) {
  const initial = toInputDate(user.subscription.until);
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);

  const commit = () => {
    if (!value || value === initial) return;
    const d = new Date(`${value}T23:59:59`);
    if (Number.isNaN(d.getTime()) || d.getFullYear() < 2000) {
      setValue(initial);
      return;
    }
    onSave(d.toISOString());
  };

  return (
    <TextField
      size="small"
      type="date"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      slotProps={{ inputLabel: { shrink: true } }}
      sx={{ width: 170 }}
    />
  );
}

export default function UsersAdmin() {
  const { db, user: me, saveUser, deleteUser } = useApp();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  if (!db) return null;

  const toggleSub = (u: User, on: boolean) => {
    // Берём тариф, который у ученика уже был; если его нет — первый в списке.
    const plan =
      db.settings.plans.find((p) => p.id === u.subscription.planId) ?? db.settings.plans[0];
    void saveUser({
      ...u,
      subscription: on
        ? {
            active: true,
            planId: u.subscription.planId ?? plan?.id ?? null,
            until: new Date(Date.now() + (plan?.periodDays ?? 30) * 864e5).toISOString(),
          }
        : { active: false, planId: null, until: null },
    });
  };

  const remove = (u: User) => {
    if (confirm(`Удалить пользователя ${u.email}?`)) void deleteUser(u.id);
  };

  /** Ручная установка даты окончания: включает подписку и сохраняет тариф ученика. */
  const setUntil = (u: User, until: string) => {
    void saveUser({
      ...u,
      subscription: {
        active: true,
        planId: u.subscription.planId ?? db.settings.plans[0]?.id ?? null,
        until,
      },
    });
  };

  return (
    <>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Здесь видно, кто зарегистрировался и у кого активна подписка. Подписку можно подарить
        вручную — например, ученику, который оплатил переводом. Чтобы отменить подарок, просто
        выключите переключатель. Дату окончания можно поправить вручную в поле «Действует до».
      </Typography>

      {compact ? (
        <Stack spacing={1.5}>
          {db.users.map((u) => (
            <Card key={u.id}>
              <CardContent>
                <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {u.email}
                </Typography>
                <Stack
                  direction="row"
                  useFlexGap
                  sx={{ mt: 1.5, gap: 1, flexWrap: 'wrap', alignItems: 'center' }}
                >
                  <Chip
                    size="small"
                    label={u.role === 'admin' ? 'Администратор' : 'Ученик'}
                    color={u.role === 'admin' ? 'primary' : 'default'}
                  />
                  <Tooltip title={u.subscription.active ? 'Отменить подарок' : 'Подарить подписку'}>
                    <Switch
                      checked={u.subscription.active}
                      onChange={(e) => toggleSub(u, e.target.checked)}
                    />
                  </Tooltip>
                  <SubUntilField user={u} onSave={(until) => setUntil(u, until)} />
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton color="error" disabled={u.id === me?.id} onClick={() => remove(u)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Почта</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell align="center">Подписка (подарок)</TableCell>
                <TableCell>Действует до</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {db.users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.role === 'admin' ? 'Администратор' : 'Ученик'}
                      color={u.role === 'admin' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={u.subscription.active ? 'Отменить подарок' : 'Подарить подписку'}>
                      <Switch
                        size="small"
                        checked={u.subscription.active}
                        onChange={(e) => toggleSub(u, e.target.checked)}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <SubUntilField user={u} onSave={(until) => setUntil(u, until)} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={u.id === me?.id ? 'Нельзя удалить себя' : 'Удалить'}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={u.id === me?.id}
                          onClick={() => remove(u)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
