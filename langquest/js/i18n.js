/* LangQuest — interface language (base language)
 *  - UI strings per base language, `{name}` placeholders
 *  - Hebrew is the default; the browser language picks another supported base language
 *  - Content fields localise via `field_<lang>` (e.g. name_en) with Hebrew as the fallback
 *  - Adding a base language: add it to UI_LANGS + STR, and `_xx` fields / translations in data.js
 */
(function () {
  const UI_LANGS = {
    he: { name: 'עברית', flag: '🇮🇱', dir: 'rtl' },
    en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
    ar: { name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    ru: { name: 'Русский', flag: '🇷🇺', dir: 'ltr' }
  };

  const STR = {
    he: {
      'doc.title': 'LangQuest · שפה מדוברת',
      'common.exit': '✕ יציאה', 'common.next': 'הבא ←', 'common.finish': 'סיום 🏁', 'common.skip': 'דלג',
      'common.back': '→ חזרה', 'common.continue': 'המשך ←', 'common.toMap': '🗺️ למפה', 'common.backToMap': '→ למפה',
      'common.toVault': '📒 לאוסף', 'common.again': '🔁 שוב', 'common.close': 'סגירה', 'common.save': 'שמירה',
      'common.remove': 'הסרה', 'common.soon': 'בקרוב', 'common.minutes': '{n} דקות', 'common.normal': '▶️ רגיל',
      'common.slow': '🐢 איטי', 'common.play': '▶️ שמע', 'common.replay': '🔊 השמע שוב', 'common.uiLang': 'שפת הממשק',
      'teach.choose': 'בחרו מורה',
      'teach.yours': 'המורה שלך',
      'story.start': 'יאללה, מתחילים! ←',
      'teach.done': 'כל הכבוד! עכשיו נתרגל שיחה אמיתית עם ה-Boss 👑',
      'story.airport': 'נחתנו ב{city}! ✈️ התחנה הראשונה: ביקורת דרכונים. בואו נלמד מה אומרים לפקיד.',
      'story.hotel': 'הגענו למלון ב{city} 🏨 בואו נעשה צ׳ק־אין, נברר מתי ארוחת הבוקר ונבקש מגבת.',
      'story.restaurant': 'ערב ב{city} 🍽️ מוצאים שולחן, מבקשים תפריט ובסוף — את החשבון.',
      'story.shopping': 'יום קניות ב{city} 🛍️ שואלים על מידה, על מחיר ומשלמים בכרטיס.',
      'story.emergency': 'לפעמים צריך עזרה מהר 🚑 בואו נלמד לבקש רופא, אמבולנס ובית מרקחת.',
      'pay.trial': '{n} ימי ניסיון חינם',
      'pay.startTrial': 'התחילו ניסיון חינם',
      'pay.badge': '⭐ Premium', 'pay.locked': 'תחנת Premium', 'pay.title': '⭐ LangQuest Premium',
      'pay.sub': 'פתחו את כל התחנות, כל אתגרי ה-Boss וכל השפות.', 'pay.f1': 'כל 5 התחנות בכל שפה', 'pay.f2': 'כל אתגרי ה-Audio Boss',
      'pay.f3': 'שפות חדשות ברגע שהן יוצאות', 'pay.f4': 'תומכים בפיתוח הלומדה ❤️', 'pay.free': 'בחינם: {n} התחנות הראשונות בכל שפה, כולל ה-Boss שלהן',
      'pay.monthly': 'חודשי', 'pay.yearly': 'שנתי', 'pay.lifetime': 'לכל החיים',
      'pay.perMonth': 'לחודש', 'pay.perYear': 'לשנה', 'pay.once': 'תשלום חד־פעמי',
      'pay.best': 'הכי משתלם', 'pay.buy': 'לרכישה', 'pay.restore': 'יש לכם מפתח רישיון?',
      'pay.restorePh': 'הדביקו כאן את מפתח הרישיון', 'pay.activate': 'הפעלה', 'pay.demo': 'מצב הדגמה: התשלומים עוד לא חוברו — הרכישה מדומה ופועלת רק במחשב המקומי.',
      'pay.unavailable': 'הרכישה עוד לא זמינה — נסו שוב בקרוב.', 'pay.thanks': '🎉 תודה! Premium פעיל', 'pay.error': 'לא הצלחנו לאמת את הרכישה — נסו שוב או פנו לתמיכה',
      'pay.status': 'מנוי', 'pay.statusFree': 'חינם', 'pay.until': '{plan} · פעיל עד {date}',
      'pay.key': 'מפתח רישיון (להפעלה במכשיר נוסף)', 'pay.copy': 'העתקה', 'pay.copied': 'הועתק ✓',
      'pay.upgrade': '⭐ שדרוג ל-Premium', 'pay.signOut': 'הסרת הרישיון מהמכשיר',
      'pwa.install': 'התקנת האפליקציה', 'pwa.installed': 'LangQuest הותקנה 🎉',

      'hdr.lang': 'החלפת שפה', 'hdr.xp': 'נקודות ניסיון', 'hdr.vault': 'אוסף הביטויים', 'hdr.settings': 'הגדרות',
      'hdr.home': 'חזרה למפה', 'hdr.streakDone': 'יעד היום הושג! רצף: {n} ימים',
      'hdr.streakTip': 'היום: {m} / {g} דקות · רצף: {n} ימים',

      'map.dueTitle': 'הגיע זמן התרגול של {t}!', 'map.dueLeft': 'עוד {n} דקות ליעד היומי',
      'map.dueStreak': '— שמרו על רצף של {n} ימים 🔥', 'map.review': '🧠 חזרה',
      'map.title': 'המסע שלך ב{lang}',
      'map.sub': 'שפה מדוברת לחו״ל — 3-5 דקות לתחנה: שומעים, מאטים, משחקים ומדברים.',
      'map.accent': 'מבטא', 'map.testVoice': '🔊 בדיקת קול', 'map.changeLevel': 'שינוי רמה',
      'map.levelPill': '{li} רמה: <b>{level}</b> · קצב {pi} <b>{pace}</b>',
      'map.streakDays': '{n} ימי רצף', 'map.best': 'שיא: {n}',
      'map.goalDone': '✅ יעד {g} הדקות של היום הושג', 'map.goalProgress': 'היום: {m} / {g} דקות למידה',
      'map.reminders': '⏰ תזכורות: {s}', 'map.mapTitle': '🗺️ מפת המסע', 'map.stationsCount': '{d}/{n} תחנות',
      'map.done': '✅ הושלם · הגייה {n}%', 'map.openMeta': '3 ביטויים · ~4 דק׳', 'map.locked': 'השלימו את התחנה הקודמת',
      'map.bossBeaten': ' · 👑 בוס הובס', 'map.redo': '🔁 שיעור', 'map.start': '▶️ התחל', 'map.bossLocked': 'נפתח אחרי השיעור',
      'map.vaultTitle': '📒 אוסף הביטויים', 'map.vaultDue': '{n} ביטויים מחכים לחזרה היום',
      'map.vaultEmpty': 'אין חזרות להיום — ביטויים קשים נשמרים כאן אוטומטית', 'map.reviewNow': '🧠 חזרה עכשיו',
      'map.toVault': 'לאוסף',
      'voice.noTts': 'הדפדפן לא תומך בהקראה (TTS)',
      'voice.noVoice': 'לא נמצא קול {a} במכשיר — ייתכן שיושמע קול ברירת מחדל',

      'vault.title': '📒 אוסף הביטויים',
      'vault.desc': 'ביטויים שהתקשיתם בהם נשמרים כאן אוטומטית (או בלחיצה על ☆). החזרות מתוזמנות בשיטת Spaced Repetition: 1 → 3 → 7 → 14 → 30 ימים.',
      'vault.reviewN': '🧠 חזרה על {n} ביטויים', 'vault.mastery': 'רמת שליטה', 'vault.today': '⏰ היום',
      'vault.empty': 'האוסף ריק — התחילו שיעור ושמרו ביטויים עם ☆',
      'review.title': '🧠 חזרה חכמה', 'review.ask': 'איך אומרים את זה? אמרו בקול ואז חשפו.',
      'review.reveal': '👀 חשוף ושמע', 'review.knew': '✅ ידעתי', 'review.doneTitle': 'סיימתם את החזרה של היום!',
      'review.none': 'אין חזרות להיום', 'review.knewLabel': 'ידעתם',

      'langs.title': 'באיזו שפה נדבר?', 'langs.isUi': 'שפת הממשק',

      'set.title': '⚙️ הגדרות', 'set.levelIn': 'רמה ב{lang}', 'set.goal': 'יעד יומי', 'set.changeLevel': '🎚️ שינוי רמה',
      'set.reminders': '⏰ תזכורות ({s})', 'set.profile': '👤 עריכת פרופיל השפות', 'set.voiceTitle': '🔊 קול והגייה',
      'set.accent': 'מבטא ({lang})', 'set.voice': 'קריין', 'set.noVoices': 'לא נמצאו קולות למבטא הזה במכשיר',
      'set.voiceHint': 'קולות המסומנים Natural / Neural / Online נשמעים הכי טבעיים.',
      'set.slow': 'מהירות מצב צב 🐢:', 'set.translit': 'הצגת תעתיק עברי מנוקד',
      'set.test': '🔊 בדיקה', 'set.testSlow': '🐢 בדיקה איטית',
      'set.micYes': '🎙️ זיהוי דיבור זמין בדפדפן הזה.', 'set.micNo': '🎙️ זיהוי דיבור לא זמין בדפדפן הזה — מומלץ Chrome או Edge.',
      'set.reset': 'איפוס כל ההתקדמות', 'set.resetConfirm': 'לאפס את כל ההתקדמות, הרצף והאוסף?',
      'set.levelToast': '{icon} קצב {pace} — {level}',
      'streak.reached': '🔥 יעד {n} הדקות היומי הושג! הרצף ממשיך (+20 XP)',

      'ui.stressed': 'הברה מוטעמת',
      'mic.notAllowed': 'צריך לאשר גישה למיקרופון בדפדפן 🎙️', 'mic.noSpeech': 'לא שמענו כלום — נסו שוב, קרוב יותר למיקרופון',
      'mic.noCapture': 'לא נמצא מיקרופון במכשיר', 'mic.network': 'זיהוי הדיבור דורש חיבור לאינטרנט',
      'mic.aborted': 'ההקלטה בוטלה', 'mic.generic': 'משהו השתבש בזיהוי — נסו שוב',
      'score.great': 'מושלם! נשמעת כמו מקומי 🌟', 'score.good': 'יפה מאוד! כמעט מושלם 👏',
      'score.mid': 'בכיוון — הקשיבו למילים באדום ונסו שוב', 'score.low': 'בואו ננסה שוב, לאט ובבירור 🐢',
      'vc.speak': 'דברו עכשיו', 'vc.listening': 'מקשיבים…', 'vc.sayNow': 'אמרו את המשפט עכשיו…', 'vc.retry': 'נסו שוב',
      'vc.heard': 'שמענו:', 'vc.tapRed': 'לחצו על מילה אדומה כדי לשמוע אותה לאט',
      'vc.noRec': 'הדפדפן הזה לא תומך בזיהוי דיבור (נסו Chrome או Edge). אמרו את המשפט בקול והעריכו בעצמכם:',
      'vc.selfOk': '✅ אמרתי נכון', 'vc.selfBad': '🔁 צריך עוד תרגול',

      'step.listen': 'שמיעה וזיהוי', 'step.listen.hint': 'הקשיבו למשפט בקצב טבעי ועקבו אחרי המילה המוארת. לחצו על מילה לפירוש.',
      'step.slow': 'תרגול איטי', 'step.slow.hint': 'אותו משפט — לאט. הקשיבו מילה-אחר-מילה וחזרו בקול.',
      'step.game': 'משחק חיזוק',
      'step.voice': 'סימולציית דיבור', 'step.voice.hint': 'אמרו את המשפט למיקרופון — ירוק = נהגה נכון, אדום = לשפר.',
      'game.pic': 'צליל ← תמונה', 'game.pic.hint': 'הקשיבו ובחרו את התמונה שמתאימה למשפט.',
      'game.gap': 'השלימו את החסר', 'game.gap.hint': 'הקשיבו ובחרו את המילה החסרה.',
      'game.build': 'הרכיבו את המשפט', 'game.build.hint': 'הקשיבו ולחצו על המילים לפי הסדר.',
      'lesson.skipStep': '⏭️ דלג לשלב המשחק', 'lesson.star': 'שמירה לאוסף הביטויים',
      'lesson.starOn': 'נשמר לאוסף הביטויים ⭐', 'lesson.starOff': 'הוסר מאוסף הביטויים',
      'lesson.playNatural': '▶️ השמע בקצב טבעי', 'lesson.hard': '🔍 צלילים מורכבים', 'lesson.playSlow': '🐢 השמע לאט ({n}%)',
      'lesson.wordByWord': '🧩 מילה-אחר-מילה', 'lesson.breakdown': 'פירוק פונטי — לחצו על מילה לשמיעה איטית',
      'lesson.echo': '🗣️ עכשיו תורכם — חזרו אחריי (לא נספר בציון)',
      'lesson.correct': 'נכון! 🎯', 'lesson.correct2': 'נכון! 👍', 'lesson.buildPh': 'לחצו על המילים לפי הסדר…',
      'lesson.clear': '↺ נקה',
      'fin.title': 'תחנת {name} — הושלמה!', 'fin.accuracy': 'דיוק הגייה', 'fin.games': 'משחקים בניסיון ראשון',
      'fin.saved': '📒 {n} ביטויים נשמרו לאוסף לחזרה חכמה.', 'fin.unlocked': '🔓 התחנה הבאה נפתחה!',
      'fin.boss': '👑 לאתגר ה-Audio Boss',

      'boss.ai': 'דמות AI · {lang}', 'boss.replay': 'השמע שוב', 'boss.say': '🎯 תגידו:', 'boss.hint': '💡 רמז',
      'boss.answer': 'ענו בקול', 'boss.notHeard': 'לא שמענו — נסו שוב',
      'boss.moveOn': 'נמשיך הלאה — הביטוי נשמר לאוסף לחזרה 📒',
      'boss.almost': '{s}% — כמעט! שמענו {heard}. נסו שוב ({n} ניסיונות)',
      'boss.noMic': 'אין זיהוי דיבור בדפדפן הזה — אמרו בקול ואז בחרו את התשובה:',
      'boss.won': 'ניצחתם את הבוס!', 'boss.lost': 'כמעט! עוד ניסיון אחד', 'boss.score': 'ציון שיחה:',

      'onb.s1': 'השפות שלי', 'onb.s2': 'מה לומדים', 'onb.s3': 'זמן ותזכורות', 'onb.s4': 'התוכנית שלי',
      'onb.go': '🚀 יוצאים למסע', 'onb.welcome': 'ברוכים הבאים ל-LangQuest!',
      'onb.uiQ': 'באיזו שפה להציג את הלומדה?',
      'onb.knownQ': 'כדי להתאים את הקצב בשבילכם — אילו שפות אתם כבר יודעים, ובאיזו רמה?',
      'onb.levelsHelp': 'מה אומרת כל רמה?', 'onb.targetQ': 'איזו שפה נלמד? 🧭', 'onb.levelQ': 'מה הרמה שלכם ב{lang} היום?',
      'onb.timeQ': 'כמה זמן ביום? ⏱️',
      'onb.timeSub': 'עדיף מעט כל יום מאשר הרבה פעם בשבוע. הרצף 🔥 נספר כשמגיעים ליעד היומי.',
      'onb.whenQ': '⏰ מתי אתם פנויים ללמוד?', 'onb.planTitle': 'התוכנית שלכם ל{lang}',
      'onb.curLevel': 'רמה נוכחית', 'onb.pace': 'קצב למידה',
      'onb.boostRelated': '{known} שלכם קרובה ל{lang} — הרבה מילים וצלילים יהיו מוכרים, אז מתחילים קצת מהר יותר.',
      'onb.boostMulti': 'אתם כבר דוברים {known} — יש לכם ניסיון בלמידת שפה, אז מתחילים בקצב רגיל.',
      'onb.goal': 'יעד יומי', 'onb.rem': 'תזכורות', 'onb.open': 'תחנות פתוחות', 'onb.of': '{a} מתוך {b}',
      'onb.editLater': 'אפשר לשנות הכול בכל רגע דרך ⚙️ הגדרות.',
      'onb.lvlPickTitle': 'מה הרמה שלכם ב{lang}?', 'onb.lvlPickSub': 'נתאים את הקצב, מהירות ההקראה והתעתיק.',

      'rem.modalTitle': '⏰ תזכורות ללמידה', 'rem.modalSub': 'בחרו שעה קבועה ביום שבה אתם פנויים לכמה דקות תרגול.',
      'rem.dueToast': '⏰ {t} — הגיע זמן התרגול היומי!',
      'rem.dayNames': ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
      'rem.title': '⏰ הגיע זמן ה{lang} שלך!', 'rem.bodyStreak': '{m} דקות תרגול שומרות על רצף של {n} ימים 🔥',
      'rem.body': '{m} דקות של שמיעה ודיבור — בואו נתחיל 🗺️', 'rem.summary': '🗺️ LangQuest — {m} דקות {lang}',
      'rem.details': 'זמן התרגול היומי שלך: {m} דקות של שמיעה, הגייה ודיבור ב{lang}.',
      'rem.perm.granted': '✅ התראות מערכת מאושרות',
      'rem.perm.denied': '🚫 התראות חסומות בדפדפן — אפשר לאשר מחדש בהגדרות האתר, או להשתמש ביומן',
      'rem.perm.default': '🔔 עוד לא אישרתם התראות', 'rem.perm.unsupported': 'הדפדפן לא תומך בהתראות — השתמשו בהוספה ליומן',
      'rem.enable': 'להזכיר לי לתרגל', 'rem.timeQ': 'באיזו שעה אתם פנויים?', 'rem.addTime': '＋ שעה נוספת',
      'rem.daysQ': 'באילו ימים?', 'rem.allow': '🔔 אישור התראות', 'rem.test': '🔔 התראת בדיקה',
      'rem.ics': '📅 הוספה ליומן (.ics)',
      'rem.note': 'התראות מהלומדה מגיעות כשהיא פתוחה (גם בלשונית ברקע). כדי לקבל תזכורת גם כשהיא סגורה — הוסיפו ליומן.',
      'rem.oneDay': 'צריך לבחור לפחות יום אחד', 'rem.off': 'כבויות', 'rem.everyDay': 'כל יום'
    },

    en: {
      'doc.title': 'LangQuest · Spoken language',
      'common.exit': '✕ Exit', 'common.next': 'Next →', 'common.finish': 'Finish 🏁', 'common.skip': 'Skip',
      'common.back': '← Back', 'common.continue': 'Continue →', 'common.toMap': '🗺️ Map', 'common.backToMap': '← Map',
      'common.toVault': '📒 Phrasebook', 'common.again': '🔁 Again', 'common.close': 'Close', 'common.save': 'Save',
      'common.remove': 'Remove', 'common.soon': 'Coming soon', 'common.minutes': '{n} min', 'common.normal': '▶️ Normal',
      'common.slow': '🐢 Slow', 'common.play': '▶️ Listen', 'common.replay': '🔊 Play again', 'common.uiLang': 'Interface language',
      'teach.choose': 'Choose your teacher',
      'teach.yours': 'Your teacher',
      'story.start': 'Let\'s go! →',
      'teach.done': 'Well done! Now let\'s practise a real conversation with the Boss 👑',
      'story.airport': 'We just landed in {city}! ✈️ First stop: passport control. Let\'s learn what to say to the officer.',
      'story.hotel': 'We\'ve reached our hotel in {city} 🏨 Let\'s check in, ask about breakfast and get a towel.',
      'story.restaurant': 'Dinner time in {city} 🍽️ We\'ll get a table, ask for the menu and, at the end, the check.',
      'story.shopping': 'Shopping day in {city} 🛍️ We\'ll ask for a size, check the price and pay by card.',
      'story.emergency': 'Sometimes you need help fast 🚑 Let\'s learn to ask for a doctor, an ambulance and a pharmacy.',
      'pay.trial': '{n}-day free trial',
      'pay.startTrial': 'Start free trial',
      'pay.badge': '⭐ Premium', 'pay.locked': 'Premium stop', 'pay.title': '⭐ LangQuest Premium',
      'pay.sub': 'Unlock every stop, every Boss challenge and every language.', 'pay.f1': 'All 5 stops in every language', 'pay.f2': 'Every Audio Boss challenge',
      'pay.f3': 'New languages as soon as they launch', 'pay.f4': 'Support the app ❤️', 'pay.free': 'Free: the first {n} stops of every language, Bosses included',
      'pay.monthly': 'Monthly', 'pay.yearly': 'Yearly', 'pay.lifetime': 'Lifetime',
      'pay.perMonth': '/ month', 'pay.perYear': '/ year', 'pay.once': 'one-time payment',
      'pay.best': 'Best value', 'pay.buy': 'Buy', 'pay.restore': 'Have a license key?',
      'pay.restorePh': 'Paste your license key', 'pay.activate': 'Activate', 'pay.demo': 'Demo mode: payments are not connected yet — purchases are simulated and only work on localhost.',
      'pay.unavailable': 'Purchasing is not available yet — please try again soon.', 'pay.thanks': '🎉 Thank you! Premium is active', 'pay.error': 'We couldn\'t verify the purchase — try again or contact support',
      'pay.status': 'Subscription', 'pay.statusFree': 'Free', 'pay.until': '{plan} · active until {date}',
      'pay.key': 'License key (to activate another device)', 'pay.copy': 'Copy', 'pay.copied': 'Copied ✓',
      'pay.upgrade': '⭐ Upgrade to Premium', 'pay.signOut': 'Remove the license from this device',
      'pwa.install': 'Install the app', 'pwa.installed': 'LangQuest installed 🎉',

      'hdr.lang': 'Switch language', 'hdr.xp': 'Experience points', 'hdr.vault': 'Phrasebook', 'hdr.settings': 'Settings',
      'hdr.home': 'Back to map', 'hdr.streakDone': "Today's goal reached! Streak: {n} days",
      'hdr.streakTip': 'Today: {m} / {g} min · streak: {n} days',

      'map.dueTitle': "It's {t} — practice time!", 'map.dueLeft': '{n} more min to your daily goal',
      'map.dueStreak': '— keep your {n}-day streak 🔥', 'map.review': '🧠 Review',
      'map.title': 'Your {lang} journey',
      'map.sub': 'Spoken language for travel — 3–5 minutes per stop: listen, slow down, play and speak.',
      'map.accent': 'Accent', 'map.testVoice': '🔊 Test voice', 'map.changeLevel': 'Change level',
      'map.levelPill': '{li} Level: <b>{level}</b> · pace {pi} <b>{pace}</b>',
      'map.streakDays': '{n}-day streak', 'map.best': 'Best: {n}',
      'map.goalDone': "✅ Today's {g}-minute goal reached", 'map.goalProgress': 'Today: {m} / {g} min of practice',
      'map.reminders': '⏰ Reminders: {s}', 'map.mapTitle': '🗺️ Journey map', 'map.stationsCount': '{d}/{n} stops',
      'map.done': '✅ Done · pronunciation {n}%', 'map.openMeta': '3 phrases · ~4 min', 'map.locked': 'Finish the previous stop',
      'map.bossBeaten': ' · 👑 Boss beaten', 'map.redo': '🔁 Lesson', 'map.start': '▶️ Start', 'map.bossLocked': 'Unlocks after the lesson',
      'map.vaultTitle': '📒 Phrasebook', 'map.vaultDue': '{n} phrases waiting for review today',
      'map.vaultEmpty': 'No reviews today — tricky phrases are saved here automatically', 'map.reviewNow': '🧠 Review now',
      'map.toVault': 'Open',
      'voice.noTts': "This browser doesn't support text-to-speech",
      'voice.noVoice': 'No {a} voice on this device — a default voice may be used',

      'vault.title': '📒 Phrasebook',
      'vault.desc': 'Phrases you struggled with are saved here automatically (or tap ☆). Reviews are spaced out: 1 → 3 → 7 → 14 → 30 days.',
      'vault.reviewN': '🧠 Review {n} phrases', 'vault.mastery': 'Mastery', 'vault.today': '⏰ Today',
      'vault.empty': 'Your phrasebook is empty — start a lesson and save phrases with ☆',
      'review.title': '🧠 Smart review', 'review.ask': 'How do you say this? Say it out loud, then reveal.',
      'review.reveal': '👀 Reveal & listen', 'review.knew': '✅ I knew it', 'review.doneTitle': "You've finished today's review!",
      'review.none': 'No reviews today', 'review.knewLabel': 'known',

      'langs.title': 'Which language shall we speak?', 'langs.isUi': 'Your interface language',

      'set.title': '⚙️ Settings', 'set.levelIn': 'Level in {lang}', 'set.goal': 'Daily goal', 'set.changeLevel': '🎚️ Change level',
      'set.reminders': '⏰ Reminders ({s})', 'set.profile': '👤 Edit language profile', 'set.voiceTitle': '🔊 Voice & pronunciation',
      'set.accent': 'Accent ({lang})', 'set.voice': 'Narrator', 'set.noVoices': 'No voices for this accent on this device',
      'set.voiceHint': 'Voices labelled Natural / Neural / Online sound the most natural.',
      'set.slow': 'Turtle mode speed 🐢:', 'set.translit': 'Show pronunciation respelling',
      'set.test': '🔊 Test', 'set.testSlow': '🐢 Slow test',
      'set.micYes': '🎙️ Speech recognition is available in this browser.',
      'set.micNo': "🎙️ Speech recognition isn't available here — try Chrome or Edge.",
      'set.reset': 'Reset all progress', 'set.resetConfirm': 'Reset all progress, streak and phrasebook?',
      'set.levelToast': '{icon} {pace} pace — {level}',
      'streak.reached': '🔥 Daily {n}-minute goal reached! Streak continues (+20 XP)',

      'ui.stressed': 'Stressed syllable',
      'mic.notAllowed': 'Please allow microphone access in your browser 🎙️', 'mic.noSpeech': "We didn't hear anything — try again, closer to the mic",
      'mic.noCapture': 'No microphone found on this device', 'mic.network': 'Speech recognition needs an internet connection',
      'mic.aborted': 'Recording cancelled', 'mic.generic': 'Something went wrong — please try again',
      'score.great': 'Perfect! You sound like a local 🌟', 'score.good': 'Very nice! Almost perfect 👏',
      'score.mid': 'Getting there — listen to the red words and try again', 'score.low': "Let's try again, slowly and clearly 🐢",
      'vc.speak': 'Speak now', 'vc.listening': 'Listening…', 'vc.sayNow': 'Say the sentence now…', 'vc.retry': 'Try again',
      'vc.heard': 'We heard:', 'vc.tapRed': 'Tap a red word to hear it slowly',
      'vc.noRec': "This browser doesn't support speech recognition (try Chrome or Edge). Say the sentence aloud and rate yourself:",
      'vc.selfOk': '✅ I said it right', 'vc.selfBad': '🔁 Needs more practice',

      'step.listen': 'Listen & feel', 'step.listen.hint': 'Listen at natural speed and follow the highlighted word. Tap a word for its meaning.',
      'step.slow': 'Slow practice', 'step.slow.hint': 'Same sentence — slowly. Listen word by word and repeat aloud.',
      'step.game': 'Practice game',
      'step.voice': 'Speaking check', 'step.voice.hint': 'Say the sentence into the mic — green = right, red = needs work.',
      'game.pic': 'Sound → picture', 'game.pic.hint': 'Listen and pick the picture that matches the sentence.',
      'game.gap': 'Fill the gap', 'game.gap.hint': 'Listen and pick the missing word.',
      'game.build': 'Build the sentence', 'game.build.hint': 'Listen and tap the words in order.',
      'lesson.skipStep': '⏭️ Skip to the game', 'lesson.star': 'Save to phrasebook',
      'lesson.starOn': 'Saved to phrasebook ⭐', 'lesson.starOff': 'Removed from phrasebook',
      'lesson.playNatural': '▶️ Play at natural speed', 'lesson.hard': '🔍 Tricky sounds', 'lesson.playSlow': '🐢 Play slowly ({n}%)',
      'lesson.wordByWord': '🧩 Word by word', 'lesson.breakdown': 'Phonetic breakdown — tap a word to hear it slowly',
      'lesson.echo': '🗣️ Your turn — repeat after me (not scored)',
      'lesson.correct': 'Correct! 🎯', 'lesson.correct2': 'Correct! 👍', 'lesson.buildPh': 'Tap the words in order…',
      'lesson.clear': '↺ Clear',
      'fin.title': '{name} — complete!', 'fin.accuracy': 'Pronunciation', 'fin.games': 'Games on first try',
      'fin.saved': '📒 {n} phrases saved to your phrasebook for review.', 'fin.unlocked': '🔓 Next stop unlocked!',
      'fin.boss': '👑 Take on the Audio Boss',

      'boss.ai': 'AI character · {lang}', 'boss.replay': 'Play again', 'boss.say': '🎯 Say:', 'boss.hint': '💡 Hint',
      'boss.answer': 'Answer aloud', 'boss.notHeard': "Didn't catch that — try again",
      'boss.moveOn': "Let's move on — the phrase was saved for review 📒",
      'boss.almost': '{s}% — almost! We heard {heard}. Try again ({n} tries left)',
      'boss.noMic': 'No speech recognition in this browser — say it aloud, then pick the answer:',
      'boss.won': 'You beat the Boss!', 'boss.lost': 'So close! One more try', 'boss.score': 'Conversation score:',

      'onb.s1': 'My languages', 'onb.s2': 'What to learn', 'onb.s3': 'Time & reminders', 'onb.s4': 'My plan',
      'onb.go': "🚀 Let's go", 'onb.welcome': 'Welcome to LangQuest!',
      'onb.uiQ': 'Which language should the app use?',
      'onb.knownQ': 'To set the right pace for you — which languages do you already know, and how well?',
      'onb.levelsHelp': 'What does each level mean?', 'onb.targetQ': 'Which language will we learn? 🧭',
      'onb.levelQ': 'What is your {lang} level today?',
      'onb.timeQ': 'How much time per day? ⏱️',
      'onb.timeSub': 'A little every day beats a lot once a week. Your streak 🔥 counts when you reach the daily goal.',
      'onb.whenQ': '⏰ When are you free to practise?', 'onb.planTitle': 'Your {lang} plan',
      'onb.curLevel': 'Current level', 'onb.pace': 'Learning pace',
      'onb.boostRelated': 'Your {known} is close to {lang} — many words and sounds will feel familiar, so we start a little faster.',
      'onb.boostMulti': 'You already speak {known} — you know how to learn a language, so we start at a regular pace.',
      'onb.goal': 'Daily goal', 'onb.rem': 'Reminders', 'onb.open': 'Open stops', 'onb.of': '{a} of {b}',
      'onb.editLater': 'You can change everything anytime in ⚙️ Settings.',
      'onb.lvlPickTitle': 'What is your {lang} level?', 'onb.lvlPickSub': "We'll adjust the pace and narration speed.",

      'rem.modalTitle': '⏰ Study reminders', 'rem.modalSub': 'Pick a fixed time of day when you have a few minutes to practise.',
      'rem.dueToast': '⏰ {t} — time for your daily practice!',
      'rem.dayNames': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      'rem.title': '⏰ Time for your {lang}!', 'rem.bodyStreak': '{m} minutes of practice keep your {n}-day streak 🔥',
      'rem.body': "{m} minutes of listening and speaking — let's go 🗺️", 'rem.summary': '🗺️ LangQuest — {m} min of {lang}',
      'rem.details': 'Your daily practice: {m} minutes of listening, pronunciation and speaking in {lang}.',
      'rem.perm.granted': '✅ System notifications allowed',
      'rem.perm.denied': '🚫 Notifications are blocked — re-allow them in site settings, or use your calendar',
      'rem.perm.default': "🔔 You haven't allowed notifications yet", 'rem.perm.unsupported': "This browser doesn't support notifications — add to your calendar instead",
      'rem.enable': 'Remind me to practise', 'rem.timeQ': 'What time are you free?', 'rem.addTime': '＋ Add a time',
      'rem.daysQ': 'Which days?', 'rem.allow': '🔔 Allow notifications', 'rem.test': '🔔 Test notification',
      'rem.ics': '📅 Add to calendar (.ics)',
      'rem.note': 'Reminders from the app arrive while it is open (even in a background tab). To be reminded when it is closed, add them to your calendar.',
      'rem.oneDay': 'Pick at least one day', 'rem.off': 'Off', 'rem.everyDay': 'Every day'
    },

    ar: {
      'doc.title': 'LangQuest · اللغة المحكية',
      'common.exit': '✕ خروج', 'common.next': 'التالي ←', 'common.finish': 'إنهاء 🏁', 'common.skip': 'تخطٍّ',
      'common.back': '→ رجوع', 'common.continue': 'متابعة ←', 'common.toMap': '🗺️ الخريطة', 'common.backToMap': '→ الخريطة',
      'common.toVault': '📒 دفتر العبارات', 'common.again': '🔁 مرة أخرى', 'common.close': 'إغلاق', 'common.save': 'حفظ',
      'common.remove': 'حذف', 'common.soon': 'قريبًا', 'common.minutes': '{n} دقائق', 'common.normal': '▶️ عادي',
      'common.slow': '🐢 بطيء', 'common.play': '▶️ استمع', 'common.replay': '🔊 أعد التشغيل', 'common.uiLang': 'لغة الواجهة',
      'teach.choose': 'اختاروا معلّمكم',
      'teach.yours': 'معلّمكم',
      'story.start': 'هيا نبدأ! ←',
      'teach.done': 'أحسنتم! الآن لنتدرب على محادثة حقيقية مع الزعيم 👑',
      'story.airport': 'وصلنا للتو إلى {city}! ✈️ المحطة الأولى: مراقبة الجوازات. لنتعلم ماذا نقول للموظف.',
      'story.hotel': 'وصلنا إلى الفندق في {city} 🏨 لنسجّل الدخول ونسأل عن الفطور ونطلب منشفة.',
      'story.restaurant': 'وقت العشاء في {city} 🍽️ نحجز طاولة ونطلب قائمة الطعام وفي النهاية الحساب.',
      'story.shopping': 'يوم تسوق في {city} 🛍️ نسأل عن المقاس والسعر وندفع بالبطاقة.',
      'story.emergency': 'أحيانًا نحتاج إلى المساعدة بسرعة 🚑 لنتعلم كيف نطلب طبيبًا وسيارة إسعاف وصيدلية.',
      'pay.trial': 'تجربة مجانية لمدة {n} أيام',
      'pay.startTrial': 'ابدأوا التجربة المجانية',
      'pay.badge': '⭐ Premium', 'pay.locked': 'محطة Premium', 'pay.title': '⭐ LangQuest Premium',
      'pay.sub': 'افتحوا كل المحطات وكل تحديات الزعيم وكل اللغات.', 'pay.f1': 'كل المحطات الخمس في كل لغة', 'pay.f2': 'كل تحديات Audio Boss',
      'pay.f3': 'لغات جديدة فور صدورها', 'pay.f4': 'ادعموا تطوير التطبيق ❤️', 'pay.free': 'مجانًا: أول {n} محطات في كل لغة، مع تحديات الزعيم الخاصة بها',
      'pay.monthly': 'شهري', 'pay.yearly': 'سنوي', 'pay.lifetime': 'مدى الحياة',
      'pay.perMonth': '/ شهر', 'pay.perYear': '/ سنة', 'pay.once': 'دفعة واحدة',
      'pay.best': 'الأوفر', 'pay.buy': 'شراء', 'pay.restore': 'لديكم مفتاح ترخيص؟',
      'pay.restorePh': 'الصقوا مفتاح الترخيص هنا', 'pay.activate': 'تفعيل', 'pay.demo': 'وضع تجريبي: لم يتم ربط الدفع بعد — الشراء محاكاة ويعمل على الجهاز المحلي فقط.',
      'pay.unavailable': 'الشراء غير متاح بعد — حاولوا مجددًا قريبًا.', 'pay.thanks': '🎉 شكرًا! Premium مفعّل', 'pay.error': 'تعذّر التحقق من الشراء — حاولوا مجددًا أو تواصلوا مع الدعم',
      'pay.status': 'الاشتراك', 'pay.statusFree': 'مجاني', 'pay.until': '{plan} · فعّال حتى {date}',
      'pay.key': 'مفتاح الترخيص (لتفعيل جهاز آخر)', 'pay.copy': 'نسخ', 'pay.copied': 'تم النسخ ✓',
      'pay.upgrade': '⭐ الترقية إلى Premium', 'pay.signOut': 'إزالة الترخيص من هذا الجهاز',
      'pwa.install': 'تثبيت التطبيق', 'pwa.installed': 'تم تثبيت LangQuest 🎉',

      'hdr.lang': 'تغيير اللغة', 'hdr.xp': 'نقاط الخبرة', 'hdr.vault': 'دفتر العبارات', 'hdr.settings': 'الإعدادات',
      'hdr.home': 'العودة إلى الخريطة', 'hdr.streakDone': 'تم تحقيق هدف اليوم! السلسلة: {n} أيام',
      'hdr.streakTip': 'اليوم: {m} / {g} دقائق · السلسلة: {n} أيام',

      'map.dueTitle': 'حان وقت التدريب ({t})!', 'map.dueLeft': 'بقيت {n} دقائق لهدفكم اليومي',
      'map.dueStreak': '— حافظوا على سلسلة {n} أيام 🔥', 'map.review': '🧠 مراجعة',
      'map.title': 'رحلتكم مع {lang}',
      'map.sub': 'لغة محكية للسفر — من 3 إلى 5 دقائق لكل محطة: نستمع، نبطئ، نلعب ونتكلم.',
      'map.accent': 'اللهجة', 'map.testVoice': '🔊 تجربة الصوت', 'map.changeLevel': 'تغيير المستوى',
      'map.levelPill': '{li} المستوى: <b>{level}</b> · الوتيرة {pi} <b>{pace}</b>',
      'map.streakDays': 'سلسلة {n} أيام', 'map.best': 'الأفضل: {n}',
      'map.goalDone': '✅ تم تحقيق هدف اليوم ({g} دقائق)', 'map.goalProgress': 'اليوم: {m} / {g} دقائق تدريب',
      'map.reminders': '⏰ التذكيرات: {s}', 'map.mapTitle': '🗺️ خريطة الرحلة', 'map.stationsCount': '{d}/{n} محطات',
      'map.done': '✅ مكتمل · النطق {n}%', 'map.openMeta': '3 عبارات · ~4 دقائق', 'map.locked': 'أكملوا المحطة السابقة',
      'map.bossBeaten': ' · 👑 هُزم الزعيم', 'map.redo': '🔁 الدرس', 'map.start': '▶️ ابدأ', 'map.bossLocked': 'يُفتح بعد الدرس',
      'map.vaultTitle': '📒 دفتر العبارات', 'map.vaultDue': '{n} عبارات تنتظر المراجعة اليوم',
      'map.vaultEmpty': 'لا مراجعات اليوم — تُحفظ العبارات الصعبة هنا تلقائيًا', 'map.reviewNow': '🧠 راجعوا الآن',
      'map.toVault': 'فتح',
      'voice.noTts': 'هذا المتصفح لا يدعم القراءة الصوتية (TTS)',
      'voice.noVoice': 'لا يوجد صوت {a} على الجهاز — قد يُستخدم صوت افتراضي',

      'vault.title': '📒 دفتر العبارات',
      'vault.desc': 'العبارات التي واجهتم فيها صعوبة تُحفظ هنا تلقائيًا (أو بالضغط على ☆). المراجعات موزعة زمنيًا: 1 → 3 → 7 → 14 → 30 يومًا.',
      'vault.reviewN': '🧠 مراجعة {n} عبارات', 'vault.mastery': 'مستوى الإتقان', 'vault.today': '⏰ اليوم',
      'vault.empty': 'الدفتر فارغ — ابدأوا درسًا واحفظوا العبارات بالضغط على ☆',
      'review.title': '🧠 مراجعة ذكية', 'review.ask': 'كيف نقول هذا؟ قولوه بصوت عالٍ ثم اكشفوا الإجابة.',
      'review.reveal': '👀 اكشف واستمع', 'review.knew': '✅ عرفتها', 'review.doneTitle': 'أنهيتم مراجعة اليوم!',
      'review.none': 'لا مراجعات اليوم', 'review.knewLabel': 'عرفتم',

      'langs.title': 'بأي لغة سنتكلم؟', 'langs.isUi': 'لغة الواجهة',

      'set.title': '⚙️ الإعدادات', 'set.levelIn': 'المستوى في {lang}', 'set.goal': 'الهدف اليومي', 'set.changeLevel': '🎚️ تغيير المستوى',
      'set.reminders': '⏰ التذكيرات ({s})', 'set.profile': '👤 تعديل ملف اللغات', 'set.voiceTitle': '🔊 الصوت والنطق',
      'set.accent': 'اللهجة ({lang})', 'set.voice': 'الراوي', 'set.noVoices': 'لا توجد أصوات لهذه اللهجة على الجهاز',
      'set.voiceHint': 'الأصوات الموسومة Natural / Neural / Online هي الأكثر طبيعية.',
      'set.slow': 'سرعة وضع السلحفاة 🐢:', 'set.translit': 'إظهار النطق بالحروف العربية',
      'set.test': '🔊 تجربة', 'set.testSlow': '🐢 تجربة بطيئة',
      'set.micYes': '🎙️ التعرف على الكلام متاح في هذا المتصفح.', 'set.micNo': '🎙️ التعرف على الكلام غير متاح هنا — جرّبوا Chrome أو Edge.',
      'set.reset': 'إعادة ضبط كل التقدم', 'set.resetConfirm': 'إعادة ضبط كل التقدم والسلسلة ودفتر العبارات؟',
      'set.levelToast': '{icon} وتيرة {pace} — {level}',
      'streak.reached': '🔥 تحقق هدف {n} دقائق اليومي! السلسلة مستمرة (+20 XP)',

      'ui.stressed': 'المقطع المنبور',
      'mic.notAllowed': 'يجب السماح بالوصول إلى الميكروفون في المتصفح 🎙️', 'mic.noSpeech': 'لم نسمع شيئًا — حاولوا مجددًا بالقرب من الميكروفون',
      'mic.noCapture': 'لم يُعثر على ميكروفون في الجهاز', 'mic.network': 'التعرف على الكلام يحتاج إلى اتصال بالإنترنت',
      'mic.aborted': 'أُلغي التسجيل', 'mic.generic': 'حدث خطأ — حاولوا مجددًا',
      'score.great': 'ممتاز! تبدون كأحد السكان المحليين 🌟', 'score.good': 'جيد جدًا! شبه مثالي 👏',
      'score.mid': 'تقتربون — استمعوا إلى الكلمات الحمراء وحاولوا مجددًا', 'score.low': 'لنحاول مرة أخرى، ببطء ووضوح 🐢',
      'vc.speak': 'تكلّموا الآن', 'vc.listening': 'نستمع…', 'vc.sayNow': 'قولوا الجملة الآن…', 'vc.retry': 'حاولوا مجددًا',
      'vc.heard': 'سمعنا:', 'vc.tapRed': 'اضغطوا على كلمة حمراء لسماعها ببطء',
      'vc.noRec': 'هذا المتصفح لا يدعم التعرف على الكلام (جرّبوا Chrome أو Edge). قولوا الجملة بصوت عالٍ وقيّموا أنفسكم:',
      'vc.selfOk': '✅ قلتها بشكل صحيح', 'vc.selfBad': '🔁 أحتاج إلى مزيد من التدريب',

      'step.listen': 'الاستماع والتعرف', 'step.listen.hint': 'استمعوا إلى الجملة بسرعة طبيعية وتابعوا الكلمة المضيئة. اضغطوا على كلمة لمعرفة معناها.',
      'step.slow': 'تدريب بطيء', 'step.slow.hint': 'الجملة نفسها — ببطء. استمعوا كلمة بكلمة وكرروا بصوت عالٍ.',
      'step.game': 'لعبة تقوية',
      'step.voice': 'محاكاة الكلام', 'step.voice.hint': 'قولوا الجملة في الميكروفون — الأخضر = صحيح، الأحمر = يحتاج إلى تحسين.',
      'game.pic': 'صوت ← صورة', 'game.pic.hint': 'استمعوا واختاروا الصورة المناسبة للجملة.',
      'game.gap': 'أكملوا الفراغ', 'game.gap.hint': 'استمعوا واختاروا الكلمة الناقصة.',
      'game.build': 'رتّبوا الجملة', 'game.build.hint': 'استمعوا واضغطوا على الكلمات بالترتيب.',
      'lesson.skipStep': '⏭️ الانتقال إلى اللعبة', 'lesson.star': 'حفظ في دفتر العبارات',
      'lesson.starOn': 'حُفظت في دفتر العبارات ⭐', 'lesson.starOff': 'أُزيلت من دفتر العبارات',
      'lesson.playNatural': '▶️ تشغيل بسرعة طبيعية', 'lesson.hard': '🔍 أصوات صعبة', 'lesson.playSlow': '🐢 تشغيل بطيء ({n}%)',
      'lesson.wordByWord': '🧩 كلمة بكلمة', 'lesson.breakdown': 'تحليل صوتي — اضغطوا على كلمة لسماعها ببطء',
      'lesson.echo': '🗣️ دوركم الآن — كرروا بعدي (بدون تقييم)',
      'lesson.correct': 'صحيح! 🎯', 'lesson.correct2': 'صحيح! 👍', 'lesson.buildPh': 'اضغطوا على الكلمات بالترتيب…',
      'lesson.clear': '↺ مسح',
      'fin.title': 'محطة {name} — اكتملت!', 'fin.accuracy': 'دقة النطق', 'fin.games': 'ألعاب من المحاولة الأولى',
      'fin.saved': '📒 حُفظت {n} عبارات في الدفتر للمراجعة.', 'fin.unlocked': '🔓 فُتحت المحطة التالية!',
      'fin.boss': '👑 إلى تحدي Audio Boss',

      'boss.ai': 'شخصية ذكاء اصطناعي · {lang}', 'boss.replay': 'أعد التشغيل', 'boss.say': '🎯 قولوا:', 'boss.hint': '💡 تلميح',
      'boss.answer': 'أجيبوا بصوتكم', 'boss.notHeard': 'لم نسمع جيدًا — حاولوا مجددًا',
      'boss.moveOn': 'لننتقل — حُفظت العبارة للمراجعة 📒',
      'boss.almost': '{s}% — اقتربتم! سمعنا {heard}. حاولوا مجددًا (تبقّت {n} محاولات)',
      'boss.noMic': 'لا يوجد تعرف على الكلام في هذا المتصفح — قولوها بصوت عالٍ ثم اختاروا الإجابة:',
      'boss.won': 'هزمتم الزعيم!', 'boss.lost': 'اقتربتم! محاولة أخرى', 'boss.score': 'نتيجة المحادثة:',

      'onb.s1': 'لغاتي', 'onb.s2': 'ماذا نتعلم', 'onb.s3': 'الوقت والتذكيرات', 'onb.s4': 'خطتي',
      'onb.go': '🚀 لننطلق', 'onb.welcome': 'أهلًا بكم في LangQuest!',
      'onb.uiQ': 'بأي لغة نعرض التطبيق؟',
      'onb.knownQ': 'لنضبط الوتيرة المناسبة لكم — ما اللغات التي تعرفونها، وبأي مستوى؟',
      'onb.levelsHelp': 'ماذا يعني كل مستوى؟', 'onb.targetQ': 'أي لغة سنتعلم؟ 🧭', 'onb.levelQ': 'ما مستواكم في {lang} اليوم؟',
      'onb.timeQ': 'كم من الوقت يوميًا؟ ⏱️',
      'onb.timeSub': 'القليل كل يوم أفضل من الكثير مرة في الأسبوع. تُحتسب السلسلة 🔥 عند بلوغ الهدف اليومي.',
      'onb.whenQ': '⏰ متى تكونون متفرغين للتعلم؟', 'onb.planTitle': 'خطتكم لتعلّم {lang}',
      'onb.curLevel': 'المستوى الحالي', 'onb.pace': 'وتيرة التعلم',
      'onb.boostRelated': '{known} قريبة من {lang} — ستبدو كلمات وأصوات كثيرة مألوفة، لذا نبدأ أسرع قليلًا.',
      'onb.boostMulti': 'أنتم تتحدثون {known} بالفعل — لديكم خبرة في تعلم اللغات، لذا نبدأ بوتيرة عادية.',
      'onb.goal': 'الهدف اليومي', 'onb.rem': 'التذكيرات', 'onb.open': 'المحطات المفتوحة', 'onb.of': '{a} من {b}',
      'onb.editLater': 'يمكن تغيير كل شيء في أي وقت من ⚙️ الإعدادات.',
      'onb.lvlPickTitle': 'ما مستواكم في {lang}؟', 'onb.lvlPickSub': 'سنضبط الوتيرة وسرعة القراءة.',

      'rem.modalTitle': '⏰ تذكيرات التعلم', 'rem.modalSub': 'اختاروا وقتًا ثابتًا في اليوم تكونون فيه متفرغين لبضع دقائق من التدريب.',
      'rem.dueToast': '⏰ {t} — حان وقت التدريب اليومي!',
      'rem.dayNames': ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
      'rem.title': '⏰ حان وقت تعلّم {lang}!', 'rem.bodyStreak': '{m} دقائق من التدريب تحافظ على سلسلة {n} أيام 🔥',
      'rem.body': '{m} دقائق من الاستماع والتحدث — لنبدأ 🗺️', 'rem.summary': '🗺️ LangQuest — {m} دقائق · {lang}',
      'rem.details': 'تدريبكم اليومي على {lang}: {m} دقائق من الاستماع والنطق والتحدث.',
      'rem.perm.granted': '✅ إشعارات النظام مسموحة',
      'rem.perm.denied': '🚫 الإشعارات محظورة في المتصفح — يمكن السماح بها من إعدادات الموقع أو استخدام التقويم',
      'rem.perm.default': '🔔 لم تسمحوا بالإشعارات بعد', 'rem.perm.unsupported': 'المتصفح لا يدعم الإشعارات — أضيفوا التذكير إلى التقويم',
      'rem.enable': 'ذكّرني بالتدريب', 'rem.timeQ': 'في أي ساعة تكونون متفرغين؟', 'rem.addTime': '＋ وقت إضافي',
      'rem.daysQ': 'في أي أيام؟', 'rem.allow': '🔔 السماح بالإشعارات', 'rem.test': '🔔 إشعار تجريبي',
      'rem.ics': '📅 إضافة إلى التقويم (.ics)',
      'rem.note': 'تصل التذكيرات أثناء فتح التطبيق (حتى في علامة تبويب في الخلفية). لتلقيها عندما يكون مغلقًا، أضيفوها إلى التقويم.',
      'rem.oneDay': 'اختاروا يومًا واحدًا على الأقل', 'rem.off': 'متوقفة', 'rem.everyDay': 'كل يوم'
    },

    ru: {
      'doc.title': 'LangQuest · Разговорный язык',
      'common.exit': '✕ Выход', 'common.next': 'Далее →', 'common.finish': 'Готово 🏁', 'common.skip': 'Пропустить',
      'common.back': '← Назад', 'common.continue': 'Продолжить →', 'common.toMap': '🗺️ Карта', 'common.backToMap': '← Карта',
      'common.toVault': '📒 Разговорник', 'common.again': '🔁 Ещё раз', 'common.close': 'Закрыть', 'common.save': 'Сохранить',
      'common.remove': 'Удалить', 'common.soon': 'Скоро', 'common.minutes': '{n} мин', 'common.normal': '▶️ Обычно',
      'common.slow': '🐢 Медленно', 'common.play': '▶️ Слушать', 'common.replay': '🔊 Ещё раз', 'common.uiLang': 'Язык интерфейса',
      'teach.choose': 'Выберите преподавателя',
      'teach.yours': 'Ваш преподаватель',
      'story.start': 'Поехали! →',
      'teach.done': 'Отлично! Теперь потренируемся в настоящем диалоге с Боссом 👑',
      'story.airport': 'Мы только что прилетели — {city}! ✈️ Первая остановка: паспортный контроль. Учимся, что сказать офицеру.',
      'story.hotel': 'Мы в отеле — {city} 🏨 Заселяемся, узнаём про завтрак и просим полотенце.',
      'story.restaurant': 'Ужин — {city} 🍽️ Берём столик, просим меню, а в конце — счёт.',
      'story.shopping': 'День покупок — {city} 🛍️ Спрашиваем размер, цену и платим картой.',
      'story.emergency': 'Иногда помощь нужна срочно 🚑 Учимся звать врача, скорую и искать аптеку.',
      'pay.trial': '{n} дня бесплатно',
      'pay.startTrial': 'Начать бесплатный период',
      'pay.badge': '⭐ Premium', 'pay.locked': 'Остановка Premium', 'pay.title': '⭐ LangQuest Premium',
      'pay.sub': 'Откройте все остановки, все битвы с Боссом и все языки.', 'pay.f1': 'Все 5 остановок в каждом языке', 'pay.f2': 'Все битвы Audio Boss',
      'pay.f3': 'Новые языки сразу после выхода', 'pay.f4': 'Поддержите развитие приложения ❤️', 'pay.free': 'Бесплатно: первые {n} остановки каждого языка, включая Боссов',
      'pay.monthly': 'Месяц', 'pay.yearly': 'Год', 'pay.lifetime': 'Навсегда',
      'pay.perMonth': '/ мес.', 'pay.perYear': '/ год', 'pay.once': 'разовый платёж',
      'pay.best': 'Выгоднее всего', 'pay.buy': 'Купить', 'pay.restore': 'Есть лицензионный ключ?',
      'pay.restorePh': 'Вставьте лицензионный ключ', 'pay.activate': 'Активировать', 'pay.demo': 'Демо-режим: оплата ещё не подключена — покупка имитируется и работает только на локальном компьютере.',
      'pay.unavailable': 'Покупка пока недоступна — попробуйте позже.', 'pay.thanks': '🎉 Спасибо! Premium активен', 'pay.error': 'Не удалось подтвердить покупку — попробуйте ещё раз или напишите в поддержку',
      'pay.status': 'Подписка', 'pay.statusFree': 'Бесплатно', 'pay.until': '{plan} · активна до {date}',
      'pay.key': 'Лицензионный ключ (для другого устройства)', 'pay.copy': 'Копировать', 'pay.copied': 'Скопировано ✓',
      'pay.upgrade': '⭐ Перейти на Premium', 'pay.signOut': 'Удалить лицензию с этого устройства',
      'pwa.install': 'Установить приложение', 'pwa.installed': 'LangQuest установлено 🎉',

      'hdr.lang': 'Сменить язык', 'hdr.xp': 'Очки опыта', 'hdr.vault': 'Разговорник', 'hdr.settings': 'Настройки',
      'hdr.home': 'На карту', 'hdr.streakDone': 'Цель на сегодня выполнена! Серия: {n} дн.',
      'hdr.streakTip': 'Сегодня: {m} / {g} мин · серия: {n} дн.',

      'map.dueTitle': 'Время практики — {t}!', 'map.dueLeft': 'Ещё {n} мин до дневной цели',
      'map.dueStreak': '— сохраните серию в {n} дн. 🔥', 'map.review': '🧠 Повторение',
      'map.title': 'Ваше путешествие: {lang}',
      'map.sub': 'Разговорный язык для поездок — 3–5 минут на остановку: слушаем, замедляем, играем и говорим.',
      'map.accent': 'Акцент', 'map.testVoice': '🔊 Проверить голос', 'map.changeLevel': 'Изменить уровень',
      'map.levelPill': '{li} Уровень: <b>{level}</b> · темп {pi} <b>{pace}</b>',
      'map.streakDays': 'Серия: {n} дн.', 'map.best': 'Рекорд: {n}',
      'map.goalDone': '✅ Цель {g} мин на сегодня выполнена', 'map.goalProgress': 'Сегодня: {m} / {g} мин практики',
      'map.reminders': '⏰ Напоминания: {s}', 'map.mapTitle': '🗺️ Карта путешествия', 'map.stationsCount': 'Остановки: {d}/{n}',
      'map.done': '✅ Пройдено · произношение {n}%', 'map.openMeta': '3 фразы · ~4 мин', 'map.locked': 'Пройдите предыдущую остановку',
      'map.bossBeaten': ' · 👑 Босс побеждён', 'map.redo': '🔁 Урок', 'map.start': '▶️ Начать', 'map.bossLocked': 'Откроется после урока',
      'map.vaultTitle': '📒 Разговорник', 'map.vaultDue': 'Фраз ждут повторения сегодня: {n}',
      'map.vaultEmpty': 'Сегодня повторять нечего — сложные фразы сохраняются здесь автоматически', 'map.reviewNow': '🧠 Повторить сейчас',
      'map.toVault': 'Открыть',
      'voice.noTts': 'Этот браузер не поддерживает озвучивание текста',
      'voice.noVoice': 'На устройстве нет голоса {a} — может прозвучать голос по умолчанию',

      'vault.title': '📒 Разговорник',
      'vault.desc': 'Фразы, которые давались с трудом, сохраняются здесь автоматически (или нажмите ☆). Повторения распределены во времени: 1 → 3 → 7 → 14 → 30 дней.',
      'vault.reviewN': '🧠 Повторить фразы ({n})', 'vault.mastery': 'Уровень освоения', 'vault.today': '⏰ Сегодня',
      'vault.empty': 'Разговорник пуст — начните урок и сохраняйте фразы кнопкой ☆',
      'review.title': '🧠 Умное повторение', 'review.ask': 'Как это сказать? Произнесите вслух, затем откройте ответ.',
      'review.reveal': '👀 Показать и прослушать', 'review.knew': '✅ Я знал(а)', 'review.doneTitle': 'Повторение на сегодня завершено!',
      'review.none': 'Сегодня повторять нечего', 'review.knewLabel': 'знали',

      'langs.title': 'На каком языке будем говорить?', 'langs.isUi': 'Язык интерфейса',

      'set.title': '⚙️ Настройки', 'set.levelIn': 'Уровень: {lang}', 'set.goal': 'Дневная цель', 'set.changeLevel': '🎚️ Изменить уровень',
      'set.reminders': '⏰ Напоминания ({s})', 'set.profile': '👤 Изменить языковой профиль', 'set.voiceTitle': '🔊 Голос и произношение',
      'set.accent': 'Акцент ({lang})', 'set.voice': 'Диктор', 'set.noVoices': 'На устройстве нет голосов для этого акцента',
      'set.voiceHint': 'Голоса с пометкой Natural / Neural / Online звучат естественнее всего.',
      'set.slow': 'Скорость режима черепахи 🐢:', 'set.translit': 'Показывать транскрипцию кириллицей',
      'set.test': '🔊 Проверка', 'set.testSlow': '🐢 Медленная проверка',
      'set.micYes': '🎙️ Распознавание речи доступно в этом браузере.', 'set.micNo': '🎙️ Распознавание речи недоступно — попробуйте Chrome или Edge.',
      'set.reset': 'Сбросить весь прогресс', 'set.resetConfirm': 'Сбросить весь прогресс, серию и разговорник?',
      'set.levelToast': '{icon} Темп «{pace}» — {level}',
      'streak.reached': '🔥 Дневная цель {n} мин выполнена! Серия продолжается (+20 XP)',

      'ui.stressed': 'Ударный слог',
      'mic.notAllowed': 'Разрешите доступ к микрофону в браузере 🎙️', 'mic.noSpeech': 'Мы ничего не услышали — попробуйте ещё раз, ближе к микрофону',
      'mic.noCapture': 'Микрофон не найден', 'mic.network': 'Для распознавания речи нужен интернет',
      'mic.aborted': 'Запись отменена', 'mic.generic': 'Что-то пошло не так — попробуйте ещё раз',
      'score.great': 'Отлично! Звучит как у местного 🌟', 'score.good': 'Очень хорошо! Почти идеально 👏',
      'score.mid': 'Уже близко — послушайте красные слова и попробуйте снова', 'score.low': 'Попробуем ещё раз, медленно и чётко 🐢',
      'vc.speak': 'Говорите', 'vc.listening': 'Слушаем…', 'vc.sayNow': 'Произнесите фразу…', 'vc.retry': 'Ещё раз',
      'vc.heard': 'Мы услышали:', 'vc.tapRed': 'Нажмите на красное слово, чтобы услышать его медленно',
      'vc.noRec': 'Этот браузер не поддерживает распознавание речи (попробуйте Chrome или Edge). Произнесите фразу вслух и оцените себя:',
      'vc.selfOk': '✅ Сказал(а) правильно', 'vc.selfBad': '🔁 Нужно ещё потренироваться',

      'step.listen': 'Слушаем', 'step.listen.hint': 'Послушайте фразу в естественном темпе и следите за подсвеченным словом. Нажмите на слово, чтобы узнать значение.',
      'step.slow': 'Медленная практика', 'step.slow.hint': 'Та же фраза — медленно. Слушайте слово за словом и повторяйте вслух.',
      'step.game': 'Игра',
      'step.voice': 'Проверка речи', 'step.voice.hint': 'Скажите фразу в микрофон — зелёный = верно, красный = нужно улучшить.',
      'game.pic': 'Звук → картинка', 'game.pic.hint': 'Послушайте и выберите подходящую картинку.',
      'game.gap': 'Заполните пропуск', 'game.gap.hint': 'Послушайте и выберите пропущенное слово.',
      'game.build': 'Соберите фразу', 'game.build.hint': 'Послушайте и нажимайте на слова по порядку.',
      'lesson.skipStep': '⏭️ Перейти к игре', 'lesson.star': 'Сохранить в разговорник',
      'lesson.starOn': 'Сохранено в разговорник ⭐', 'lesson.starOff': 'Удалено из разговорника',
      'lesson.playNatural': '▶️ В естественном темпе', 'lesson.hard': '🔍 Сложные звуки', 'lesson.playSlow': '🐢 Медленно ({n}%)',
      'lesson.wordByWord': '🧩 Слово за словом', 'lesson.breakdown': 'Фонетический разбор — нажмите на слово, чтобы услышать его медленно',
      'lesson.echo': '🗣️ Ваша очередь — повторяйте за мной (без оценки)',
      'lesson.correct': 'Верно! 🎯', 'lesson.correct2': 'Верно! 👍', 'lesson.buildPh': 'Нажимайте на слова по порядку…',
      'lesson.clear': '↺ Очистить',
      'fin.title': '{name} — пройдено!', 'fin.accuracy': 'Произношение', 'fin.games': 'Игры с первой попытки',
      'fin.saved': '📒 Фраз сохранено в разговорник: {n}.', 'fin.unlocked': '🔓 Следующая остановка открыта!',
      'fin.boss': '👑 Сразиться с Audio Boss',

      'boss.ai': 'ИИ-персонаж · {lang}', 'boss.replay': 'Ещё раз', 'boss.say': '🎯 Скажите:', 'boss.hint': '💡 Подсказка',
      'boss.answer': 'Ответить голосом', 'boss.notHeard': 'Не расслышали — попробуйте ещё раз',
      'boss.moveOn': 'Идём дальше — фраза сохранена для повторения 📒',
      'boss.almost': '{s}% — почти! Мы услышали {heard}. Ещё раз (осталось попыток: {n})',
      'boss.noMic': 'В этом браузере нет распознавания речи — скажите вслух и выберите ответ:',
      'boss.won': 'Вы победили Босса!', 'boss.lost': 'Почти! Ещё одна попытка', 'boss.score': 'Оценка диалога:',

      'onb.s1': 'Мои языки', 'onb.s2': 'Что учим', 'onb.s3': 'Время и напоминания', 'onb.s4': 'Мой план',
      'onb.go': '🚀 В путь', 'onb.welcome': 'Добро пожаловать в LangQuest!',
      'onb.uiQ': 'На каком языке показывать приложение?',
      'onb.knownQ': 'Чтобы подобрать темп — какие языки вы уже знаете и насколько хорошо?',
      'onb.levelsHelp': 'Что означает каждый уровень?', 'onb.targetQ': 'Какой язык будем учить? 🧭',
      'onb.levelQ': 'Какой у вас сейчас уровень: {lang}?',
      'onb.timeQ': 'Сколько времени в день? ⏱️',
      'onb.timeSub': 'Лучше понемногу каждый день, чем много раз в неделю. Серия 🔥 засчитывается, когда вы достигаете дневной цели.',
      'onb.whenQ': '⏰ Когда вам удобно заниматься?', 'onb.planTitle': 'Ваш план: {lang}',
      'onb.curLevel': 'Текущий уровень', 'onb.pace': 'Темп обучения',
      'onb.boostRelated': 'Язык «{known}» близок к языку «{lang}» — многие слова и звуки покажутся знакомыми, поэтому начнём чуть быстрее.',
      'onb.boostMulti': 'Вы уже говорите на языке «{known}» — у вас есть опыт изучения языков, поэтому начнём в обычном темпе.',
      'onb.goal': 'Дневная цель', 'onb.rem': 'Напоминания', 'onb.open': 'Открытые остановки', 'onb.of': '{a} из {b}',
      'onb.editLater': 'Всё можно изменить в любой момент в ⚙️ Настройках.',
      'onb.lvlPickTitle': 'Какой у вас уровень: {lang}?', 'onb.lvlPickSub': 'Подстроим темп и скорость озвучивания.',

      'rem.modalTitle': '⏰ Напоминания о занятиях', 'rem.modalSub': 'Выберите постоянное время, когда у вас есть несколько минут на практику.',
      'rem.dueToast': '⏰ {t} — время ежедневной практики!',
      'rem.dayNames': ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      'rem.title': '⏰ Время для языка: {lang}!', 'rem.bodyStreak': '{m} мин практики сохранят серию в {n} дн. 🔥',
      'rem.body': '{m} мин слушания и разговора — начнём 🗺️', 'rem.summary': '🗺️ LangQuest — {m} мин · {lang}',
      'rem.details': 'Ваша ежедневная практика ({lang}): {m} мин слушания, произношения и разговора.',
      'rem.perm.granted': '✅ Системные уведомления разрешены',
      'rem.perm.denied': '🚫 Уведомления заблокированы — разрешите их в настройках сайта или используйте календарь',
      'rem.perm.default': '🔔 Вы ещё не разрешили уведомления', 'rem.perm.unsupported': 'Браузер не поддерживает уведомления — добавьте напоминание в календарь',
      'rem.enable': 'Напоминать мне заниматься', 'rem.timeQ': 'В какое время вы свободны?', 'rem.addTime': '＋ Добавить время',
      'rem.daysQ': 'В какие дни?', 'rem.allow': '🔔 Разрешить уведомления', 'rem.test': '🔔 Тестовое уведомление',
      'rem.ics': '📅 Добавить в календарь (.ics)',
      'rem.note': 'Напоминания приходят, пока приложение открыто (даже в фоновой вкладке). Чтобы получать их, когда оно закрыто, добавьте их в календарь.',
      'rem.oneDay': 'Выберите хотя бы один день', 'rem.off': 'Выключены', 'rem.everyDay': 'Каждый день'
    }
  };

  function detect() {
    const prefs = navigator.languages || [navigator.language || 'he'];
    for (const l of prefs) {
      const code = l.toLowerCase().split('-')[0];
      if (code === 'iw' || code === 'he') return 'he';
      if (STR[code]) return code;
    }
    return 'he';
  }

  function ui() {
    const u = LQStore.getSettings().ui;
    return STR[u] ? u : detect();
  }

  function t(key, vars) {
    let s = STR[ui()][key];
    if (s == null) s = STR.he[key];
    if (s == null) return key;
    if (vars && typeof s === 'string') s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return s;
  }

  /** Localised content field: obj[field_<ui>] with obj[field] (Hebrew) as fallback. */
  function f(obj, field) {
    const u = ui();
    if (u !== 'he' && obj[field + '_' + u] != null) return obj[field + '_' + u];
    return obj[field];
  }

  /** Translation of a phrase / NPC line into the base language. */
  function tr(item) {
    const u = ui();
    return (item.tr && (item.tr[u] || item.tr.he)) || '';
  }

  /** Syllables of a word written in the learner's own script (Hebrew niqqud, Arabic, Cyrillic, respelling). */
  function translit(word) {
    const u = ui();
    const tl = u === 'he' ? word.he : word['tl_' + u];
    return tl && tl.length && tl[0] ? tl : null;
  }

  function showTranslit() {
    return LQStore.getSettings().translit;
  }

  function apply() {
    const u = ui();
    document.documentElement.lang = u;
    document.documentElement.dir = UI_LANGS[u].dir;
    document.title = t('doc.title');
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  }

  function setUi(code) {
    LQStore.setSetting('ui', code);
    apply();
  }

  window.LQI18n = { UI_LANGS, t, f, tr, ui, setUi, apply, showTranslit, translit, detect };
  apply();
})();
