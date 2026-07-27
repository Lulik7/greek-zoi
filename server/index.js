/**
 * API школы греческого языка.
 *
 * Главное правило безопасности: платные материалы физически не покидают сервер
 * без активной подписки. Клиент получает только пометку «закрыто» — ни ссылки
 * на аудио, ни текста песни в ответе нет.
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { createServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, isProduction, paths } from './config.js';
import * as store from './db.js';
import { sendPasswordReset, sendVerification } from './mailer.js';
import { createCheckoutSession, fulfillCheckout, parseWebhook, stripeEnabled } from './payments.js';

const here = dirname(fileURLToPath(import.meta.url));
// путь берём из config: в облаке он указывает на подключённый диск
const UPLOADS = paths.uploads;
mkdirSync(UPLOADS, { recursive: true });

const COOKIE = 'gs_session';
const VERIFY_TTL = 24 * 3600 * 1000; // сутки
const RESET_TTL = 3600 * 1000; // час

const app = express();
app.set('trust proxy', 1); // сайт может стоять за прокси (Caddy, Nginx, Railway)

// ------------------------------------------------------------- безопасность

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (config.https.force) {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
    } else {
      return res.status(403).json({ error: 'Требуется HTTPS' });
    }
  }
  next();
});

/**
 * Вебхук Stripe принимает тело как есть: подпись считается по «сырым» байтам,
 * поэтому этот роут стоит до express.json().
 */
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripeEnabled()) return res.status(503).json({ error: 'Оплата не подключена' });
  let event;
  try {
    event = parseWebhook(req.body, req.headers['stripe-signature']);
  } catch (e) {
    console.warn('[stripe] подпись вебхука не сошлась:', e.message);
    return res.status(400).json({ error: `Webhook error: ${e.message}` });
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object;
      if (session.payment_status === 'paid') await fulfillCheckout(session);
    }
  } catch (e) {
    console.error('[stripe] ошибка обработки вебхука:', e);
    return res.status(500).json({ error: 'Не удалось обработать событие' });
  }

  res.json({ received: true });
});

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// ------------------------------------------------------------------- helpers

function issueSession(res, user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: '30d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction || config.https.force,
    maxAge: 30 * 24 * 3600 * 1000,
  });
}

function currentUser(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  try {
    const { sub } = jwt.verify(token, config.jwtSecret);
    return store.getUserById(sub);
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Нужно войти в аккаунт' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const user = currentUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Доступ только для администратора' });
  req.user = user;
  next();
}

/** Простая защита от перебора: не чаще одного запроса в минуту на адрес почты. */
const throttle = new Map();
function tooOften(key, ms = 60_000) {
  const now = Date.now();
  const last = throttle.get(key);
  if (last && now - last < ms) return true;
  throttle.set(key, now);
  if (throttle.size > 5000) throttle.clear();
  return false;
}

const hasAccess = (user, track) => track.free || user?.role === 'admin' || !!user?.subscription.active;

/** Убирает из материала всё, что не положено видеть без подписки. */
function publicTrack(track, user) {
  const unlocked = hasAccess(user, track);
  return {
    id: track.id,
    title: track.title,
    titleRu: track.titleRu,
    artist: track.artist,
    kind: track.kind,
    levelIds: track.levelIds,
    topicIds: track.topicIds,
    free: track.free,
    published: track.published,
    createdAt: track.createdAt,
    locked: !unlocked,
    // ссылка идёт через сервер: доступ проверяется на каждый запрос аудио
    audioUrl: unlocked ? `/api/audio/${track.id}` : '',
    lyrics: unlocked ? track.lyrics : [],
    note: unlocked ? track.note : '',
  };
}

// -------------------------------------------------------------------- данные

app.get('/api/bootstrap', (req, res) => {
  const user = currentUser(req);
  const isAdmin = user?.role === 'admin';
  const tracks = store.getTracks();

  res.json({
    levels: store.getLevels(),
    topics: store.getTopics(),
    settings: store.getSettings(),
    // администратор видит материалы целиком — ему их редактировать
    tracks: isAdmin ? tracks : tracks.filter((t) => t.published).map((t) => publicTrack(t, user)),
    users: isAdmin ? store.getUsers() : [],
    events: isAdmin ? store.getEvents() : [],
    payments: isAdmin ? store.getPayments() : [],
    user,
    features: { stripe: stripeEnabled(), email: config.mail.enabled },
  });
});

