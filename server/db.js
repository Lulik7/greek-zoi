/**
 * База данных — SQLite (встроенный в Node модуль `node:sqlite`, без нативных сборок).
 * Файл базы: <STORAGE_DIR>/data/school.db, по умолчанию server/data/school.db.
 * Достаточно скопировать его, чтобы сделать бэкап.
 *
 * Здесь же — весь доступ к данным. Роуты в index.js работают только через эти функции.
 */
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import { paths } from './config.js';
import { LEVELS, TOPICS, TRACKS, SETTINGS, USERS } from './seed.js';

// Путь берём из config: в облаке он указывает на подключённый диск,
// иначе база не переживёт перезапуск. Папку config уже создал, но
// mkdirSync с recursive безвреден и страхует от неожиданного порядка импортов.
const DATA_DIR = paths.dataDir;
mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(join(DATA_DIR, 'school.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS levels (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    ord INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '',
    ord INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_ru TEXT NOT NULL DEFAULT '',
    artist TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'song',
    audio_url TEXT NOT NULL DEFAULT '',
    free INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS track_levels (
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    level_id TEXT NOT NULL,
    PRIMARY KEY (track_id, level_id)
  );

  CREATE TABLE IF NOT EXISTS track_topics (
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL,
    PRIMARY KEY (track_id, topic_id)
  );

  CREATE TABLE IF NOT EXISTS lyrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    ord INTEGER NOT NULL,
    time REAL,
    el TEXT NOT NULL DEFAULT '',
    ru TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX IF NOT EXISTS lyrics_track ON lyrics(track_id, ord);

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    sub_active INTEGER NOT NULL DEFAULT 0,
    sub_plan TEXT,
    sub_until TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    path TEXT NOT NULL DEFAULT '',
    label TEXT,
    user_id TEXT,
    at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS events_at ON events(at);

  -- одноразовые ссылки: подтверждение почты и сброс пароля.
  -- в базе лежит только SHA-256 от токена, сам токен уходит в письмо
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS tokens_lookup ON tokens(token_hash);

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    plan_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'eur',
    status TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'stripe',
    created_at TEXT NOT NULL
  );
`);

// Миграции для баз, созданных предыдущими версиями
const userColumns = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
if (!userColumns.includes('email_verified')) {
  db.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0');
}

const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

// ---------------------------------------------------------------- наполнение

function seedIfEmpty() {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM levels').get();
  if (n > 0) return;

  const insLevel = db.prepare('INSERT INTO levels (id, code, title, description, ord) VALUES (?, ?, ?, ?, ?)');
  LEVELS.forEach((l) => insLevel.run(l.id, l.code, l.title, l.description, l.order));

  const insTopic = db.prepare('INSERT INTO topics (id, slug, title, emoji, ord) VALUES (?, ?, ?, ?, ?)');
  TOPICS.forEach((t) => insTopic.run(t.id, t.slug, t.title, t.emoji, t.order));

  TRACKS.forEach((t, i) => {
    createTrack({ ...t, published: true }, `t${i + 1}`, new Date(2026, 0, 10 + i).toISOString());
  });

  setSettings(SETTINGS);

  USERS.forEach((u) => {
    db.prepare(
      `INSERT INTO users (id, email, name, password_hash, role, sub_active, sub_plan, sub_until,
                          email_verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    ).run(
      u.id,
      u.email,
      u.name,
      bcrypt.hashSync(u.password, 10),
      u.role,
      u.subscription.active ? 1 : 0,
      u.subscription.planId,
      u.subscription.until,
      new Date().toISOString(),
    );
  });

  console.log('[db] база создана и заполнена демо-материалами');
}

// ------------------------------------------------------------------ контент

export function getLevels() {
  return db
    .prepare('SELECT id, code, title, description, ord AS "order" FROM levels ORDER BY ord')
    .all()
    .map((r) => ({ ...r }));
}

