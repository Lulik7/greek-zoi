import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import WaveEdge from './WaveEdge';
import InstrumentCards from './InstrumentCards';
import { cartoonTitle, HERO_VIOLET, INK, PAGE_BG, YELLOW } from '../theme';

/** Статья под цитатой: коротко о том, из чего состоит греческая песня */
const ARTICLE: { head: string; text: string }[] = [
  {
    head: 'Песня как вход в язык',
    text: 'Греческий проще всего входит через песню. Слова в ней повторяются, рифма держит порядок, а мелодия сама расставляет ударения — те самые, что в греческом всегда обозначены на письме. Услышав строку несколько раз, вы запоминаете её целиком, вместе с интонацией живой речи, а не отдельными словами из списка.',
  },
  {
    head: 'Δημοτικά — народная песня',
    text: 'Старейший пласт: песни областей, каждая со своим ладом и своим танцем. Каламатьянос водят по кругу, взявшись за руки, сиртос идёт мягкой цепочкой, зейбекикос танцуют в одиночку. Эти песни пережили века без нот и без авторов — их передавали голосом, и в них сохранился язык деревни, моря и дороги.',
  },
  {
    head: 'Ρεμπέτικο — песня портов',
    text: 'Городской жанр, выросший в кварталах Пирея и Салоник. После 1922 года в Грецию хлынули беженцы из Малой Азии и принесли восточные лады. Так родилось ремпетико — песни о разлуке, бедности и упрямой радости, под бузуки с его длинным грифом и звонкими парами струн. В 2017 году ЮНЕСКО внесло ремпетико в список нематериального наследия человечества.',
  },
  {
    head: 'Λαϊκό и έντεχνο — от таверны до поэзии',
    text: 'Из ремпетико выросло лаико — народная городская песня, которую и сегодня поют по всей стране. А рядом появилось «энтехно»: Микис Теодоракис и Манос Хадзидакис положили на музыку стихи Сефериса, Элитиса, Рицоса — поэтов, двое из которых получили Нобелевскую премию. Получилась редкая вещь: большая поэзия, которую знают наизусть и напевают за столом.',
  },
];

/**
 * Что показываем в полосе: греческая строка и пояснение по-русски.
 * Здесь народная мудрость и факты о греческой музыке — то, что можно
 * размещать свободно. Строк из современных песен тут намеренно нет:
 * их тексты защищены авторским правом.
 */
const ITEMS: { el: string; ru: string }[] = [
  {
    el: 'Όποιος τραγουδάει, τα βάσανά του ξεχνάει',
    ru: 'Кто поёт — забывает свои печали. Греческая народная мудрость',
  },
  {
    el: 'Ρεμπέτικο',
    ru: 'Песня греческих портов и эмигрантов. В 2017 году ЮНЕСКО внесло ремпетико в список нематериального наследия человечества',
  },
  {
    el: 'Μπουζούκι',
    ru: 'Главный инструмент городской песни: длинный гриф, три или четыре пары струн, узнаваемый звон',
  },
  {
    el: 'Καλαματιανός',
    ru: 'Самый известный народный танец Греции: двенадцать шагов по кругу, за руки, через весь праздник',
  },
  {
    el: 'Συρτάκι',
    ru: 'Не древний танец: придуман в 1964 году для фильма «Грек Зорба», музыку написал Микис Теодоракис',
  },
  {
    el: 'Μουσική',
    ru: '«Искусство муз» — от тех самых девяти богинь. Отсюда же наше слово «музей», «место муз»',
  },
  {
    el: 'Λαϊκό',
    ru: 'Народная городская песня — то, что поют в тавернах от Салоник до Крита',
  },
];

const EVERY_MS = 6000;

/**
 * Полоса в цвет шапки: медленно перелистывает мысли и факты о греческой музыке.
 * Растягивается на всю ширину экрана, даже если стоит внутри Container.
 */
export default function MusicQuotesBand() {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const t = window.setInterval(() => {
      // короткое затухание, потом смена текста — чтобы не мигало
      setShown(false);
      window.setTimeout(() => {
        setI((prev) => (prev + 1) % ITEMS.length);
        setShown(true);
      }, 450);
    }, EVERY_MS);
    return () => window.clearInterval(t);
  }, []);

  const item = ITEMS[i];

  return (
    <Box
      sx={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: HERO_VIOLET,
        overflow: 'hidden',
      }}
    >
      {/* волна сверху — такая же, как переход под шапкой на главной */}
      <WaveEdge color={PAGE_BG} flip />

      <Box
        sx={{
          position: 'relative',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 2, md: 3 },
          display: 'grid',
          placeItems: 'center',
        }}
      >
      {/* нотки по краям — лёгкий намёк на тему, не отвлекают */}
      <MusicNoteIcon
        aria-hidden
        sx={{
          position: 'absolute',
          left: { xs: 10, md: 48 },
          top: { xs: 14, md: 26 },
          fontSize: { xs: 30, md: 46 },
          color: 'rgba(255,255,255,0.22)',
        }}
      />
      <MusicNoteIcon
        aria-hidden
        sx={{
          position: 'absolute',
          right: { xs: 12, md: 60 },
          bottom: { xs: 14, md: 24 },
          fontSize: { xs: 24, md: 38 },
          color: 'rgba(255,255,255,0.18)',
          transform: 'rotate(18deg)',
        }}
      />

      <Box
        aria-live="polite"
        sx={{
          textAlign: 'center',
          maxWidth: 900,
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}
      >
        <Typography
          sx={{
            ...cartoonTitle,
            fontWeight: 900,
            WebkitTextStroke: `1.3px ${INK}`,
            color: YELLOW,
            fontSize: { xs: 21, sm: 28, md: 34 },
            lineHeight: 1.15,
          }}
        >
          {item.el}
        </Typography>
        <Typography
          sx={{
            mt: { xs: 1.25, md: 1.5 },
            color: 'rgba(255,255,255,0.96)',
            fontWeight: 700,
            fontSize: { xs: 15.5, sm: 18, md: 21 },
            lineHeight: 1.4,
          }}
        >
          {item.ru}
        </Typography>
        </Box>

        {/* статья: коротко о том, из чего состоит греческая песня */}
        <Box
          component="article"
          sx={{
            mt: { xs: 3.5, md: 5 },
            maxWidth: 980,
            textAlign: 'left',
            color: 'rgba(255,255,255,0.94)',
          }}
        >
          <Typography
            component="h2"
            sx={{
              ...cartoonTitle,
              fontWeight: 900,
              color: YELLOW,
              WebkitTextStroke: `1.6px ${INK}`,
              fontSize: { xs: 30, sm: 40, md: 48 },
              lineHeight: 1.1,
              textAlign: 'center',
              mb: { xs: 2.5, md: 3.5 },
            }}
          >
            Немного о греческой музыке
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2.25, md: 3 },
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            {ARTICLE.map((p) => (
              <Box key={p.head}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    color: YELLOW,
                    fontSize: { xs: 16, md: 18 },
                    mb: 0.5,
                  }}
                >
                  {p.head}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: 14.5, md: 16 },
                    lineHeight: 1.55,
                  }}
                >
                  {p.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* два инструмента под статьёй */}
          <InstrumentCards />
        </Box>
      </Box>

      {/* волна снизу — тот же переход, что и сверху */}
      <WaveEdge color={PAGE_BG} />
    </Box>
  );
}
