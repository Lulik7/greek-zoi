import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useApp } from '../../store/AppContext';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function StatsAdmin() {
  const { db } = useApp();

  const data = useMemo(() => {
    if (!db) return null;
    const events = db.events;
    const byType = (t: string) => events.filter((e) => e.type === t).length;

    const count = (pred: (l: string) => boolean, type: string) => {
      const map = new Map<string, number>();
      events
        .filter((e) => e.type === type && e.label && pred(e.label))
        .forEach((e) => map.set(e.label!, (map.get(e.label!) ?? 0) + 1));
      return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    };

    return {
      pages: byType('page'),
      plays: byType('play'),
      locked: byType('locked'),
      searches: byType('search'),
      topPlays: count(() => true, 'play'),
      topSearches: count(() => true, 'search'),
      users: db.users.length,
      subscribers: db.users.filter((u) => u.subscription.active).length,
      paidCount: db.payments.filter((p) => p.status === 'paid').length,
      revenue: db.payments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.amountCents, 0) / 100,
    };
  }, [db]);

  if (!db || !data) return null;

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        <Stat label="Просмотров страниц" value={data.pages} />
        <Stat label="Запусков аудио" value={data.plays} />
        <Stat label="Упёрлись в замок" value={data.locked} />
        <Stat label="Поисковых запросов" value={data.searches} />
        <Stat label="Зарегистрировано" value={data.users} />
        <Stat label="С активной подпиской" value={data.subscribers} />
        <Stat label="Оплат прошло" value={data.paidCount} />
        <Stat label="Получено, €" value={data.revenue.toFixed(0)} />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
        {[
          { title: 'Чаще всего слушают', rows: data.topPlays },
          { title: 'Что ищут', rows: data.topSearches },
        ].map((block) => (
          <TableContainer key={block.title} component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {/* шапка в одну строку — заголовок не должен ломаться пополам */}
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{block.title}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    Кол-во
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {block.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="caption" color="text.secondary">
                        Пока нет данных
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {block.rows.map(([label, n]) => (
                  <TableRow key={label}>
                    <TableCell>{label}</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label={n} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ))}
      </Box>
    </Stack>
  );
}