app.get('/api/audio/:id', (req, res) => {
  const user = currentUser(req);
  const track = store.getTrack(req.params.id);
  if (!track || !track.published) return res.status(404).json({ error: 'Материал не найден' });
  if (!hasAccess(user, track)) return res.status(403).json({ error: 'Материал доступен по подписке' });

  const url = track.audioUrl;
  if (!url) return res.status(404).json({ error: 'Аудио не загружено' });

  if (url.startsWith('/media/')) {
    const file = join(UPLOADS, url.slice('/media/'.length));
    if (!existsSync(file)) return res.status(404).json({ error: 'Файл не найден' });
    return res.sendFile(file);
  }
  // внешнее хранилище (R2, Bunny, SoundCloud и т. п.)
  return res.redirect(302, url);
});

app.post('/api/events', (req, res) => {
  const user = currentUser(req);
  const { type, path, label } = req.body ?? {};
  if (!['page', 'play', 'locked', 'search'].includes(type)) {
    return res.status(400).json({ error: 'Неизвестный тип события' });
  }
  store.addEvent({ type, path, label, userId: user?.id });
  res.json({ ok: true });
});

// ---------------------------------------------------------------- аккаунты

const emailOk = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? '');

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (!emailOk(email)) return res.status(400).json({ error: 'Введите корректный адрес почты' });
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов' });
  }

  let user;
  try {
    user = store.createUser({ email: email.trim(), password, name });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  issueSession(res, user);

  // письмо с подтверждением; если SMTP не настроен, ссылка вернётся в ответе
  const token = store.createToken(user.id, 'verify', VERIFY_TTL);
  let devLink;
  try {
    const sent = await sendVerification(user, token);
    if (!sent.delivered) devLink = sent.url;
  } catch (e) {
    console.warn('[auth] не удалось отправить письмо:', e.message);
  }

  res.json({ ...user, verificationLink: devLink });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const user = store.verifyUser(String(email ?? '').trim(), String(password ?? ''));
  if (!user) return res.status(401).json({ error: 'Неверная почта или пароль' });
  issueSession(res, user);
  res.json(user);
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => res.json(currentUser(req)));

/** Переход по ссылке из письма: подтверждаем почту и возвращаем ученика на сайт. */
app.get('/api/auth/verify', (req, res) => {
  const user = store.consumeToken(req.query.token, 'verify');
  if (!user) return res.redirect(`${config.publicUrl}/?verify=expired`);
  store.setEmailVerified(user.id);
  issueSession(res, user); // заодно впускаем в аккаунт
  res.redirect(`${config.publicUrl}/?verify=ok`);
});

app.post('/api/auth/resend-verification', requireAuth, async (req, res) => {
  if (req.user.emailVerified) return res.json({ ok: true, alreadyVerified: true });
  if (tooOften(`verify:${req.user.email}`)) {
    return res.status(429).json({ error: 'Письмо уже отправлено. Проверьте почту через минуту.' });
  }
  const token = store.createToken(req.user.id, 'verify', VERIFY_TTL);
  const sent = await sendVerification(req.user, token);
  res.json({ ok: true, verificationLink: sent.delivered ? undefined : sent.url });
});

app.post('/api/auth/forgot', async (req, res) => {
  const email = String(req.body?.email ?? '').trim();
  // отвечаем одинаково независимо от того, есть такой ученик или нет:
  // иначе форма превращается в способ узнать, кто зарегистрирован
  const answer = { ok: true };
  if (!emailOk(email)) return res.json(answer);
  if (tooOften(`reset:${email}`)) return res.json(answer);

  const user = store.getUserByEmail(email);
  if (!user) return res.json(answer);

  const token = store.createToken(user.id, 'reset', RESET_TTL);
  try {
    const sent = await sendPasswordReset(user, token);
    if (!sent.delivered) answer.resetLink = sent.url;
  } catch (e) {
    console.warn('[auth] письмо о сбросе пароля не ушло:', e.message);
  }
  res.json(answer);
});

app.post('/api/auth/reset', (req, res) => {
  const { token, password } = req.body ?? {};
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов' });
  }
  const user = store.consumeToken(token, 'reset');
  if (!user) return res.status(400).json({ error: 'Ссылка устарела. Запросите восстановление заново.' });

  store.setPassword(user.id, password);
  // раз человек получил письмо — почта точно его
  const updated = store.setEmailVerified(user.id);
  issueSession(res, updated);
  res.json(updated);
});

// ------------------------------------------------------------------ оплата

