/**
 * Отправка писем.
 *
 * Если SMTP не настроен (например, на компьютере разработчика), письма не
 * теряются — их содержимое печатается в консоль сервера, а ссылка возвращается
 * вызывающему коду, чтобы её можно было открыть вручную.
 */
import nodemailer from 'nodemailer';
import { config } from './config.js';

let transport = null;

function getTransport() {
  if (!config.mail.enabled) return null;
  if (!transport) {
    transport = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined,
    });
  }
  return transport;
}

function layout(title, body, action) {
  return `<!doctype html>
<html lang="ru"><body style="margin:0;background:#f6f8fb;font-family:Segoe UI,Arial,sans-serif;color:#12203a">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px">
    <div style="background:#0d5eaf;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">
      <div style="font-weight:700;letter-spacing:.02em">СЛУШАЮ ГРЕЧЕСКИЙ — ГОВОРЮ ПО-ГРЕЧЕСКИ</div>
      <div style="font-size:13px;opacity:.85">Онлайн-школа греческого языка Зои Павловской</div>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 14px 14px">
      <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
      <div style="font-size:15px;line-height:1.5">${body}</div>
      ${
        action
          ? `<p style="margin:24px 0">
               <a href="${action.url}" style="display:inline-block;background:#0d5eaf;color:#fff;
                  text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">
                 ${action.label}
               </a>
             </p>
             <p style="font-size:13px;color:#5a6b85">
               Если кнопка не открывается, скопируйте ссылку:<br>
               <span style="word-break:break-all">${action.url}</span>
             </p>`
          : ''
      }
    </div>
  </div>
</body></html>`;
}

async function send({ to, subject, html, text }) {
  const t = getTransport();
  if (!t) {
    console.log(`\n[mail] SMTP не настроен, письмо не отправлено.\n  кому: ${to}\n  тема: ${subject}\n  ${text}\n`);
    return { delivered: false };
  }
  await t.sendMail({ from: config.mail.from, to, subject, html, text });
  return { delivered: true };
}

/** Ссылка ведёт прямо в API: там почта помечается подтверждённой и человек возвращается на сайт */
export function verificationUrl(token) {
  return `${config.publicUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;
}

export function resetUrl(token) {
  return `${config.publicUrl}/reset?token=${encodeURIComponent(token)}`;
}

export async function sendVerification(user, token) {
  const url = verificationUrl(token);
  const res = await send({
    to: user.email,
    subject: 'Подтвердите почту — школа греческого языка',
    text: `Здравствуйте, ${user.name}! Подтвердите почту по ссылке: ${url}`,
    html: layout(
      `Здравствуйте, ${user.name}!`,
      'Остался один шаг: подтвердите, что это ваша почта. Ссылка действует 24 часа.',
      { url, label: 'Подтвердить почту' },
    ),
  });
  return { ...res, url };
}

export async function sendPasswordReset(user, token) {
  const url = resetUrl(token);
  const res = await send({
    to: user.email,
    subject: 'Восстановление пароля — школа греческого языка',
    text: `Чтобы задать новый пароль, откройте ссылку: ${url}`,
    html: layout(
      'Восстановление пароля',
      'Вы запросили новый пароль. Нажмите кнопку ниже — ссылка действует 1 час. ' +
        'Если вы этого не делали, просто удалите письмо: пароль останется прежним.',
      { url, label: 'Задать новый пароль' },
    ),
  });
  return { ...res, url };
}

export async function sendSubscriptionStarted(user, plan, until) {
  const date = new Date(until).toLocaleDateString('ru-RU');
  return send({
    to: user.email,
    subject: 'Подписка оформлена — школа греческого языка',
    text: `Подписка «${plan.title}» активна до ${date}. Приятных занятий!`,
    html: layout(
      'Подписка оформлена',
      `Тариф «<b>${plan.title}</b>» активен до <b>${date}</b>. Все песни и диалоги открыты — ` +
        'заходите на сайт и слушайте.',
      { url: config.publicUrl, label: 'Перейти к материалам' },
    ),
  });
}
