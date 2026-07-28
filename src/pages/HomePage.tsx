import { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useApp } from '../store/AppContext';
import SearchBar from '../components/SearchBar';
import VideoBlock from '../components/VideoBlock';
import FloatingDecor from '../components/FloatingDecor';
import AccessibilityPanel from '../components/AccessibilityPanel';
import { useLogoLines } from '../lib/title';
import {
  cartoonTitle,
  GREEK_FONT,
  HERO_BLUE,
  INK,
  PAGE_BG,
  SCENE_GROUND,
  TEXT_ON_DARK,
  YELLOW,
} from '../theme';

/** Страница школы в Фейсбуке — туда ведёт жёлтая надпись с названием школы */
const FACEBOOK_URL = 'https://www.facebook.com/sinnefokapnou';

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

  useEffect(() => {
    logEvent({ type: 'page', path: '/' });
  }, [logEvent]);

  /**
   * Переход по ссылке вида «/#home-levels» — прокрутить к нужному разделу.
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
      {/* справа: специальные возможности — размер, контраст, анимация */}
      <AccessibilityPanel />

      {/* Первый блок: спокойный голубой, ничего не движется */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: 'common.white',
          bgcolor: HERO_BLUE,
          pb: { xs: 2, md: 4 },
          backgroundImage: 'none',
          borderTop: 'none',
          boxShadow: 'none',
        }}
      >
        {/* лимоны и оливки — неподвижно, по краям блока */}
        <FloatingDecor />

        <Container
          maxWidth="lg"
          sx={{ position: 'relative', zIndex: 2, py: { xs: 4, sm: 5, md: 7 } }}
        >
          <Stack
            sx={{
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
              maxWidth: { md: '72%' },
            }}
          >
            {/* поиск стоит над названием сайта */}
            <Box id="home-search" sx={{ width: '100%', maxWidth: 720, mb: { xs: 3, md: 4 } }}>
              <SearchBar />
            </Box>

            <Typography
              component="h1"
              sx={{
                ...cartoonTitle,
                fontWeight: 900,
                lineHeight: 1.05,
                fontSize: 'clamp(24px, 6.4vw, 56px)',
              }}
            >
              {line1}
            </Typography>
            {line2 && (
              <Typography
                component="div"
                sx={{
                  ...cartoonTitle,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  fontSize: 'clamp(24px, 6.4vw, 56px)',
                }}
              >
                {line2}
              </Typography>
            )}

            <Typography
              sx={{
                mt: 1.75,
                maxWidth: 460,
                fontSize: { xs: 15.5, md: 18 },
                fontWeight: 600,
                lineHeight: 1.4,
                color: 'rgba(255,255,255,0.95)',
              }}
            >
              Песни, которые учат вас греческому языку
            </Typography>

            {/* название школы — ссылка на страницу в Фейсбуке */}
            <Box
              component="a"
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              sx={{
                mt: { xs: 2.5, md: 3 },
                display: 'inline-block',
                textDecoration: 'none',
                px: { xs: 1.75, md: 2.5 },
                py: { xs: 0.75, md: 0.9 },
                borderRadius: 999,
                bgcolor: YELLOW,
                color: INK,
                fontSize: { xs: 12.5, md: 14.5 },
                fontWeight: 900,
                lineHeight: 1.3,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                border: `2px solid ${alphaInk(0.15)}`,
                '&:hover': { filter: 'brightness(1.05)' },
              }}
            >
              {settings.subtitle}
            </Box>

            {/* этикетки тем — ведут прямо к песням */}
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                mt: { xs: 2.5, md: 3 },
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              {topics.map((t) => (
                <Chip
                  key={t.id}
                  component={RouterLink}
                  to={`/catalog?topic=${t.id}`}
                  clickable
                  label={`${t.emoji} ${t.title}`}
                  sx={{
                    bgcolor: '#ffffff',
                    color: INK,
                    fontWeight: 800,
                    border: `2px solid ${alphaInk(0.15)}`,
                    '&:hover': { bgcolor: SCENE_GROUND },
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

      <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 5, md: 8 }}>
          <Box id="home-watch" sx={{ scrollMarginTop: 88 }}>
            <SectionTitle hint="Посмотрите, как всё устроено, и послушайте песню, которую Зоя предлагает вам в этот раз.">
              Смотрим и слушаем
            </SectionTitle>
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                // у сменного видео подписи нет — не растягиваем его до высоты соседа
                alignItems: 'start',
              }}
            >
              <VideoBlock
                title={settings.instructionVideoTitle}
                description="Короткое видео: как искать материалы, где включается текст и что входит в подписку."
                url={settings.instructionVideoUrl}
                badge="Инструкция"
              />
              {/* у сменного видео подписи нет — только само видео */}
              <VideoBlock
                title=""
                description={settings.featuredVideoDescription}
                url={settings.featuredVideoUrl}
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
                gap: { xs: 1, sm: 1.5, md: 2 },
                gridTemplateColumns: {
                  xs: 'repeat(4, 1fr)',
                  sm: 'repeat(4, 1fr)',
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
                      boxShadow: `0 10px 28px -16px ${alphaInk(0.35)}`,
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
                            fontSize: { xs: 19, sm: 26, md: 30 },
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
                    borderColor: alphaInk(0.18),
                    color: TEXT_ON_DARK,
                    borderWidth: 1.5,
                    '&:hover': {
                      borderColor: HERO_BLUE,
                      bgcolor: SCENE_GROUND,
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

function alphaInk(a: number) {
  return `rgba(18,58,99,${a})`;
}
