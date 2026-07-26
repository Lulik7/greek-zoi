import { Alert, Box, CircularProgress, Container } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import AllTracksPage from './pages/AllTracksPage';
import SubscribePage from './pages/SubscribePage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/admin/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StatusBanners from './components/StatusBanners';
import { useApp } from './store/AppContext';

export default function App() {
  const { loading, connectionError } = useApp();

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {connectionError && (
          <Container maxWidth="lg" sx={{ pt: 2 }}>
            <Alert severity="error">{connectionError}</Alert>
          </Container>
        )}
        <StatusBanners />
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
      </Box>
      <Footer />
    </Box>
  );
}
