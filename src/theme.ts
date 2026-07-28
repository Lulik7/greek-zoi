import { createTheme, alpha } from '@mui/material/styles';

/**
 * Сайт: спокойный голубой и белый, жёлтые акценты (лимоны).
 */
export const UI_FONT = '"Nunito", "Segoe UI", system-ui, sans-serif';
export const GREEK_FONT = UI_FONT;

/** Спокойный голубой — шапка и первый блок */
export const HERO_BLUE = '#5B9BD5';
export const HERO_BLUE_SOFT = '#4A88C2';
export const SCENE_GROUND = '#EAF3FB';
/** Белый фон всего сайта */
export const PAGE_BG = '#FFFFFF';
export const PAGE_BG_SOFT = '#EAF3FB';
export const YELLOW = '#FADA1B';
/** Тёмно-синий: текст и обводка заголовка */
export const INK = '#123A63';
/** Текст на светлом фоне */
export const TEXT_ON_DARK = INK;
export const TEXT_MUTED = '#4B6A85';

const blue = '#3E7FB8';
const blueDark = INK;
const blueLight = '#8FC1E3';
const yellow = YELLOW;
const ink = INK;

export const cartoonTitle = {
  color: yellow,
  WebkitTextStroke: `1.5px ${ink}`,
  paintOrder: 'stroke fill',
  textShadow: `
    0 3px 0 ${alpha(ink, 0.55)},
    0 8px 18px ${alpha(ink, 0.28)}
  `,
  letterSpacing: '0.01em',
} as const;

export const pillButtonSx = {
  borderRadius: 999,
  fontWeight: 800,
  boxShadow: `0 4px 0 ${alpha(ink, 0.28)}`,
  '&:hover': {
    boxShadow: `0 6px 0 ${alpha(ink, 0.3)}`,
    transform: 'translateY(-1px)',
  },
} as const;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: blue, dark: blueDark, light: blueLight, contrastText: '#fff' },
    secondary: { main: yellow, dark: '#E5C410', light: '#FFE56A', contrastText: ink },
    success: { main: '#1f9d63' },
    background: { default: PAGE_BG, paper: '#ffffff' },
    text: { primary: ink, secondary: TEXT_MUTED },
    divider: 'rgba(18,58,99,0.14)',
  },
  shape: { borderRadius: 22 },
  typography: {
    fontFamily: UI_FONT,
    fontSize: 15,
    h1: { fontWeight: 900, letterSpacing: '0.01em', lineHeight: 1.05 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 900 },
    h4: { fontWeight: 900, letterSpacing: '0.005em' },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontSize: 15.5, fontWeight: 800 },
    body1: { fontSize: 16.5, lineHeight: 1.55 },
    body2: { fontSize: 15.5, lineHeight: 1.55 },
    caption: { fontSize: 14, lineHeight: 1.45 },
    overline: { fontSize: 13, letterSpacing: '0.08em', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 800, letterSpacing: 0, fontSize: 15.5 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          /* фон — волны .site-wave-bg в App; body прозрачный/запасной цвет */
          backgroundColor: 'transparent',
          color: ink,
        },
        '#root': {
          minHeight: '100%',
        },
        '::selection': { background: alpha(yellow, 0.5) },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          /* непрозрачный белый — фон страницы не «просвечивает» и не красит формы */
          backgroundColor: '#ffffff',
          opacity: 1,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgba(18,58,99,0.1)',
          borderRadius: 22,
          backgroundColor: '#ffffff',
          opacity: 1,
          boxShadow: `0 2px 0 ${alpha(ink, 0.05)}, 0 18px 40px -24px ${alpha(ink, 0.35)}`,
          transition: 'box-shadow .25s ease, transform .25s ease, border-color .25s ease',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 22 },
        sizeLarge: { paddingBlock: 13, fontSize: 16.5 },
        contained: {
          boxShadow: `0 4px 0 ${alpha(ink, 0.22)}`,
          '&:hover': {
            boxShadow: `0 6px 0 ${alpha(ink, 0.26)}`,
            transform: 'translateY(-1px)',
          },
          '&.MuiButton-containedSecondary': {
            color: ink,
            fontWeight: 800,
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: 'rgba(18,58,99,0.22)',
          color: ink,
          '&:hover': { borderWidth: 2, borderColor: blue },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 999, fontSize: 14.5 },
        sizeSmall: { fontSize: 13.5, height: 26 },
        outlined: { borderColor: 'rgba(18,58,99,0.2)', color: ink },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: 15 },
        // шапка таблицы синяя — подписи в ней только белые, иначе не читаются
        head: { fontWeight: 800, color: '#FFFFFF', backgroundColor: '#3E7FB8' },
      },
    },
    MuiListItemText: { styleOverrides: { primary: { fontSize: 16 } } },
    MuiFormHelperText: { styleOverrides: { root: { fontSize: 13.5 } } },
    MuiInputBase: { styleOverrides: { root: { fontSize: 16 } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#fff',
        },
      },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 16, fontSize: 15.5 } } },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 800, fontSize: 15.5 } },
    },
  },
});
