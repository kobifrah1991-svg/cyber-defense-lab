/* TedraLingo — merge two copies of the learner's state (this device + the cloud) without losing progress.
 *  Progress only grows: lessons / Bosses / grammar units done stay done, best scores and XP take the max,
 *  the phrasebook keeps every phrase. Choices (settings, profile, today's quests) follow the newer copy.
 */
(function () {
  const plain = o => !!o && typeof o === 'object' && !Array.isArray(o);
  const num = (x, max = 1e9) => (Number.isFinite(x) ? Math.max(0, Math.min(max, x)) : 0);
  const obj = o => (plain(o) ? o : {});

  function mergeMap(a, b, fn) {
    const out = {};
    for (const k of new Set([...Object.keys(obj(a)), ...Object.keys(obj(b))])) out[k] = fn(obj(a)[k], obj(b)[k]);
    return out;
  }

  const station = (x, y) => {
    x = obj(x); y = obj(y);
    return {
      lesson: !!(x.lesson || y.lesson), boss: !!(x.boss || y.boss),
      bestVoice: Math.max(num(x.bestVoice, 100), num(y.bestVoice, 100)),
      bestBoss: Math.max(num(x.bestBoss, 100), num(y.bestBoss, 100))
    };
  };
  const unit = (x, y) => {
    x = obj(x); y = obj(y);
    return { done: !!(x.done || y.done), best: Math.max(num(x.best, 100), num(y.best, 100)) };
  };

  /** `a` and `b` are full states; the newer one (by `updated`) wins wherever progress can't simply be combined. */
  function merge(a, b) {
    a = obj(a); b = obj(b);
    const [older, newer] = num(b.updated, 1e15) > num(a.updated, 1e15) ? [a, b] : [b, a];
    const out = structuredClone(newer);

    out.xp = Math.max(num(a.xp), num(b.xp));
    out.progress = mergeMap(a.progress, b.progress, (x, y) => mergeMap(x, y, station));
    out.grammar = mergeMap(a.grammar, b.grammar, (x, y) => mergeMap(x, y, unit));

    // phrasebook: keep every phrase; for one saved on both, the copy that was reviewed more
    out.vault = mergeMap(a.vault, b.vault, (x, y) => {
      if (!plain(x)) return y;
      if (!plain(y)) return x;
      const nx = num(x.reviews), ny = num(y.reviews);
      return ny > nx ? y : nx > ny ? x : newer === b ? y : x;
    });

    // streak: the copy that reached its daily goal most recently, with the best ever kept
    const sa = obj(a.streak), sb = obj(b.streak);
    const recent = String(sb.lastGoalDay || '') > String(sa.lastGoalDay || '') ? sb : String(sa.lastGoalDay || '') > String(sb.lastGoalDay || '') ? sa : obj(newer.streak);
    out.streak = { ...recent, best: Math.max(num(sa.best), num(sb.best), num(recent.count)) };

    const ea = obj(a.engage), eb = obj(b.engage);
    out.engage = {
      ...obj(newer.engage),
      xpDays: mergeMap(ea.xpDays, eb.xpDays, (x, y) => Math.max(num(x), num(y))),
      counters: mergeMap(ea.counters, eb.counters, (x, y) => Math.max(num(x), num(y))),
      badges: { ...obj(obj(older.engage).badges), ...obj(obj(newer.engage).badges) }
    };

    out.profile = { ...obj(newer.profile), onboarded: !!(obj(a.profile).onboarded || obj(b.profile).onboarded) };
    out.updated = Math.max(num(a.updated, 1e15), num(b.updated, 1e15));
    return out;
  }

  /** Same learning content, ignoring timestamps — used to skip needless writes. */
  function same(a, b) {
    const strip = s => JSON.stringify({ ...obj(s), updated: 0 });
    return strip(a) === strip(b);
  }

  window.LQCloudMerge = { merge, same };
})();
