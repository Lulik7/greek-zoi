import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { cartoonTitle, HERO_VIOLET, INK, YELLOW } from '../theme';

/** landscape → cloud enter → hold → fly → done */
type Phase = 'landscape' | 'enter' | 'hold' | 'fly' | 'done';

/** Только пейзаж — ровно 2 секунды, затем облако */
const LANDSCAPE_MS = 2000;
const HOLD_MS = 4000;
const FLY_MS = 900;

/**
 * Приветствие админа:
 * 1) пейзаж почти на весь экран
 * 2) через 2 с поверх пейзажа — облако с чашкой (~4 с)
 * 3) всё уходит
 */
export default function AdminWelcomeCloud({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('landscape');

  useEffect(() => {
    const tCloud = window.setTimeout(() => setPhase('enter'), LANDSCAPE_MS);
    const tHold = window.setTimeout(() => setPhase('hold'), LANDSCAPE_MS + 450);
    const tFly = window.setTimeout(() => setPhase('fly'), LANDSCAPE_MS + HOLD_MS);
    const tDone = window.setTimeout(() => {
      setPhase('done');
      onDone();
    }, LANDSCAPE_MS + HOLD_MS + FLY_MS);
    return () => {
      window.clearTimeout(tCloud);
      window.clearTimeout(tHold);
      window.clearTimeout(tFly);
      window.clearTimeout(tDone);
    };
  }, [onDone]);

  if (phase === 'done') return null;

  // пейзаж остаётся, пока облако на нём; гаснет вместе с улётом
  const landscapeOut = phase === 'fly';
  const showCloud = phase !== 'landscape';
  const flying = phase === 'fly';
  const entering = phase === 'enter';

  return (
    <Box
      aria-live="polite"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'none',
        bgcolor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Пейзаж почти на весь экран — фон для облака */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          display: 'grid',
          placeItems: 'center',
          opacity: landscapeOut ? 0 : 1,
          transition: 'opacity 0.75s ease',
          pointerEvents: 'none',
        }}
      >
          <Box
            sx={{
              width: { xs: '96vw', sm: '94vw', md: '92vw' },
              height: { xs: '92vh', sm: '90vh', md: '88vh' },
              maxWidth: 1400,
              position: 'relative',
              animation: phase === 'landscape' ? 'admin-sea-in 0.6s ease-out both' : 'none',
              WebkitMaskImage:
                'radial-gradient(ellipse 88% 82% at 50% 50%, #000 55%, transparent 92%)',
              maskImage:
                'radial-gradient(ellipse 88% 82% at 50% 50%, #000 55%, transparent 92%)',
            }}
          >
            <Box
              component="img"
              src="/decor/santorini.jpg"
              alt=""
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                borderRadius: 2,
                animation: 'admin-sea-ken 2.2s ease-out both',
              }}
            />
          </Box>
        </Box>

      {/* облако с чашкой — поверх пейзажа */}
      {showCloud && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            width: { xs: 340, sm: 420, md: 480 },
            minHeight: { xs: 200, sm: 230 },
            transform: entering
              ? 'translateY(24px) scale(0.88)'
              : flying
                ? 'translate(130px, -240px) scale(0.4) rotate(12deg)'
                : 'translateY(0) scale(1)',
            opacity: entering ? 0 : flying ? 0 : 1,
            transition: flying
              ? 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.85s ease'
              : 'transform 0.45s ease-out, opacity 0.4s ease-out',
            filter: 'drop-shadow(0 16px 32px rgba(33, 25, 95, 0.3))',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: { xs: 18, sm: 28 },
              top: { xs: -8, sm: -12 },
              zIndex: 4,
              width: { xs: 72, sm: 88 },
              pointerEvents: 'none',
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                left: '50%',
                bottom: '88%',
                width: 40,
                height: 56,
                transform: 'translateX(-50%)',
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    left: 8 + i * 10,
                    bottom: 0,
                    width: 10 + i * 2,
                    height: 28 + i * 6,
                    borderRadius: '50%',
                    border: '2px solid rgba(124,122,207,0.35)',
                    borderBottomColor: 'transparent',
                    borderLeftColor: 'transparent',
                    opacity: 0,
                    animation: `admin-steam 2.2s ease-in-out ${i * 0.35}s infinite`,
                  }}
                />
              ))}
            </Box>
            <Box
              component="img"
              src="/decor/coffee-cup.png"
              alt=""
              draggable={false}
              sx={{
                display: 'block',
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 4px 8px rgba(33,25,95,.2))',
                animation: 'admin-cup 2.6s ease-in-out infinite',
                transformOrigin: '50% 90%',
              }}
            />
          </Box>

          <Box sx={{ position: 'relative', width: '100%', minHeight: { xs: 200, sm: 230 } }}>
            <Box
              component="svg"
              viewBox="0 0 480 230"
              preserveAspectRatio="none"
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                overflow: 'visible',
              }}
            >
              <defs>
                <linearGradient id="adminCloudFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#FAF8FF" />
                  <stop offset="100%" stopColor="#EDE6FF" />
                </linearGradient>
              </defs>
              <path
                d="M 80 175
                   C 42 172, 28 138, 48 112
                   C 28 96, 40 64, 78 62
                   C 88 28, 140 14, 180 40
                   C 208 12, 270 10, 308 40
                   C 348 14, 418 30, 430 70
                   C 468 72, 478 112, 456 138
                   C 480 160, 460 184, 416 186
                   L 108 186
                   C 90 186, 80 180, 80 175 Z"
                fill="url(#adminCloudFill)"
                stroke={HERO_VIOLET}
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <path
                d="M 80 175
                   C 42 172, 28 138, 48 112
                   C 28 96, 40 64, 78 62
                   C 88 28, 140 14, 180 40
                   C 208 12, 270 10, 308 40
                   C 348 14, 418 30, 430 70
                   C 468 72, 478 112, 456 138
                   C 480 160, 460 184, 416 186
                   L 108 186
                   C 90 186, 80 180, 80 175 Z"
                fill="none"
                stroke={YELLOW}
                strokeWidth="2.4"
                strokeOpacity="0.7"
              />
            </Box>

            <Box
              sx={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                // симметричные поля — надпись строго по центру облака
                px: { xs: 4, sm: 5 },
                pt: { xs: 5.5, sm: 6 },
                pb: { xs: 4.5, sm: 5 },
                minHeight: { xs: 200, sm: 230 },
                boxSizing: 'border-box',
              }}
            >
              <Typography
                component="p"
                lang="el"
                sx={{
                  m: 0,
                  fontWeight: 900,
                  lineHeight: 1.25,
                  ...cartoonTitle,
                  WebkitTextStroke: `1.7px ${INK}`,
                  fontSize: { xs: 22, sm: 28, md: 32 },
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                Ζόια, καλή σου μέρα!
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <style>{`
        @keyframes admin-steam {
          0% {
            opacity: 0;
            transform: translateY(8px) scaleY(0.6) rotate(-6deg);
          }
          30% { opacity: 0.7; }
          100% {
            opacity: 0;
            transform: translateY(-36px) scaleY(1.2) rotate(8deg);
          }
        }
        @keyframes admin-cup {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes admin-sea-ken {
          from { transform: scale(1.06); }
          to { transform: scale(1); }
        }
        @keyframes admin-sea-in {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </Box>
  );
}