export function getTopics() {
  return db
    .prepare('SELECT id, slug, title, emoji, ord AS "order" FROM topics ORDER BY ord')
    .all()
    .map((r) => ({ ...r }));
}

export function getTracks() {
  const rows = db.prepare('SELECT * FROM tracks ORDER BY created_at DESC').all();
  const levels = db.prepare('SELECT track_id, level_id FROM track_levels').all();
  const topics = db.prepare('SELECT track_id, topic_id FROM track_topics').all();
  const lyrics = db.prepare('SELECT track_id, time, el, ru FROM lyrics ORDER BY track_id, ord').all();

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    titleRu: r.title_ru,
    artist: r.artist,
    kind: r.kind,
    audioUrl: r.audio_url,
    free: !!r.free,
    note: r.note,
    published: !!r.published,
    createdAt: r.created_at,
    levelIds: levels.filter((x) => x.track_id === r.id).map((x) => x.level_id),
    topicIds: topics.filter((x) => x.track_id === r.id).map((x) => x.topic_id),
    lyrics: lyrics
      .filter((x) => x.track_id === r.id)
      .map((x) => ({ time: x.time === null ? undefined : x.time, el: x.el, ru: x.ru })),
  }));
}

export function getTrack(id) {
  return getTracks().find((t) => t.id === id) ?? null;
}

