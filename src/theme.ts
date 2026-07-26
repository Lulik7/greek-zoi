import { createTheme, alpha } from '@mui/material/styles';

/**
 * Стиль по образцу, который выбрала школа: сиреневый фон, крупные жёлтые
 * заголовки с мягкой тенью, округлые формы и дружелюбный шрифт Nunito.
 */
export const UI_FONT = '"Nunito", "Segoe UI", system-ui, sans-serif';
/** Греческий текст набирается тем же шрифтом — так страница читается как единое целое */
export const GREEK_FONT = UI_FONT;

// цвета сняты пипеткой с самого видео-образца
export const HERO_VIOLET = '#7E7ACF';
const violet = '#6C5CE0';
const violetDark = '#241E55';
const violetLight = '#9C8FEA';
const yellow = '#FBDF23';
const ink = '#241E55';

/** Жёлтый заголовок с «мультяшной» тенью — как в образце */
export const cartoonTitle = {
  color: yellow,
  textShadow: `0 4px 0 ${alpha(violetDark, 0.55)}, 0 10px 24px ${alpha(violetDark, 0.35)}`,
  letterSpacing: '0.005em',
} as const;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: violet, dark: violetDark, light: violetLight, contrastText: '#fff' },
    secondary: { main: yellow, dark: '#E9BB16', light: '#FFE783', contrastText: ink },
    success: { main: '#1f9d63' },
    background: { default: '#F6F3FF', paper: '#ffffff' },
    text: { primary: ink, secondary: '#6B6296' },
    divider: 'rgba(59,45,122,0.14)',
  },
  shape: { borderRadius: 22 },
  typography: {
    fontFamily: UI_FONT,
    fontSize: 15,
    h1: { fontWeight: 900, letterSpacing: '0.005em', lineHeight: 1.05 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 900 },
    h4: { fontWeight: 900, letterSpacing: '0.005em' },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontSize: 15.5, fontWeight: 800 },
    body1: { fontSize: 16.5, lineHeight: 1.55 },
    // мелкий текст крупнее: пояснения, подписи и переводы читаются без напряжения
    body2: { fontSize: 15.5, lineHeight: 1.55 },
    caption: { fontSize: 14, lineHeight: 1.45 },
    overline: { fontSize: 13, letterSpacing: '0.08em', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 800, letterSpacing: 0, fontSize: 15.5 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: 'antialiased' },
        '::selection': { background: alpha(yellow, 0.5) },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgba(59,45,122,0.10)',
          boxShadow: '0 2px 0 rgba(59,45,122,0.06), 0 18px 40px -24px rgba(59,45,122,0.45)',
          transition: 'box-shadow .25s ease, transform .25s ease, border-color .25s ease',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 22 },
        sizeLarge: { paddingBlock: 13, fontSize: 16.5 },
        contained: {
          boxShadow: '0 4px 0 rgba(59,45,122,0.25)',
          '&:hover': { boxShadow: '0 6px 0 rgba(59,45,122,0.28)', transform: 'translateY(-1px)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 999, fontSize: 14.5 },
        sizeSmall: { fontSize: 13.5, height: 26 },
        outlined: { borderColor: 'rgba(59,45,122,0.22)' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: 15 },
        head: { fontWeight: 800, color: '#6B6296', backgroundColor: '#F2EEFF' },
      },
    },
    MuiListItemText: { styleOverrides: { primary: { fontSize: 16 } } },
    MuiFormHelperText: { styleOverrides: { root: { fontSize: 13.5 } } },
    MuiInputBase: { styleOverrides: { root: { fontSize: 16 } } },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 16, backgroundColor: '#fff' } },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 16, fontSize: 15.5 } } },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 800, fontSize: 15.5 } },
    },
  },
});