app.post('/api/checkout', requireAuth, async (req, res) => {
  const { planId } = req.body ?? {};
  const plan = store.getSettings().plans.find((p) => p.id === planId);
  if (!plan) return res.status(400).json({ error: 'Такого тарифа нет' });

  if (config.requireVerifiedEmailForCheckout && !req.user.emailVerified && config.mail.enabled) {
    return res.status(403).json({
      error: 'Сначала подтвердите почту — мы отправили письмо со ссылкой.',
      needsVerification: true,
    });
  }

  if (!stripeEnabled()) {
    // демо-режим: оплаты нет, включаем подписку сразу
    const user = store.activateSubscription(req.user.id, planId);
    return res.json({ demo: true, user });
  }

  try {
    const session = await createCheckoutSession(req.user, plan);
    res.json({ url: session.url });
  } catch (e) {
    console.error('[stripe] не удалось создать оплату:', e);
    res.status(502).json({ error: 'Платёжная система недоступна. Попробуйте позже.' });
  }
});

// ---------------------------------------------------------------- админка

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_req, file, cb) => {
      // кириллица и греческий в имени сохраняются, убираем только опасные символы
      const safe = file.originalname.replace(/[^\p{L}\p{N}._-]+/gu, '_').slice(-60);
      cb(null, `${Date.now()}-${safe || `audio${extname(file.originalname)}`}`);
    },
  }),
  limits: { fileSize: 80 * 1024 * 1024 },
  // принимаем аудио (материалы) и картинки (фон блока с названием).
  // часть браузеров присылает application/octet-stream, поэтому смотрим и расширение
  fileFilter: (_req, file, cb) => {
    const byType = file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/');
    const byExt = /\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|weba|jpe?g|png|webp|avif)$/i.test(
      file.originalname,
    );
    cb(null, byType || byExt);
  },
});

app.use('/media', express.static(UPLOADS));

app.post('/api/admin/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Нужен аудиофайл или изображение' });
  res.json({ url: `/media/${req.file.filename}`, name: req.file.originalname, size: req.file.size });
});

app.post('/api/admin/tracks', requireAdmin, (req, res) => {
  res.json(store.createTrack(req.body ?? {}));
});

app.put('/api/admin/tracks/:id', requireAdmin, (req, res) => {
  const track = store.updateTrack(req.params.id, req.body ?? {});
  if (!track) return res.status(404).json({ error: 'Материал не найден' });
  res.json(track);
});

app.delete('/api/admin/tracks/:id', requireAdmin, (req, res) => {
  store.deleteTrack(req.params.id);
  res.json({ ok: true });
});

app.put('/api/admin/levels', requireAdmin, (req, res) => {
  try {
    res.json(store.replaceLevels(req.body ?? []));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/admin/topics', requireAdmin, (req, res) => {
  try {
    res.json(store.replaceTopics(req.body ?? []));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  res.json(store.setSettings(req.body ?? {}));
});

app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
  if (req.params.id === req.user.id && req.body?.role && req.body.role !== 'admin') {
    return res.status(400).json({ error: 'Нельзя снять с себя права администратора' });
  }
  const user = store.updateUser(req.params.id, req.body ?? {});
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Нельзя удалить себя' });
  store.deleteUser(req.params.id);
  res.json({ ok: true });
});

// ------------------------------------------------------- статика и запуск

const DIST = join(here, '..', 'dist');
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  // всё, что не /api и не /media, отдаём index.html — маршрутизация на клиенте
  app.get(/^(?!\/api|\/media).*/, (_req, res) => res.sendFile(join(DIST, 'index.html')));
}

app.use((err, _req, res, _next) => {
  /**
   * Кривой ввод — вина клиента, а не сервера. Отдавать на него 500 плохо:
   * в логах это выглядит как поломка, а любой сканер может засыпать сервер
   * «ошибками». Разбираем то, что кидает разбор тела запроса.
   */
  if (err?.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    return res.status(400).json({ error: 'Некорректный JSON в запросе' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Слишком большой запрос' });
  }

  console.error('[api]', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Сервер сам держит TLS, только если указаны файлы сертификата. Обычно
// сертификат выдаёт прокси (Caddy/Nginx/облако), и здесь достаточно http.
const useTls = config.https.keyFile && config.https.certFile;
const server = useTls
  ? createHttpsServer(
      { key: readFileSync(config.https.keyFile), cert: readFileSync(config.https.certFile) },
      app,
    )
  : createServer(app);

server.listen(config.port, () => {
  console.log(`[api] сервер запущен: ${useTls ? 'https' : 'http'}://localhost:${config.port}`);
  if (!isProduction) console.log(`[api] адрес сайта для ссылок: ${config.publicUrl}`);
});
