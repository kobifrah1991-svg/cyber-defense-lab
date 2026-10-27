/* TedraLingo AI tutor — free spoken conversation with the learner's teacher (Premium)
 *
 *  POST /tutor  { token, target, base, level, teacher: { name, city, age }, scenario, messages: [{ role, content }] }
 *   → { ok, reply, translation, correction: { note, better } | null, suggestions: [..] }
 *
 *  The license key (see license-worker.js) gates access; an optional KV binding (TUTOR_KV) caps
 *  messages per license per day (TUTOR_DAILY_LIMIT, default 60).
 */
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

export const MODEL = 'claude-opus-5-5';
const MAX_HISTORY = 20;
const MAX_CHARS = 500;

const LANG_NAMES = { en: 'English', es: 'Spanish', fr: 'French', it: 'Italian', de: 'German', he: 'Hebrew', ar: 'Arabic', ru: 'Russian' };
const LEVELS = [
  { name: 'absolute beginner', cefr: 'Pre-A1', guide: 'very simple, high-frequency words; present tense; at most about 8 words per sentence' },
  { name: 'basic', cefr: 'A1–A2', guide: 'simple sentences with common travel vocabulary' },
  { name: 'intermediate', cefr: 'B1–B2', guide: 'natural everyday sentences' },
  { name: 'advanced', cefr: 'C1–C2', guide: 'natural native-speed phrasing; idioms are welcome' }
];

export const TutorReply = z.object({
  reply: z.string().describe('The teacher\'s next spoken line, in the target language only'),
  translation: z.string().describe('The same line translated into the learner\'s own language'),
  correction: z.object({
    note: z.string().describe('A short, kind explanation in the learner\'s own language'),
    better: z.string().describe('The learner\'s last message rewritten correctly, in the target language')
  }).nullable().describe('null when the learner\'s last message had no real mistake'),
  suggestions: z.array(z.string()).describe('Two short things the learner could say next, in the target language')
});

export function systemPrompt({ target, base, level, teacher, scenario }) {
  const L = LEVELS[Math.max(0, Math.min(3, level | 0))];
  const tl = LANG_NAMES[target] || target;
  const bl = LANG_NAMES[base] || base;
  return [
    `You are ${teacher.name}, a warm, upbeat ${teacher.age}-year-old language teacher from ${teacher.city}.`,
    `You are having a spoken practice conversation with a learner who is getting ready to travel. They are learning ${tl}; their own language is ${bl}; their level is ${L.name} (${L.cefr}).`,
    `Scenario: ${scenario}`,
    '',
    'How to answer:',
    `- Stay in character and keep the conversation going: respond naturally, then ask one simple question that moves the scene forward.`,
    `- "reply" is in ${tl} only: one or two short sentences, using ${L.guide}. It will be read aloud, so write it the way people actually speak, without emoji or lists.`,
    `- "translation" is that same reply in ${bl}.`,
    `- If the learner's last message has a real mistake (vocabulary, grammar, word order), set "correction" with a short, encouraging note in ${bl} and the corrected sentence in ${tl}. Their messages come from speech recognition, so ignore missing punctuation, capitalisation and accents. Otherwise "correction" is null.`,
    `- If the learner writes in ${bl} or seems stuck, give the ${tl} way to say it in your reply, kindly, and carry on.`,
    `- "suggestions": two short, different things the learner could say next, in ${tl}, at their level.`,
    '- Keep everything friendly and suitable for all ages. If the learner asks for something unrelated or unsafe, gently bring the conversation back to the practice scene.'
  ].join('\n');
}

const OPENER = '(The learner has just opened the conversation. Greet them in character and start the scene with a question.)';

/** Validate and normalise the client's history: alternating turns, user first and last, bounded size. */
export function cleanHistory(messages) {
  const all = (Array.isArray(messages) ? messages : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }));
  const list = all.slice(-(MAX_HISTORY - 1));
  if (list.length && list[0].role === 'assistant') {
    // the teacher opens every conversation: keep its first line behind the opener turn that produced it;
    // once older turns were trimmed away, the leading teacher line is just dropped
    if (list.length === all.length) list.unshift({ role: 'user', content: OPENER });
    else list.shift();
  }
  const out = [];
  for (const m of list) {
    if (out.length && out[out.length - 1].role === m.role) out[out.length - 1].content += '\n' + m.content;
    else out.push(m);
  }
  if (!out.length) return [{ role: 'user', content: OPENER }];
  if (out[out.length - 1].role !== 'user') return null;
  return out;
}

/** One tutor turn. `client` is injectable for tests. */
export async function tutorTurn(client, input) {
  const messages = cleanHistory(input.messages);
  if (!messages) return { status: 400, body: { ok: false, error: 'bad_history' } };
  const teacher = {
    name: String(input.teacher?.name || 'Alex').slice(0, 40),
    city: String(input.teacher?.city || 'the city').slice(0, 60),
    age: Number(input.teacher?.age) || 25
  };
  const scenario = String(input.scenario || 'A friendly chat while travelling.').slice(0, 300);

  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',                     // a declined turn is retried on Anthropic's recommended model
      cache_control: { type: 'ephemeral' },
      system: systemPrompt({ target: input.target, base: input.base, level: input.level, teacher, scenario }),
      messages,
      output_config: { effort: 'low', format: betaZodOutputFormat(TutorReply) }
    });
    if (response.stop_reason === 'refusal') return { status: 200, body: { ok: false, error: 'refusal' } };
    const out = response.parsed_output;
    if (!out) return { status: 502, body: { ok: false, error: 'bad_output' } };
    return {
      status: 200,
      body: { ok: true, reply: out.reply, translation: out.translation, correction: out.correction, suggestions: out.suggestions.slice(0, 2) }
    };
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { status: 503, body: { ok: false, error: 'busy' } };
    if (e instanceof Anthropic.APIError) return { status: 502, body: { ok: false, error: 'upstream' } };
    throw e;
  }
}

/** Per-license daily cap when a KV namespace is bound. Returns false when the cap is reached. */
export async function underDailyCap(env, licenseId) {
  if (!env.TUTOR_KV) return true;
  const day = new Date().toISOString().slice(0, 10);
  const key = `tutor:${licenseId}:${day}`;
  const used = Number(await env.TUTOR_KV.get(key)) || 0;
  if (used >= (Number(env.TUTOR_DAILY_LIMIT) || 60)) return false;
  await env.TUTOR_KV.put(key, String(used + 1), { expirationTtl: 2 * 86400 });
  return true;
}

export function makeClient(env) {
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}
