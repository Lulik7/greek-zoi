import { Box } from '@mui/material';
import FunFrame from './FunFrame';

/**
 * Четыре греческих инструмента в квадратных рамках, наклонённых навстречу
 * друг другу. Фотографии подобраны владелицей сайта и лежат в public/decor —
 * оттуда они отдаются напрямую и попадают в репозиторий вместе с кодом.
 */
const ITEMS = [
  {
    key: 'lyra-antique',
    src: '/decor/instr-lyra-antique.jpg',
    caption: 'Λύρα · лира',
    tilt: -13,
    delay: '0s',
  },
  {
    key: 'bouzouki',
    src: '/decor/instr-bouzouki.jpg',
    caption: 'Μπουζούκι · бузуки',
    tilt: -6,
    delay: '0.5s',
  },
  {
    key: 'askomandoura',
    src: '/decor/instr-askomandoura.jpg',
    // на фото критская волынка из козьей шкуры, а не сантури — подпись по факту
    caption: 'Ασκομαντούρα · волынка',
    tilt: 6,
    delay: '1s',
  },
  {
    key: 'lyra-cretan',
    src: '/decor/instr-lyra-cretan.jpg',
    caption: 'Κρητική λύρα · критская лира',
    tilt: 13,
    delay: '1.5s',
  },
];

export default function InstrumentCards() {
  return (
    <Box
      sx={{
        mt: { xs: 4, md: 5.5 },
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: { xs: 1.5, sm: 2, md: 2.5 },
      }}
    >
      {ITEMS.map((i) => (
        <FunFrame key={i.key} caption={i.caption} tilt={i.tilt} delay={i.delay}>
          <Box
            component="img"
            src={i.src}
            alt={i.caption}
            loading="lazy"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </FunFrame>
      ))}
    </Box>
  );
}
