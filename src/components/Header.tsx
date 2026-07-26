import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useApp } from '../store/AppContext';
import AuthDialog from './AuthDialog';
import { GREEK_FONT, HERO_VIOLET } from '../theme';

const NAV = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/all', label: 'Все материалы' },
  { to: '/subscribe', label: 'Подписка' },
];

export default function Header() {
  const { db, user, isAdmin, hasSubscription, logout } = useApp();
  const nav = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [drawer, setDrawer] = useState(false);
  const s = db?.settings;

  const goto = (to: string) => {
    setDrawer(false);
    nav(to);
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: HERO_VIOLET, color: 'common.white' }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1, py: 1, minHeight: { xs: 64, md: 80 } }}>
            {/* В самой верхней полосе — цитата на греческом и её перевод */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                minWidth: 0,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <FormatQuoteIcon
                sx={{
                  color: 'secondary.main',
                  fontSize: 26,
                  flexShrink: 0,
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: GREEK_FONT,
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: { xs: 15.5, sm: 19, md: 21 },
                    lineHeight: 1.25,
                    color: 'secondary.main',
                  }}
                  noWrap
                >
                  {s?.heroQuoteEl}
                </Typography>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: 'rgba(255,255,255,.85)', letterSpacing: '0.02em' }}
                  noWrap
                >
                  {s?.heroQuoteRu}
                  {s?.heroQuoteSource ? ` · ${s.heroQuoteSource}` : ''}
                </Typography>
              </Box>
            </Box>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ display: { xs: 'none', md: 'flex' }, ml: 'auto', mr: 1 }}
            >
              {NAV.map((n) => (
                <Button
                  key={n.to}
                  component={RouterLink}
                  to={n.to}
                  color="inherit"
                  sx={{
                    px: 1.75,
                    color: 'common.white',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    fontSize: 14.5,
                    '&:hover': { color: 'secondary.main', bgcolor: 'rgba(255,255,255,.12)' },
                  }}
                >
                  {n.label}
                </Button>
              ))}
            </Stack>

            {user ? (
              <>
                <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
                  <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                    {user.name.slice(0, 1).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2">{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        icon={<WorkspacePremiumIcon />}
                        color={hasSubscription ? 'success' : 'default'}
                        label={hasSubscription ? 'Подписка активна' : 'Без подписки'}
                      />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem
                    onClick={() => {
                      setAnchor(null);
                      nav('/account');
                    }}
                  >
                    Личный кабинет
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem
                      onClick={() => {
                        setAnchor(null);
                        nav('/admin');
                      }}
                    >
                      <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1 }} /> Админка
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={async () => {
                      setAnchor(null);
                      await logout();
                      nav('/');
                    }}
                  >
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Выйти
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => setAuthOpen(true)}
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  color: 'primary.dark',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                Войти
              </Button>
            )}

            <IconButton
              aria-label="Меню"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              onClick={() => setDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="subtitle2" color="primary.dark">
              {s?.subtitle}
            </Typography>
          </Box>
          <Divider />
          <List>
            {NAV.map((n) => (
              <ListItemButton key={n.to} onClick={() => goto(n.to)}>
                <ListItemText primary={n.label} />
              </ListItemButton>
            ))}
            {user && (
              <ListItemButton onClick={() => goto('/account')}>
                <ListItemText primary="Личный кабинет" />
              </ListItemButton>
            )}
            {isAdmin && (
              <ListItemButton onClick={() => goto('/admin')}>
                <ListItemText primary="Админка" />
              </ListItemButton>
            )}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            {user ? (
              <Button
                fullWidth
                startIcon={<LogoutIcon />}
                onClick={async () => {
                  setDrawer(false);
                  await logout();
                  nav('/');
                }}
              >
                Выйти
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setDrawer(false);
                  setAuthOpen(true);
                }}
              >
                Войти
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
