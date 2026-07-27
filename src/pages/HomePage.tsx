import { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useApp } from '../store/AppContext';
import SearchBar from '../components/SearchBar';
import VideoBlock from '../components/VideoBlock';
import FloatingDecor from '../components/FloatingDecor';
import SiteMapTour from '../components/SiteMapTour';
import AccessibilityPanel from '../components/AccessibilityPanel';
import MusicQuotesBand from '../components/MusicQuotesBand';
import { useLogoLines } from '../lib/title';
import {
  cartoonTitle,
  GREEK_FONT,
  HERO_VIOLET,
  INK,
  PAGE_BG,
  SCENE_GROUND,
  TEXT_ON_DARK,
  YELLOW,
} from '../theme';

/** Русское склонение после числа: 1 уровень, 2 уровня, 5 уровней */
function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function SectionTitle({ children, hint }: { children: string; hint?: string }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="h5"
        sx={{
          fontSize: { xs: 22, md: 28 },
          fontWeight: 900,
          color: INK,
        }}
      >
        {children}
      </Typography>
      {hint && (
        // подзаголовок раздела: крупнее и контрастнее приглушённого серого
        <Typography
          sx={{
            mt: 0.6,
            color: INK,
            opacity: 0.82,
            fontWeight: 600,
            fontSize: { xs: 15, md: 17 },
            lineHeight: 1.45,
          }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export default function HomePage() {
  const { db, logEvent } = useApp();
  const [line1, line2] = useLogoLines();
  const { hash } = useLocation();
  const theme = useTheme();
  /*
   * Видео первого экрана весит 11 МБ и играет фоном под маской прозрачности.
   * На телефоне это лишний трафик ради декорации, поэтому там ставим
   * стоп-кадр. Проверяем ширину заранее: скрытый через CSS <video> всё
   * равно скачался бы.
   */
  const wideScreen = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    logEvent({ type: 'page', path: '/' });
  }, [logEvent]);

  /**
   * Переход с карты сайта: «/#home-levels» — прокрутить к нужному разделу.
   * Блок может появиться на кадр позже, поэтому ждём его несколько кадров.
   */
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    let tries = 0;
    let raf = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (tries++ < 30) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [hash]);

  if (!db) return null;
  const { settings, levels, topics, tracks } = db;
  const published = tracks.filter((t) => t.published);

  return (
    <Box sx={{ bgcolor: 'transparent' }}>
      {/* слева: карта сайта с Посейдоном */}
      <SiteMapTour />
      {/* справа: специальные возможности — размер, контраст, анимация */}
      <AccessibilityPanel />

      {/* Hero: сиреневый + сцена справа (как раньше), герои мельче */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: 'common.white',
          bgcolor: HERO_VIOLET,
          minHeight: { sm: 500, md: 540 },
          pb: { xs: 2, md: 4 },
          // сплошной цвет — без градиента сверху, чтобы не было шва с header
          backgroundImage: 'none',
          borderTop: 'none',
          boxShadow: 'none',
          '@keyframes platePulse': {
            '0%, 100%': {
              transform: 'scale(1)',
              filter: 'brightness(1)',
              boxShadow: `0 5px 0 ${alphaInk(0.28)}`,
            },
            '45%': {
              transform: 'scale(1.04)',
              filter: 'brightness(1.12)',
              boxShadow: `0 5px 0 ${alphaInk(0.28)}, 0 0 32px 8px rgba(250,218,27,.55)`,
            },
          },
        }}
      >
        {/*
          HERO VIDEO: top/bottom = 0 + height 100% + cover — без полосок.
          Герои меньше за счёт узкой панели (38%), без scale.
        */}
        <Box
          {...(wideScreen
            ? {
                component: 'video' as const,
                autoPlay: true,
                muted: true,
                loop: true,
                playsInline: true,
                preload: 'auto',
                src: '/media/hero-style-scene-hd.mp4?v=5',
              }
            : { component: 'img' as const, src: '/media/hero-style-scene.png', alt: '' })}
          aria-hidden
          sx={{
            position: 'absolute',
            // как ~3 шага назад: у правого края, шире к центру (~32%)
            right: 0,
            top: 0,
            bottom: 0,
            width: { xs: '52%', md: '32%' },
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            opacity: { xs: 0.5, md: 0.88 },
            pointerEvents: 'none',
            zIndex: 0,
            border: 0,
            outline: 0,
            boxShadow: 'none',
            // только мягкий левый край; сверху/снизу без полосок
            maskImage:
              'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 22%, #000 50%, #000 100%)',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 22%, #000 50%, #000 100%)',
          }}
        />

        {/* сирень слева под текст */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: { xs: '55%', md: '55%' },
            zIndex: 1,
            pointerEvents: 'none',
            background: `linear-gradient(90deg, ${HERO_VIOLET} 0%, ${HERO_VIOLET} 75%, transparent 100%)`,
          }}
        />

        {/* лимоны, оливки, слива на hero — как было (не убирать) */}
        <FloatingDecor />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 6, sm: 7, md: 10 } }}>
          <Stack
            sx={{
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
              maxWidth: { md: '58%' },
            }}
          >
            {/*
              Заголовок снова слева, как было.
              Кувшин — absolute слева от слов, текст не сдвигает.
            */}
            <Box sx={{ position: 'relative' }}>
              {/* оболочка держит позицию; анимация — на img внутри */}
              <Box
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  position: 'absolute',
                  right: '100%',
                  top: '50%',
                  mr: 1.25,
                  transform: 'translateY(-50%)',
                  width: { sm: 68, md: 84 },
                  lineHeight: 0,
                  pointerEvents: 'none',
                }}
              >
                <Box
                  component="img"
                  className="decor-jug"
                  src="/decor/jug.png"
                  alt=""
                  draggable={false}
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    // лёгкое покачивание (класс + inline — чтобы точно играло)
                    animation: 'decor-jug 2.8s ease-in-out infinite !important',
                    transformOrigin: '50% 85%',
                    filter: 'drop-shadow(0 4px 10px rgba(33,25,95,.28))',
                  }}
                />
              </Box>
              <Typography
                component="h1"
                className="hero-title-fly"
                sx={{
                  ...cartoonTitle,
                  fontWeight: 900,
                  lineHeight: 1.02,
                  fontSize: 'clamp(26px, 6.8vw, 60px)',
                  whiteSpace: 'nowrap',
                }}
              >
                {line1}
              </Typography>
              {line2 && (
                <Typography
                  component="div"
                  className="hero-title-fly hero-title-fly-delay"
                  sx={{
                    ...cartoonTitle,
                    fontWeight: 900,
                    lineHeight: 1.02,
                    fontSize: 'clamp(26px, 6.8vw, 60px)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {line2}
                </Typography>
              )}
            </Box>

            <Typography
              sx={{
                mt: 1.75,
                maxWidth: 440,
                fontSize: { xs: 15.5, md: 18 },
                fontWeight: 600,
                lineHeight: 1.4,
                color: 'rgba(255,255,255,0.92)',
                textShadow: '0 1px 8px rgba(33,25,95,.25)',
              }}
            >
              Песни с текстом — слушайте и говорите по-гречески
            </Typography>

            <Box
              component={RouterLink}
              to="/catalog"
              // якорь для облака тура — оно садится на эту надпись
              id="home-school-badge"
              sx={{
                mt: { xs: 3, md: 3.5 },
                display: 'inline-block',
                textDecoration: 'none',
                px: { xs: 2.75, md: 3.75 },
                py: { xs: 1.15, md: 1.45 },
                borderRadius: 999,
                bgcolor: YELLOW,
                color: INK,
                fontSize: { xs: 15, md: 18 },
                fontWeight: 900,
                lineHeight: 1.3,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                boxShadow: `0 5px 0 ${alphaInk(0.3)}`,
                animation: 'platePulse 3.2s ease-in-out infinite',
                border: `2px solid ${alphaInk(0.12)}`,
                '&:hover': { filter: 'brightness(1.05)' },
              }}
            >
              {settings.subtitle}
            </Box>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                mt: { xs: 3, md: 3.5 },
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              {[
                `${published.length} ${plural(published.length, 'материал', 'материала', 'материалов')}`,
                `${levels.length} ${plural(levels.length, 'уровень', 'уровня', 'уровней')} — от Α1 до Γ2`,
                'Доступ по подписке',
              ].map((label) => (
                <Chip
                  key={label}
                  label={label}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.16)',
                    color: 'inherit',
                    border: '1px solid rgba(255,255,255,0.28)',
                    backdropFilter: 'blur(4px)',
                    fontWeight: 700,
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Container>

        {/* волна в цвет фона сайта */}
        <Box
          component="svg"
          aria-hidden
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          sx={{ display: 'block', width: '100%', height: { xs: 36, md: 72 }, position: 'relative', zIndex: 2 }}
        >
          <path
            d="M0,38 C220,86 430,4 720,26 C1010,48 1230,92 1440,44 L1440,90 L0,90 Z"
            fill={PAGE_BG}
          />
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 5, md: 8 }}>
          <Box
            id="home-search"
            sx={{ mt: { xs: -2.5, md: -5 }, position: 'relative', zIndex: 3, scrollMarginTop: 88 }}
          >
            <SearchBar />
          </Box>

          <Box id="home-watch" sx={{ scrollMarginTop: 88 }}>
            <SectionTitle hint="Посмотрите, как всё устроено, и послушайте песню, которую Зоя разбирает в этом месяце.">
              Смотрим и слушаем
            </SectionTitle>
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              }}
            >
              <VideoBlock
                title={settings.instructionVideoTitle}
                description="Короткое видео: как искать материалы, где включается текст и что входит в подписку."
                url={settings.instructionVideoUrl}
                badge="Инструкция"
              />
              <VideoBlock
                title={settings.featuredVideoTitle}
                description={settings.featuredVideoDescription}
                url={settings.featuredVideoUrl}
                badge="Обновляется"
              />
            </Box>
          </Box>

          <Box id="home-levels" sx={{ scrollMarginTop: 88 }}>
            <SectionTitle hint="Выберите свой уровень — откроются подходящие материалы.">
              Уровни
            </SectionTitle>
            <Box
              sx={{
                display: 'grid',
                // на телефоне все шесть уровней в одной строке: колонки узкие,
                // поэтому описание там прячем и оставляем код со счётчиком
                gap: { xs: 0.75, sm: 1.5, md: 2 },
                gridTemplateColumns: {
                  xs: 'repeat(6, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(6, 1fr)',
                },
              }}
            >
              {levels.map((l) => {
                const count = published.filter((t) => t.levelIds.includes(l.id)).length;
                return (
                  <Card
                    key={l.id}
                    sx={{
                      overflow: 'hidden',
                      borderRadius: 3.5,
                      border: 'none',
                      bgcolor: '#ffffff',
                      boxShadow: `0 10px 28px -16px rgba(33,25,95,0.35)`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 18px 36px -16px rgba(33,25,95,0.45)`,
                      },
                    }}
                  >
                    <CardActionArea
                      component={RouterLink}
                      to={`/catalog?level=${l.id}`}
                      sx={{ height: '100%' }}
                    >
                      <Box
                        sx={{
                          bgcolor: INK,
                          color: 'common.white',
                          py: { xs: 0.9, sm: 1.25 },
                          textAlign: 'center',
                          borderRadius: '18px 18px 0 0',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: GREEK_FONT,
                            fontWeight: 900,
                            fontSize: { xs: 17, sm: 26, md: 30 },
                            lineHeight: 1,
                            color: YELLOW,
                          }}
                        >
                          {l.code}
                        </Typography>
                      </Box>
                      <CardContent
                        sx={{
                          textAlign: 'center',
                          px: { xs: 0.5, sm: 1.5 },
                          py: { xs: 1, sm: 2 },
                          bgcolor: SCENE_GROUND,
                          '&:last-child': { pb: { xs: 1.25, sm: 2 } },
                        }}
                      >
                        {/* описание не влезает в узкую колонку — прячем его на телефоне */}
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ display: { xs: 'none', sm: 'block' }, minHeight: 62, color: INK }}
                        >
                          {l.description}
                        </Typography>
                        <Chip
                          size="small"
                          color="secondary"
                          label={`${count} шт.`}
                          sx={{
                            mt: { xs: 0, sm: 1.5 },
                            fontWeight: 800,
                            color: INK,
                            height: { xs: 20, sm: 24 },
                            '& .MuiChip-label': { px: { xs: 0.6, sm: 1 }, fontSize: { xs: 10, sm: 13 } },
                          }}
                        />
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>

          {/* полоса в цвет шапки: мысли и факты о греческой музыке */}
          <MusicQuotesBand />

          <Box id="home-topics" sx={{ scrollMarginTop: 88 }}>
            <SectionTitle hint="Или начните с темы — она пригодится в жизни уже завтра.">
              Темы
            </SectionTitle>
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {topics.map((t) => (
                <Chip
                  key={t.id}
                  component={RouterLink}
                  to={`/catalog?topic=${t.id}`}
                  clickable
                  label={`${t.emoji}  ${t.title}`}
                  variant="outlined"
                  sx={{
                    px: 1.5,
                    py: 2.75,
                    fontSize: 16,
                    bgcolor: '#ffffff',
                    borderColor: 'rgba(33,25,95,0.18)',
                    color: TEXT_ON_DARK,
                    borderWidth: 1.5,
                    '&:hover': {
                      borderColor: HERO_VIOLET,
                      bgcolor: 'rgba(124,122,207,0.08)',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Card
            sx={{
              textAlign: 'center',
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              bgcolor: '#ffffff',
              border: '1px solid rgba(33,25,95,0.1)',
            }}
          >
            <Typography sx={{ mb: 3, fontSize: 16.5, color: 'text.secondary' }}>
              Полный список материалов школы — с уровнями, темами и пометкой, что открыто.
            </Typography>
            <Button
              component={RouterLink}
              to="/all"
              size="large"
              variant="contained"
              color="secondary"
              endIcon={<ArrowForwardIcon />}
              sx={{ color: INK, fontWeight: 900, px: 3.5 }}
            >
              Открыть полный список
            </Button>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

function alphaInk(a: number) {
  return `rgba(33,25,95,${a})`;
}
