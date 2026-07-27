import { useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { cartoonTitle, HERO_VIOLET, INK, YELLOW } from '../../theme';

/** Греческие поздравления — выпадает случайное */
const GREEK = [
  { big: 'ΜΠΡΑΒΟ!', ru: 'Браво!' },
  { big: 'ΣΥΓΧΑΡΗΤΗΡΙΑ!', ru: 'Поздравляем!' },
  { big: 'ΤΕΛΕΙΑ!', ru: 'Отлично!' },
  { big: 'ΥΠΕΡΟΧΑ!', ru: 'Превосходно!' },
  { big: 'ΜΠΡΑΒΟ ΣΟΥ!', ru: 'Молодец!' },
];

const COLORS = [YELLOW, HERO_VIOLET, '#FF6B6B', '#4ECDC4', '#FFA62B', '#B388FF'];

/** Очаги салюта по всему экрану — залп идёт волнами */
const BURSTS = [
  { x: 16, y: 20 },
  { x: 50, y: 13 },
  { x: 84, y: 20 },
  { x: 10, y: 52 },
  { x: 90, y: 50 },
  { x: 26, y: 80 },
  { x: 50, y: 88 },
  { x: 76, y: 78 },
];

const PER_BURST = 26;
/**
 * Два залпа — больше и не нужно, а главное: каждая искра это анимированный
 * элемент в DOM. Тысяча с лишним подвешивает вкладку, 8×26×2 = 416 идёт ровно.
 */
const WAVES = 2;
const SHOW_MS = 5500;

type Particle = {
  id: string;
  left: number;
  top: number;
  dx: number;
  dy: number;
  color: string;
  delay: number;
  size: number;
};

function makeParticles(): Particle[] {
  const out: Particle[] = [];
  for (let w = 0; w < WAVES; w++) {
    BURSTS.forEach((b, bi) => {
      for (let i = 0; i < PER_BURST; i++) {
        const angle = (i / PER_BURST) * Math.PI * 2 + Math.random() * 0.25;
        const dist = 170 + Math.random() * 260;
        out.push({
          id: `${w}-${bi}-${i}`,
          left: b.x,
          top: b.y,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          // волны идут внахлёст: очаги вспыхивают вразнобой, а не хором
          delay: w * 1.9 + bi * 0.09 + Math.random() * 0.25,
          size: 10 + Math.random() * 12,
        });
      }
    });
  }
  return out;
}

/**
 * Салют и надпись при победе. Показывается поверх страницы,
 * гаснет сам через несколько секунд или по клику.
 * При включённом «убрать анимацию» — только надпись, без разлетающихся искр.
 */
export default function WinCelebration({ open, onClose }: { open: boolean; onClose: () => void }) {
  // новый набор искр и новое поздравление на каждый показ
  const particles = useMemo(() => (open ? makeParticles() : []), [open]);
  const phrase = useMemo(
    () => (open ? GREEK[Math.floor(Math.random() * GREEK.length)] : GREEK[0]),
    [open],
  );

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, SHOW_MS);
    return () => window.clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Box
      role="status"
      aria-live="polite"
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2400,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        bgcolor: 'rgba(33,25,95,0.28)',
        animation: 'win-fade 0.35s ease-out',
      }}
    >
      {/* искры */}
      {particles.map((p) => (
        <Box
          key={p.id}
          aria-hidden
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              animationDelay: `${p.delay}s`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
            } as React.CSSProperties
          }
          sx={{
            position: 'absolute',
            borderRadius: '50%',
            pointerEvents: 'none',
            boxShadow: '0 0 14px 3px rgba(255,255,255,0.95)',
            animation: 'win-spark 2.2s cubic-bezier(.15,.7,.3,1) forwards',
            'html.a11y-no-motion &': { display: 'none' },
          }}
        />
      ))}

      {/* надпись */}
      <Box
        sx={{
          position: 'relative',
          textAlign: 'center',
          px: { xs: 3, sm: 6 },
          py: { xs: 3, sm: 4 },
          borderRadius: 6,
          bgcolor: '#fff',
          border: `5px solid ${INK}`,
          boxShadow: `0 10px 0 ${INK}, 0 26px 50px rgba(33,25,95,0.45)`,
          animation: 'win-pop 0.5s cubic-bezier(.2,1.4,.4,1)',
          maxWidth: 'calc(100vw - 24px)',
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 30, sm: 44 },
            fontWeight: 900,
            lineHeight: 1.05,
            ...cartoonTitle,
            WebkitTextStroke: `1.8px ${INK}`,
          }}
        >
          {phrase.big}
        </Typography>
        <Typography
          sx={{
            mt: 0.5,
            fontSize: { xs: 15, sm: 18 },
            fontWeight: 900,
            color: HERO_VIOLET,
          }}
        >
          {phrase.ru}
        </Typography>
        {/* «Бум! Ура! Молодец!» по-гречески */}
        <Typography
          sx={{
            mt: 1.5,
            fontSize: { xs: 22, sm: 30 },
            fontWeight: 900,
            color: INK,
            letterSpacing: '0.02em',
            lineHeight: 1.15,
          }}
        >
          Μπουμ! Ζήτω! Μπράβο!
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 12, fontWeight: 700, color: INK, opacity: 0.5 }}>
          клик — закрыть
        </Typography>
      </Box>

      <style>{`
        @keyframes win-spark {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.25); opacity: 0; }
        }
        @keyframes win-pop {
          0%   { transform: scale(0.6) rotate(-4deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes win-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}
