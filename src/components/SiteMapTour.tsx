import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { cartoonTitle, HERO_VIOLET, INK, YELLOW } from '../theme';

type Step = 0 | 1 | 2 | 3 | 4 | 5;
type Phase = 'in' | 'idle' | 'out' | 'gone';
type Side = 'left' | 'center' | 'right';
type Pt = { x: number; y: number };

const LAST = 5;

const STEPS: { title: string; line: string; target: string | null; side: Side }[] = [
  { title: '', line: 'Кликни, если ты первый раз здесь!', target: null, side: 'center' },
  {
    title: '',
    line: 'Привет! Вот карта сайта. Кликай мышкой, чтобы узнать весь путь',
    target: null,
    side: 'left',
  },
  {
    title: 'Поиск',
    line: 'Здесь можно найти песни и диалоги',
    target: 'home-search',
    side: 'center',
  },
  {
    title: 'Как пользоваться сайтом',
    line: 'Смотри, слушай, учись — всё просто!',
    target: 'home-watch',
    side: 'left',
  },
  {
    title: 'Уровни',
    line: 'Выбери свой уровень — откроются подходящие песни.',
    target: 'home-levels',
    side: 'right',
  },
  {
    title: 'Темы',
    line: 'Или начни с темы — пригодится уже завтра!',
    target: 'home-topics',
    side: 'center',
  },
];

function sideX(side: Side): number {
  const w = window.innerWidth;
  if (side === 'left') return Math.round(w * 0.08);
  if (side === 'right') return Math.round(w * 0.62);
  return Math.round(w * 0.5);
}

/** Стык (низ облака) в page-координатах — для дороги и спуска */
function pageDock(stepIndex: number): Pt {
  const s = STEPS[stepIndex];
  const x = sideX(s.side);
  if (!s.target) {
    // 0 — садится на надпись «Онлайн-школа…»; 1 — ниже слева
    if (stepIndex === 0) {
      const badge = document.getElementById('home-school-badge');
      if (badge) {
        const r = badge.getBoundingClientRect();
        return {
          x: Math.round(r.left + r.width / 2),
          // низ облака чуть ниже надписи — облако ложится прямо на неё
          y: r.bottom + window.scrollY + 8,
        };
      }
      // запасной вариант, если надписи на странице нет
      return {
        x: Math.round(window.innerWidth * 0.3),
        y: window.scrollY + window.innerHeight * 0.5,
      };
    }
    return { x, y: window.scrollY + window.innerHeight * 0.26 };
  }
  const el = document.getElementById(s.target);
  if (!el) return { x, y: window.scrollY + window.innerHeight * 0.5 };
  const y = el.getBoundingClientRect().top + window.scrollY + 36;
  return { x, y };
}

function cloudSize(title: string, line: string) {
  const n = title.length + line.length;
  let w = 280;
  if (n > 20) w = 320;
  if (n > 35) w = 380;
  if (n > 50) w = 460;
  if (n > 65) w = 520;
  // длинный текст 2-го облака + карта
  if (n > 55) w = Math.max(w, 480);
  w = Math.min(w, window.innerWidth - 20);
  const lines = Math.ceil(line.length / Math.max(12, (w - 100) / 11));
  const h = 130 + (title ? 28 : 0) + lines * 28 + (lines > 2 ? 16 : 0);
  return { w, h };
}

type Wave = 'wave' | 'bumpy' | 's' | 'loop' | 'flip';

function waveFor(i: number, isLast: boolean): Wave {
  if (isLast) return 'flip';
  // 0 = дорога 2-е→3-е облако — всегда волнистая
  if (i === 0) return 'wave';
  return (['bumpy', 's', 'loop', 'wave'] as Wave[])[i % 4];
}

/**
 * Короткая плавная кривая a→b (page).
 * Старт — из-под облака A; конец заходит ПОД облако B.
 * wave = несколько мягких волн (дорога 2→3).
 */
