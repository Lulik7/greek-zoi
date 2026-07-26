import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../../store/AppContext';
import type { User } from '../../types';

export default function UsersAdmin() {
  const { db, user: me, saveUser, deleteUser } = useApp();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  if (!db) return null;

  const toggleSub = (u: User, on: boolean) => {
    const plan = db.settings.plans[0];
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

  const until = (u: User) =>
    u.subscription.until ? new Date(u.subscription.until).toLocaleDateString('ru-RU') : '—';

  return (
    <>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Здесь видно, кто зарегистрировался и у кого активна подписка. Подписку можно выдать
        вручную — например, ученику, который оплатил переводом.
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
                  <Select
                    size="small"
                    value={u.role}
                    disabled={u.id === me?.id}
                    onChange={(e) => saveUser({ ...u, role: e.target.value as User['role'] })}
                  >
                    <MenuItem value="student">Ученик</MenuItem>
                    <MenuItem value="admin">Администратор</MenuItem>
                  </Select>
                  <Switch
                    checked={u.subscription.active}
                    onChange={(e) => toggleSub(u, e.target.checked)}
                  />
                  <Chip size="small" variant="outlined" label={`до ${until(u)}`} />
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
                <TableCell align="center">Подписка</TableCell>
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
                    <Select
                      size="small"
                      value={u.role}
                      disabled={u.id === me?.id}
                      onChange={(e) => saveUser({ ...u, role: e.target.value as User['role'] })}
                    >
                      <MenuItem value="student">Ученик</MenuItem>
                      <MenuItem value="admin">Администратор</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={u.subscription.active}
                      onChange={(e) => toggleSub(u, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    {u.subscription.until ? (
                      <Chip size="small" variant="outlined" label={until(u)} />
                    ) : (
                      '—'
                    )}
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
