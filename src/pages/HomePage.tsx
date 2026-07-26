import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  type SxProps,
  type Theme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useApp } from '../store/AppContext';
import SearchBar from '../components/SearchBar';
import VideoBlock from '../components/VideoBlock';
import HeroFigure from '../components/HeroFigure';
import { useLogoLines } from '../lib/title';
import { cartoonTitle, GREEK_FONT, HERO_VIOLET } from '../theme';

/**
 * Кусочек рисунка-образца: вырезаем прямоугольник (x, y, ширина, высота) из
 * картинки и показываем нужного размера. Так на странице оказываются только
 * рисунки — кувшин, оливки, лимоны, атлет — без чужих надписей.
 */
const IMG_W = 1440;
const IMG_H = 720;

/** Прямоугольник с фигурой атлета в кадре видео (768×384) */
const ATHLETE_CROP: [number, number, number, number] = [442, 16, 206, 229];
/** Кнопки чужого сайта, попадающие в верх кадра, — стираем их */
const ATHLETE_ERASE: [number, number, number, number][] = [[512, 0, 260, 38]];

/** Что берём из картинки-образца и куда ставим в первом блоке */
const DECOR = [
  { key: 'jug', rect: [40, 92, 155, 220] as [number, number, number, number], width: 104, place: { left: '2%', top: '12%' } },
  { key: 'plum', rect: [90, 335, 105, 110] as [number, number, number, number], width: 72, place: { left: '4%', bottom: '14%' } },
  { key: 'olives1', rect: [696, 100, 130, 96] as [number, number, number, number], width: 92, place: { left: { sm: '58%', md: '62%' }, top: '11%' } },
  { key: 'olives2', rect: [690, 336, 135, 96] as [number, number, number, number], width: 86, place: { left: { sm: '40%', md: '46%' }, bottom: '12%' } },
  { key: 'lemon', rect: [1236, 104, 128, 132] as [number, number, number, number], width: 82, place: { left: { sm: '24%', md: '30%' }, bottom: '8%', display: { xs: 'none', lg: 'block' } } },
];

