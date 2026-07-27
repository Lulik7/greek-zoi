import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import FunFrame from './FunFrame';
import { INK } from '../theme';

/**
 * Фотография преподавателя в такой же рамке, как у музыкальных инструментов.
 *
 * Файл кладётся в public/decor/zoya.jpg — оттуда он отдаётся по адресу
 * /decor/zoya.jpg и попадает в репозиторий вместе с кодом. Пока файла нет,
 * показываем понятную заглушку, а не сломанную картинку.
 */
export default function TeacherPhoto({
  src = '/decor/zoya.jpg',
  caption = 'Зоя Павловская · ваш преподаватель',
}: {
  src?: string;
  caption?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 3, md: 4 } }}>
      <FunFrame caption={caption} tilt={-4} width={{ xs: 190, sm: 220, md: 260 }}>
        {failed ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 14,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              px: 1.5,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: INK, opacity: 0.7 }}>
              Положите фото в
              <br />
              <Box component="code" sx={{ fontSize: 12 }}>
                public/decor/zoya.jpg
              </Box>
            </Typography>
          </Box>
        ) : (
          <Box
            component="img"
            src={src}
            alt={caption}
            onError={() => setFailed(true)}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
      </FunFrame>
    </Box>
  );
}
