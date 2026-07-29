import { lazy, Suspense } from 'react';
import { Alert, Box, CircularProgress, Container } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import SubscribePage from './pages/SubscribePage';
import StatusBanners from './components/StatusBanners';
import SiteDecor from './components/SiteDecor';
import { useApp } from './store/AppContext';

/*
 * Страницы, которые нужны не всем и не сразу, грузятся отдельными файлами
 * при первом заходе на них. Тяжелее всего админка со всеми вкладками —
 * ученику она не нужна, и качать её ему незачем.
 */
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AllTracksPage = lazy(() => import('./pages/AllTracksPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

/** Пока подгружается страница — тот же кружок, что и при запуске сайта */
function PageLoading() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  const { loading, connectionError } = useApp();

  if (loading) {
    return (
      <Box
        className="site-wave-bg"
        sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}
      >
        <SiteDecor />
        <CircularProgress sx={{ position: 'relative', zIndex: 1 }} />
      </Box>
    );
  }

  return (
    <Box
      className="site-wave-bg"
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}
    >
      {/* только фон + декор — z-index 0, не красит формы */}
      <SiteDecor />
      {/* контент поверх: карточки/формы со своими белыми фонами */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'transparent',
        }}
      >
        <Header />
        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'transparent' }}>
          {connectionError && (
            <Container maxWidth="lg" sx={{ pt: 2 }}>
              <Alert severity="error">{connectionError}</Alert>
            </Container>
          )}
          <StatusBanners />
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/all" element={<AllTracksPage />} />
              <Route path="/subscribe" element={<SubscribePage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/reset" element={<ResetPasswordPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
