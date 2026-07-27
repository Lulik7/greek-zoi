import { Box } from '@mui/material';

/**
 * Волнистый переход между цветными полосами — тот же силуэт, что под шапкой
 * на главной. Вынесен отдельно, чтобы все переходы на сайте выглядели
 * одинаково и правились в одном месте.
 *
 * `color` — цвет того, что ПОД волной: волна как бы наливается снизу.
 * `flip` — перевернуть, когда волна стоит сверху блока, а не снизу.
 */
const WAVE_D = 'M0,38 C220,86 430,4 720,26 C1010,48 1230,92 1440,44 L1440,90 L0,90 Z';

export default function WaveEdge({
  color,
  flip = false,
  height,
}: {
  color: string;
  flip?: boolean;
  height?: { xs: number; md: number };
}) {
  const h = height ?? { xs: 28, md: 56 };
  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      sx={{
        display: 'block',
        width: '100%',
        height: h,
        position: 'relative',
        zIndex: 2,
        transform: flip ? 'scaleY(-1)' : 'none',
      }}
    >
      <path d={WAVE_D} fill={color} />
    </Box>
  );
}