function Deco({
  src,
  rect,
  width,
  sx = {},
}: {
  src: string;
  rect: [number, number, number, number];
  width: number;
  sx?: SxProps<Theme>;
}) {
  const [x, y, w, h] = rect;
  const k = width / w;
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        width,
        height: h * k,
        backgroundImage: `url(${src})`,
        backgroundSize: `${IMG_W * k}px ${IMG_H * k}px`,
        backgroundPosition: `${-x * k}px ${-y * k}px`,
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        ...sx,
      }}
    />
  );
}

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
      <Typography variant="h5" sx={{ fontSize: { xs: 22, md: 26 } }}>
        {children}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export default function HomePage() {
  const { db, logEvent } = useApp();
  const [line1, line2] = useLogoLines();

  useEffect(() => {
    logEvent({ type: 'page', path: '/' });
  }, [logEvent]);

  if (!db) return null;
  const { settings, levels, topics, tracks } = db;
  const published = tracks.filter((t) => t.published);

  return (
    <Box>
      {/* Первый блок: название школы на сиреневом фоне, как в выбранном образце */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: 'common.white',
          bgcolor: HERO_VIOLET,
          minHeight: { md: 430 },
          // плашка вспыхивает ярче в такт лучам
          '@keyframes platePulse': {
            '0%, 100%': {
              transform: 'scale(1)',
              filter: 'brightness(1)',
              boxShadow: '0 5px 0 rgba(36,30,85,.28)',
            },
            '45%': {
              transform: 'scale(1.05)',
              filter: 'brightness(1.22)',
              boxShadow: '0 5px 0 rgba(36,30,85,.28), 0 0 36px 10px rgba(255,240,140,.85)',
            },
          },
          // вспышка лучей за жёлтой плашкой — как в видео
          '@keyframes rayBurst': {
            '0%, 100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(.72) rotate(0deg)' },
            '45%': { opacity: 0.55, transform: 'translate(-50%, -50%) scale(1) rotate(7deg)' },
            '70%': { opacity: 0.18, transform: 'translate(-50%, -50%) scale(1.05) rotate(11deg)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            '& *': { animation: 'none !important' },
          },
        }}
      >
        {/* Рисунки-украшения вырезаны из картинки-образца: надписей в них нет */}
        {settings.heroImageUrl && (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {DECOR.map((d) => (
              <Deco key={d.key} src={settings.heroImageUrl} rect={d.rect} width={d.width} sx={d.place} />
            ))}
          </Box>
        )}

        {/* Атлет — живая фигура из видео, стоит справа, как в образце */}
        {settings.heroVideoUrl && (
          <HeroFigure
            src={settings.heroVideoUrl}
            crop={ATHLETE_CROP}
            erase={ATHLETE_ERASE}
            sx={{
              position: 'absolute',
              right: { md: 30, lg: 90 },
              bottom: { md: 30, lg: 36 },
              display: { xs: 'none', md: 'block' },
              width: { md: 250, lg: 292 },
              height: 'auto',
            }}
          />
        )}

        <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 6, sm: 8, md: 11 } }}>
          <Stack
            sx={{
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
              maxWidth: { md: '58%' },
            }}
          >
            <Typography
              component="h1"
              sx={{
                ...cartoonTitle,
                fontWeight: 900,
                lineHeight: 1.05,
                // подбирается под ширину экрана, чтобы «ГОВОРЮ ПО-ГРЕЧЕСКИ» не рвалось
                fontSize: 'clamp(25px, 6.6vw, 58px)',
                whiteSpace: 'nowrap',
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
                  fontSize: 'clamp(25px, 6.6vw, 58px)',
                  whiteSpace: 'nowrap',
                }}
              >
                {line2}
              </Typography>
            )}

            {/* Название школы — жёлтая плашка с пульсирующими лучами, как в видео */}
            <Box
              component={RouterLink}
              to="/catalog"
              sx={{
                mt: { xs: 3, md: 3.5 },
                position: 'relative',
                display: 'inline-block',
                textDecoration: 'none',
                isolation: 'isolate',
              }}
            >
              {/* белые лучи за плашкой */}
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: { xs: 420, md: 620 },
                  height: { xs: 420, md: 620 },
                  zIndex: -1,
                  background:
                    'repeating-conic-gradient(from 0deg, rgba(255,255,255,.9) 0deg 5deg, rgba(255,255,255,0) 5deg 13deg)',
                  maskImage: 'radial-gradient(closest-side, #000 18%, transparent 72%)',
                  WebkitMaskImage: 'radial-gradient(closest-side, #000 18%, transparent 72%)',
                  animation: 'rayBurst 3.2s ease-in-out infinite',
                }}
              />
              <Box
                sx={{
                  px: { xs: 2.5, md: 3.5 },
                  py: { xs: 1.1, md: 1.4 },
                  borderRadius: 999,
                  bgcolor: 'secondary.main',
                  color: 'primary.dark',
                  fontSize: { xs: 15.5, md: 20 },
                  fontWeight: 800,
                  lineHeight: 1.35,
                  boxShadow: '0 5px 0 rgba(36,30,85,.28)',
                  animation: 'platePulse 3.2s ease-in-out infinite',
                }}
              >
                {settings.subtitle}
              </Box>
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
                    bgcolor: 'rgba(255,255,255,0.14)',
                    color: 'inherit',
                    border: '1px solid rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(4px)',
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Container>

        {/* волна снизу — приём из выбранного образца */}
        <Box
          component="svg"
          aria-hidden
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          sx={{ display: 'block', width: '100%', height: { xs: 34, md: 64 }, position: 'relative' }}
        >
          <path
            d="M0,38 C220,86 430,4 720,26 C1010,48 1230,92 1440,44 L1440,90 L0,90 Z"
            fill="#F6F3FF"
          />
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 5, md: 8 }}>
          {/* Поиск — приподнят к волне, как главный инструмент */}
          <Box sx={{ mt: { xs: -2, md: -4 }, position: 'relative', zIndex: 1 }}>
            <SearchBar />
          </Box>

          <Box>
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

          <Box>
            <SectionTitle hint="Выберите свой уровень — откроются подходящие песни и диалоги.">
              Уровни
            </SectionTitle>
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 1.5, md: 2 },
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
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
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: 'primary.main',
                        boxShadow: '0 20px 38px -22px rgba(36,30,85,0.6)',
                      },
                    }}
                  >
                    <CardActionArea
                      component={RouterLink}
                      to={`/catalog?level=${l.id}`}
                      sx={{ height: '100%' }}
                    >
                      {/* тёмно-фиолетовая шапка карточки — приём из образца */}
                      <Box
                        sx={{
                          bgcolor: 'primary.dark',
                          color: 'common.white',
                          py: 1.1,
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: GREEK_FONT,
                            fontWeight: 900,
                            fontSize: { xs: 26, md: 30 },
                            lineHeight: 1,
                          }}
                        >
                          {l.code}
                        </Typography>
                      </Box>
                      <CardContent sx={{ textAlign: 'center', px: 1.5, bgcolor: '#F3F0FF' }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                          sx={{ minHeight: 62 }}
                        >
                          {l.description}
                        </Typography>
                        <Chip
                          size="small"
                          color="secondary"
                          label={`${count} шт.`}
                          sx={{ mt: 1.5 }}
                        />
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>

          <Box>
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
                    bgcolor: 'background.paper',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(13,94,175,0.06)',
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
              background: 'linear-gradient(140deg, #ffffff 0%, #eef4fb 100%)',
            }}
          >
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Полный список песен и диалогов школы — с уровнями, темами и пометкой, что открыто.
            </Typography>
            <Button
              component={RouterLink}
              to="/all"
              size="large"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
            >
              Открыть полный список
            </Button>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
