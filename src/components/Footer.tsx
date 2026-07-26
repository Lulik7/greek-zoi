import { Box, Container, Divider, Link, Stack, Typography } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useApp } from '../store/AppContext';

export default function Footer() {
  const { db } = useApp();
  const s = db?.settings;
  if (!s) return null;

  const items = [
    { icon: <PhoneIcon fontSize="small" />, text: s.contactPhone, href: `tel:${s.contactPhone}` },
    { icon: <EmailIcon fontSize="small" />, text: s.contactEmail, href: `mailto:${s.contactEmail}` },
    { icon: <TelegramIcon fontSize="small" />, text: s.contactTelegram, href: `https://t.me/${s.contactTelegram.replace('@', '')}` },
    { icon: <InstagramIcon fontSize="small" />, text: s.contactInstagram, href: `https://instagram.com/${s.contactInstagram.replace('@', '')}` },
  ].filter((i) => i.text);

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 6, md: 10 },
        color: 'common.white',
        background: 'linear-gradient(160deg, #0b4f8a 0%, #08375f 60%, #061f38 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {s.subtitle}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, mb: 3 }}>
          Контакты
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {items.map((i) => (
            <Stack key={i.text} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {i.icon}
              <Link href={i.href} color="inherit" underline="hover" target="_blank" rel="noreferrer">
                {i.text}
              </Link>
            </Stack>
          ))}
        </Stack>
        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} {s.subtitle}. Все аудиоматериалы защищены авторским правом.
        </Typography>
      </Container>
    </Box>
  );
}
