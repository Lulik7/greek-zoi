/**
 * Проверка подключения Stripe.
 *
 * Запуск:  node scripts/stripe-check.mjs
 *
 * Скрипт заводит временного ученика, просит сервер создать оплату и печатает
 * ссылку на страницу Stripe. Ключи он не выводит — только сообщает, видит ли
 * их сервер. Данные для теста берутся из .env, ничего вводить не нужно.
 */
const BASE = process.env.QA_BASE || 'http://localhost:4000';

const jar = new Map();
async function api(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    redirect: 'manual',
    headers: {
      'content-type': 'application/json',
      ...(jar.size ? { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') } : {}),
    },
  });
  for (const c of res.headers.getSetCookie?.() || []) {
    const [pair] = c.split(';');
    const i = pair.indexOf('=');
    jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 300);
  }
  return { status: res.status, body };
}

console.log(`\nПроверяю ${BASE}\n`);

const boot = await api('/api/bootstrap');
if (boot.status !== 200) {
  console.log('Сервер не отвечает. Запущен ли он? (npm run dev)');
  process.exit(1);
}

const stripeOn = boot.body?.features?.stripe ?? null;
console.log(`1. Сервер видит ключи Stripe: ${stripeOn === null ? 'не могу определить' : stripeOn ? 'ДА' : 'НЕТ — работает демо-режим'}`);

const plans = boot.body?.settings?.plans || [];
console.log(`2. Тарифов в базе: ${plans.length}${plans.length ? ' — ' + plans.map((p) => `${p.title} (${p.priceEur} €)`).join(', ') : ''}`);
if (!plans.length) {
  console.log('   Без тарифов оплату не создать.');
  process.exit(1);
}

const email = `stripe_test_${Date.now()}@example.com`;
const reg = await api('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ email, name: 'Проверка оплаты', password: 'test-password-123' }),
});
console.log(`3. Временный ученик заведён: ${reg.status === 200 ? email : 'ОШИБКА ' + JSON.stringify(reg.body)}`);
if (reg.status !== 200) process.exit(1);

const plan = plans[0];
const co = await api('/api/checkout', { method: 'POST', body: JSON.stringify({ planId: plan.id }) });

if (co.body?.demo) {
  console.log('\n4. Ответ: ДЕМО-РЕЖИМ — подписка включилась без оплаты.');
  console.log('   Значит STRIPE_SECRET_KEY пуст или сервер не перезапускался после правки .env.');
} else if (co.body?.url) {
  console.log('\n4. Stripe принял запрос. Ссылка на страницу оплаты:\n');
  console.log('   ' + co.body.url);
  console.log('\n   Откройте её и заплатите тестовой картой:');
  console.log('   номер 4242 4242 4242 4242, срок — любой будущий, CVC — любые 3 цифры.');
  console.log('\n   Подписка включится только когда придёт вебхук. Если Stripe CLI');
  console.log('   не запущен (stripe listen), оплата пройдёт, а подписка — нет.');
} else {
  console.log(`\n4. Не получилось: статус ${co.status}, ответ ${JSON.stringify(co.body)}`);
}
console.log('');
