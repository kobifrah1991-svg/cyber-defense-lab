/* TedraLingo website — language, prices and links
 * Text per interface language; prices and checkout come from ../js/commerce.js (single source of truth).
 */
(function () {
  const LANGS = {
    he: { name: 'עברית', dir: 'rtl', locale: 'he-IL' },
    en: { name: 'English', dir: 'ltr', locale: 'en-US' },
    ar: { name: 'العربية', dir: 'rtl', locale: 'ar' },
    ru: { name: 'Русский', dir: 'ltr', locale: 'ru-RU' }
  };

  const T = {
    he: {
      title: 'TedraLingo · מדברים שפה חדשה כבר מהשיעור הראשון',
      nav_features: 'יכולות', nav_how: 'איך זה עובד', nav_teachers: 'המורים', nav_pricing: 'מחירים', nav_faq: 'שאלות',
      nav_family: "מוצרים נוספים", family_title: "עוד מ-Scitedra Labs", family_sub: "TedraLingo היא חלק ממשפחת המוצרים של סקיטדרה מעבדות — לומדים טכנולוגיה ושפות דרך עשייה.", family_all: "לכל המוצרים של Scitedra Labs", family_more: "לפרטים",
      open_app: 'פתחו את הלומדה',
      hero_title: 'מדברים שפה חדשה — כבר מהשיעור הראשון',
      hero_sub: 'שיעורים של 3–5 דקות לשפה מדוברת לחו״ל: שומעים מורה אמיתי, מאטים, משחקים ומדברים — והלומדה בודקת לכם את ההגייה, מילה אחר מילה.',
      cta_free: 'התחילו בחינם', cta_android: 'הורידו לאנדרואיד', android_soon: 'אנדרואיד — בקרוב',
      proof: ['3–5 דקות ביום', 'בדיקת הגייה חיה', 'תעתיק בשפה שלכם', 'עובד גם בלי אינטרנט'],
      feat_title: 'כל מה שצריך כדי באמת לדבר',
      feats: [
        ['🎤', 'מקראה עוקבת', 'כל מילה נדלקת בדיוק כשהמורה אומר אותה. לחיצה על מילה — שומעים אותה לאט ומקבלים פירוש.'],
        ['🐢', 'מצב צב', 'הקראה ב־50%–70% מהמהירות, בלי לעוות את הקול — עד שכל צליל יושב.'],
        ['🔤', 'פירוק להברות ותעתיק', 'כל מילה מפורקת להברות, עם ההברה המוטעמת ותעתיק באותיות שלכם: עברית מנוקדת, ערבית או קירילית.'],
        ['🎙️', 'בדיקת דיבור חיה', 'אומרים את המשפט למיקרופון — ירוק למה שנאמר נכון, אדום למה שצריך לשפר, וציון דיוק.'],
        ['👑', 'Audio Boss', 'בסוף כל תחנה — שיחה קולית אמיתית עם דמות: פקיד גבולות, מלצר, מוכרת.'],
        ['📘', 'משפה מדוברת לשפה מלאה', 'שלב 2 (Premium): קורס דקדוק יסודי בכל שפה — הסבר בעברית, טבלאות צורות, דוגמאות קוליות ותרגול.'],
        ['🧠', 'חזרה חכמה', 'ביטויים קשים נשמרים אוטומטית וחוזרים בדיוק כשעומדים לשכוח אותם.']
      ],
      how_title: 'שיעור אחד, ארבעה צעדים, חמש דקות',
      how: [['👂', 'שומעים', 'בקצב טבעי עם הקראה עוקבת'], ['🐢', 'מאטים', 'מילה אחר מילה, הברה אחר הברה'], ['🎮', 'משחקים', 'צליל לתמונה, השלמה, הרכבת משפט'], ['🎙️', 'מדברים', 'בדיקת הגייה חיה וציון']],
      shots_title: 'ככה זה נראה',
      shots: ['מפת המסע', 'שיעור עם תעתיק', 'בדיקת הגייה'],
      teach_title: 'מורים שמרגישים כמו חברים מחו״ל',
      teach_sub: 'בוחרים מורה — ובוחרים מבטא: אמריקאי או בריטי, ספרדית מספרד או ממקסיקו, ואיטלקית עם Giulia מרומא.',
      langs_title: 'שפות', langs_learn: 'ללמוד', langs_more: 'ועוד:', langs_ui: 'שפת הלומדה', soon: 'בקרוב',
      price_title: 'מתחילים בחינם, ממשיכים עם Premium',
      plan_free: 'חינם', plan_free_desc: 'שלוש התחנות הראשונות בכל שפה, כולל ה-Boss, אוסף ביטויים ותזכורות',
      plan_monthly: 'חודשי', plan_yearly: 'שנתי', plan_lifetime: 'לכל החיים',
      per_month: 'לחודש', per_year: 'לשנה', once: 'תשלום חד־פעמי', best: 'הכי משתלם',
      trial: '{n} ימי ניסיון חינם', choose: 'בחירה', start_free: 'התחילו בחינם',
      prem_includes: 'כל התחנות · כל ה-Boss · שפות חדשות',
      faq_title: 'שאלות נפוצות',
      faq: [
        ['צריך לדעת לקרוא את השפה?', 'לא. לכל מילה יש תעתיק באותיות שלכם, פירוק להברות וסימון ההברה המוטעמת.'],
        ['איך עובדת בדיקת ההגייה?', 'הלומדה מקשיבה למשפט שאמרתם, משווה מילה אחר מילה וצובעת בירוק או באדום. בכרום, באדג׳ ובאפליקציית האנדרואיד.'],
        ['אפשר ללמוד גם בלי אינטרנט?', 'כן. אחרי הפתיחה הראשונה הלומדה נשמרת במכשיר. בדיקת הדיבור דורשת חיבור.'],
        ['איך מבטלים מנוי?', 'בכל רגע, בלחיצה אחת דרך הקישור שבקבלה — ותקופת הניסיון לא מחויבת אם מבטלים לפני סופה.'],
        ['על אילו מכשירים זה עובד?', 'בכל דפדפן מודרני — טלפון, טאבלט ומחשב — וכאפליקציית אנדרואיד. אפשר גם להתקין מהדפדפן כאפליקציה.']
      ],
      final_title: 'חמש דקות ביום. שפה חדשה בחופשה הבאה.',
      footer_privacy: 'פרטיות', footer_terms: 'תנאי שימוש', footer_contact: 'צור קשר'
    },
    en: {
      title: 'TedraLingo · Speak a new language from your first lesson',
      nav_features: 'Features', nav_how: 'How it works', nav_teachers: 'Teachers', nav_pricing: 'Pricing', nav_faq: 'FAQ',
      nav_family: "More products", family_title: "More from Scitedra Labs", family_sub: "TedraLingo is part of the Scitedra Labs family — learn technology and languages by doing.", family_all: "All Scitedra Labs products", family_more: "Learn more",
      open_app: 'Open the app',
      hero_title: 'Speak a new language — from your very first lesson',
      hero_sub: '3–5 minute lessons in the language you need abroad: hear a real teacher, slow it down, play, and speak — and get your pronunciation checked word by word.',
      cta_free: 'Start free', cta_android: 'Get it for Android', android_soon: 'Android — coming soon',
      proof: ['3–5 minutes a day', 'Live pronunciation check', 'Transliteration in your script', 'Works offline'],
      feat_title: 'Everything you need to actually speak',
      feats: [
        ['🎤', 'Follow-along reading', 'Every word lights up exactly as the teacher says it. Tap a word to hear it slowly and see its meaning.'],
        ['🐢', 'Turtle mode', 'Narration at 50–70% speed without distorting the voice — until every sound clicks.'],
        ['🔤', 'Syllables & transliteration', 'Every word split into syllables, with the stressed one highlighted and a respelling in your own script.'],
        ['🎙️', 'Live speaking check', 'Say the sentence into the mic — green for what you got right, red for what needs work, plus an accuracy score.'],
        ['👑', 'Audio Boss', 'Each stop ends with a real spoken conversation: a border officer, a waiter, a shop assistant.'],
        ['📘', 'From spoken to complete', 'Stage 2 (Premium): a thorough grammar course in every language — clear explanations, tables of forms, audio examples and practice.'],
        ['🧠', 'Smart review', 'Tricky phrases are saved automatically and come back right before you would forget them.']
      ],
      how_title: 'One lesson, four steps, five minutes',
      how: [['👂', 'Listen', 'Natural speed with follow-along text'], ['🐢', 'Slow down', 'Word by word, syllable by syllable'], ['🎮', 'Play', 'Sound to picture, fill the gap, build the sentence'], ['🎙️', 'Speak', 'Live pronunciation check and score']],
      shots_title: 'See it in action',
      shots: ['Journey map', 'Lesson with transliteration', 'Pronunciation check'],
      teach_title: 'Teachers who feel like friends abroad',
      teach_sub: 'Pick a teacher — and an accent: American or British English, Spanish from Spain or Mexico, and Italian with Giulia from Rome.',
      langs_title: 'Languages', langs_learn: 'Learn', langs_more: 'And more:', langs_ui: 'App language', soon: 'Coming soon',
      price_title: 'Start free, keep going with Premium',
      plan_free: 'Free', plan_free_desc: 'The first three stops of every language, Bosses included, plus phrasebook and reminders',
      plan_monthly: 'Monthly', plan_yearly: 'Yearly', plan_lifetime: 'Lifetime',
      per_month: '/ month', per_year: '/ year', once: 'one-time payment', best: 'Best value',
      trial: '{n}-day free trial', choose: 'Choose', start_free: 'Start free',
      prem_includes: 'Every stop · every Boss · new languages',
      faq_title: 'Questions',
      faq: [
        ['Do I need to read the alphabet?', 'No. Every word comes with a transliteration in your own script, a syllable breakdown and its stressed syllable marked.'],
        ['How does the pronunciation check work?', 'The app listens to your sentence, compares it word by word and colours it green or red. Works in Chrome, Edge and the Android app.'],
        ['Can I learn offline?', 'Yes. After the first visit the app is stored on your device. The speaking check needs a connection.'],
        ['How do I cancel?', 'Anytime, in one click from the link in your receipt — you are not charged if you cancel before the trial ends.'],
        ['Which devices are supported?', 'Any modern browser on phone, tablet or computer, plus the Android app. You can also install it from the browser.']
      ],
      final_title: 'Five minutes a day. A new language for your next trip.',
      footer_privacy: 'Privacy', footer_terms: 'Terms', footer_contact: 'Contact'
    },
    ar: {
      title: 'TedraLingo · تحدثوا لغة جديدة من الدرس الأول',
      nav_features: 'المزايا', nav_how: 'كيف يعمل', nav_teachers: 'المعلمون', nav_pricing: 'الأسعار', nav_faq: 'الأسئلة',
      nav_family: "منتجات أخرى", family_title: "المزيد من Scitedra Labs", family_sub: "TedraLingo جزء من عائلة منتجات Scitedra Labs — تعلّم التقنية واللغات بالممارسة.", family_all: "كل منتجات Scitedra Labs", family_more: "التفاصيل",
      open_app: 'افتحوا التطبيق',
      hero_title: 'تحدثوا لغة جديدة — من الدرس الأول',
      hero_sub: 'دروس من 3 إلى 5 دقائق للغة التي تحتاجونها في السفر: استمعوا إلى معلم حقيقي، أبطئوا، العبوا وتكلموا — والتطبيق يفحص نطقكم كلمة بكلمة.',
      cta_free: 'ابدأوا مجانًا', cta_android: 'حمّلوه لأندرويد', android_soon: 'أندرويد — قريبًا',
      proof: ['3–5 دقائق يوميًا', 'فحص نطق مباشر', 'نقحرة بحروفكم', 'يعمل بدون إنترنت'],
      feat_title: 'كل ما تحتاجونه لتتكلموا فعلًا',
      feats: [
        ['🎤', 'قراءة متابعة', 'كل كلمة تضيء لحظة نطقها. اضغطوا على كلمة لسماعها ببطء ومعرفة معناها.'],
        ['🐢', 'وضع السلحفاة', 'قراءة بسرعة 50%–70% دون تشويه الصوت — حتى يستقر كل صوت.'],
        ['🔤', 'مقاطع ونقحرة', 'كل كلمة مقسمة إلى مقاطع مع المقطع المنبور ونطقها بالحروف العربية.'],
        ['🎙️', 'فحص كلام مباشر', 'قولوا الجملة في الميكروفون — الأخضر لما قيل صحيحًا والأحمر لما يحتاج إلى تحسين، مع نسبة الدقة.'],
        ['👑', 'Audio Boss', 'كل محطة تنتهي بمحادثة صوتية حقيقية: ضابط حدود، نادل، بائعة.'],
        ['📘', 'من اللغة المحكية إلى اللغة الكاملة', 'المرحلة 2 (Premium): دورة قواعد أساسية في كل لغة — شرح واضح، جداول صيغ، أمثلة صوتية وتمارين.'],
        ['🧠', 'مراجعة ذكية', 'العبارات الصعبة تُحفظ تلقائيًا وتعود قبل أن تنسوها بقليل.']
      ],
      how_title: 'درس واحد، أربع خطوات، خمس دقائق',
      how: [['👂', 'نستمع', 'بسرعة طبيعية مع نص متابع'], ['🐢', 'نبطئ', 'كلمة بكلمة ومقطعًا بمقطع'], ['🎮', 'نلعب', 'صوت لصورة، أكمل الفراغ، رتّب الجملة'], ['🎙️', 'نتكلم', 'فحص نطق مباشر ونتيجة']],
      shots_title: 'هكذا يبدو',
      shots: ['خريطة الرحلة', 'درس مع النقحرة', 'فحص النطق'],
      teach_title: 'معلمون كأصدقاء من الخارج',
      teach_sub: 'اختاروا معلمًا — واختاروا لهجة: إنجليزية أمريكية أو بريطانية، إسبانية من إسبانيا أو المكسيك، وإيطالية مع جوليا من روما.',
      langs_title: 'اللغات', langs_learn: 'للتعلم', langs_more: 'وأيضًا:', langs_ui: 'لغة التطبيق', soon: 'قريبًا',
      price_title: 'ابدأوا مجانًا وتابعوا مع Premium',
      plan_free: 'مجاني', plan_free_desc: 'أول ثلاث محطات في كل لغة مع تحديات الزعيم، ودفتر العبارات والتذكيرات',
      plan_monthly: 'شهري', plan_yearly: 'سنوي', plan_lifetime: 'مدى الحياة',
      per_month: '/ شهر', per_year: '/ سنة', once: 'دفعة واحدة', best: 'الأوفر',
      trial: 'تجربة مجانية لمدة {n} أيام', choose: 'اختيار', start_free: 'ابدأوا مجانًا',
      prem_includes: 'كل المحطات · كل الزعماء · لغات جديدة',
      faq_title: 'أسئلة شائعة',
      faq: [
        ['هل أحتاج إلى قراءة الأبجدية؟', 'لا. لكل كلمة نطق بالحروف العربية وتقسيم إلى مقاطع مع تمييز المقطع المنبور.'],
        ['كيف يعمل فحص النطق؟', 'يستمع التطبيق إلى جملتكم ويقارنها كلمة بكلمة ويلوّنها بالأخضر أو الأحمر. يعمل في Chrome وEdge وتطبيق أندرويد.'],
        ['هل يمكن التعلم بدون إنترنت؟', 'نعم. بعد الزيارة الأولى يُحفظ التطبيق على جهازكم. فحص الكلام يحتاج إلى اتصال.'],
        ['كيف ألغي الاشتراك؟', 'في أي وقت بنقرة واحدة من الرابط في الإيصال — ولا تُحاسبون إذا ألغيتم قبل نهاية التجربة.'],
        ['على أي أجهزة يعمل؟', 'على أي متصفح حديث في الهاتف أو الجهاز اللوحي أو الحاسوب، وكتطبيق أندرويد.']
      ],
      final_title: 'خمس دقائق يوميًا. لغة جديدة في رحلتكم القادمة.',
      footer_privacy: 'الخصوصية', footer_terms: 'الشروط', footer_contact: 'تواصل'
    },
    ru: {
      title: 'TedraLingo · Говорите на новом языке с первого урока',
      nav_features: 'Возможности', nav_how: 'Как это работает', nav_teachers: 'Преподаватели', nav_pricing: 'Цены', nav_faq: 'Вопросы',
      nav_family: "Другие продукты", family_title: "Ещё от Scitedra Labs", family_sub: "TedraLingo входит в семью продуктов Scitedra Labs — изучайте технологии и языки на практике.", family_all: "Все продукты Scitedra Labs", family_more: "Подробнее",
      open_app: 'Открыть приложение',
      hero_title: 'Говорите на новом языке — с первого урока',
      hero_sub: 'Уроки по 3–5 минут для языка, который нужен в поездке: слушайте настоящего преподавателя, замедляйте, играйте и говорите — приложение проверит произношение слово за словом.',
      cta_free: 'Начать бесплатно', cta_android: 'Скачать для Android', android_soon: 'Android — скоро',
      proof: ['3–5 минут в день', 'Проверка произношения', 'Транскрипция кириллицей', 'Работает офлайн'],
      feat_title: 'Всё, чтобы по-настоящему заговорить',
      feats: [
        ['🎤', 'Чтение с подсветкой', 'Каждое слово загорается в момент произнесения. Нажмите на слово — услышите его медленно и увидите перевод.'],
        ['🐢', 'Режим черепахи', 'Озвучка на 50–70% скорости без искажения голоса — пока каждый звук не станет понятен.'],
        ['🔤', 'Слоги и транскрипция', 'Каждое слово разбито на слоги, ударный выделен, рядом — транскрипция кириллицей.'],
        ['🎙️', 'Проверка речи', 'Скажите фразу в микрофон — зелёным то, что верно, красным — что улучшить, и процент точности.'],
        ['👑', 'Audio Boss', 'Каждая остановка заканчивается живым диалогом: пограничник, официант, продавец.'],
        ['📘', 'От разговорного к полному', 'Этап 2 (Premium): основательный курс грамматики для каждого языка — понятные объяснения, таблицы форм, аудиопримеры и упражнения.'],
        ['🧠', 'Умное повторение', 'Трудные фразы сохраняются автоматически и возвращаются прямо перед тем, как вы их забудете.']
      ],
      how_title: 'Один урок, четыре шага, пять минут',
      how: [['👂', 'Слушаем', 'Естественный темп с подсветкой текста'], ['🐢', 'Замедляем', 'Слово за словом, слог за слогом'], ['🎮', 'Играем', 'Звук — картинка, пропуски, сборка фразы'], ['🎙️', 'Говорим', 'Проверка произношения и оценка']],
      shots_title: 'Как это выглядит',
      shots: ['Карта путешествия', 'Урок с транскрипцией', 'Проверка произношения'],
      teach_title: 'Преподаватели — как друзья из-за границы',
      teach_sub: 'Выберите преподавателя — и акцент: американский или британский английский, испанский из Испании или Мексики, итальянский с Джулией из Рима.',
      langs_title: 'Языки', langs_learn: 'Изучать', langs_more: 'А также:', langs_ui: 'Язык приложения', soon: 'Скоро',
      price_title: 'Начните бесплатно, продолжайте с Premium',
      plan_free: 'Бесплатно', plan_free_desc: 'Первые три остановки каждого языка с Боссами, разговорник и напоминания',
      plan_monthly: 'Месяц', plan_yearly: 'Год', plan_lifetime: 'Навсегда',
      per_month: '/ мес.', per_year: '/ год', once: 'разовый платёж', best: 'Выгоднее всего',
      trial: '{n} дня бесплатно', choose: 'Выбрать', start_free: 'Начать бесплатно',
      prem_includes: 'Все остановки · все Боссы · новые языки',
      faq_title: 'Вопросы',
      faq: [
        ['Нужно ли знать алфавит?', 'Нет. У каждого слова есть транскрипция кириллицей, разбивка на слоги и отмеченный ударный слог.'],
        ['Как работает проверка произношения?', 'Приложение слушает фразу, сравнивает её слово за словом и окрашивает зелёным или красным. Работает в Chrome, Edge и в приложении для Android.'],
        ['Можно ли заниматься офлайн?', 'Да. После первого запуска приложение сохраняется на устройстве. Для проверки речи нужен интернет.'],
        ['Как отменить подписку?', 'В любой момент одним нажатием по ссылке из чека — если отменить до конца пробного периода, оплаты не будет.'],
        ['На каких устройствах работает?', 'В любом современном браузере на телефоне, планшете и компьютере, а также как приложение для Android.']
      ],
      final_title: 'Пять минут в день. Новый язык к следующей поездке.',
      footer_privacy: 'Конфиденциальность', footer_terms: 'Условия', footer_contact: 'Контакты'
    }
  };

  const KEY = 'langquest_site_lang';
  function detect() {
    try { const saved = localStorage.getItem(KEY); if (saved && T[saved]) return saved; } catch { /* private mode */ }
    for (const l of navigator.languages || [navigator.language || 'he']) {
      const c = l.toLowerCase().split('-')[0];
      if (c === 'iw') return 'he';
      if (T[c]) return c;
    }
    return 'he';
  }

  let lang = detect();
  // commerce.js formats prices for the current language
  window.LQI18n = { ui: () => lang };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);

  const TEACHERS = [
    { id: 'emma', name: 'Emma', flag: '🇺🇸', hue: 200, city: { he: 'ניו יורק', en: 'New York', ar: 'نيويورك', ru: 'Нью-Йорк' } },
    { id: 'oliver', name: 'Oliver', flag: '🇬🇧', hue: 160, city: { he: 'לונדון', en: 'London', ar: 'لندن', ru: 'Лондон' } },
    { id: 'lucia', name: 'Lucía', flag: '🇪🇸', hue: 12, city: { he: 'מדריד', en: 'Madrid', ar: 'مدريد', ru: 'Мадрид' } },
    { id: 'mateo', name: 'Mateo', flag: '🇲🇽', hue: 35, city: { he: 'מקסיקו סיטי', en: 'Mexico City', ar: 'مكسيكو سيتي', ru: 'Мехико' } },
    { id: 'giulia', name: 'Giulia', flag: '🇮🇹', hue: 340, city: { he: 'רומא', en: 'Rome', ar: 'روما', ru: 'Рим' } }
  ];
  // [flag, name, available, main] — the main five first, the rest listed after them
  const LEARN = [['🇬🇧', 'English', true, true], ['🇸🇦', 'العربية', false, true], ['🇫🇷', 'Français', false, true], ['🇪🇸', 'Español', true, true], ['🇮🇱', 'עברית', false, true],
    ['🇮🇹', 'Italiano', true, false], ['🇩🇪', 'Deutsch', false, false]];

  // the other Scitedra Labs products (pages on scitedra-labs.web.app)
  const SCT = 'https://scitedra-labs.web.app';
  const FAMILY = [
    { name: 'CyberLab 3D', img: 'cl3d-hero', page: '/cyberlab-3d/',
      desc: { he: 'סימולטור תלת־ממדי ללימוד IT וסייבר: 60 שלבים מ-Help Desk ועד SOC.', en: 'A 3D simulator for learning IT and cyber: 60 lessons from Help Desk to SOC.', ar: 'محاكي ثلاثي الأبعاد لتعلّم تقنية المعلومات والأمن السيبراني: 60 مرحلة من الدعم الفني حتى SOC.', ru: '3D-симулятор для изучения IT и кибербезопасности: 60 уровней от Help Desk до SOC.' } },
    { name: 'CyberLab Kids', img: 'kids-hero', page: '/cyberlab-kids/',
      desc: { he: 'משחק חינמי לילדים על מחשבים, רשתות ובטיחות ברשת.', en: 'A free game for kids about computers, networks and online safety.', ar: 'لعبة مجانية للأطفال عن الحواسيب والشبكات والأمان على الإنترنت.', ru: 'Бесплатная игра для детей о компьютерах, сетях и безопасности в интернете.' } },
    { name: { he: 'הרפתקת הרשת של ביטי', en: "Bitty's Net Adventure" }, img: 'bna-title2', en: true, page: '/net-adventure/',
      desc: { he: 'משחק פלטפורמה לילדים על סכנות ברשת: רצים, קופצים ולומדים להיזהר.', en: 'A kids platformer about online dangers: run, jump and learn to stay safe.', ar: 'لعبة منصات للأطفال عن مخاطر الإنترنت: اركض واقفز وتعلّم الحذر.', ru: 'Платформер для детей об опасностях в интернете: беги, прыгай и учись осторожности.' } },
    { name: 'Tedralink Files', img: 'tlf-hero', en: true, page: '/tedralink-files/',
      desc: { he: 'ניהול ועריכת קבצים מרחוק: שרתים, NAS וענן — במחשב ובטלפון.', en: 'Remote file management: servers, NAS and cloud — on desktop and phone.', ar: 'إدارة الملفات عن بُعد: الخوادم وNAS والسحابة — على الحاسوب والهاتف.', ru: 'Удалённое управление файлами: серверы, NAS и облако — на компьютере и телефоне.' } },
    { name: 'EduPsych CRM', img: 'eps-hero', page: '/edupsych-crm/',
      desc: { he: 'מערכת עבודה לפסיכולוגים חינוכיים: יומן, מטופלים, סיכומים ודוחות.', en: 'A workspace for educational psychologists: calendar, clients, notes and reports.', ar: 'منظومة عمل للأخصائيين النفسيين التربويين: تقويم وملفات ومحاضر وتقارير.', ru: 'Рабочая система для школьных психологов: календарь, клиенты, заметки и отчёты.' } }
  ];

  function render() {
    const t = T[lang];
    const C = window.LQCommerce;
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang].dir;
    document.title = t.title;
    try { localStorage.setItem(KEY, lang); } catch { /* private mode */ }

    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t[el.dataset.t]; });
    $('#langSel').value = lang;

    const apk = C && C.CONFIG.apkUrl;
    document.querySelectorAll('[data-android]').forEach(a => {
      a.textContent = apk ? '🤖 ' + t.cta_android : '🤖 ' + t.android_soon;
      if (apk) { a.href = apk; a.removeAttribute('aria-disabled'); } else { a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); }
    });

    $('#proof').innerHTML = t.proof.map(p => `<li>${esc(p)}</li>`).join('');
    $('#feats').innerHTML = t.feats.map(([i, h, p]) => `<article class="feat"><span class="ico">${i}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join('');
    $('#how').innerHTML = t.how.map(([i, h, p], k) => `<li><span class="num">${k + 1}</span><span class="ico">${i}</span><b>${esc(h)}</b><small>${esc(p)}</small></li>`).join('');
    $('#shots').innerHTML = ['map', 'lesson', 'voice'].map((s, k) => `
      <figure class="phone"><img src="img/${lang}-${s}.jpg" alt="${esc(t.shots[k])}" loading="lazy" width="390" height="844"><figcaption>${esc(t.shots[k])}</figcaption></figure>`).join('');
    $('#heroShot').src = `img/${lang}-lesson.jpg`;
    $('#teachers').innerHTML = TEACHERS.map(tc => `
      <div class="teacher">
        <span class="t-ava" style="--h:${tc.hue}"><b>${tc.name[0]}</b>${photos.includes(tc.id + '.webp') ? `<img src="../img/teachers/${tc.id}.webp" alt="" loading="lazy" onerror="this.remove()">` : ''}</span>
        <b>${esc(tc.name)} ${tc.flag}</b><small>📍 ${esc(tc.city[lang])}</small>
      </div>`).join('');
    const li = ([f, n, ok]) => `<li class="${ok ? '' : 'soon'}">${f} <span dir="auto">${n}</span>${ok ? '' : ` <small>${esc(t.soon)}</small>`}</li>`;
    $('#learn').innerHTML = LEARN.filter(x => x[3]).map(li).join('')
      + `<li class="more">${esc(t.langs_more)}</li>` + LEARN.filter(x => !x[3]).map(li).join('');
    $('#uiLangs').innerHTML = Object.values(LANGS).map(L => `<li>${esc(L.name)}</li>`).join('');

    const period = { month: t.per_month, year: t.per_year, once: t.once };
    const plans = C ? C.PLANS : [];
    const trialDays = C ? C.CONFIG.trialDays : 0;
    $('#plans').innerHTML = `
      <article class="plan">
        <h3>${esc(t.plan_free)}</h3><div class="price">0</div><p>${esc(t.plan_free_desc)}</p>
        <a class="btn ghost" href="../index.html">${esc(t.start_free)}</a>
      </article>` + plans.map(p => `
      <article class="plan ${p.best ? 'best' : ''}">
        ${p.best ? `<span class="flag">${esc(t.best)}</span>` : ''}
        <h3>${esc(t['plan_' + p.id])}</h3>
        <div class="price">${esc(C.priceLabel(p))}</div><small>${esc(period[p.period])}</small>
        ${p.period !== 'once' && trialDays ? `<small class="trial">🎁 ${esc(t.trial.replace('{n}', trialDays))}</small>` : ''}
        <p>${esc(t.prem_includes)}</p>
        <a class="btn ${p.best ? 'primary' : 'ghost'}" href="../index.html?upgrade=${p.id}">${esc(t.choose)}</a>
      </article>`).join('');
    const pre = lang === 'he' ? '' : '/en';
    $('[data-family-home]').href = `${SCT}${pre}/`;
    $('#family').innerHTML = FAMILY.map(f => {
      const href = f.url || `${SCT}${pre}${f.page}`;
      const name = typeof f.name === 'string' ? f.name : (f.name[lang] || f.name.en);
      const img = `img/family/${f.img}${f.en && lang !== 'he' ? '-en' : ''}.webp`;
      return `<a class="fam" href="${href}" target="_blank" rel="noopener">
        <img src="${img}" alt="" loading="lazy" width="800" height="375">
        <b dir="auto">${esc(name)}</b><small>${esc(f.desc[lang])}</small><span class="more">${esc(t.family_more)} ${LANGS[lang].dir === 'rtl' ? '←' : '→'}</span></a>`;
    }).join('');
    $('#faq').innerHTML = t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  }

  $('#langSel').innerHTML = Object.entries(LANGS).map(([c, L]) => `<option value="${c}">${L.name}</option>`).join('');
  $('#langSel').onchange = e => { lang = e.target.value; render(); };
  let photos = [];
  fetch('../img/media.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null))
    .then(m => { if (m && m.teachers && m.teachers.length) { photos = m.teachers; render(); } }).catch(() => {});
  $('#year').textContent = new Date().getFullYear();
  render();
})();
