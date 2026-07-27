import { useEffect, useRef, useState } from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import HangmanGame from '../components/games/HangmanGame';
import CrosswordGame from '../components/games/CrosswordGame';
import MemoryGame from '../components/games/MemoryGame';
import AnagramGame from '../components/games/AnagramGame';
import ChoiceQuiz from '../components/games/ChoiceQuiz';
import OddOneOutGame from '../components/games/OddOneOutGame';
import PhraseBuilderGame from '../components/games/PhraseBuilderGame';
import { ALPHABET_QUIZ, NUMBER_QUIZ, WORD_QUIZ } from '../components/games/quizData';
import { cartoonTitle, HERO_VIOLET, INK, TEXT_MUTED, YELLOW } from '../theme';

/**
 * Пухлое облако для меток на карте: пропорции 170×100, крупные круглые «шапки».
 * Отдельный силуэт, а не тот, что в туре, — тот вытянутый и на мелкой метке
 * выглядел бы приплюснутым.
 */
const CLOUD_D =
  'M 34 88 C 12 86, 4 66, 20 56 C 8 40, 26 22, 46 32 C 54 12, 86 8, 98 26 C 114 10, 144 20, 144 44 C 164 48, 168 76, 146 88 Z';
const CLOUD_VIEWBOX = '0 0 170 100';

type Side = 'left' | 'right';

type Place = {
  title: string;
  /** короткая подпись для облака на карте — длинная не влезает в силуэт */
  short: string;
  line: string;
  /** остановка на карте: греческий город и смайлик к нему */
  city: string;
  emoji: string;
  /** положение города на карте Греции, % от ширины и высоты картинки */
  x: number;
  y: number;
  /**
   * Смещение облака от города, в тех же процентах. Города лежат близко,
   * а облака крупные — поэтому подпись отводится в сторону и соединяется
   * с городом выноской, как на настоящих картах.
   */
  ox: number;
  oy: number;
  /** куда ведёт клик: маршрут, при необходимости с якорем на главной */
  to: string;
  hero: string;
  side: Side;
};

/**
 * Города идут с севера на юг и дальше на восток — чтобы маршрут на карте
 * читался одной линией, без петель.
 */
const PLACES: Place[] = [
  {
    title: 'Поиск',
    short: 'Поиск',
    line: 'Найти песню или диалог по названию',
    city: 'Салоники',
    emoji: '⚓',
    x: 38.3,
    y: 17.5,
    ox: -8.3,
    oy: -9.5,
    to: '/#home-search',
    hero: '/decor/hermes.png',
    side: 'left',
  },
  {
    title: 'Смотрим и слушаем',
    short: 'Видео',
    line: 'Видео и разбор песни месяца',
    city: 'Олимп',
    emoji: '⛰️',
    x: 31.8,
    y: 25.4,
    ox: -19.8,
    oy: -3.4,
    to: '/#home-watch',
    hero: '/decor/athena.png',
    side: 'right',
  },
  {
    title: 'Уровни',
    short: 'Уровни',
    line: 'От A1 до Γ2 — выберите свой',
    city: 'Дельфы',
    emoji: '🎭',
    x: 33.8,
    y: 48.5,
    ox: -20.8,
    oy: -3.5,
    to: '/#home-levels',
    hero: '/decor/poseidon.png',
    side: 'left',
  },
  {
    title: 'Темы',
    short: 'Темы',
    line: 'Еда, любовь, путешествия, работа',
    city: 'Афины',
    emoji: '🏛️',
    x: 47,
    y: 55.7,
    ox: -11,
    oy: 6.3,
    to: '/#home-topics',
    hero: '/decor/prometheus.png',
    side: 'right',
  },
  {
    title: 'Каталог',
    short: 'Каталог',
    line: 'Подборки по уровням и темам',
    city: 'Санторини',
    emoji: '🌅',
    x: 65.7,
    y: 78.2,
    ox: -3.7,
    oy: -10.2,
    to: '/catalog',
    hero: '/decor/athena.png',
    side: 'left',
  },
  {
    title: 'Все материалы',
    short: 'Материалы',
    line: 'Полный список песен и диалогов',
    city: 'Кносс',
    emoji: '🏺',
    x: 60,
    y: 89.5,
    ox: -27,
    oy: -2.5,
    to: '/all',
    hero: '/decor/hermes.png',
    side: 'right',
  },
  {
    title: 'Подписка',
    short: 'Подписка',
    line: 'Открыть весь каталог школы',
    city: 'Родос',
    emoji: '🌞',
    x: 90.5,
    y: 79,
    ox: -2.5,
    oy: -13,
    to: '/subscribe',
    hero: '/decor/poseidon.png',
    side: 'left',
  },
];

