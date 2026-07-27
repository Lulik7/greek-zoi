import { Box, Container, Divider, Link, Stack, Typography } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useApp } from '../store/AppContext';
import WaveEdge from './WaveEdge';
import { PAGE_BG, YELLOW } from '../theme';

export default function Footer() {
  const { db } = useApp();
  const s = db?.settings;
  if (!s) return null;

  const items = [
    { icon: <PhoneIcon fontSize="small" />, text: s.contactPhone, href: `tel:${s.contactPhone}` },
    { icon: <EmailIcon fontSize="small" />, text: s.contactEmail, href: `mailto:${s.contactEmail}` },
    {
      icon: <TelegramIcon fontSize="small" />,
      text: s.contactTelegram,
      href: `https://t.me/${s.contactTelegram.replace('@', '')}`,
    },
    {
      icon: <InstagramIcon fontSize="small" />,
      text: s.contactInstagram,
      href: `https://instagram.com/${s.contactInstagram.replace('@', '')}`,
    },
  ].filter((i) => i.text);

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 6, md: 10 },
        color: 'common.white',
        background: 'linear-gradient(165deg, #7C7ACF 0%, #5F5BB8 50%, #21195F 100%)',
      }}
    >
      {/* волна сверху — такая же, как переход под шапкой и у блока о музыке */}
      <WaveEdge color={PAGE_BG} flip />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Typography
          component="div"
          sx={{
            mb: 1,
            fontWeight: 900,
            color: YELLOW,
            textShadow: '0 2px 0 #21195F',
            // в 3 раза крупнее обычного h6 (~1.25rem → ~3.75rem)
            fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
            lineHeight: 1.15,
          }}
        >
          {s.subtitle}
        </Typography>
        <Typography
          component="div"
          sx={{
            opacity: 0.9,
            mb: 3,
            fontWeight: 700,
            // body2 (~0.875rem) × 3 ≈ 2.625rem
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.625rem' },
            lineHeight: 1.2,
          }}
        >
          Контакты
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          useFlexGap
          sx={{
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {items.map((i) => (
            <Stack key={i.text} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {i.icon}
              <Link href={i.href} color="inherit" underline="hover" target="_blank" rel="noreferrer">
                {i.text}
              </Link>
            </Stack>
          ))}
        </Stack>
        <Typography
          sx={{
            mt: 3,
            fontWeight: 700,
            fontSize: { xs: 14, sm: 15.5 },
            opacity: 0.92,
            lineHeight: 1.45,
          }}
        >
          Разработано: Юлия Бернер (
          <Link
            href="mailto:yuliaberner.dev@gmail.com"
            color="inherit"
            underline="hover"
            sx={{ fontWeight: 800 }}
          >
            yuliaberner.dev@gmail.com
          </Link>
          )
        </Typography>
        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.22)' }} />
        <Typography variant="caption" sx={{ opacity: 0.72 }}>
          © {new Date().getFullYear()} {s.subtitle}. Все аудиоматериалы защищены авторским правом.
        </Typography>
      </Container>
    </Box>
  );
}
