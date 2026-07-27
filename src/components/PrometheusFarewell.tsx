import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Link, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { HERO_VIOLET, INK, YELLOW } from '../theme';

type Phase = 'enter' | 'hold' | 'fly' | 'done';

const HOLD_MS = 10_000;
const FLY_MS = 900;

/**
 * Силуэт почти на весь viewBox (края «пуха» у границ) —
 * при растяжении текст с полями 12–18% остаётся внутри.
 */
const CLOUD_D =
  'M 18 175 C 4 170, 2 120, 16 95 C 4 75, 14 45, 40 42 C 48 18, 85 8, 115 28 C 135 8, 185 4, 220 28 C 250 8, 300 14, 325 42 C 360 38, 390 70, 385 105 C 402 125, 398 165, 365 178 C 385 195, 355 210, 320 208 L 45 210 C 25 210, 18 190, 18 175 Z';

/**
 * Баннер Прометея: показывается при каждом заходе на Подписку.
 * Уходит по клику или сам через HOLD_MS.
 */
export default function PrometheusFarewell({
  authorEmail,
  facebookUrl,
}: {
  authorEmail?: string;
  facebookUrl?: string;
}) {
  const [phase, setPhase] = useState<Phase>('enter');
  const timersRef = useRef<number[]>([]);

  const dismiss = useCallback(() => {
    if (phase === 'fly' || phase === 'done') return;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setPhase('fly');
    timersRef.current.push(window.setTimeout(() => setPhase('done'), FLY_MS));
  }, [phase]);

  useEffect(() => {
    const tEnter = window.setTimeout(() => setPhase('hold'), 400);
    const tFly = window.setTimeout(() => setPhase('fly'), HOLD_MS);
    const tDone = window.setTimeout(() => setPhase('done'), HOLD_MS + FLY_MS);
    timersRef.current = [tEnter, tFly, tDone];
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  if (phase === 'done') return null;

  const flying = phase === 'fly';
  const entering = phase === 'enter';
  const mail = authorEmail || 'info@greek-zoi.com';
  const fb = facebookUrl || 'https://www.facebook.com/';

  return (
    <Box
      aria-live="polite"
      onClick={dismiss}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: flying ? 'none' : 'auto',
        cursor: flying ? 'default' : 'pointer',
        bgcolor: flying ? 'transparent' : 'rgba(33, 25, 95, 0.32)',
        transition: 'background-color 0.7s ease',
        px: 2,
      }}
    >
      <Box
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        role="button"
        tabIndex={0}
        aria-label="Закрыть сообщение"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dismiss();
          }
        }}
        sx={{
          position: 'relative',
          // компактнее — не на весь экран
          width: { xs: 'min(100%, 340px)', sm: 420, md: 460 },
          maxWidth: 480,
          cursor: flying ? 'default' : 'pointer',
          transform: entering
            ? 'translateY(24px) scale(0.92)'
            : flying
              ? 'translate(70px, -180px) scale(0.4) rotate(10deg)'
              : 'translateY(0) scale(1)',
          opacity: entering ? 0 : flying ? 0 : 1,
          transition: flying
            ? 'transform 0.9s ease, opacity 0.85s ease'
            : 'transform 0.4s ease-out, opacity 0.35s ease-out',
          filter: 'drop-shadow(0 14px 28px rgba(33, 25, 95, 0.3))',
        }}
      >
        <Box
          component="img"
          src="/decor/prometheus.png"
          alt=""
          draggable={false}
          sx={{
            display: 'block',
            width: { xs: 72, sm: 84 },
            height: 'auto',
            mx: 'auto',
            mb: '-20px',
            position: 'relative',
            zIndex: 3,
            filter: 'drop-shadow(0 3px 10px rgba(33,25,95,.25))',
            animation: 'prom-sway 2.8s ease-in-out infinite',
            transformOrigin: '50% 85%',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            // высота следует за текстом + поля
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 400 220"
            preserveAspectRatio="none"
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
            }}
          >
            <defs>
              <linearGradient id="promCloudGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#F8F5FF" />
                <stop offset="100%" stopColor="#EDE6FF" />
              </linearGradient>
            </defs>
            <path
              d={CLOUD_D}
              fill="url(#promCloudGrad)"
              stroke={HERO_VIOLET}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path d={CLOUD_D} fill="none" stroke={YELLOW} strokeWidth="2" strokeOpacity="0.7" />
            <ellipse cx="120" cy="75" rx="32" ry="12" fill="#fff" opacity="0.45" />
          </Box>

          {/* крестик — явная кнопка закрытия (по облаку и так можно кликнуть) */}
          <IconButton
            aria-label="Закрыть сообщение"
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            onKeyDown={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: '9%',
              right: '10%',
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

          {/* текст: умеренные поля — силуэт почти на весь бокс */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              px: { xs: 3.25, sm: 3.75 },
              pt: { xs: 3.75, sm: 4.25 },
              pb: { xs: 3.25, sm: 3.75 },
              boxSizing: 'border-box',
            }}
          >
            <Typography
              sx={{
                m: 0,
                fontWeight: 800,
                lineHeight: 1.35,
                color: INK,
                fontSize: { xs: 12.5, sm: 13.5 },
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              Мы надеемся, что вам понравилось у нас и вы подписались, чтобы слушать и изучать
              новые песни!
            </Typography>
            <Typography
              sx={{
                m: 0,
                mt: 1,
                fontWeight: 800,
                lineHeight: 1.35,
                color: INK,
                fontSize: { xs: 12, sm: 13 },
                wordBreak: 'break-word',
              }}
            >
              Напиши о своих впечатлениях на{' '}
              <Link
                href={fb}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                sx={{ fontWeight: 900, color: HERO_VIOLET }}
              >
                Фейсбуке
              </Link>{' '}
              или напрямую{' '}
              <Link
                href={`mailto:${mail}`}
                onClick={(e) => e.stopPropagation()}
                sx={{ fontWeight: 900, color: HERO_VIOLET }}
              >
                автору
              </Link>
              !
            </Typography>
            <Typography
              sx={{
                m: 0,
                mt: 1.1,
                fontWeight: 900,
                lineHeight: 1.3,
                color: HERO_VIOLET,
                fontSize: { xs: 13, sm: 14.5 },
              }}
            >
              До новых встреч!
            </Typography>
            <Typography
              sx={{
                m: 0,
                mt: 0.55,
                fontWeight: 800,
                lineHeight: 1.3,
                color: INK,
                fontSize: { xs: 11.5, sm: 12.5 },
                wordBreak: 'break-word',
              }}
            >
              Успехов в изучении греческого языка!
            </Typography>
          </Box>
        </Box>
      </Box>

      <style>{`
        @keyframes prom-sway {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
      `}</style>
    </Box>
  );
}
