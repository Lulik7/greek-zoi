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
import { GREEK_FONT, HERO_VIOLET, INK, YELLOW } from '../theme';

const NAV: { to: string; label: string; sub?: string }[] = [
  { to: '/', label: 'Главная' },
  { to: '/map', label: 'Карта сайта', sub: '(игры)' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/all', label: 'Все материалы' },
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
        sx={{
          bgcolor: HERO_VIOLET,
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
            {/* В самой верхней полосе — цитата на греческом и её перевод */}
            {/*
              На телефоне цитата с переводом занимает почти всю строку и
              жмёт кнопки — там её не показываем. Вместо неё пустая распорка,
              иначе «Войти» и бургер уедут к левому краю.
            */}
            <Box sx={{ display: { xs: 'block', sm: 'none' }, flexGrow: 1 }} />
            <Box
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                minWidth: 0,
                textDecoration: { xs: 'none', sm: 'none' },
                display: { xs: 'none', sm: 'flex' },
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
                  transform: 'scaleX(-1)',
                }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: GREEK_FONT,
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: { sm: 17, md: 19, lg: 21 },
                      lineHeight: 1.25,
                      color: 'secondary.main',
                      minWidth: 0,
                      /*
                       * На планшете строка не помещается и обрывалась многоточием.
                       * Разрешаем ей занять две строки; на широком экране —
                       * по-прежнему одна.
                       */
                      display: { sm: '-webkit-box', lg: 'block' },
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: { sm: 2, lg: 'unset' },
                      overflow: 'hidden',
                      whiteSpace: { sm: 'normal', lg: 'nowrap' },
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {s?.heroQuoteEl}
                  </Typography>
                  <FormatQuoteIcon
                    sx={{
                      color: 'secondary.main',
                      fontSize: 26,
                      flexShrink: 0,
                      display: { xs: 'none', sm: 'block' },
                    }}
                  />
                </Stack>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    color: 'rgba(255,255,255,.85)',
                    letterSpacing: '0.02em',
                    lineHeight: 1.3,
                    // то же правило, что и для греческой строки выше
                    display: { sm: '-webkit-box', lg: 'block' },
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: { sm: 2, lg: 'unset' },
                    overflow: 'hidden',
                    whiteSpace: { sm: 'normal', lg: 'nowrap' },
                    textOverflow: 'ellipsis',
                  }}
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
                    position: 'relative',
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
                  {/*
                    Вторая строка вынесена из потока: иначе она растягивала кнопку
                    и пункт вставал выше соседних. Так все названия на одном уровне.
                  */}
                  {n.sub && (
                    <Box
                      component="span"
                      sx={{
                        position: 'absolute',
                        top: '78%',
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        pointerEvents: 'none',
                        fontSize: 14,
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: '0.02em',
                        color: 'secondary.main',
                        textTransform: 'lowercase',
                      }}
                    >
                      {n.sub}
                    </Box>
                  )}
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
                <ListItemText primary={n.label} secondary={n.sub} />
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
