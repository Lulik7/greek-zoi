import { Box, Container, Divider, Link, Stack, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import ChatIcon from '@mui/icons-material/Chat';
import { useApp } from '../store/AppContext';
import WaveEdge from './WaveEdge';
import { PAGE_BG, YELLOW } from '../theme';

export default function Footer() {
  const { db } = useApp();
  const s = db?.settings;
  if (!s) return null;

  const items = [
    {
      icon: <FacebookIcon fontSize="small" />,
      text: `FB: ${s.contactFacebook}`,
      href: s.contactFacebookUrl,
    },
    {
      icon: <EmailIcon fontSize="small" />,
      text: `e-mail: ${s.contactEmail}`,
      href: `mailto:${s.contactEmail}`,
    },
    {
      icon: <TelegramIcon fontSize="small" />,
      text: `Telegram: ${s.contactTelegram}`,
      href: `https://t.me/${s.contactTelegram.replace('@', '')}`,
    },
    {
      icon: <ChatIcon fontSize="small" />,
      text: `Viber / WhatsApp: ${s.contactPhone}`,
      href: `https://wa.me/${s.contactPhone.replace(/[^\d]/g, '')}`,
    },
  ].filter((i) => i.text && i.href);

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 6, md: 10 },
        color: 'common.white',
        background: 'linear-gradient(165deg, #5B9BD5 0%, #3E7FB8 55%, #123A63 100%)',
      }}
    >
      {/* волна сверху — такая же, как переход под первым блоком */}
      <WaveEdge color={PAGE_BG} flip />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Typography
          component="div"
          sx={{
            mb: 2,
            fontWeight: 900,
            color: YELLOW,
            textShadow: '0 2px 0 #123A63',
            fontSize: { xs: '1.05rem', sm: '1.2rem', md: '1.35rem' },
            lineHeight: 1.25,
          }}
        >
          {s.subtitle}
        </Typography>
        <Typography
          component="div"
          sx={{ opacity: 0.9, mb: 2, fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' } }}
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
