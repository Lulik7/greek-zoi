// Начальное наполнение базы. Применяется один раз — при создании пустой базы.
import { randomBytes } from 'node:crypto';

const DEMO = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
];

export const LEVELS = [
  { id: 'a1', code: 'A1', title: 'Α1 — Начальный', description: 'Первые слова, алфавит, знакомство', order: 1 },
  { id: 'a2', code: 'A2', title: 'Α2 — Базовый', description: 'Быт, покупки, простые фразы', order: 2 },
  { id: 'b1', code: 'B1', title: 'Β1 — Средний', description: 'Свободный разговор на бытовые темы', order: 3 },
  { id: 'b2', code: 'B2', title: 'Β2 — Выше среднего', description: 'Мнение, аргументы, тексты песен', order: 4 },
];

export const TOPICS = [
  { id: 'love', slug: 'love', title: 'Любовь', emoji: '❤️', order: 1 },
  { id: 'clothes', slug: 'clothes', title: 'Одежда', emoji: '👗', order: 2 },
  { id: 'shopping', slug: 'shopping', title: 'Покупки', emoji: '🛍️', order: 3 },
  { id: 'food', slug: 'food', title: 'Еда', emoji: '🥗', order: 4 },
  { id: 'travel', slug: 'travel', title: 'Путешествия', emoji: '⛵', order: 5 },
  { id: 'family', slug: 'family', title: 'Семья', emoji: '👨‍👩‍👧', order: 6 },
  { id: 'work', slug: 'work', title: 'Работа', emoji: '💼', order: 7 },
  { id: 'sea', slug: 'sea', title: 'Море и лето', emoji: '🌊', order: 8 },
];