function makePath(a: Pt, b: Pt, wave: Wave): string {
  // выход вниз из-под A
  const leave = 40;
  const a1 = { x: a.x, y: a.y + leave };
  // конец глубже под облако B
  const bHide = { x: b.x, y: b.y - 48 };

  const dx = bHide.x - a1.x;
  const dy = Math.max(40, bHide.y - a1.y);
  const span = Math.min(dy, 200);
  const midX = (a1.x + bHide.x) / 2;
  const midY = a1.y + span * 0.5;
  const dir = dx >= 0 ? 1 : -1;
  const amp = Math.min(44, 26 + Math.abs(dx) * 0.1);

  let mid = '';
  if (wave === 'wave') {
    // явно волнистая: 3–4 мягкие волны влево-вправо
    const wAmp = Math.min(56, 36 + Math.abs(dx) * 0.15);
    const y1 = a1.y + span * 0.22;
    const y2 = a1.y + span * 0.45;
    const y3 = a1.y + span * 0.68;
    const y4 = a1.y + span * 0.88;
    mid = `C ${a1.x + dir * wAmp} ${a1.y + span * 0.08},
             ${a1.x + dx * 0.2 + dir * wAmp} ${y1},
             ${a1.x + dx * 0.25} ${y1}
      C ${a1.x + dx * 0.3 - dir * wAmp} ${y1},
             ${a1.x + dx * 0.42 - dir * wAmp} ${y2},
             ${a1.x + dx * 0.48} ${y2}
      C ${a1.x + dx * 0.54 + dir * wAmp} ${y2},
             ${a1.x + dx * 0.68 + dir * wAmp} ${y3},
             ${a1.x + dx * 0.72} ${y3}
      C ${a1.x + dx * 0.78 - dir * wAmp * 0.7} ${y3},
             ${bHide.x - dir * wAmp * 0.4} ${y4},
             ${bHide.x} ${bHide.y}`;
  } else if (wave === 'bumpy') {
    mid = `C ${a1.x + dir * amp} ${a1.y + span * 0.3},
             ${bHide.x - dir * amp} ${a1.y + span * 0.7},
             ${bHide.x} ${bHide.y}`;
  } else if (wave === 's') {
    mid = `C ${a1.x + dir * amp * 0.85} ${a1.y + span * 0.35},
             ${bHide.x - dir * amp * 0.85} ${a1.y + span * 0.65},
             ${bHide.x} ${bHide.y}`;
  } else if (wave === 'loop') {
    const r = 34;
    const lx = midX + dir * (r + 10);
    mid = `C ${a1.x + dir * 14} ${a1.y + span * 0.22},
             ${lx + dir * r * 0.65} ${midY - r * 0.55},
             ${lx} ${midY}
      C ${lx - dir * r * 0.65} ${midY + r * 0.55},
             ${bHide.x - dir * 14} ${bHide.y - span * 0.1},
             ${bHide.x} ${bHide.y}`;
  } else {
    // ОДНА петля, затем конец под облако
    const r = Math.min(58, Math.max(40, span * 0.24));
    const cx = midX + dir * 6;
    const cy = midY + r * 0.15;
    const k = 0.5523;
    mid = `C ${a1.x + dir * 10} ${a1.y + span * 0.18},
             ${cx - dir * r} ${cy - r * 0.35},
             ${cx - dir * r} ${cy}
      C ${cx - dir * r} ${cy + k * r},
             ${cx - dir * k * r} ${cy + r},
             ${cx} ${cy + r}
      C ${cx + dir * k * r} ${cy + r},
             ${cx + dir * r} ${cy + k * r},
             ${cx + dir * r} ${cy}
      C ${cx + dir * r * 0.55} ${cy - r * 0.25},
             ${bHide.x - dir * 6} ${bHide.y - 6},
             ${bHide.x} ${bHide.y}`;
  }

  // конец bHide — под облаком B (облако поверх, конец спрятан)
  return `M ${a1.x} ${a1.y} ${mid}`;
}

function alongPath(d: string, t: number, pathEl: SVGPathElement) {
  pathEl.setAttribute('d', d);
  const len = pathEl.getTotalLength() || 1;
  const dist = Math.max(0, Math.min(1, t)) * len;
  const p = pathEl.getPointAtLength(dist);
  const p2 = pathEl.getPointAtLength(Math.min(len, dist + 4));
  const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
  return { x: p.x, y: p.y, angle, len };
}

/**
 * Клик → облако само спускается по дороге.
 * Показывается при каждом заходе на главную и ждёт клика — само не гаснет.
 */