/** Маршрут по остановкам — плавная кривая через все города (координаты в %) */
const ROUTE_D = (() => {
  const pts = PLACES.map((p) => ({ x: p.x, y: p.y }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    // опорная точка посередине со смещением — линия идёт дугой, а не по прямой
    const cx = (prev.x + cur.x) / 2 + (cur.y - prev.y) * 0.18;
    const cy = (prev.y + cur.y) / 2 - (cur.x - prev.x) * 0.18;
    d += ` Q ${cx.toFixed(2)} ${cy.toFixed(2)}, ${cur.x} ${cur.y}`;
  }
  return d;
})();

/**
 * Посейдон на корабле: плывёт за курсором по карте.
 * Позиция считается от рамки карты, поэтому колесо мыши и прокрутка страницы
 * тоже двигают корабль — пересчитываем от последних координат курсора.
 * Движение сглажено: корабль догоняет мышь, а не прыгает за ней.
 */
function SeaGod({ mapRef }: { mapRef: React.RefObject<HTMLDivElement | null> }) {
  const shipRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 50, y: 45 });
  const pos = useRef({ x: 50, y: 45 });
  const facing = useRef(1);
  const lastClient = useRef<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    // на телефоне мыши нет — корабль не нужен
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const aim = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = ((cx - r.left) / r.width) * 100;
      const y = ((cy - r.top) / r.height) * 100;
      const inside = x > -8 && x < 108 && y > -8 && y < 108;
      setVisible(inside);
      if (!inside) return;
      target.current = {
        x: Math.max(4, Math.min(96, x)),
        y: Math.max(5, Math.min(95, y)),
      };
    };

    const onMove = (e: MouseEvent) => {
      lastClient.current = { x: e.clientX, y: e.clientY };
      aim(e.clientX, e.clientY);
    };
    // колесо и прокрутка: курсор стоит, а карта уезжает — цель пересчитываем
    const onShift = () => {
      const l = lastClient.current;
      if (l) aim(l.x, l.y);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('wheel', onShift, { passive: true });
    window.addEventListener('scroll', onShift, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('wheel', onShift);
      window.removeEventListener('scroll', onShift);
    };
  }, [mapRef]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      // «убрать анимацию» в спецвозможностях — ставим корабль сразу, без догона
      const instant = document.documentElement.classList.contains('a11y-no-motion');
      const p = pos.current;
      const t = target.current;
      const dx = t.x - p.x;
      const k = instant ? 1 : 0.075;
      p.x += dx * k;
      p.y += (t.y - p.y) * k;
      if (Math.abs(dx) > 0.06) facing.current = dx > 0 ? 1 : -1;

      const node = shipRef.current;
      if (node) {
        node.style.left = `${p.x}%`;
        node.style.top = `${p.y}%`;
        node.style.transform = `translate(-50%, -50%) scaleX(${facing.current})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Box
      ref={shipRef}
      aria-hidden
      sx={{
        position: 'absolute',
        left: '50%',
        top: '45%',
        // выше облаков-меток (у них 2, при наведении 4) — кораблик всегда сверху
        zIndex: 6,
        width: { sm: 150, md: 190 },
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease',
        display: { xs: 'none', sm: 'block' },
        // белое свечение + подсветка: кораблик читается на любом цвете карты
        filter:
          'drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 8px 16px rgba(33,25,95,0.5)) saturate(1.25)',
        willChange: 'left, top',
      }}
    >
      <Box sx={{ position: 'relative', animation: 'sea-god-bob 2.4s ease-in-out infinite' }}>
        <Box
          component="img"
          src="/decor/poseidon.png"
          alt=""
          draggable={false}
          sx={{
            display: 'block',
            width: '52%',
            height: 'auto',
            mx: 'auto',
            mb: '-15%',
            position: 'relative',
            zIndex: 2,
          }}
        />
        {/* кораблик рисуем сами — готовой картинки в проекте нет */}
        <Box component="svg" viewBox="0 0 120 70" sx={{ width: '100%', height: 'auto' }}>
          <path
            d="M 60 44 L 60 6"
            stroke={INK}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M 64 9 Q 96 26, 64 41 Z" fill={YELLOW} stroke={INK} strokeWidth="3.5" />
          <path
            d="M 6 42 L 114 42 L 98 62 Q 60 72, 22 62 Z"
            fill={HERO_VIOLET}
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M 14 50 L 106 50" stroke={YELLOW} strokeWidth="3" strokeLinecap="round" />
        </Box>
      </Box>
      <style>{`
        @keyframes sea-god-bob {
          0%, 100% { transform: translateY(0) rotate(-2.5deg); }
          50% { transform: translateY(-5px) rotate(2.5deg); }
        }
      `}</style>
    </Box>
  );
}

/**
 * Географическая карта Греции с городами-остановками.
 * Точки расставлены в процентах, поэтому держатся на месте при любой ширине.
 * На узком экране подписи прячутся — остаются только метки, а названия
 * читаются ниже, в списке облаков.
 */
function GreeceMap({ onGo }: { onGo: (to: string) => void }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  return (
    <Box
      ref={mapRef}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 900,
        mx: 'auto',
        mb: { xs: 5, md: 7 },
        borderRadius: 4,
        border: `4px solid ${HERO_VIOLET}`,
        overflow: 'hidden',
        boxShadow: '0 16px 36px rgba(33,25,95,0.22)',
      }}
    >
      <Box
        component="img"
        src="/decor/greece-map.jpg"
        alt="Карта Греции с остановками школы"
        draggable={false}
        sx={{ display: 'block', width: '100%', height: 'auto' }}
      />

      <SeaGod mapRef={mapRef} />

      {/* маршрут поверх карты: тёмная линия + жёлтый пунктир, чтобы читалось на пёстрой карте */}
      <Box
        component="svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      >
        <path
          d={ROUTE_D}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.85"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={ROUTE_D}
          fill="none"
          stroke={INK}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={ROUTE_D}
          fill="none"
          stroke={YELLOW}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 9"
          vectorEffect="non-scaling-stroke"
        />
      </Box>

      {/* точка ровно на городе — облако стоит рядом, а метка остаётся точной */}
      {PLACES.map((p) => (
        <Box
          key={`dot-${p.city}`}
          aria-hidden
          sx={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: YELLOW,
            border: `3px solid ${INK}`,
            boxShadow: '0 0 0 2px rgba(255,255,255,0.9)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {PLACES.map((p, i) => (
        <Box
          key={p.city}
          role="button"
          tabIndex={0}
          aria-label={`Остановка ${i + 1}. ${p.city} — ${p.title}`}
          onClick={() => onGo(p.to)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onGo(p.to);
            }
          }}
          sx={{
            position: 'absolute',
            left: `${p.x + p.ox}%`,
            top: `${p.y + p.oy}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
            width: { xs: 142, sm: 190, md: 216 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            filter: 'drop-shadow(0 5px 12px rgba(33,25,95,0.45))',
            transition: 'transform 0.2s ease, filter 0.2s ease',
            '&:hover, &:focus-visible': {
              transform: 'translate(-50%, -50%) scale(1.12)',
              filter: 'drop-shadow(0 9px 18px rgba(33,25,95,0.55))',
              zIndex: 4,
            },
            '&:focus-visible': { outline: 'none' },
          }}
        >
          <Box sx={{ position: 'relative', width: '100%' }}>
            {/* облако-подложка — тот же силуэт, что и в туре */}
            <Box
              component="svg"
              viewBox={CLOUD_VIEWBOX}
              preserveAspectRatio="none"
              aria-hidden
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <path
                d={CLOUD_D}
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="5"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </Box>

            {/* внутри облака — только номер и категория */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                px: { xs: 1.25, sm: 2 },
                // высокие поля — облако получается пухлым, а не приплюснутым
                pt: { xs: 3.5, sm: 4.25 },
                pb: { xs: 3, sm: 3.75 },
              }}
            >
              <Box
                component="span"
                aria-hidden
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: YELLOW,
                  border: `2px solid ${INK}`,
                  fontSize: 14,
                  fontWeight: 900,
                  color: INK,
                }}
              >
                {i + 1}
              </Box>
              <Box
                component="span"
                sx={{
                  fontWeight: 900,
                  color: HERO_VIOLET,
                  lineHeight: 1.1,
                  fontSize: { xs: 21, sm: 24 },
                }}
              >
                {p.short}
              </Box>
            </Box>
          </Box>

          {/* название города — рядом с облаком, отдельной табличкой */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.4,
              mt: '-4px',
              mx: 'auto',
              position: 'relative',
              zIndex: 2,
              color: INK,
              fontWeight: 900,
              fontSize: { xs: 10, sm: 11.5 },
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              // светлая обводка текста — чтобы читалось на пёстрой карте, но без рамки
              textShadow:
                '0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff, 1px 1px 0 #fff, -1px -1px 0 #fff',
            }}
          >
            <Box component="span" aria-hidden sx={{ fontSize: 11, lineHeight: 1 }}>
              {p.emoji}
            </Box>
            {p.city}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Карта сайта: весь путь по школе одной страницей.
 * Клик по облаку уводит в нужное место — на раздел главной или на отдельную страницу.
 */