export const TRACKS = [
  {
    title: 'Καλημέρα, αγάπη μου',
    titleRu: 'Доброе утро, любовь моя',
    artist: 'Демо-запись школы',
    kind: 'song',
    levelIds: ['a1'],
    topicIds: ['love'],
    audioUrl: DEMO[0],
    free: true,
    note: 'Притяжательное μου, обращение. Слушаем 3 раза: без текста, с текстом, поём.',
    lyrics: [
      { time: 0, el: 'Καλημέρα, αγάπη μου', ru: 'Доброе утро, любовь моя' },
      { time: 6, el: 'Ο ήλιος βγήκε στο βουνό', ru: 'Солнце взошло над горой' },
      { time: 13, el: 'Σ᾽ αγαπώ, σ᾽ αγαπώ', ru: 'Я люблю тебя, люблю тебя' },
      { time: 20, el: 'Και το ξέρεις καλά', ru: 'И ты это хорошо знаешь' },
      { time: 27, el: 'Καλημέρα, καρδιά μου', ru: 'Доброе утро, сердце моё' },
    ],
  },
  {
    title: 'Στο σούπερ μάρκετ',
    titleRu: 'В супермаркете',
    artist: 'Ζωή & Νίκος',
    kind: 'dialogue',
    levelIds: ['a1', 'a2'],
    topicIds: ['shopping', 'food'],
    audioUrl: DEMO[1],
    free: false,
    note: 'Числительные, цены, πόσο κάνει. Отработать вопрос «Πόσο κάνει;»',
    lyrics: [
      { time: 0, el: '— Καλησπέρα! Πόσο κάνει το τυρί;', ru: '— Добрый вечер! Сколько стоит сыр?' },
      { time: 7, el: '— Οκτώ ευρώ το κιλό.', ru: '— Восемь евро за килограмм.' },
      { time: 12, el: '— Θέλω μισό κιλό, παρακαλώ.', ru: '— Хочу полкило, пожалуйста.' },
      { time: 19, el: '— Τίποτε άλλο;', ru: '— Что-нибудь ещё?' },
      { time: 24, el: '— Ναι, δύο ψωμιά και ένα μπουκάλι νερό.', ru: '— Да, два хлеба и бутылку воды.' },
    ],
  },
  {
    title: 'Τι φοράς σήμερα;',
    titleRu: 'Что ты сегодня надеваешь?',
    artist: 'Ζωή & Μαρία',
    kind: 'dialogue',
    levelIds: ['a2'],
    topicIds: ['clothes', 'shopping'],
    audioUrl: DEMO[2],
    free: true,
    note: 'Лексика одежды, глагол φοράω, цвета.',
    lyrics: [
      { time: 0, el: '— Τι φοράς σήμερα το βράδυ;', ru: '— Что ты надеваешь сегодня вечером?' },
      { time: 6, el: '— Το μαύρο φόρεμα και τα κόκκινα παπούτσια.', ru: '— Чёрное платье и красные туфли.' },
      { time: 14, el: '— Πολύ ωραία! Και εγώ;', ru: '— Очень красиво! А я?' },
      { time: 20, el: '— Βάλε το μπλε πουκάμισο.', ru: '— Надень синюю рубашку.' },
    ],
  },
  {
    title: 'Η θάλασσα μου μίλησε',
    titleRu: 'Море со мной говорило',
    artist: 'Демо-запись школы',
    kind: 'song',
    levelIds: ['b1'],
    topicIds: ['sea', 'love'],
    audioUrl: DEMO[3],
    free: false,
    note: 'Аорист, метафоры. Хорошо заходит после темы «Καλοκαίρι».',
    lyrics: [
      { time: 0, el: 'Η θάλασσα μου μίλησε απόψε', ru: 'Море сегодня ночью со мной говорило' },
      { time: 8, el: 'Για όσα δεν σου είπα ποτέ', ru: 'О том, что я тебе никогда не сказал(а)' },
      { time: 16, el: 'Τα κύματα θυμούνται τ᾽ όνομά σου', ru: 'Волны помнят твоё имя' },
      { time: 25, el: 'Κι εγώ σε περιμένω ακόμη', ru: 'А я всё ещё жду тебя' },
    ],
  },
  {
    title: 'Στο εστιατόριο',
    titleRu: 'В ресторане',
    artist: 'Ζωή & σερβιτόρος',
    kind: 'dialogue',
    levelIds: ['a2', 'b1'],
    topicIds: ['food'],
    audioUrl: DEMO[4],
    free: false,
    note: 'Заказ, вежливые формы, θα ήθελα.',
    lyrics: [
      { time: 0, el: '— Καλώς ήρθατε! Τι θα πάρετε;', ru: '— Добро пожаловать! Что будете брать?' },
      { time: 7, el: '— Θα ήθελα μια χωριάτικη σαλάτα.', ru: '— Я бы хотела деревенский салат.' },
      { time: 14, el: '— Και για κύριο πιάτο;', ru: '— А на основное блюдо?' },
      { time: 20, el: '— Ψάρι στα κάρβουνα, παρακαλώ.', ru: '— Рыбу на углях, пожалуйста.' },
    ],
  },
  {
    title: 'Η οικογένειά μου',
    titleRu: 'Моя семья',
    artist: 'Учебный текст',
    kind: 'dialogue',
    levelIds: ['a1'],
    topicIds: ['family'],
    audioUrl: DEMO[1],
    free: false,
    note: 'Родственники, притяжательные местоимения.',
    lyrics: [
      { time: 0, el: 'Με λένε Ζωή και είμαι από την Αθήνα.', ru: 'Меня зовут Зои, я из Афин.' },
      { time: 7, el: 'Έχω μια αδελφή και δύο αδελφούς.', ru: 'У меня одна сестра и два брата.' },
      { time: 14, el: 'Ο πατέρας μου είναι δάσκαλος.', ru: 'Мой отец — учитель.' },
    ],
  },
  {
    title: 'Ταξίδι στα νησιά',
    titleRu: 'Путешествие по островам',
    artist: 'Демо-запись школы',
    kind: 'song',
    levelIds: ['b1', 'b2'],
    topicIds: ['travel', 'sea'],
    audioUrl: DEMO[0],
    free: true,
    note: 'Будущее время θα + основа. Лексика транспорта.',
    lyrics: [
      { time: 0, el: 'Θα πάρω το πλοίο για τη Σαντορίνη', ru: 'Я сяду на корабль до Санторини' },
      { time: 9, el: 'Θα ξεχάσω τη μεγάλη πόλη', ru: 'Я забуду большой город' },
      { time: 18, el: 'Ο άνεμος θα με πάει μακριά', ru: 'Ветер унесёт меня далеко' },
    ],
  },
  {
    title: 'Συνέντευξη για δουλειά',
    titleRu: 'Собеседование на работу',
    artist: 'Ζωή & εργοδότης',
    kind: 'dialogue',
    levelIds: ['b2'],
    topicIds: ['work'],
    audioUrl: DEMO[2],
    free: false,
    note: 'Деловая лексика, условные предложения.',
    lyrics: [
      { time: 0, el: '— Πείτε μας λίγα λόγια για τον εαυτό σας.', ru: '— Расскажите немного о себе.' },
      { time: 8, el: '— Εργάζομαι στον τομέα του τουρισμού δέκα χρόνια.', ru: '— Я работаю в сфере туризма десять лет.' },
      { time: 17, el: '— Γιατί θέλετε αυτή τη θέση;', ru: '— Почему вы хотите эту должность?' },
    ],
  },
  {
    title: 'Λόγια της αγάπης',
    titleRu: 'Слова любви',
    artist: 'Демо-запись школы',
    kind: 'song',
    levelIds: ['b2'],
    topicIds: ['love'],
    audioUrl: DEMO[3],
    free: false,
    note: 'Поэтическая лексика, καθαρεύουσα-вкрапления, идиомы.',
    lyrics: [
      { time: 0, el: 'Τα λόγια της αγάπης δεν γράφονται', ru: 'Слова любви не пишутся' },
      { time: 9, el: 'Μονάχα ψιθυρίζονται στ᾽ αυτί', ru: 'Их лишь шепчут на ухо' },
      { time: 18, el: 'Κι όποιος τ᾽ ακούσει μια φορά', ru: 'И кто услышит их однажды' },
      { time: 26, el: 'Δεν τα ξεχνά ποτέ ξανά', ru: 'Не забудет уже никогда' },
    ],
  },
  {
    title: 'Στην αγορά της Αθήνας',
    titleRu: 'На афинском рынке',
    artist: 'Ζωή & πωλητής',
    kind: 'dialogue',
    levelIds: ['b1'],
    topicIds: ['shopping', 'food'],
    audioUrl: DEMO[4],
    free: false,
    note: 'Торг, разговорные формы, повелительное наклонение.',
    lyrics: [
      { time: 0, el: '— Ελάτε, ελάτε! Φρέσκα ντοματάκια!', ru: '— Подходите, подходите! Свежие помидорчики!' },
      { time: 8, el: '— Πόσο πάει το κιλό;', ru: '— Почём килограмм?' },
      { time: 13, el: '— Δύο ευρώ, για σας ενάμισι!', ru: '— Два евро, для вас — полтора!' },
    ],
  },
];