export function createTrack(t, forcedId, forcedCreatedAt) {
  const id = forcedId ?? uid('t');
  const createdAt = forcedCreatedAt ?? new Date().toISOString();
  db.prepare(
    `INSERT INTO tracks (id, title, title_ru, artist, kind, audio_url, free, note, published, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    t.title ?? '',
    t.titleRu ?? '',
    t.artist ?? '',
    t.kind === 'dialogue' ? 'dialogue' : 'song',
    t.audioUrl ?? '',
    t.free ? 1 : 0,
    t.note ?? '',
    t.published === false ? 0 : 1,
    createdAt,
  );
  writeRelations(id, t);
  return getTrack(id);
}

export function updateTrack(id, t) {
  const exists = db.prepare('SELECT id FROM tracks WHERE id = ?').get(id);
  if (!exists) return null;
  db.prepare(
    `UPDATE tracks SET title = ?, title_ru = ?, artist = ?, kind = ?, audio_url = ?,
       free = ?, note = ?, published = ? WHERE id = ?`,
  ).run(
    t.title ?? '',
    t.titleRu ?? '',
    t.artist ?? '',
    t.kind === 'dialogue' ? 'dialogue' : 'song',
    t.audioUrl ?? '',
    t.free ? 1 : 0,
    t.note ?? '',
    t.published === false ? 0 : 1,
    id,
  );
  writeRelations(id, t);
  return getTrack(id);
}

function writeRelations(id, t) {
  db.prepare('DELETE FROM track_levels WHERE track_id = ?').run(id);
  db.prepare('DELETE FROM track_topics WHERE track_id = ?').run(id);
  db.prepare('DELETE FROM lyrics WHERE track_id = ?').run(id);

  const insL = db.prepare('INSERT OR IGNORE INTO track_levels (track_id, level_id) VALUES (?, ?)');
  (t.levelIds ?? []).forEach((lid) => insL.run(id, lid));

  const insT = db.prepare('INSERT OR IGNORE INTO track_topics (track_id, topic_id) VALUES (?, ?)');
  (t.topicIds ?? []).forEach((tid) => insT.run(id, tid));

  const insLy = db.prepare('INSERT INTO lyrics (track_id, ord, time, el, ru) VALUES (?, ?, ?, ?, ?)');
  (t.lyrics ?? []).forEach((line, i) => {
    const time = typeof line.time === 'number' && Number.isFinite(line.time) ? line.time : null;
    insLy.run(id, i, time, line.el ?? '', line.ru ?? '');
  });
}

export function deleteTrack(id) {
  db.prepare('DELETE FROM tracks WHERE id = ?').run(id);
}

export function replaceLevels(levels) {
  const used = new Set(db.prepare('SELECT DISTINCT level_id FROM track_levels').all().map((r) => r.level_id));
  const keep = new Set(levels.map((l) => l.id));
  for (const id of used) {
    if (!keep.has(id)) throw new Error(`Уровень ${id} используется в материалах и не может быть удалён`);
  }
  db.prepare('DELETE FROM levels').run();
  const ins = db.prepare('INSERT INTO levels (id, code, title, description, ord) VALUES (?, ?, ?, ?, ?)');
  levels.forEach((l, i) => ins.run(l.id, l.code ?? '', l.title ?? '', l.description ?? '', l.order ?? i + 1));
  return getLevels();
}

export function replaceTopics(topics) {
  const used = new Set(db.prepare('SELECT DISTINCT topic_id FROM track_topics').all().map((r) => r.topic_id));
  const keep = new Set(topics.map((t) => t.id));
  for (const id of used) {
    if (!keep.has(id)) throw new Error(`Тема ${id} используется в материалах и не может быть удалена`);
  }
  db.prepare('DELETE FROM topics').run();
  const ins = db.prepare('INSERT INTO topics (id, slug, title, emoji, ord) VALUES (?, ?, ?, ?, ?)');
  topics.forEach((t, i) => ins.run(t.id, t.slug ?? t.id, t.title ?? '', t.emoji ?? '', t.order ?? i + 1));
  return getTopics();
}

export function getSettings() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'site'").get();
  // подмешиваем значения по умолчанию: так новые поля появляются в уже созданной базе
  return row ? { ...SETTINGS, ...JSON.parse(row.value) } : SETTINGS;
}

export function setSettings(settings) {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('site', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(JSON.stringify(settings));
  return getSettings();
}

// ------------------------------------------------------------ пользователи

function rowToUser(r) {
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    emailVerified: !!r.email_verified,
    createdAt: r.created_at,
    subscription: {
      active: !!r.sub_active && (!r.sub_until || new Date(r.sub_until).getTime() > Date.now()),
      planId: r.sub_plan,
      until: r.sub_until,
    },
  };
}

export function getUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at').all().map(rowToUser);
}

export function getUserById(id) {
  return rowToUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
}

export function createUser({ email, password, name }) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new Error('Пользователь с такой почтой уже зарегистрирован');
  const id = uid('u');
  db.prepare(
    `INSERT INTO users (id, email, name, password_hash, role, sub_active, sub_plan, sub_until, created_at)
     VALUES (?, ?, ?, ?, 'student', 0, NULL, NULL, ?)`,
  ).run(id, email, name || email.split('@')[0], bcrypt.hashSync(password, 10), new Date().toISOString());
  return getUserById(id);
}

export function verifyUser(email, password) {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  return rowToUser(row);
}

export function getUserByEmail(email) {
  return rowToUser(db.prepare('SELECT * FROM users WHERE email = ?').get(email));
}

export function setEmailVerified(id) {
  db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(id);
  return getUserById(id);
}

export function setPassword(id, password) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), id);
  return getUserById(id);
}

export function updateUser(id, patch) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!row) return null;
  const sub = patch.subscription ?? {};
  db.prepare(
    `UPDATE users SET name = ?, role = ?, sub_active = ?, sub_plan = ?, sub_until = ? WHERE id = ?`,
  ).run(
    patch.name ?? row.name,
    patch.role ?? row.role,
    'subscription' in patch ? (sub.active ? 1 : 0) : row.sub_active,
    'subscription' in patch ? (sub.planId ?? null) : row.sub_plan,
    'subscription' in patch ? (sub.until ?? null) : row.sub_until,
    id,
  );
  return getUserById(id);
}

export function deleteUser(id) {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

export function activateSubscription(userId, planId) {
  const plan = getSettings().plans.find((p) => p.id === planId);
  const days = plan?.periodDays ?? 30;
  const until = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
  db.prepare('UPDATE users SET sub_active = 1, sub_plan = ?, sub_until = ? WHERE id = ?').run(planId, until, userId);
  return getUserById(userId);
}

// ------------------------------------------- одноразовые ссылки из писем

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

/** Создаёт ссылку-токен. В базу кладём только хеш — по базе токен не восстановить. */
export function createToken(userId, kind, ttlMs) {
  db.prepare("DELETE FROM tokens WHERE user_id = ? AND kind = ? AND used_at IS NULL").run(userId, kind);
  const token = randomBytes(32).toString('base64url');
  db.prepare(
    'INSERT INTO tokens (user_id, kind, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(userId, kind, hashToken(token), new Date(Date.now() + ttlMs).toISOString(), new Date().toISOString());
  return token;
}

/** Проверяет и гасит токен. Возвращает пользователя либо null. */
export function consumeToken(token, kind) {
  if (!token) return null;
  const row = db.prepare('SELECT * FROM tokens WHERE token_hash = ? AND kind = ?').get(hashToken(token), kind);
  if (!row || row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  db.prepare('UPDATE tokens SET used_at = ? WHERE id = ?').run(new Date().toISOString(), row.id);
  return getUserById(row.user_id);
}

// ------------------------------------------------------------------ оплаты

export function recordPayment({ id, userId, planId, amountCents, currency, status, provider }) {
  db.prepare(
    `INSERT INTO payments (id, user_id, plan_id, amount_cents, currency, status, provider, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET status = excluded.status`,
  ).run(
    id,
    userId ?? null,
    planId,
    amountCents ?? 0,
    currency ?? 'eur',
    status,
    provider ?? 'stripe',
    new Date().toISOString(),
  );
}

export function isPaymentProcessed(id) {
  const row = db.prepare("SELECT status FROM payments WHERE id = ?").get(id);
  return row?.status === 'paid';
}

export function getPayments(limit = 200) {
  return db
    .prepare('SELECT * FROM payments ORDER BY created_at DESC LIMIT ?')
    .all(limit)
    .map((r) => ({
      id: r.id,
      userId: r.user_id,
      planId: r.plan_id,
      amountCents: r.amount_cents,
      currency: r.currency,
      status: r.status,
      provider: r.provider,
      createdAt: r.created_at,
    }));
}

// -------------------------------------------------------------- статистика

export function addEvent({ type, path, label, userId }) {
  db.prepare('INSERT INTO events (type, path, label, user_id, at) VALUES (?, ?, ?, ?, ?)').run(
    type,
    path ?? '',
    label ?? null,
    userId ?? null,
    new Date().toISOString(),
  );
}

export function getEvents(limit = 2000) {
  return db
    .prepare('SELECT id, type, path, label, at FROM events ORDER BY id DESC LIMIT ?')
    .all(limit)
    .map((r) => ({ ...r, id: String(r.id) }));
}

/**
 * Разовые правки уже существующих баз. Каждая должна быть безопасна при
 * повторном запуске: выполняются при каждом старте сервера.
 */
function migrate() {
  // Из поля «исполнитель» убираем приставку «Диалог • » — понятие типа
  // материала из проекта убрано, а в старых записях приставка осталась.
  db.prepare("UPDATE tracks SET artist = TRIM(REPLACE(artist, 'Диалог • ', '')) WHERE artist LIKE 'Диалог • %'").run();

  /*
   * Почта администратора могла смениться через ADMIN_EMAIL. В базе, которая
   * пережила перезапуск, учётка осталась со старым адресом — переносим её.
   * Пароль не трогаем: если его меняли через админку, менять его молча нельзя.
   */
  const wanted = (process.env.ADMIN_EMAIL || '').trim();
  if (wanted) {
    const taken = db.prepare('SELECT id FROM users WHERE email = ?').get(wanted);
    if (!taken) {
      const changed = db
        .prepare("UPDATE users SET email = ? WHERE role = 'admin' AND email <> ?")
        .run(wanted, wanted);
      if (changed.changes) console.log(`[db] почта администратора изменена на ${wanted}`);
    }
  }
}

seedIfEmpty();
migrate();