export default function MapPage() {
  const nav = useNavigate();
  const { hash } = useLocation();

  /** переход из шапки на «/map#games» — прокручиваем к играм */
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

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        <Typography
          component="h1"
          sx={{
            ...cartoonTitle,
            fontWeight: 900,
            WebkitTextStroke: `1.6px ${INK}`,
            fontSize: { xs: 30, sm: 40, md: 48 },
            lineHeight: 1.1,
          }}
        >
          Карта сайта
        </Typography>
        <Typography
          sx={{
            mt: 1.5,
            fontWeight: 700,
            color: TEXT_MUTED,
            fontSize: { xs: 14, sm: 15.5 },
            maxWidth: 620,
            mx: 'auto',
          }}
        >
          Весь путь по школе — от поиска песни до подписки. Маршрут отмечен на карте Греции:
          нажмите на облако, и мы перенесём вас в нужное место.
        </Typography>
      </Box>

      <GreeceMap onGo={(to) => nav(to)} />

      {/* игры под картой — сюда ведёт пункт «Игры» в шапке */}
      <Stack
        id="games"
        spacing={{ xs: 4, md: 5 }}
        sx={{ mt: { xs: 5, md: 7 }, scrollMarginTop: 96 }}
      >
        <HangmanGame />
        <CrosswordGame />
        <MemoryGame />
        <AnagramGame />
        <ChoiceQuiz
          title="Выбери перевод"
          subtitle="Греческое слово — четыре варианта"
          promptHint="Что значит это слово?"
          pool={WORD_QUIZ}
        />
        <ChoiceQuiz
          title="Греческий алфавит"
          subtitle="Как называется буква"
          promptHint="Название этой буквы?"
          pool={ALPHABET_QUIZ}
          bigPrompt
        />
        <ChoiceQuiz
          title="Числа"
          subtitle="От одного до двадцати"
          promptHint="Как это будет по-гречески?"
          pool={NUMBER_QUIZ}
          bigPrompt
        />
        <OddOneOutGame />
        <PhraseBuilderGame />
      </Stack>
    </Container>
  );
}