export const SETTINGS = {
  title: 'СЛУШАЮ ГРЕЧЕСКИЙ — ГОВОРЮ ПО-ГРЕЧЕСКИ',
  subtitle: 'Онлайн-школа греческого языка Зои Павловской',
  contactPhone: '+306982104110',
  contactEmail: 'zoepavlovska@gmail.com',
  contactTelegram: '@zoiapavlovska',
  contactFacebook: 'Zoi Pavlovska',
  contactFacebookUrl: 'https://www.facebook.com/sinnefokapnou',
  instructionVideoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
  instructionVideoTitle: 'Как пользоваться сайтом',
  featuredVideoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
  featuredVideoDescription: '',
  plans: [
    {
      id: 'month',
      title: 'Месяц',
      priceEur: 9,
      periodDays: 30,
      features: ['Все материалы школы', 'Тексты с переводом', 'Новые материалы каждую неделю'],
    },
    {
      id: 'half',
      title: '6 месяцев',
      priceEur: 45,
      periodDays: 180,
      features: ['Всё из тарифа «Месяц»', 'Экономия 17%', 'Доступ к архиву разборов'],
      highlighted: true,
    },
    {
      id: 'year',
      title: 'Год',
      priceEur: 79,
      periodDays: 365,
      features: ['Всё из тарифа «6 месяцев»', 'Экономия 27%', 'Личная консультация 30 минут'],
    },
  ],
};

/**
 * Пароли учётных записей, которые создаются при первом запуске.
 *
 * В коде их держать нельзя: репозиторий открытый, и любой прочитавший
 * получил бы доступ к админке. Поэтому в продакшене пароль берётся из
 * переменной окружения, а если её не задали — генерируется случайный и
 * один раз печатается в лог сервера. На своей машине остаётся простой,
 * чтобы не мешать разработке.
 */
function seedPassword(envName, devDefault, label) {
  const fromEnv = process.env[envName];
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== 'production') return devDefault;

  const generated = randomBytes(12).toString('base64url');
  console.log(
    `[seed] ${label}: пароль не задан в ${envName}, сгенерирован — ${generated}\n` +
      '[seed] запишите его и смените пароль через админку.',
  );
  return generated;
}

const ADMIN = {
  id: 'u-admin',
  // почта администратора задаётся переменной ADMIN_EMAIL
  email: process.env.ADMIN_EMAIL || 'admin@zoi.gr',
  name: 'Зоя Павловская',
  password: seedPassword('ADMIN_PASSWORD', 'admin123', 'администратор admin@zoi.gr'),
  role: 'admin',
  subscription: { active: true, planId: 'year', until: '2030-01-01T00:00:00.000Z' },
};

/*
 * Ученик без подписки — чтобы на своей машине было под кем проверять,
 * как сайт выглядит для постороннего. В продакшене такой записи быть
 * не должно: на живом сайте это чужая учётная запись в списке учеников.
 * Пароль ему подбирается только там, где он создаётся, — иначе в журнал
 * живого сервера зря печатался бы пароль от несуществующей записи.
 */
export const USERS = [ADMIN];

if (process.env.NODE_ENV !== 'production') {
  USERS.push({
    id: 'u-demo',
    email: 'student@mail.ru',
    name: 'Ученик Демо',
    password: seedPassword('DEMO_PASSWORD', 'demo123', 'демо-ученик student@mail.ru'),
    role: 'student',
    subscription: { active: false, planId: null, until: null },
  });
}
