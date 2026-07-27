import { Box } from '@mui/material';

/**
 * Трое героев на всю ширину: WebM с альфой (фон уже снят),
 * без canvas — иначе главный поток подвисает (белый/пустой экран).
 */
export default function HeroesRun({ src }: { src: string }) {
  // предпочитаем webm с прозрачностью; fallback — тот же src
  const webm = src.endsWith('.mp4')
    ? src.replace(/heroes-source\.mp4.*/, 'heroes-run.webm')
    : src;

  return (
    <Box
      aria-hidden
      sx={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        overflow: 'hidden',
        bgcolor: 'transparent',
        lineHeight: 0,
        pointerEvents: 'none',
        my: { xs: 0.5, md: 1.5 },
      }}
    >
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={webm}
        sx={{
          display: 'block',
          width: '100%',
          height: 'auto',
          maxHeight: { xs: 140, sm: 170, md: 200 },
          objectFit: 'contain',
          objectPosition: 'center center',
          // без тёмной подложки — герои на фоне страницы
          background: 'transparent',
          // чуть мельче визуально
          transform: 'scale(0.92)',
          transformOrigin: 'center center',
        }}
      />
    </Box>
  );
}
