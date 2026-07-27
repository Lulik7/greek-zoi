import { Box, Typography } from '@mui/material';
import { INK, YELLOW } from '../theme';

/**
 * Две квадратные карточки с греческими инструментами, повёрнутые углами
 * друг к другу. Инструменты нарисованы здесь же: готовых фотографий в
 * проекте нет, а чужие снимки тянут за собой вопрос прав.
 */

/** Бузуки: грушевидный корпус, длинный гриф, три пары струн */
function Bouzouki() {
  return (
    <Box component="svg" viewBox="0 0 200 200" sx={{ width: '100%', height: '100%' }}>
      {/* гриф */}
      <path
        d="M96 118 L156 34"
        stroke="#8C5A2B"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path d="M96 118 L156 34" stroke={INK} strokeWidth="15" strokeLinecap="round" fill="none" opacity="0.18" />
      {/* лады */}
      {[0.25, 0.4, 0.55, 0.7, 0.85].map((t) => (
        <path
          key={t}
          d={`M ${96 + (156 - 96) * t - 5} ${118 + (34 - 118) * t - 4} l 10 -7`}
          stroke="#F3E2C7"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
      {/* головка грифа */}
      <path
        d="M150 42 q 14 -18 26 -8 q 10 9 -4 21 z"
        fill="#6E4520"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* колки */}
      <circle cx="170" cy="30" r="4" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
      <circle cx="182" cy="42" r="4" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
      {/* корпус-груша */}
      <path
        d="M96 118 C 72 100, 34 112, 30 146 C 26 178, 62 190, 84 176 C 104 164, 112 134, 96 118 Z"
        fill="#C98A4B"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* блик на корпусе */}
      <ellipse cx="52" cy="132" rx="14" ry="8" fill="#fff" opacity="0.35" transform="rotate(-25 52 132)" />
      {/* розетка */}
      <circle cx="70" cy="150" r="13" fill="#5C3517" stroke={INK} strokeWidth="3.5" />
      <circle cx="70" cy="150" r="6" fill="#8C5A2B" />
      {/* струны */}
      {[-4, 0, 4].map((d) => (
        <path
          key={d}
          d={`M ${88 + d} ${168 + d * 0.6} L ${152 + d} ${38 + d * 0.6}`}
          stroke="#FFF6DA"
          strokeWidth="1.6"
          opacity="0.9"
        />
      ))}
      {/* подставка */}
      <path d="M80 172 l 18 -8" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </Box>
  );
}

/** Лира: две изогнутые стойки, перекладина и натянутые струны */
function Lyra() {
  return (
    <Box component="svg" viewBox="0 0 200 200" sx={{ width: '100%', height: '100%' }}>
      {/* корпус-резонатор */}
      <path
        d="M62 176 C 44 150, 60 126, 100 126 C 140 126, 156 150, 138 176 C 120 192, 80 192, 62 176 Z"
        fill="#C98A4B"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <ellipse cx="100" cy="152" rx="16" ry="9" fill="#5C3517" stroke={INK} strokeWidth="3" />
      {/* стойки-рога */}
      <path
        d="M70 132 C 48 104, 46 66, 62 40"
        stroke="#8C5A2B"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M130 132 C 152 104, 154 66, 138 40"
        stroke="#8C5A2B"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      {/* перекладина */}
      <path d="M56 42 L144 42" stroke="#6E4520" strokeWidth="12" strokeLinecap="round" />
      {/* колки на перекладине */}
      {[74, 90, 106, 122].map((x) => (
        <circle key={x} cx={x} cy="36" r="4" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
      ))}
      {/* струны */}
      {[74, 90, 106, 122].map((x) => (
        <path
          key={x}
          d={`M ${x} 46 L ${x} 132`}
          stroke="#FFF6DA"
          strokeWidth="2"
          opacity="0.95"
        />
      ))}
    </Box>
  );
}

/** Одна карточка: квадрат в толстой рамке, слегка повёрнут и качается */
function Card({
  children,
  caption,
  tilt,
  delay,
}: {
  children: React.ReactNode;
  caption: string;
  tilt: number;
  delay: string;
}) {
  return (
    // поворот держим снаружи, покачивание — внутри: иначе анимация
    // перезаписывает transform и наклон пропадает
    <Box
      sx={{
        width: { xs: 150, sm: 200, md: 240 },
        flexShrink: 0,
        transform: `rotate(${tilt}deg)`,
        transformOrigin: '50% 60%',
        transition: 'transform 0.25s ease',
        '&:hover': { transform: `rotate(${tilt}deg) scale(1.06)` },
      }}
    >
      <Box
        sx={{
          animation: `instrument-wobble 4s ease-in-out ${delay} infinite`,
          'html.a11y-no-motion &': { animation: 'none' },
        }}
      >
      <Box
        sx={{
          position: 'relative',
          // квадрат
          aspectRatio: '1 / 1',
          borderRadius: 4,
          bgcolor: '#FFF9E8',
          border: `6px solid ${INK}`,
          boxShadow: `0 8px 0 ${INK}, 0 18px 34px rgba(33,25,95,0.45)`,
          overflow: 'hidden',
          p: 1.5,
        }}
      >
        {/* жёлтая «весёлая» окантовка внутри рамки */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 7,
            borderRadius: 3,
            border: `3px dashed ${YELLOW}`,
            animation: 'instrument-dash 9s linear infinite',
            'html.a11y-no-motion &': { animation: 'none' },
          }}
        />
        {children}
      </Box>
      </Box>
      <Typography
        sx={{
          mt: 1.25,
          textAlign: 'center',
          fontWeight: 900,
          fontSize: { xs: 14, md: 16 },
          color: YELLOW,
          textShadow: `0 2px 0 ${INK}`,
        }}
      >
        {caption}
      </Typography>
    </Box>
  );
}

export default function InstrumentCards() {
  return (
    <Box
      sx={{
        mt: { xs: 4, md: 5.5 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        // углами друг к другу: наклоны встречные, карточки слегка находят
        gap: { xs: 1, sm: 2 },
      }}
    >
      <Card caption="Μπουζούκι · бузуки" tilt={-9} delay="0s">
        <Bouzouki />
      </Card>
      <Card caption="Λύρα · лира" tilt={9} delay="0.6s">
        <Lyra />
      </Card>

      <style>{`
        @keyframes instrument-wobble {
          0%, 100% { transform: rotate(var(--tilt, 0deg)) translateY(0); }
          50%      { transform: rotate(var(--tilt, 0deg)) translateY(-8px); }
        }
        @keyframes instrument-dash {
          to { stroke-dashoffset: 100px; }
        }
      `}</style>
    </Box>
  );
}