export default function SiteMapTour() {
  const [step, setStep] = useState<Step>(0);
  const [phase, setPhase] = useState<Phase>('in');
  const [pos, setPos] = useState({ left: 20, top: 160 });
  const [rot, setRot] = useState(0);
  const [busy, setBusy] = useState(false);
  const [roads, setRoads] = useState<string[]>([]);
  const [activeRoad, setActiveRoad] = useState<string | null>(null);
  const [drawT, setDrawT] = useState(1);
  const [pathLen, setPathLen] = useState(400);
  const [scrollY, setScrollY] = useState(0);
  const [docH, setDocH] = useState(5000);

  const measureRef = useRef<SVGPathElement | null>(null);
  const timers = useRef<number[]>([]);
  const flying = useRef(false);

  const data = STEPS[step];
  const size = useMemo(() => cloudSize(data.title, data.line), [data.title, data.line]);

  /** page (x,y) → fixed left/top; низ облака на точке */
  const placePage = useCallback((pageX: number, pageY: number, w: number, h: number, sy?: number) => {
    const scroll = sy ?? window.scrollY;
    const vx = pageX;
    const vy = pageY - scroll;
    setPos({
      left: Math.max(8, Math.min(vx - w / 2, window.innerWidth - w - 8)),
      top: Math.max(8, Math.min(vy - h + 6, window.innerHeight - 50)),
    });
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const clearRoad = () => {
      setRoads([]);
      setActiveRoad(null);
      setDrawT(1);
    };
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      // во время автоспуска не трогаем; если юзер крутит вверх — дорога исчезает
      if (!flying.current && y < lastY - 4) {
        clearRoad();
      }
      lastY = y;
    };
    const onWheel = (e: WheelEvent) => {
      if (flying.current) return;
      if (e.deltaY < 0) clearRoad();
    };
    const onTouch = (() => {
      let startY = 0;
      return {
        start: (e: TouchEvent) => {
          startY = e.touches[0]?.clientY ?? 0;
        },
        move: (e: TouchEvent) => {
          if (flying.current) return;
          const y = e.touches[0]?.clientY ?? 0;
          if (y - startY > 12) clearRoad(); // свайп вниз пальцем = прокрутка вверх контента
        },
      };
    })();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouch.start, { passive: true });
    window.addEventListener('touchmove', onTouch.move, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouch.start);
      window.removeEventListener('touchmove', onTouch.move);
    };
  }, []);

  useEffect(() => {
    const t0 = window.setTimeout(() => {
      const d = pageDock(0);
      const s = cloudSize(STEPS[0].title, STEPS[0].line);
      placePage(d.x, d.y, s.w, s.h);
      setDocH(Math.max(document.documentElement.scrollHeight, 5000));
      setPhase('idle');
    }, 300);
    timers.current.push(t0);
    return () => timers.current.forEach(clearTimeout);
  }, [placePage]);

  const getMeasure = () => {
    if (!measureRef.current) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.appendChild(p);
      document.body.appendChild(svg);
      measureRef.current = p;
    }
    return measureRef.current;
  };

  /** Клик: смена шага + автоматический спуск по дороге (если есть блок) */
  const rideTo = (next: Step) => {
    if (flying.current || busy) return;

    timers.current.forEach(clearTimeout);

    const nextMeta = STEPS[next];
    const nextSize = cloudSize(nextMeta.title, nextMeta.line);

    // 0→1: только текст «карта сайта», без дороги.
    // Клик по первому облаку — сразу поднимаем страницу в начало,
    // чтобы тур стартовал от самого верха.
    if (!nextMeta.target) {
      window.scrollTo({ top: 0 });
      setScrollY(0);
      setStep(next);
      const d = pageDock(next);
      placePage(d.x, d.y, nextSize.w, nextSize.h, 0);
      return;
    }

    // ——— автоматический спуск по дороге ———
    flying.current = true;
    setBusy(true);

    const from = pageDock(step);
    const to = pageDock(next);
    const wave = waveFor(roads.length, next === LAST);
    const pathD = makePath(from, to, wave);
    const meas = getMeasure();
    const info = alongPath(pathD, 0, meas);

    setPathLen(info.len);
    setActiveRoad(pathD);
    setDrawT(0);
    setStep(next); // текст сразу; карта пропадёт если next > 1
    placePage(from.x, from.y, nextSize.w, nextSize.h);
    setDocH(Math.max(document.documentElement.scrollHeight, to.y + 500));

    // короче дорога → чуть короче поездка
    const dur = wave === 'flip' ? 2800 : 2000;
    const t0 = performance.now();

    const tick = (now: number) => {
      const raw = Math.min(1, (now - t0) / dur);
      // почти linear — неровности дороги видны
      const e = raw;
      setDrawT(e);

      const pt = alongPath(pathD, e, meas);
      // flip: один переворот (угол ограничен), без двойного spin
      setRot(
        wave === 'flip'
          ? Math.max(-180, Math.min(180, pt.angle))
          : Math.max(-28, Math.min(28, pt.angle * 0.5)),
      );

      // скролл слегка следует за облаком, чтобы путь был в кадре
      const wantScroll = Math.max(0, pt.y - window.innerHeight * 0.4);
      window.scrollTo({ top: wantScroll });
      setScrollY(wantScroll);

      placePage(pt.x, pt.y, nextSize.w, nextSize.h, wantScroll);

      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        setActiveRoad(null);
        setDrawT(1);
        setRot(0);
        const final = pageDock(next);
        const endScroll = Math.max(0, final.y - window.innerHeight * 0.35);
        window.scrollTo({ top: endScroll });
        setScrollY(endScroll);
        placePage(final.x, final.y, nextSize.w, nextSize.h, endScroll);

        if (next === LAST) {
          // весь путь пройден — дорога исчезает, можно свободно скроллить
          setRoads([]);
        } else {
          setRoads((prev) => [...prev, pathD]);
        }

        flying.current = false;
        setBusy(false);
      }
    };

    requestAnimationFrame(tick);
  };

  /** Убрать дорогу и облако */
  const closeTour = () => {
    if (phase === 'out' || phase === 'gone') return;
    timers.current.forEach(clearTimeout);
    setRoads([]);
    setActiveRoad(null);
    setPhase('out');
    window.setTimeout(() => setPhase('gone'), 800);
  };

  const onClick = () => {
    if (phase === 'out' || phase === 'gone' || busy) return;
    if (step < LAST) {
      rideTo((step + 1) as Step);
      return;
    }
    closeTour();
  };

  if (phase === 'gone') return null;

  const entering = phase === 'in';
  const leaving = phase === 'out';
  const poseidonW = size.w > 400 ? 118 : 100;
  const slot = Math.round(poseidonW * 0.7);

  // дорога — задний план (тот же body, z ниже облака)
  const roadSvg = (
    <svg
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: docH,
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'visible',
        transform: `translateY(${-scrollY}px)`,
      }}
    >
      {roads.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="rgba(250,218,27,0.4)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke={HERO_VIOLET} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke={YELLOW} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 14" />
        </g>
      ))}
      {activeRoad && (
        <g>
          <path
            d={activeRoad}
            fill="none"
            stroke="rgba(250,218,27,0.4)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLen}
            strokeDashoffset={pathLen * (1 - drawT)}
          />
          <path
            d={activeRoad}
            fill="none"
            stroke={HERO_VIOLET}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLen}
            strokeDashoffset={pathLen * (1 - drawT)}
          />
          <path
            d={activeRoad}
            fill="none"
            stroke={YELLOW}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10 14"
            strokeDashoffset={pathLen * (1 - drawT)}
          />
        </g>
      )}
    </svg>
  );

  const cloudUi = (
    <>
      {/* Посейдон — поверх дороги */}
      <img
        src="/decor/poseidon.png"
        alt=""
        draggable={false}
        aria-hidden
        style={{
          position: 'fixed',
          left: pos.left + size.w / 2 - poseidonW / 2,
          top: pos.top - 2,
          width: poseidonW,
          height: 'auto',
          zIndex: 10050,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 4px 10px rgba(33,25,95,.28))',
          transform: leaving
            ? 'translateX(-100px) scale(0.5)'
            : entering
              ? 'scale(0.9)'
              : `rotate(${rot}deg)`,
          opacity: entering || leaving ? 0 : 1,
          transition: busy ? 'none' : 'opacity 0.4s, transform 0.5s',
          transformOrigin: '50% 80%',
        }}
      />

      <Box
        role="button"
        tabIndex={0}
        aria-label={`${data.title} ${data.line}`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        sx={{
          position: 'fixed',
          left: pos.left,
          top: pos.top,
          width: size.w,
          maxWidth: 'calc(100vw - 16px)',
          // первый план: конец дороги за облаком
          zIndex: 10000,
          cursor: busy ? 'default' : 'pointer',
          userSelect: 'none',
          pointerEvents: busy || leaving ? 'none' : 'auto',
          opacity: entering || leaving ? 0 : 1,
          transform: leaving
            ? 'translateX(-120%) scale(0.6)'
            : entering
              ? 'scale(0.92)'
              : `rotate(${rot}deg)`,
          transformOrigin: '50% 85%',
          transition: busy ? 'none' : 'opacity 0.4s, transform 0.5s, width 0.35s ease',
          filter: 'drop-shadow(0 14px 28px rgba(33,25,95,0.28))',
        }}
      >
        <Box sx={{ height: slot }} aria-hidden />

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            minHeight: size.h,
            mt: `-${Math.round(slot * 0.3)}px`,
          }}
        >
          {/*
            «Подушка» только внутри силуэта облака (clip-path = та же форма).
            Закрывает конец дороги, не вылезает за края.
          */}
          <Box
            component="svg"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
            aria-hidden
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="tourCloud2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#FAF8FF" />
                <stop offset="100%" stopColor="#EDE6FF" />
              </linearGradient>
              <clipPath id="tourCloudClip" clipPathUnits="userSpaceOnUse">
                <path d="M 68 148 C 36 146, 22 118, 40 96 C 24 82, 34 56, 64 54 C 72 26, 118 14, 152 36 C 174 12, 228 10, 258 36 C 292 14, 348 28, 358 60 C 388 62, 398 96, 380 118 C 400 136, 384 156, 348 156 L 92 156 C 76 156, 68 152, 68 148 Z" />
              </clipPath>
            </defs>
            {/* непрозрачная заливка строго по контуру облака */}
            <path
              d="M 68 148 C 36 146, 22 118, 40 96 C 24 82, 34 56, 64 54 C 72 26, 118 14, 152 36 C 174 12, 228 10, 258 36 C 292 14, 348 28, 358 60 C 388 62, 398 96, 380 118 C 400 136, 384 156, 348 156 L 92 156 C 76 156, 68 152, 68 148 Z"
              fill="url(#tourCloud2)"
              stroke={HERO_VIOLET}
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            {/* доп. слой снизу внутри клипа — глубже прячет конец дороги */}
            <rect
              x="60"
              y="100"
              width="280"
              height="70"
              fill="#F4EFFC"
              clipPath="url(#tourCloudClip)"
            />
          </Box>

          {/* крестик на первом облаке — выйти из тура, не проходя его целиком */}
          {step === 0 && (
            <IconButton
              aria-label="Закрыть подсказку"
              onClick={(e) => {
                e.stopPropagation();
                closeTour();
              }}
              onKeyDown={(e) => e.stopPropagation()}
              sx={{
                position: 'absolute',
                top: '27%',
                right: '7%',
                zIndex: 3,
                p: 0.25,
                color: HERO_VIOLET,
                bgcolor: '#FFF',
                border: `2px solid ${HERO_VIOLET}`,
                '&:hover': { bgcolor: YELLOW, color: INK },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}

          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: step === 1 ? 'flex-end' : 'center',
              gap: step === 1 ? 0.75 : 0,
              // 2-е: заметно правее к карте, слева большой отступ от края
              pl: step === 1 ? { xs: 7, sm: 8.5, md: 9.5 } : 3.5,
              pr: step === 1 ? { xs: 3, sm: 3.5 } : 3.5,
              pt: step === 1 ? 4.5 : 5,
              pb: step === 1 ? 3.25 : 3.5,
              minHeight: size.h - 8,
            }}
          >
            <Box
              sx={{
                flex: step === 1 ? '1 1 auto' : 1,
                minWidth: 0,
                maxWidth: step === 1 ? { xs: '68%', sm: '70%' } : '100%',
                textAlign: step === 1 ? 'left' : 'center',
                ml: step === 1 ? 'auto' : 0,
              }}
            >
              {data.title ? (
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: HERO_VIOLET,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 0.75,
                  }}
                >
                  {data.title}
                </Typography>
              ) : null}
              <Typography
                key={data.line}
                sx={{
                  m: 0,
                  fontWeight: 900,
                  lineHeight: 1.25,
                  ...cartoonTitle,
                  WebkitTextStroke: `1.2px ${INK}`,
                  fontSize:
                    step === 1
                      ? { xs: 13, sm: 14.5, md: 15.5 }
                      : { xs: 16, sm: 19, md: 21 },
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                {data.line}
              </Typography>
            </Box>

            {step === 1 && (
              <Box
                component="img"
                src="/decor/site-map.png"
                alt=""
                draggable={false}
                sx={{
                  width: { xs: 58, sm: 72 },
                  height: 'auto',
                  flexShrink: 0,
                  ml: 0.5,
                  mr: { xs: 1.25, sm: 1.75 },
                  transform: 'rotate(8deg)',
                  filter: 'drop-shadow(0 3px 8px rgba(33,25,95,.2))',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );

  return (
    <>
      {typeof document !== 'undefined' && createPortal(roadSvg, document.body)}
      {/* облако в body с z выше дороги — конец пути за облаком */}
      {typeof document !== 'undefined' && createPortal(cloudUi, document.body)}
    </>
  );
}
