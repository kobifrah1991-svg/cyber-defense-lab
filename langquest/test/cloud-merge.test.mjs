import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

globalThis.window = {};
vm.runInThisContext(readFileSync(new URL('../js/cloud-merge.js', import.meta.url), 'utf8'));
const { merge, same } = window.LQCloudMerge;

const phone = {
  updated: 100, xp: 300, settings: { lang: 'es', slowRate: 0.6 },
  progress: { es: { airport: { lesson: true, boss: true, bestVoice: 90, bestBoss: 80 }, taxi: { lesson: true, boss: false, bestVoice: 70, bestBoss: 0 } } },
  grammar: { es: { 'ser-estar': { done: true, best: 75 } } },
  vault: { 'es:taxi:1': { box: 2, due: '2026-10-30', added: '2026-10-20', reviews: 3 } },
  streak: { count: 4, best: 6, lastGoalDay: '2026-10-26', today: '2026-10-27', todaySec: 60 },
  engage: { freezes: 1, xpDays: { '2026-10-26': 50 }, counters: { lesson: 5 }, badges: { first: '2026-10-20' } },
  profile: { onboarded: true, minutes: 5, levels: { es: 1 } }
};
const laptop = {
  updated: 200, xp: 120, settings: { lang: 'it', slowRate: 0.7 },
  progress: { es: { airport: { lesson: true, boss: false, bestVoice: 95, bestBoss: 0 }, hotel: { lesson: true, boss: false, bestVoice: 60, bestBoss: 0 } }, it: { airport: { lesson: true, boss: false, bestVoice: 88, bestBoss: 0 } } },
  grammar: { es: { 'ser-estar': { done: false, best: 90 }, articles: { done: true, best: 50 } } },
  vault: { 'es:taxi:1': { box: 0, due: '2026-10-27', added: '2026-10-20', reviews: 1 }, 'it:cafe:0': { box: 0, due: '2026-10-27', added: '2026-10-27', reviews: 0 } },
  streak: { count: 1, best: 2, lastGoalDay: '2026-10-25', today: '2026-10-27', todaySec: 30 },
  engage: { freezes: 0, xpDays: { '2026-10-26': 20, '2026-10-27': 40 }, counters: { lesson: 2, word: 9 }, badges: { polyglot: '2026-10-27' } },
  profile: { onboarded: false, minutes: 10, levels: { es: 1, it: 2 } }
};

test('progress from both devices is kept: lessons, Bosses, grammar units, best scores, XP', () => {
  const m = merge(phone, laptop);
  assert.equal(m.xp, 300);
  assert.deepEqual(m.progress.es.airport, { lesson: true, boss: true, bestVoice: 95, bestBoss: 80 });
  assert.ok(m.progress.es.taxi.lesson && m.progress.es.hotel.lesson && m.progress.it.airport.lesson);
  assert.deepEqual(m.grammar.es['ser-estar'], { done: true, best: 90 });
  assert.ok(m.grammar.es.articles.done);
});

test('phrasebook keeps every phrase, the more-reviewed copy wins', () => {
  const m = merge(phone, laptop);
  assert.equal(m.vault['es:taxi:1'].reviews, 3);
  assert.ok(m.vault['it:cafe:0']);
});

test('choices follow the newer copy; streak follows the latest goal day with the best kept', () => {
  const m = merge(phone, laptop);
  assert.equal(m.settings.lang, 'it');
  assert.equal(m.profile.minutes, 10);
  assert.equal(m.profile.onboarded, true);
  assert.equal(m.streak.count, 4);
  assert.equal(m.streak.best, 6);
  assert.deepEqual(m.engage.xpDays, { '2026-10-26': 50, '2026-10-27': 40 });
  assert.deepEqual(m.engage.counters, { lesson: 5, word: 9 });
  assert.deepEqual(Object.keys(m.engage.badges).sort(), ['first', 'polyglot']);
  assert.equal(m.updated, 200);
});

test('merge is symmetric for progress, idempotent, and survives junk from the cloud', () => {
  assert.deepEqual(merge(phone, laptop).progress, merge(laptop, phone).progress);
  const m = merge(phone, laptop);
  assert.ok(same(merge(m, m), m));
  const junk = merge(phone, { xp: 'lots', progress: [1, 2], vault: 'x', streak: null, engage: 5, updated: 'soon' });
  assert.equal(junk.xp, 300);
  assert.ok(junk.progress.es.airport.lesson);
  assert.equal(junk.vault['es:taxi:1'].reviews, 3);
});
