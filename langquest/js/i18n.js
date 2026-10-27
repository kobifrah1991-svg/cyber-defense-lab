/* LangQuest — interface language (base language)
 *  - UI strings per base language, `{name}` placeholders
 *  - Hebrew is the default; the browser language picks another supported base language
 *  - Content fields localise via `field_<lang>` (e.g. name_en) with Hebrew as the fallback
 *  - Adding a base language: add it to UI_LANGS + STR, and `_xx` fields / translations in data.js
 */
(function () {
  const UI_LANGS = {
    he: { name: 'עברית', flag: '🇮🇱', dir: 'rtl' },
    en: { name: 'English', flag: '🇬🇧', dir: 'ltr' }
  };

  const STR = {
    he: {
      'doc.title': 'LangQuest · שפה מדוברת',
      'common.exit': '✕ יציאה', 'common.next': 'הבא ←', 'common.finish': 'סיום 🏁', 'common.skip': 'דלג',
      'common.back': '→ חזרה', 'common.continue': 'המשך ←', 'common.toMap': '🗺️ למפה', 'common.backToMap': '→ למפה',
      'common.toVault': '📒 לאוסף', 'common.again': '🔁 שוב', 'common.close': 'סגירה', 'common.save': 'שמירה',
      'common.remove': 'הסרה', 'common.soon': 'בקרוב', 'common.minutes': '{n} דקות', 'common.normal': '▶️ רגיל',
      'common.slow': '🐢 איטי', 'common.play': '▶️ שמע', 'common.replay': '🔊 השמע שוב', 'common.uiLang': 'שפת הממשק',

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
      'set.slow': 'Turtle mode speed 🐢:', 'set.translit': 'Show Hebrew transliteration',
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

  /** Hebrew niqqud transliteration only makes sense for a Hebrew base language. */
  function showTranslit() {
    return ui() === 'he' && LQStore.getSettings().translit;
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

  window.LQI18n = { UI_LANGS, t, f, tr, ui, setUi, apply, showTranslit, detect };
  apply();
})();
