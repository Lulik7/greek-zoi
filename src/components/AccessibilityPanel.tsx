import { useCallback, useEffect, useState } from 'react';
import { Box, Divider, IconButton, Stack, Switch, Tooltip, Typography } from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { HERO_BLUE, INK, YELLOW } from '../theme';

type Settings = {
  /** масштаб страницы: 1 — обычный, до 1.5 */
  zoom: number;
  contrast: boolean;
  noMotion: boolean;
  underlineLinks: boolean;
};

const DEFAULTS: Settings = { zoom: 1, contrast: false, noMotion: false, underlineLinks: false };
const KEY = 'a11y-settings';
const ZOOM_STEPS = [1, 1.15, 1.3, 1.5];

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULTS;
  }
}

function save(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* приватный режим — просто не сохраняем */
  }
}

/**
 * Специальные возможности: кнопка сбоку и панель с настройками.
 * Всё применяется к <html> — классами и style.zoom, поэтому работает
 * на любой странице и переживает перезагрузку.
 */
export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<Settings>(DEFAULTS);

  // читаем сохранённое только в браузере, чтобы не мигало при первой отрисовке
  useEffect(() => setS(load()), []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.zoom = s.zoom === 1 ? '' : String(s.zoom);
    root.classList.toggle('a11y-contrast', s.contrast);
    root.classList.toggle('a11y-no-motion', s.noMotion);
    root.classList.toggle('a11y-underline', s.underlineLinks);
    save(s);
  }, [s]);

  const patch = useCallback((p: Partial<Settings>) => setS((prev) => ({ ...prev, ...p })), []);

  const zoomIndex = Math.max(0, ZOOM_STEPS.indexOf(s.zoom));
  const changed =
    s.zoom !== 1 || s.contrast || s.noMotion || s.underlineLinks;

  const row = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: INK }}>{label}</Typography>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} size="small" />
    </Stack>
  );

  return (
    <>
      {/* стили доступности живут рядом с компонентом, который их включает */}
      <style>{`
        html.a11y-contrast body { filter: contrast(1.45) saturate(1.15); }
        html.a11y-no-motion *, html.a11y-no-motion *::before, html.a11y-no-motion *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
        html.a11y-underline a { text-decoration: underline !important; }
      `}</style>

      <Tooltip title="Специальные возможности" placement="left">
        <IconButton
          aria-label="Специальные возможности"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          sx={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1500,
            width: 52,
            height: 52,
            borderRadius: '14px 0 0 14px',
            bgcolor: HERO_BLUE,
            color: '#fff',
            border: `2px solid ${INK}`,
            borderRight: 'none',
            boxShadow: '0 6px 18px rgba(18,58,99,0.3)',
            '&:hover': { bgcolor: YELLOW, color: INK },
          }}
        >
          <AccessibilityNewIcon />
        </IconButton>
      </Tooltip>

      {open && (
        <Box
          role="dialog"
          aria-label="Настройки специальных возможностей"
          sx={{
            position: 'fixed',
            right: { xs: 8, sm: 16 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1600,
            width: { xs: 'calc(100vw - 16px)', sm: 300 },
            maxWidth: 320,
            p: 2,
            borderRadius: 3,
            bgcolor: '#fff',
            border: `3px solid ${HERO_BLUE}`,
            boxShadow: '0 18px 40px rgba(18,58,99,0.32)',
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
          >
            <Typography sx={{ fontWeight: 900, color: INK, fontSize: 15 }}>
              Специальные возможности
            </Typography>
            <IconButton aria-label="Закрыть" size="small" onClick={() => setOpen(false)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Typography sx={{ fontWeight: 700, fontSize: 14, color: INK, mb: 0.75 }}>
            Размер страницы
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            {ZOOM_STEPS.map((z, i) => (
              <Box
                key={z}
                component="button"
                type="button"
                aria-pressed={zoomIndex === i}
                onClick={() => patch({ zoom: z })}
                sx={{
                  flex: 1,
                  py: 0.75,
                  cursor: 'pointer',
                  borderRadius: 2,
                  border: `2px solid ${INK}`,
                  bgcolor: zoomIndex === i ? YELLOW : '#fff',
                  color: INK,
                  fontWeight: 900,
                  fontSize: 11 + i * 2,
                  fontFamily: 'inherit',
                }}
              >
                А
              </Box>
            ))}
          </Stack>

          <Stack spacing={1}>
            {row('Высокий контраст', s.contrast, (v) => patch({ contrast: v }))}
            {row('Убрать анимацию', s.noMotion, (v) => patch({ noMotion: v }))}
            {row('Подчёркивать ссылки', s.underlineLinks, (v) => patch({ underlineLinks: v }))}
          </Stack>

          {changed && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Box
                component="button"
                type="button"
                onClick={() => setS(DEFAULTS)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  width: '100%',
                  py: 0.75,
                  cursor: 'pointer',
                  justifyContent: 'center',
                  borderRadius: 2,
                  border: `2px solid ${INK}`,
                  bgcolor: '#fff',
                  color: INK,
                  fontWeight: 800,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                <RestartAltIcon fontSize="small" /> Сбросить настройки
              </Box>
            </>
          )}
        </Box>
      )}
    </>
  );
}
