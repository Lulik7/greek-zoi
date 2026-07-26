/**
 * Настройки сервера. Всё берётся из переменных окружения (файл .env рядом с проектом),
 * а для локальной разработки подставляются безопасные значения по умолчанию.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const DATA_DIR = join(here, 'data');
mkdirSync(DATA_DIR, { recursive: true });

// Node умеет читать .env сам, начиная с 20.6
const ENV_FILE = join(ROOT, '.env');
if (existsSync(ENV_FILE)) {
  try {
    process.loadEnvFile(ENV_FILE);
  } catch (e) {
    console.warn('[config] не удалось прочитать .env:', e.message);
  }
}

const flag = (name, fallback = false) => {
  const v = process.env[name];
  if (v === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
};

export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Ключ для подписи сессий. В продакшене задаётся переменной JWT_SECRET.
 * Если её нет, ключ генерируется один раз и сохраняется в server/data/jwt.key —
 * так сессии переживают перезапуск, и в коде не лежит «секрет по умолчанию».
 */
function resolveJwtSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16) return process.env.JWT_SECRET;

  if (isProduction) {
    throw new Error(
      'Не задана переменная JWT_SECRET. Сгенерируйте ключ командой\n' +
        '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"\n' +
        'и пропишите её в .env перед запуском в продакшене.',
    );
  }

  const file = join(DATA_DIR, 'jwt.key');
  if (existsSync(file)) return readFileSync(file, 'utf8').trim();
  const secret = randomBytes(48).toString('base64url');
  writeFileSync(file, secret, { mode: 0o600 });
  console.log('[config] сгенерирован ключ подписи сессий: server/data/jwt.key');
  return secret;
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: resolveJwtSecret(),
  /** Адрес сайта — с него уходят ссылки в письмах и возвраты после оплаты */
  publicUrl: (process.env.PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, ''),

  https: (() => {
    const keyFile = process.env.SSL_KEY_FILE || '';
    const certFile = process.env.SSL_CERT_FILE || '';
    return {
      /**
       * Переадресовывать http → https и слать HSTS. Включается само, если сервер
       * держит TLS сам или работает в продакшене (обычно за прокси с сертификатом).
       */
      force: flag('FORCE_HTTPS', isProduction || !!(keyFile && certFile)),
      keyFile,
      certFile,
    };
  })(),

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: (process.env.STRIPE_CURRENCY || 'eur').toLowerCase(),
    get enabled() {
      return !!this.secretKey;
    },
  },

  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Школа греческого языка <no-reply@localhost>',
    get enabled() {
      return !!this.host;
    },
  },

  /** Требовать подтверждённую почту перед оплатой подписки */
  requireVerifiedEmailForCheckout: flag('REQUIRE_VERIFIED_EMAIL', true),
};

export const paths = { root: ROOT, dataDir: DATA_DIR, uploads: join(here, 'uploads') };
