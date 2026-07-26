import { useState } from 'react';
import { Alert, Container, Divider, Tab, Tabs, Typography } from '@mui/material';
import { useApp } from '../../store/AppContext';
import TracksAdmin from './TracksAdmin';
import TaxonomyAdmin from './TaxonomyAdmin';
import SettingsAdmin from './SettingsAdmin';
import UsersAdmin from './UsersAdmin';
import StatsAdmin from './StatsAdmin';

const TABS = [
  { label: 'Материалы', node: <TracksAdmin /> },
  { label: 'Уровни и темы', node: <TaxonomyAdmin /> },
  { label: 'Главная и тарифы', node: <SettingsAdmin /> },
  { label: 'Ученики', node: <UsersAdmin /> },
  { label: 'Статистика', node: <StatsAdmin /> },
];

export default function AdminPage() {
  const { isAdmin, loading } = useApp();
  const [tab, setTab] = useState(0);

  if (loading) return null;

  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="warning">
          Раздел доступен только администратору. Войдите под учётной записью администратора
          (в демо: admin@zoi.gr / admin123).
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontSize: { xs: 26, md: 34 } }}>
        Панель администратора
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mt: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TABS.map((t) => (
          <Tab key={t.label} label={t.label} />
        ))}
      </Tabs>
      <Divider sx={{ mb: 3 }} />

      {TABS[tab].node}
    </Container>
  );
}
