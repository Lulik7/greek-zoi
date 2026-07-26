import { useEffect, useRef } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

interface Props {
  /** Видео с анимированной фигурой */
  src: string;
  /** Что вырезаем из кадра: [x, y, ширина, высота] в пикселях кадра */
  crop: [number, number, number, number];
  /** Куски кадра, которые нужно стереть (координаты кадра): чужие кнопки, надписи */
  erase?: [number, number, number, number][];
  sx?: SxProps<Theme>;
}

/**
 * Фигура из видео без фона: каждый кадр рисуется на холст, и сиреневые точки
 * фона делаются прозрачными. Так на странице остаётся только сам атлет —
 * ни рамки-квадрата, ни соседних рисунков из исходного кадра.
 */
export default function HeroFigure({ src, crop, erase, sx }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const [sx0, sy0, sw, sh] = crop;
    canvas.width = sw;
    canvas.height = sh;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';

    let raf = 0;
    const draw = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, sw, sh);
        ctx.drawImage(video, sx0, sy0, sw, sh, 0, 0, sw, sh);
        // вырезаем куски чужого интерфейса, попавшие в кадр
        erase?.forEach(([ex, ey, ew, eh]) => ctx.clearRect(ex - sx0, ey - sy0, ew, eh));
        const frame = ctx.getImageData(0, 0, sw, sh);
        const d = frame.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          // сиреневый фон: синего заметно больше, чем зелёного и красного
          const violet = b > 150 && b - g > 34 && b - r > 22 && r > 85 && r < 180;
          if (violet) d[i + 3] = 0;
          else if (b > 140 && b - g > 22 && b - r > 12) d[i + 3] = 110; // мягкая кромка
        }
        ctx.putImageData(frame, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };

    void video.play().catch(() => {
      /* автозапуск может быть запрещён — тогда останется первый кадр */
    });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      video.pause();
      video.src = '';
    };
  }, [src, crop, erase]);

  return <Box component="canvas" ref={canvasRef} aria-hidden sx={{ display: 'block', ...sx }} />;
}
