/**
 * Оплата подписки через Stripe.
 *
 * Схема: сайт создаёт Checkout Session → ученик платит на странице Stripe →
 * Stripe присылает вебхук на /api/stripe/webhook → сервер включает подписку.
 * Подписку включает ТОЛЬКО обработчик вебхука: браузеру в этом вопросе доверять нельзя.
 *
 * Если ключи Stripe не заданы, модуль работает в демо-режиме: подписка включается
 * сразу, а на странице оплаты честно написано, что реального списания нет.
 */
import Stripe from 'stripe';
import { config } from './config.js';
import * as store from './db.js';
import { sendSubscriptionStarted } from './mailer.js';

let stripe = null;
if (config.stripe.enabled) {
  stripe = new Stripe(config.stripe.secretKey);
  console.log('[stripe] приём оплат включён');
} else {
  console.log('[stripe] ключи не заданы — оплата работает в демо-режиме');
}

export const stripeEnabled = () => !!stripe;

export async function createCheckoutSession(user, plan) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { userId: user.id, planId: plan.id },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: config.stripe.currency,
          unit_amount: Math.round(plan.priceEur * 100),
          product_data: {
            name: `Подписка «${plan.title}»`,
            description: `Доступ ко всем материалам школы на ${plan.periodDays} дней`,
          },
        },
      },
    ],
    success_url: `${config.publicUrl}/subscribe?paid=1`,
    cancel_url: `${config.publicUrl}/subscribe?canceled=1`,
  });

  store.recordPayment({
    id: session.id,
    userId: user.id,
    planId: plan.id,
    amountCents: Math.round(plan.priceEur * 100),
    currency: config.stripe.currency,
    status: 'pending',
  });

  return session;
}

/** Проверяет подпись Stripe и возвращает событие. Бросает ошибку, если подпись не сошлась. */
export function parseWebhook(rawBody, signature) {
  if (!config.stripe.webhookSecret) {
    throw new Error('Не задан STRIPE_WEBHOOK_SECRET — вебхук отклонён');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
}

/** Включает подписку по оплаченной сессии. Повторный вызов ничего не ломает. */
export async function fulfillCheckout(session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const planId = session.metadata?.planId;
  if (!userId || !planId) {
    console.warn('[stripe] в сессии нет userId/planId, пропускаем', session.id);
    return;
  }
  if (store.isPaymentProcessed(session.id)) return; // защита от повторной доставки вебхука

  const user = store.getUserById(userId);
  const plan = store.getSettings().plans.find((p) => p.id === planId);
  if (!user || !plan) {
    console.warn('[stripe] пользователь или тариф не найден', { userId, planId });
    return;
  }

  const updated = store.activateSubscription(userId, planId);
  store.recordPayment({
    id: session.id,
    userId,
    planId,
    amountCents: session.amount_total ?? Math.round(plan.priceEur * 100),
    currency: session.currency ?? config.stripe.currency,
    status: 'paid',
  });

  try {
    await sendSubscriptionStarted(updated, plan, updated.subscription.until);
  } catch (e) {
    console.warn('[stripe] подписка включена, но письмо не ушло:', e.message);
  }

  console.log(`[stripe] подписка «${plan.title}» включена для ${user.email}`);
}
