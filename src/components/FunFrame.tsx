import { Box, Typography } from '@mui/material';
import { INK, YELLOW } from '../theme';

/**
 * Квадратная карточка в «весёлой» рамке: толстая тёмная обводка с подложкой,
 * бегущий жёлтый пунктир внутри, лёгкое покачивание и наклон.
 *
 * Одна на весь сайт — так рамки у инструментов и у портрета не разъедутся.
 * Поворот держим на внешнем слое, покачивание на внутреннем: иначе анимация
 * перезаписывает transform и наклон пропадает.
 */
export default function FunFrame({
  children,
  caption,
  tilt = 0,
  delay = '0s',
  width,
  aspect,
  onLight = false,
}: {
  children: React.ReactNode;
  caption?: string;
  /** наклон в градусах */
  tilt?: number;
  /** сдвиг покачивания, чтобы карточки не качались хором */
  delay?: string;
  width?: { xs: number; sm?: number; md: number };
  /** пропорции окна: по умолчанию квадрат */
  aspect?: string;
  /**
   * Рамка стоит на светлом фоне. Подпись по умолчанию жёлтая с тёмной
   * тенью — это читается на фиолетовой полосе, но не на бежевой странице.
   */
  onLight?: boolean;
}) {
  const w = width ?? { xs: 140, sm: 165, md: 200 };
  return (
    <Box
      sx={{
        width: w,
        flexShrink: 0,
        transform: `rotate(${tilt}deg)`,
        transformOrigin: '50% 60%',
        transition: 'transform 0.25s ease',
        '&:hover': { transform: `rotate(${tilt}deg) scale(1.07)` },
      }}
    >
      <Box
        sx={{
          animation: `fun-frame-wobble 4.4s ease-in-out ${delay} infinite`,
          'html.a11y-no-motion &': { animation: 'none' },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: aspect ?? '1 / 1',
            // углы почти прямые — скругление только чтобы не резало глаз
            borderRadius: '6px',
            background: 'linear-gradient(160deg, #FFFDF3 0%, #FDF0D2 60%, #F6E2BA 100%)',
            border: `6px solid ${INK}`,
            boxShadow: `0 8px 0 ${INK}, 0 18px 34px rgba(33,25,95,0.45)`,
            overflow: 'hidden',
            p: 1.25,
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 7,
              borderRadius: '3px',
              border: `3px dashed ${YELLOW}`,
              animation: 'fun-frame-dash 9s linear infinite',
              'html.a11y-no-motion &': { animation: 'none' },
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          {children}
        </Box>
      </Box>

      {caption && (
        <Typography
          sx={{
            mt: 1.25,
            textAlign: 'center',
            fontWeight: onLight ? 700 : 900,
            fontSize: { xs: 14.5, md: 16.5 },
            color: onLight ? INK : YELLOW,
            textShadow: onLight ? 'none' : `0 2px 0 ${INK}`,
            opacity: onLight ? 0.85 : 1,
            lineHeight: 1.35,
          }}
        >
          {caption}
        </Typography>
      )}

      <style>{`
        @keyframes fun-frame-wobble {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-9px); }
        }
        @keyframes fun-frame-dash {
          to { stroke-dashoffset: 100px; }
        }
      `}</style>
    </Box>
  );
}
