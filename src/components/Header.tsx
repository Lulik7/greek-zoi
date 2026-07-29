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
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useApp } from '../store/AppContext';
import AuthDialog from './AuthDialog';
import { GREEK_FONT, HERO_BLUE, INK, YELLOW } from '../theme';

const NAV: { to: string; label: string }[] = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/subscribe', label: 'Подписка' },
];

export default function Header() {
  const { db, user, isAdmin, hasSubscription, logout } = useApp();
  const nav = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [drawer, setDrawer] = useState(false);
  const s = db?.settings;
  const levels = db?.levels ?? [];

  const goto = (to: string) => {
    setDrawer(false);
    nav(to);
  };

  /**
   * Этикетки уровней с подписью: без неё «A1» и «B2» ни о чём не говорят
   * тому, кто первый раз на сайте. На компьютере подпись стоит слева от
   * этикеток, на телефоне — строкой над ними: в одну строку они не влезают.
   */
  const levelChips = (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 0.75, md: 1.5 }}
      useFlexGap
      sx={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: 28, md: 30 },
          color: 'common.white',
          whiteSpace: 'nowrap',
          lineHeight: 1.2,
        }}
      >
        Выберите ваш уровень
      </Typography>
      <Stack
        direction="row"
        spacing={{ xs: 0.75, sm: 1 }}
        useFlexGap
        sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {levels.map((l) => (
          <Chip
            key={l.id}
            component={RouterLink}
            to={`/catalog?level=${l.id}`}
            clickable
            label={l.code}
            sx={{
              fontFamily: GREEK_FONT,
              fontWeight: 900,
              fontSize: { xs: 15, sm: 16 },
              height: { xs: 30, sm: 34 },
              px: { xs: 0.5, sm: 0.75 },
              bgcolor: YELLOW,
              color: INK,
              border: `2px solid ${INK}`,
              '&:hover': { bgcolor: '#FFE056' },
            }}
          />
        ))}
      </Stack>
    </Stack>
  );

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: HERO_BLUE,
          color: 'common.white',
          boxShadow: 'none !important',
          border: 'none !important',
          borderBottom: 'none !important',
          backgroundImage: 'none !important',
          outline: 'none',
          // MUI Paper иногда рисует нижнюю линию
          '&.MuiPaper-root': {
            boxShadow: 'none !important',
            border: 'none !important',
            borderBottom: 'none !important',
            backgroundImage: 'none !important',
          },
          '&::before, &::after': { display: 'none' },
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1, py: 1, minHeight: { xs: 64, md: 80 } }}>
            {/*
              Этикетки уровней. На широком экране стоят в свободном месте
              между краем и меню — по центру этого промежутка. На телефоне
              меню прячется в бургер, поэтому там этикетки уезжают в
              отдельный ряд под шапкой и стоят ровно по центру экрана.
            */}
            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                // сдвиг вправо примерно на сантиметр — по центру промежутка
                // блок казался слишком прижатым к левому краю
                transform: 'translateX(38px)',
              }}
            >
              {levelChips}
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }} />

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
                    {/* администратору статус подписки не показываем — он к нему не относится */}
                    {!isAdmin && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          icon={<WorkspacePremiumIcon />}
                          color={hasSubscription ? 'success' : 'default'}
                          label={hasSubscription ? 'Подписка активна' : 'Без подписки'}
                        />
                      </Box>
                    )}
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
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {/* как LOG IN / SIGN UP в референс-видео: контур + жёлтая таблетка */}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => openAuth('login')}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    px: 2,
                    color: 'common.white',
                    borderColor: 'rgba(255,255,255,0.75)',
                    borderWidth: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: 800,
                    fontSize: 13,
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: YELLOW,
                      color: YELLOW,
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  Войти
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => openAuth('register')}
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    color: INK,
                    bgcolor: YELLOW,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: 900,
                    fontSize: 13,
                    border: `2px solid ${INK}`,
                    boxShadow: `0 3px 0 ${INK}`,
                    '&:hover': { bgcolor: '#FFE056', boxShadow: `0 4px 0 ${INK}` },
                  }}
                >
                  Регистрация
                </Button>
              </Stack>
            )}

            <IconButton
              aria-label="Меню"
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'common.white' }}
              onClick={() => setDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>

          {/* телефон и планшет: этикетки уровней отдельным рядом, по центру */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              pb: 1.25,
            }}
          >
            {levelChips}
          </Box>
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
              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setDrawer(false);
                    openAuth('login');
                  }}
                >
                  Войти
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setDrawer(false);
                    openAuth('register');
                  }}
                  sx={{ color: INK, fontWeight: 900 }}
                >
                  Регистрация
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>

      <AuthDialog
        key={authMode}
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
