/* TedraLingo — Chapter 2: expanded language & grammar (A1–A2 foundations)
 *
 * Unit: { id, icon, level, title: {he,en,ar,ru}, explain: {he,en,ar,ru: [bullets]}, table: [[target-language cells]],
 *         ex: [[sentence, he, en, ar, ru]], drills: [[sentence with ___, answer, [options], hint?: {en,ar,ru}]] }
 * The English track has no English translations (English can't be the base language for learning English).
 */
(function () {
  const GRAMMAR = {
    en: [
      {
        id: 'be', icon: '🧩', level: 'A1',
        title: { he: 'הפועל to be — am / is / are', en: 'The verb "to be": am / is / are', ar: 'الفعل to be: am / is / are', ru: 'Глагол to be: am / is / are' },
        explain: {
          he: ['באנגלית צריך פועל גם במשפט כמו "אני סטודנט": I am a student.', 'I → am, he / she / it → is, you / we / they → are.', "בדיבור מקצרים: I'm, she's, we're. שלילה: I'm not, she isn't."],
          ar: ['في الإنجليزية نحتاج إلى فعل حتى في جملة مثل «أنا طالب»: I am a student.', 'I ← am، he / she / it ← is، you / we / they ← are.', "في الكلام نختصر: I'm, she's, we're. النفي: I'm not, she isn't."],
          ru: ['В английском нужен глагол даже во фразе «Я студент»: I am a student.', 'I → am, he / she / it → is, you / we / they → are.', "В речи сокращают: I'm, she's, we're. Отрицание: I'm not, she isn't."]
        },
        table: [['I', 'am'], ['he / she / it', 'is'], ['you / we / they', 'are']],
        ex: [
          ['I am a student.', 'אני סטודנט.', null, 'أنا طالب.', 'Я студент.'],
          ["She's from Spain.", 'היא מספרד.', null, 'هي من إسبانيا.', 'Она из Испании.'],
          ['We are hungry.', 'אנחנו רעבים.', null, 'نحن جائعون.', 'Мы голодны.'],
          ["The hotel isn't far.", 'המלון לא רחוק.', null, 'الفندق ليس بعيدًا.', 'Отель недалеко.']
        ],
        drills: [['I ___ tired.', 'am', ['am', 'is', 'are']], ['They ___ from Italy.', 'are', ['is', 'are', 'am']], ['The museum ___ open today.', 'is', ['are', 'is', 'am']], ['You ___ very kind.', 'are', ['is', 'am', 'are']]]
      },
      {
        id: 'present', icon: '🔁', level: 'A1',
        title: { he: 'הווה פשוט — I work / she works', en: 'Present simple — I work / she works', ar: 'المضارع البسيط — I work / she works', ru: 'Present simple — I work / she works' },
        explain: {
          he: ['משתמשים בו להרגלים ולעובדות: I work in a hotel.', 'עם he / she / it מוסיפים s: she works, he lives.', 'פעלים שמסתיימים ב-o, ch, sh, s, x מקבלים es: goes, watches.'],
          ar: ['نستخدمه للعادات والحقائق: I work in a hotel.', 'مع he / she / it نضيف s: she works, he lives.', 'الأفعال المنتهية بـ o, ch, sh, s, x تأخذ es: goes, watches.'],
          ru: ['Для привычек и фактов: I work in a hotel.', 'С he / she / it добавляем s: she works, he lives.', 'Глаголы на o, ch, sh, s, x получают es: goes, watches.']
        },
        table: [['I / you / we / they', 'work · live · go'], ['he / she / it', 'works · lives · goes']],
        ex: [
          ['I work in a hotel.', 'אני עובד במלון.', null, 'أعمل في فندق.', 'Я работаю в отеле.'],
          ['She lives in London.', 'היא גרה בלונדון.', null, 'تعيش في لندن.', 'Она живёт в Лондоне.'],
          ['The bus leaves at nine.', 'האוטובוס יוצא בתשע.', null, 'تغادر الحافلة في التاسعة.', 'Автобус отправляется в девять.'],
          ['We often eat out.', 'אנחנו אוכלים בחוץ לעיתים קרובות.', null, 'غالبًا ما نأكل خارج المنزل.', 'Мы часто едим в ресторанах.']
        ],
        drills: [['He ___ coffee every morning.', 'drinks', ['drink', 'drinks', 'drinking']], ['They ___ in Madrid.', 'live', ['lives', 'live', 'living']], ['The shop ___ at six.', 'closes', ['close', 'closes', 'closing']], ['My sister ___ to work by train.', 'goes', ['go', 'goes', 'gos']]]
      },
      {
        id: 'do', icon: '❓', level: 'A1',
        title: { he: 'שאלות ושלילה עם do / does', en: 'Questions and negatives with do / does', ar: 'السؤال والنفي مع do / does', ru: 'Вопросы и отрицания с do / does' },
        explain: {
          he: ['שאלה: Do / Does + נושא + פועל: Do you speak English?', 'עם he / she / it משתמשים ב-does, והפועל חוזר לצורת הבסיס: Does she work here?', "שלילה: don't / doesn't + פועל: I don't eat meat."],
          ar: ['السؤال: Do / Does + الفاعل + الفعل: Do you speak English?', 'مع he / she / it نستخدم does ويعود الفعل إلى صيغته الأساسية: Does she work here?', "النفي: don't / doesn't + الفعل: I don't eat meat."],
          ru: ['Вопрос: Do / Does + подлежащее + глагол: Do you speak English?', 'С he / she / it — does, а глагол в начальной форме: Does she work here?', "Отрицание: don't / doesn't + глагол: I don't eat meat."]
        },
        table: [['Do you…?', 'Does she…?'], ["I don't…", "He doesn't…"]],
        ex: [
          ['Do you speak English?', 'אתה מדבר אנגלית?', null, 'هل تتحدث الإنجليزية؟', 'Вы говорите по-английски?'],
          ["I don't eat meat.", 'אני לא אוכל בשר.', null, 'لا آكل اللحم.', 'Я не ем мясо.'],
          ['Does the hotel have a pool?', 'יש במלון בריכה?', null, 'هل في الفندق مسبح؟', 'В отеле есть бассейн?'],
          ["She doesn't like coffee.", 'היא לא אוהבת קפה.', null, 'لا تحب القهوة.', 'Она не любит кофе.']
        ],
        drills: [['___ you like tea?', 'Do', ['Do', 'Does', 'Are']], ['___ he work here?', 'Does', ['Do', 'Does', 'Is']], ['We ___ have a car.', "don't", ["doesn't", "don't", 'not']], ['She ___ speak Spanish.', "doesn't", ["don't", "doesn't", "isn't"]]]
      },
      {
        id: 'articles', icon: '📰', level: 'A1',
        title: { he: 'המיליות a / an / the', en: 'Articles: a / an / the', ar: 'أدوات التعريف والتنكير: a / an / the', ru: 'Артикли: a / an / the' },
        explain: {
          he: ['a / an = "אחד, כלשהו" — כשמזכירים משהו בפעם הראשונה: a hotel.', 'an לפני צליל של תנועה: an apple, an hour.', 'the = ה־ הידיעה — משהו מסוים שכבר ידוע: the hotel near the station.'],
          ar: ['a / an = «أحد ما» — عند ذكر الشيء لأول مرة: a hotel.', 'an قبل صوت حرف علة: an apple, an hour.', 'the = أداة التعريف «الـ» — لشيء محدد ومعروف: the hotel near the station.'],
          ru: ['a / an — «какой-то, один»: когда упоминаем впервые: a hotel.', 'an — перед гласным звуком: an apple, an hour.', 'the — определённый артикль: конкретный, уже известный предмет: the hotel near the station.']
        },
        table: [['a', 'a ticket · a bag'], ['an', 'an apple · an hour'], ['the', 'the station · the menu']],
        ex: [
          ['I need a taxi.', 'אני צריך מונית.', null, 'أحتاج إلى سيارة أجرة.', 'Мне нужно такси.'],
          ['Is there an ATM here?', 'יש כאן כספומט?', null, 'هل يوجد صراف آلي هنا؟', 'Здесь есть банкомат?'],
          ['The museum is closed today.', 'המוזיאון סגור היום.', null, 'المتحف مغلق اليوم.', 'Музей сегодня закрыт.'],
          ['Can I have an orange juice?', 'אפשר מיץ תפוזים?', null, 'هل يمكنني الحصول على عصير برتقال؟', 'Можно апельсиновый сок?']
        ],
        drills: [['I want ___ apple.', 'an', ['a', 'an', 'the']], ['She is ___ teacher.', 'a', ['a', 'an', 'the']], ['Where is ___ train station?', 'the', ['a', 'an', 'the']], ['It takes ___ hour.', 'an', ['a', 'an', 'the']]]
      },
      {
        id: 'plural', icon: '👥', level: 'A1',
        title: { he: 'רבים, ו-this / these', en: 'Plurals and this / these', ar: 'الجمع و this / these', ru: 'Множественное число и this / these' },
        explain: {
          he: ['רבים: מוסיפים s — tickets, bags; אחרי s, sh, ch, x מוסיפים es — buses, glasses.', 'יוצאי דופן נפוצים: man → men, woman → women, child → children, person → people.', 'this (זה, קרוב) / these (אלה) · that (ההוא) / those (ההם).'],
          ar: ['الجمع: نضيف s — tickets, bags؛ وبعد s, sh, ch, x نضيف es — buses, glasses.', 'استثناءات شائعة: man → men, woman → women, child → children, person → people.', 'this (هذا، قريب) / these (هؤلاء) · that (ذلك) / those (أولئك).'],
          ru: ['Множественное число: + s — tickets, bags; после s, sh, ch, x — es: buses, glasses.', 'Частые исключения: man → men, woman → women, child → children, person → people.', 'this (это, рядом) / these (эти) · that (то) / those (те).']
        },
        table: [['ticket', 'tickets'], ['bus', 'buses'], ['person', 'people'], ['this', 'these']],
        ex: [
          ['These shoes are nice.', 'הנעליים האלה יפות.', null, 'هذه الأحذية جميلة.', 'Эти туфли красивые.'],
          ['How much is this?', 'כמה זה עולה?', null, 'بكم هذا؟', 'Сколько это стоит?'],
          ['There are three people.', 'יש שלושה אנשים.', null, 'هناك ثلاثة أشخاص.', 'Здесь три человека.'],
          ['Two coffees, please.', 'שני קפה, בבקשה.', null, 'قهوتان من فضلك.', 'Два кофе, пожалуйста.']
        ],
        drills: [['I have two ___.', 'bags', ['bag', 'bags', 'bages']], ['___ glasses are dirty.', 'These', ['This', 'These', 'That']], ['There are four ___ in the room.', 'people', ['person', 'people', 'persons']], ['Is ___ seat free?', 'this', ['these', 'this', 'those']]]
      },
      {
        id: 'continuous', icon: '⏳', level: 'A2',
        title: { he: 'הווה מתמשך — I am waiting', en: 'Present continuous — I am waiting', ar: 'المضارع المستمر — I am waiting', ru: 'Present continuous — I am waiting' },
        explain: {
          he: ['למה שקורה עכשיו: am / is / are + פועל עם ing — I am waiting for a taxi.', "שאלה: Are you waiting? · שלילה: She isn't working today.", 'משמש גם לתוכניות קרובות: We are leaving tomorrow.'],
          ar: ['لما يحدث الآن: am / is / are + فعل بـ ing — I am waiting for a taxi.', "السؤال: Are you waiting? · النفي: She isn't working today.", 'يُستخدم أيضًا للخطط القريبة: We are leaving tomorrow.'],
          ru: ['О том, что происходит сейчас: am / is / are + глагол с ing — I am waiting for a taxi.', "Вопрос: Are you waiting? · Отрицание: She isn't working today.", 'Также для ближайших планов: We are leaving tomorrow.']
        },
        table: [['I', 'am waiting'], ['he / she / it', 'is waiting'], ['you / we / they', 'are waiting']],
        ex: [
          ['I am waiting for a taxi.', 'אני מחכה למונית.', null, 'أنا أنتظر سيارة أجرة.', 'Я жду такси.'],
          ['It is raining.', 'יורד גשם.', null, 'إنها تمطر.', 'Идёт дождь.'],
          ['We are leaving tomorrow.', 'אנחנו עוזבים מחר.', null, 'سنغادر غدًا.', 'Мы уезжаем завтра.'],
          ['What are you doing?', 'מה אתה עושה?', null, 'ماذا تفعل؟', 'Что вы делаете?']
        ],
        drills: [['She is ___ a book.', 'reading', ['read', 'reads', 'reading']], ['They ___ having dinner now.', 'are', ['is', 'are', 'am']], ['I ___ looking for the exit.', 'am', ['am', 'is', 'are']], ['Look! It ___ snowing.', 'is', ['are', 'is', 'am']]]
      },
      {
        id: 'past', icon: '⏮️', level: 'A2',
        title: { he: 'עבר פשוט — I visited / I went', en: 'Past simple — I visited / I went', ar: 'الماضي البسيط — I visited / I went', ru: 'Past simple — I visited / I went' },
        explain: {
          he: ['לפעולה שהסתיימה בעבר: פעלים רגילים מקבלים ed — visit → visited, stay → stayed.', 'פעלים חריגים צריך לזכור: go → went, see → saw, have → had, eat → ate.', "שאלה ושלילה עם did + צורת בסיס: Did you see it? · I didn't go."],
          ar: ['لفعل انتهى في الماضي: الأفعال المنتظمة تأخذ ed — visit → visited, stay → stayed.', 'الأفعال الشاذة تُحفظ: go → went, see → saw, have → had, eat → ate.', "السؤال والنفي بـ did + الصيغة الأساسية: Did you see it? · I didn't go."],
          ru: ['О завершённом действии в прошлом: правильные глаголы + ed — visit → visited, stay → stayed.', 'Неправильные нужно запомнить: go → went, see → saw, have → had, eat → ate.', "Вопрос и отрицание: did + начальная форма: Did you see it? · I didn't go."]
        },
        table: [['visit', 'visited'], ['go', 'went'], ['see', 'saw'], ['have', 'had'], ['eat', 'ate']],
        ex: [
          ['We visited the museum yesterday.', 'ביקרנו במוזיאון אתמול.', null, 'زرنا المتحف أمس.', 'Вчера мы были в музее.'],
          ['I went to London last year.', 'נסעתי ללונדון בשנה שעברה.', null, 'ذهبت إلى لندن العام الماضي.', 'В прошлом году я ездил в Лондон.'],
          ['Did you have a good trip?', 'היה לך טיול טוב?', null, 'هل كانت رحلتك جيدة؟', 'Хорошо съездили?'],
          ["I didn't sleep well.", 'לא ישנתי טוב.', null, 'لم أنم جيدًا.', 'Я плохо спал.']
        ],
        drills: [['Yesterday we ___ to the beach.', 'went', ['go', 'went', 'goed']], ['She ___ a great movie last night.', 'saw', ['see', 'saw', 'seed']], ['Did you ___ breakfast?', 'have', ['had', 'have', 'has']], ['They ___ in a small hotel.', 'stayed', ['stay', 'stayed', 'staid']]]
      },
      {
        id: 'future', icon: '⏭️', level: 'A2',
        title: { he: 'עתיד — going to / will', en: 'The future — going to / will', ar: 'المستقبل — going to / will', ru: 'Будущее — going to / will' },
        explain: {
          he: ['going to — לתוכניות שכבר החלטנו: I am going to visit Rome.', 'will — להחלטה של הרגע, להבטחה או לתחזית: I will call you later.', "שלילה: I'm not going to… · I won't (= will not)."],
          ar: ['going to — لخطط قررناها مسبقًا: I am going to visit Rome.', 'will — لقرار لحظي أو وعد أو توقع: I will call you later.', "النفي: I'm not going to… · I won't (= will not)."],
          ru: ['going to — о планах, которые уже решены: I am going to visit Rome.', 'will — решение в момент речи, обещание или прогноз: I will call you later.', "Отрицание: I'm not going to… · I won't (= will not)."]
        },
        table: [['plan', 'I am going to + verb'], ['decision / promise', 'I will + verb'], ['negative', "won't · not going to"]],
        ex: [
          ['I am going to visit Rome.', 'אני הולך לבקר ברומא.', null, 'سأزور روما.', 'Я собираюсь посетить Рим.'],
          ["I'll call you later.", 'אתקשר אליך אחר כך.', null, 'سأتصل بك لاحقًا.', 'Я позвоню тебе позже.'],
          ['It will be sunny tomorrow.', 'מחר יהיה שמשי.', null, 'سيكون الجو مشمسًا غدًا.', 'Завтра будет солнечно.'],
          ['Are you going to take the train?', 'אתה מתכוון לנסוע ברכבת?', null, 'هل ستأخذ القطار؟', 'Вы поедете на поезде?']
        ],
        drills: [['We are going ___ visit Paris.', 'to', ['to', 'for', 'will']], ["I ___ help you, don't worry.", 'will', ['will', 'going', 'am']], ['She is ___ to buy a ticket.', 'going', ['go', 'going', 'will']], ['It ___ rain tomorrow.', 'will', ['will', 'is', 'going']]]
      },
      {
        id: 'can', icon: '💪', level: 'A2',
        title: { he: 'can / could — יכולת ובקשות מנומסות', en: 'Can / could — ability and polite requests', ar: 'can / could — القدرة والطلب المهذب', ru: 'Can / could — умение и вежливые просьбы' },
        explain: {
          he: ["can + פועל בסיס = יכול / יודע: I can swim. שלילה: can't.", 'בקשה: Can I…? Can you…? — could מנומס יותר: Could you help me?', 'אחרי can אין s ואין to: she can speak (לא she cans, לא can to).'],
          ar: ["can + الفعل الأساسي = يستطيع / يعرف: I can swim. النفي: can't.", 'الطلب: Can I…? Can you…? — وcould أكثر تهذيبًا: Could you help me?', 'لا s ولا to بعد can: she can speak (وليس she cans أو can to).'],
          ru: ["can + глагол = могу / умею: I can swim. Отрицание: can't.", 'Просьба: Can I…? Can you…? — could вежливее: Could you help me?', 'После can нет s и to: she can speak (не she cans и не can to).']
        },
        table: [['ability', "I can · I can't"], ['request', 'Can I…? · Can you…?'], ['polite', 'Could you…?']],
        ex: [
          ['Can you help me?', 'אתה יכול לעזור לי?', null, 'هل يمكنك مساعدتي؟', 'Вы можете мне помочь?'],
          ["I can't find my bag.", 'אני לא מוצא את התיק שלי.', null, 'لا أجد حقيبتي.', 'Я не могу найти свою сумку.'],
          ['Could you speak more slowly?', 'תוכל לדבר לאט יותר?', null, 'هل يمكنك التحدث ببطء أكثر؟', 'Не могли бы вы говорить медленнее?'],
          ['She can speak three languages.', 'היא יודעת לדבר שלוש שפות.', null, 'تستطيع التحدث بثلاث لغات.', 'Она говорит на трёх языках.']
        ],
        drills: [['___ you open the window, please?', 'Could', ['Could', 'Do', 'Are']], ['I ___ swim very well.', 'can', ['can', 'cans', 'can to']], ['He ___ come today, he is sick.', "can't", ['can', "can't", 'could']], ['Can I ___ the menu, please?', 'see', ['see', 'to see', 'seeing']]]
      },
      {
        id: 'prepositions', icon: '📍', level: 'A2',
        title: { he: 'מילות יחס של זמן ומקום: in / on / at', en: 'Prepositions of time and place: in / on / at', ar: 'حروف الجر للزمان والمكان: in / on / at', ru: 'Предлоги времени и места: in / on / at' },
        explain: {
          he: ['זמן: at לשעה (at 7), on ליום ולתאריך (on Monday), in לחודש, לשנה ולחלק מהיום (in July, in the morning).', 'מקום: in בתוך (in the room, in Rome), on על (on the table), at בנקודה (at the station, at the hotel).', 'ביטויים לזכור: at night, on the bus, in the car.'],
          ar: ['الزمن: at للساعة (at 7)، on لليوم والتاريخ (on Monday)، in للشهر والسنة وجزء من اليوم (in July, in the morning).', 'المكان: in داخل (in the room, in Rome)، on على (on the table)، at عند نقطة (at the station, at the hotel).', 'تعابير تُحفظ: at night, on the bus, in the car.'],
          ru: ['Время: at — час (at 7), on — день и дата (on Monday), in — месяц, год и часть дня (in July, in the morning).', 'Место: in — внутри (in the room, in Rome), on — на поверхности (on the table), at — в точке (at the station, at the hotel).', 'Запомните: at night, on the bus, in the car.']
        },
        table: [['at', 'at 7 · at the station · at night'], ['on', 'on Monday · on the table · on the bus'], ['in', 'in July · in Rome · in the morning']],
        ex: [
          ['The tour starts at nine.', 'הסיור מתחיל בתשע.', null, 'تبدأ الجولة في التاسعة.', 'Экскурсия начинается в девять.'],
          ["We're arriving on Friday.", 'אנחנו מגיעים ביום שישי.', null, 'سنصل يوم الجمعة.', 'Мы приезжаем в пятницу.'],
          ['She lives in Rome.', 'היא גרה ברומא.', null, 'تعيش في روما.', 'Она живёт в Риме.'],
          ["I'll meet you at the hotel.", 'ניפגש במלון.', null, 'سألتقي بك في الفندق.', 'Встретимся в отеле.']
        ],
        drills: [['The museum opens ___ ten.', 'at', ['at', 'on', 'in']], ['My flight is ___ Sunday.', 'on', ['at', 'on', 'in']], ['We are going to Spain ___ August.', 'in', ['at', 'on', 'in']], ['I never go out ___ night.', 'at', ['at', 'on', 'in']]]
      }
    ],

    es: [
      {
        id: 'ser-estar', icon: '🧩', level: 'A1',
        title: { he: 'ser ו-estar — שני הפעלים "להיות"', en: 'Ser and estar — two verbs for "to be"', ar: 'ser و estar — فعلان بمعنى «يكون»', ru: 'Ser и estar — два глагола «быть»' },
        explain: {
          he: ['ser — למה שקבוע: זהות, מוצא, מקצוע, תכונה: Soy Ana. Es de México.', 'estar — למקום ולמצב זמני: ¿Dónde está el hotel? Estoy cansado.', 'טיפ: אם אפשר לשאול "איפה?" או "איך אתה מרגיש?" — כנראה estar.'],
          en: ['ser — for what defines something: identity, origin, job, characteristics: Soy Ana. Es de México.', 'estar — for location and temporary states: ¿Dónde está el hotel? Estoy cansado.', 'Tip: if the question is "where?" or "how do you feel?", it is probably estar.'],
          ar: ['ser — للصفات الثابتة: الهوية والأصل والمهنة: Soy Ana. Es de México.', 'estar — للمكان والحالة المؤقتة: ¿Dónde está el hotel? Estoy cansado.', 'نصيحة: إذا كان السؤال «أين؟» أو «كيف تشعر؟» فغالبًا estar.'],
          ru: ['ser — постоянное: кто, откуда, профессия, свойства: Soy Ana. Es de México.', 'estar — место и временное состояние: ¿Dónde está el hotel? Estoy cansado.', 'Подсказка: вопрос «где?» или «как ты себя чувствуешь?» — скорее всего estar.']
        },
        table: [['yo', 'soy · estoy'], ['tú', 'eres · estás'], ['él / ella / usted', 'es · está'], ['nosotros', 'somos · estamos'], ['ellos / ustedes', 'son · están']],
        ex: [
          ['Soy estudiante.', 'אני סטודנט.', 'I am a student.', 'أنا طالب.', 'Я студент.'],
          ['El hotel está cerca.', 'המלון קרוב.', 'The hotel is close.', 'الفندق قريب.', 'Отель рядом.'],
          ['Mi hermana es muy simpática.', 'אחותי נחמדה מאוד.', 'My sister is very nice.', 'أختي لطيفة جدًا.', 'Моя сестра очень милая.'],
          ['Estamos cansados.', 'אנחנו עייפים.', 'We are tired.', 'نحن متعبون.', 'Мы устали.']
        ],
        drills: [['Yo ___ de Madrid.', 'soy', ['soy', 'estoy', 'es']], ['¿Dónde ___ el baño?', 'está', ['es', 'está', 'son']], ['Nosotros ___ muy contentos hoy.', 'estamos', ['somos', 'estamos', 'están']], ['Ella ___ médica.', 'es', ['es', 'está', 'eres']]]
      },
      {
        id: 'articles', icon: '📰', level: 'A1',
        title: { he: 'מין ומיליות: el / la / un / una', en: 'Gender and articles: el / la / un / una', ar: 'الجنس وأدوات التعريف: el / la / un / una', ru: 'Род и артикли: el / la / un / una' },
        explain: {
          he: ['לכל שם עצם יש מין: בדרך כלל -o זכר (el libro) ו-a- נקבה (la mesa).', 'ה־ הידיעה: el / la, ברבים los / las. אחד / אחת: un / una.', 'יש יוצאי דופן — el día, la mano, el problema — לכן לומדים כל מילה יחד עם המילית שלה.'],
          en: ['Every noun has a gender: usually -o is masculine (el libro) and -a feminine (la mesa).', '"The": el / la, plural los / las. "A": un / una.', 'There are exceptions — el día, la mano, el problema — so learn each noun with its article.'],
          ar: ['لكل اسم جنس: غالبًا ما ينتهي بـ ‎-o مذكر (el libro) و‎-a مؤنث (la mesa).', 'أداة التعريف: el / la، والجمع los / las. النكرة: un / una.', 'توجد استثناءات — el día, la mano, el problema — لذا تعلّموا الكلمة مع أداتها.'],
          ru: ['У каждого существительного есть род: обычно -o — мужской (el libro), -a — женский (la mesa).', 'Определённый артикль: el / la, во множественном los / las. Неопределённый: un / una.', 'Есть исключения — el día, la mano, el problema — поэтому учите слово вместе с артиклем.']
        },
        table: [['el tren', 'la playa'], ['los trenes', 'las playas'], ['un billete', 'una maleta']],
        ex: [
          ['El tren sale a las ocho.', 'הרכבת יוצאת בשמונה.', 'The train leaves at eight.', 'يغادر القطار في الثامنة.', 'Поезд отправляется в восемь.'],
          ['La playa está cerca.', 'החוף קרוב.', 'The beach is close.', 'الشاطئ قريب.', 'Пляж рядом.'],
          ['Quiero una botella de agua.', 'אני רוצה בקבוק מים.', 'I want a bottle of water.', 'أريد زجاجة ماء.', 'Я хочу бутылку воды.'],
          ['Los museos abren a las diez.', 'המוזיאונים נפתחים בעשר.', 'The museums open at ten.', 'تفتح المتاحف في العاشرة.', 'Музеи открываются в десять.']
        ],
        drills: [['___ casa es grande.', 'La', ['El', 'La', 'Los']], ['Necesito ___ taxi.', 'un', ['un', 'una', 'el']], ['___ libros están aquí.', 'Los', ['Las', 'Los', 'El']], ['Es ___ ciudad bonita.', 'una', ['un', 'una', 'el']]]
      },
      {
        id: 'ar-verbs', icon: '🔁', level: 'A1',
        title: { he: 'הווה: פעלים ב-ar (hablar)', en: 'Present tense: -ar verbs (hablar)', ar: 'المضارع: الأفعال المنتهية بـ ar (hablar)', ru: 'Настоящее время: глаголы на -ar (hablar)' },
        explain: {
          he: ['פעלים שמסתיימים ב-ar: מורידים ar ומוסיפים סיומת לפי הגוף.', 'hablar (לדבר): hablo, hablas, habla, hablamos, hablan.', 'בדרך כלל לא אומרים "אני" — הסיומת כבר אומרת: Hablo español.'],
          en: ['Verbs ending in -ar: drop -ar and add the ending for each person.', 'hablar (to speak): hablo, hablas, habla, hablamos, hablan.', 'You usually leave out "I" — the ending already says it: Hablo español.'],
          ar: ['الأفعال المنتهية بـ ar: نحذف ar ونضيف النهاية حسب الضمير.', 'hablar (يتكلم): hablo, hablas, habla, hablamos, hablan.', 'عادة لا نقول «أنا» — النهاية تكفي: Hablo español.'],
          ru: ['Глаголы на -ar: отбрасываем -ar и добавляем окончание лица.', 'hablar (говорить): hablo, hablas, habla, hablamos, hablan.', 'Местоимение обычно опускают — окончание всё показывает: Hablo español.']
        },
        table: [['yo', 'hablo'], ['tú', 'hablas'], ['él / ella / usted', 'habla'], ['nosotros', 'hablamos'], ['ellos / ustedes', 'hablan']],
        ex: [
          ['Hablo un poco de español.', 'אני מדבר קצת ספרדית.', 'I speak a little Spanish.', 'أتكلم قليلًا من الإسبانية.', 'Я немного говорю по-испански.'],
          ['¿Dónde trabajas?', 'איפה אתה עובד?', 'Where do you work?', 'أين تعمل؟', 'Где ты работаешь?'],
          ['Ella compra fruta en el mercado.', 'היא קונה פירות בשוק.', 'She buys fruit at the market.', 'تشتري الفاكهة من السوق.', 'Она покупает фрукты на рынке.'],
          ['Esperamos el autobús.', 'אנחנו מחכים לאוטובוס.', 'We are waiting for the bus.', 'ننتظر الحافلة.', 'Мы ждём автобус.']
        ],
        drills: [['Yo ___ en un hotel.', 'trabajo', ['trabajo', 'trabajas', 'trabaja']], ['¿Tú ___ inglés?', 'hablas', ['hablo', 'hablas', 'hablan']], ['Ellos ___ el tren.', 'toman', ['toma', 'toman', 'tomamos']], ['Nosotros ___ un taxi.', 'llamamos', ['llamo', 'llaman', 'llamamos']]]
      },
      {
        id: 'er-ir-verbs', icon: '🔂', level: 'A1',
        title: { he: 'הווה: פעלים ב-er וב-ir (comer, vivir)', en: 'Present tense: -er and -ir verbs (comer, vivir)', ar: 'المضارع: الأفعال المنتهية بـ er و ir (comer, vivir)', ru: 'Настоящее время: глаголы на -er и -ir (comer, vivir)' },
        explain: {
          he: ['comer (לאכול): como, comes, come, comemos, comen.', 'vivir (לגור): vivo, vives, vive, vivimos, viven.', 'בהווה ההבדל היחיד ביניהם הוא ב"אנחנו": comemos / vivimos.'],
          en: ['comer (to eat): como, comes, come, comemos, comen.', 'vivir (to live): vivo, vives, vive, vivimos, viven.', 'In the present they only differ in "we": comemos / vivimos.'],
          ar: ['comer (يأكل): como, comes, come, comemos, comen.', 'vivir (يسكن): vivo, vives, vive, vivimos, viven.', 'الفرق الوحيد بينهما في المضارع هو مع «نحن»: comemos / vivimos.'],
          ru: ['comer (есть): como, comes, come, comemos, comen.', 'vivir (жить): vivo, vives, vive, vivimos, viven.', 'В настоящем времени они различаются только в «мы»: comemos / vivimos.']
        },
        table: [['yo', 'como · vivo'], ['tú', 'comes · vives'], ['él / ella', 'come · vive'], ['nosotros', 'comemos · vivimos'], ['ellos', 'comen · viven']],
        ex: [
          ['¿Dónde vives?', 'איפה אתה גר?', 'Where do you live?', 'أين تسكن؟', 'Где ты живёшь?'],
          ['Comemos a las dos.', 'אנחנו אוכלים בשתיים.', 'We eat at two.', 'نأكل في الثانية.', 'Мы обедаем в два.'],
          ['No entiendo.', 'אני לא מבין.', "I don't understand.", 'لا أفهم.', 'Я не понимаю.'],
          ['El museo abre a las diez.', 'המוזיאון נפתח בעשר.', 'The museum opens at ten.', 'يفتح المتحف في العاشرة.', 'Музей открывается в десять.']
        ],
        drills: [['Yo ___ en Sevilla.', 'vivo', ['vivo', 'vive', 'vivimos']], ['¿Qué ___ tú?', 'comes', ['como', 'comes', 'comen']], ['Nosotros ___ en un piso.', 'vivimos', ['vivimos', 'vivemos', 'viven']], ['Ellos no ___ carne.', 'comen', ['come', 'comen', 'comemos']]]
      },
      {
        id: 'irregular', icon: '⚡', level: 'A1',
        title: { he: 'פעלים חריגים חשובים: tener, ir, hacer', en: 'Key irregular verbs: tener, ir, hacer', ar: 'أفعال شاذة مهمة: tener, ir, hacer', ru: 'Важные неправильные глаголы: tener, ir, hacer' },
        explain: {
          he: ['tener (יש לי / להחזיק): tengo, tienes, tiene, tenemos, tienen.', 'ir (ללכת / לנסוע): voy, vas, va, vamos, van.', 'hacer (לעשות): hago, haces, hace, hacemos, hacen · Hace calor = חם.'],
          en: ['tener (to have): tengo, tienes, tiene, tenemos, tienen.', 'ir (to go): voy, vas, va, vamos, van.', 'hacer (to do / make): hago, haces, hace, hacemos, hacen · Hace calor = it is hot.'],
          ar: ['tener (يملك): tengo, tienes, tiene, tenemos, tienen.', 'ir (يذهب): voy, vas, va, vamos, van.', 'hacer (يفعل / يصنع): hago, haces, hace, hacemos, hacen · Hace calor = الجو حار.'],
          ru: ['tener (иметь): tengo, tienes, tiene, tenemos, tienen.', 'ir (идти, ехать): voy, vas, va, vamos, van.', 'hacer (делать): hago, haces, hace, hacemos, hacen · Hace calor = жарко.']
        },
        table: [['yo', 'tengo · voy · hago'], ['tú', 'tienes · vas · haces'], ['él / ella', 'tiene · va · hace'], ['nosotros', 'tenemos · vamos · hacemos'], ['ellos', 'tienen · van · hacen']],
        ex: [
          ['Tengo una pregunta.', 'יש לי שאלה.', 'I have a question.', 'عندي سؤال.', 'У меня есть вопрос.'],
          ['Vamos a la playa.', 'אנחנו הולכים לחוף.', 'We are going to the beach.', 'نذهب إلى الشاطئ.', 'Мы идём на пляж.'],
          ['Hoy hace mucho calor.', 'היום חם מאוד.', 'It is very hot today.', 'الجو حار جدًا اليوم.', 'Сегодня очень жарко.'],
          ['¿Tienes hambre?', 'אתה רעב?', 'Are you hungry?', 'هل أنت جائع؟', 'Ты голоден?']
        ],
        drills: [['Yo ___ dos hermanos.', 'tengo', ['tengo', 'tiene', 'teno']], ['Ellos ___ al museo.', 'van', ['va', 'van', 'vamos']], ['¿Qué ___ tú mañana?', 'haces', ['hago', 'haces', 'hace']], ['Nosotros ___ a Madrid.', 'vamos', ['vamos', 'van', 'voy']]]
      },
      {
        id: 'questions', icon: '❓', level: 'A1',
        title: { he: 'מילות שאלה: qué, dónde, cuándo, cuánto…', en: 'Question words: qué, dónde, cuándo, cuánto…', ar: 'كلمات السؤال: qué, dónde, cuándo, cuánto…', ru: 'Вопросительные слова: qué, dónde, cuándo, cuánto…' },
        explain: {
          he: ['בספרדית פותחים שאלה ב-¿ וסוגרים ב-?.', 'qué = מה, dónde = איפה, cuándo = מתי, cuánto = כמה, quién = מי, cómo = איך, por qué = למה.', 'מילות שאלה נכתבות תמיד עם סימן הטעמה: ¿Dónde?, ¿Cuándo?'],
          en: ['Spanish questions open with ¿ and close with ?.', 'qué = what, dónde = where, cuándo = when, cuánto = how much, quién = who, cómo = how, por qué = why.', 'Question words always carry an accent: ¿Dónde?, ¿Cuándo?'],
          ar: ['في الإسبانية يبدأ السؤال بـ ¿ وينتهي بـ ?.', 'qué = ماذا، dónde = أين، cuándo = متى، cuánto = كم، quién = من، cómo = كيف، por qué = لماذا.', 'كلمات السؤال تُكتب دائمًا بعلامة نبر: ¿Dónde?, ¿Cuándo?'],
          ru: ['Испанский вопрос начинается с ¿ и заканчивается ?.', 'qué — что, dónde — где, cuándo — когда, cuánto — сколько, quién — кто, cómo — как, por qué — почему.', 'Вопросительные слова всегда пишутся с ударением: ¿Dónde?, ¿Cuándo?']
        },
        table: [['¿Qué?', '¿Dónde?', '¿Cuándo?'], ['¿Cuánto?', '¿Quién?', '¿Cómo?']],
        ex: [
          ['¿Cuándo sale el tren?', 'מתי יוצאת הרכבת?', 'When does the train leave?', 'متى يغادر القطار؟', 'Когда отправляется поезд?'],
          ['¿Cómo te llamas?', 'איך קוראים לך?', 'What is your name?', 'ما اسمك؟', 'Как тебя зовут?'],
          ['¿Quién es él?', 'מי הוא?', 'Who is he?', 'من هو؟', 'Кто он?'],
          ['¿Por qué está cerrado?', 'למה זה סגור?', 'Why is it closed?', 'لماذا هو مغلق؟', 'Почему закрыто?']
        ],
        drills: [['¿___ está la estación?', 'Dónde', ['Dónde', 'Cuándo', 'Quién']], ['¿___ cuesta el billete?', 'Cuánto', ['Cuánto', 'Cómo', 'Qué']], ['¿___ te llamas?', 'Cómo', ['Qué', 'Cómo', 'Dónde']], ['¿___ abre el museo?', 'Cuándo', ['Cuándo', 'Quién', 'Cuánto']]]
      },
      {
        id: 'gustar', icon: '❤️', level: 'A2',
        title: { he: 'gustar — איך אומרים שאוהבים', en: 'Gustar — saying what you like', ar: 'gustar — كيف نعبّر عمّا نحب', ru: 'Gustar — как сказать, что нравится' },
        explain: {
          he: ['gustar פירושו בעצם "מוצא חן": Me gusta el café = הקפה מוצא חן בעיניי.', 'gusta עם דבר אחד או פועל, gustan עם רבים: Me gustan los museos.', 'למי: me (לי), te (לך), le (לו / לה), nos (לנו), les (להם).'],
          en: ['gustar literally means "to please": Me gusta el café = coffee pleases me.', 'gusta with one thing or a verb, gustan with plural things: Me gustan los museos.', 'Who likes it: me, te, le, nos, les (me, you, him / her, us, them).'],
          ar: ['gustar معناه حرفيًا «يُعجب»: Me gusta el café = تعجبني القهوة.', 'gusta مع شيء واحد أو فعل، وgustan مع الجمع: Me gustan los museos.', 'لمن: me (لي)، te (لك)، le (له / لها)، nos (لنا)، les (لهم).'],
          ru: ['gustar буквально «нравиться»: Me gusta el café = мне нравится кофе.', 'gusta — с одним предметом или глаголом, gustan — с множественным: Me gustan los museos.', 'Кому: me (мне), te (тебе), le (ему / ей), nos (нам), les (им).']
        },
        table: [['me gusta', 'el café · viajar'], ['me gustan', 'los museos · las playas']],
        ex: [
          ['Me gusta viajar.', 'אני אוהב לטייל.', 'I like travelling.', 'أحب السفر.', 'Я люблю путешествовать.'],
          ['¿Te gusta la comida española?', 'אתה אוהב אוכל ספרדי?', 'Do you like Spanish food?', 'هل يعجبك الطعام الإسباني؟', 'Тебе нравится испанская еда?'],
          ['Nos gustan las playas.', 'אנחנו אוהבים חופים.', 'We like beaches.', 'نحب الشواطئ.', 'Нам нравятся пляжи.'],
          ['No me gusta el frío.', 'אני לא אוהב קור.', "I don't like the cold.", 'لا أحب البرد.', 'Я не люблю холод.']
        ],
        drills: [['Me ___ el chocolate.', 'gusta', ['gusta', 'gustan', 'gusto']], ['Me ___ los perros.', 'gustan', ['gusta', 'gustan', 'gusto']], ['¿___ gusta bailar?', 'Te', ['Te', 'Tú', 'Yo']], ['A ella ___ gusta el mar.', 'le', ['le', 'la', 'me']]]
      },
      {
        id: 'ir-a', icon: '⏭️', level: 'A2',
        title: { he: 'עתיד קרוב: ir a + פועל', en: 'The near future: ir a + infinitive', ar: 'المستقبل القريب: ir a + المصدر', ru: 'Ближайшее будущее: ir a + инфинитив' },
        explain: {
          he: ['הדרך הקלה לדבר על העתיד: ir (בהטיה) + a + שם הפועל.', 'Voy a comer = אני הולך לאכול. Vamos a visitar Madrid.', 'שאלה: ¿Qué vas a hacer mañana? — מה אתה עומד לעשות מחר?'],
          en: ['The easy way to talk about the future: ir (conjugated) + a + infinitive.', 'Voy a comer = I am going to eat. Vamos a visitar Madrid.', 'Question: ¿Qué vas a hacer mañana? — What are you going to do tomorrow?'],
          ar: ['الطريقة السهلة للحديث عن المستقبل: ir (مصرّفًا) + a + المصدر.', 'Voy a comer = سآكل. Vamos a visitar Madrid.', 'سؤال: ¿Qué vas a hacer mañana? — ماذا ستفعل غدًا؟'],
          ru: ['Простой способ говорить о будущем: ir (в нужной форме) + a + инфинитив.', 'Voy a comer = я собираюсь поесть. Vamos a visitar Madrid.', 'Вопрос: ¿Qué vas a hacer mañana? — Что ты будешь делать завтра?']
        },
        table: [['yo', 'voy a comer'], ['tú', 'vas a comer'], ['él / ella', 'va a comer'], ['nosotros', 'vamos a comer'], ['ellos', 'van a comer']],
        ex: [
          ['Voy a reservar una mesa.', 'אני הולך להזמין שולחן.', 'I am going to book a table.', 'سأحجز طاولة.', 'Я забронирую столик.'],
          ['Vamos a tomar el metro.', 'ניסע ברכבת התחתית.', 'We are going to take the metro.', 'سنركب المترو.', 'Мы поедем на метро.'],
          ['¿Qué vas a hacer mañana?', 'מה אתה עומד לעשות מחר?', 'What are you going to do tomorrow?', 'ماذا ستفعل غدًا؟', 'Что ты будешь делать завтра?'],
          ['Va a llover.', 'עומד לרדת גשם.', 'It is going to rain.', 'ستمطر.', 'Будет дождь.']
        ],
        drills: [['Yo voy ___ cenar en casa.', 'a', ['a', 'de', 'en']], ['Ellos ___ a viajar en julio.', 'van', ['va', 'van', 'vamos']], ['¿Qué ___ a comprar tú?', 'vas', ['voy', 'vas', 'va']], ['Nosotros vamos a ___ el museo.', 'visitar', ['visitar', 'visitamos', 'visita']]]
      },
      {
        id: 'preterite', icon: '⏮️', level: 'A2',
        title: { he: 'עבר: pretérito (hablé, comí)', en: 'The past: pretérito (hablé, comí)', ar: 'الماضي: pretérito (hablé, comí)', ru: 'Прошедшее время: pretérito (hablé, comí)' },
        explain: {
          he: ['לפעולה שהסתיימה: ‎-ar → é, aste, ó, amos, aron (hablé, hablaste, habló…).', '‎-er / -ir → í, iste, ió, imos, ieron (comí, comiste, comió…).', 'חריגים חשובים: fui (הלכתי / הייתי), tuve (היה לי), hice (עשיתי).'],
          en: ['For finished actions: -ar → é, aste, ó, amos, aron (hablé, hablaste, habló…).', '-er / -ir → í, iste, ió, imos, ieron (comí, comiste, comió…).', 'Key irregulars: fui (I went / was), tuve (I had), hice (I did).'],
          ar: ['للأفعال المنتهية: ‎-ar ← é, aste, ó, amos, aron (hablé, hablaste, habló…).', '‎-er / -ir ← í, iste, ió, imos, ieron (comí, comiste, comió…).', 'شواذ مهمة: fui (ذهبت / كنت)، tuve (كان لدي)، hice (فعلت).'],
          ru: ['О завершённом действии: -ar → é, aste, ó, amos, aron (hablé, hablaste, habló…).', '-er / -ir → í, iste, ió, imos, ieron (comí, comiste, comió…).', 'Важные исключения: fui (я ходил / был), tuve (у меня было), hice (я сделал).']
        },
        table: [['yo', 'hablé · comí · fui'], ['tú', 'hablaste · comiste · fuiste'], ['él / ella', 'habló · comió · fue'], ['nosotros', 'hablamos · comimos · fuimos'], ['ellos', 'hablaron · comieron · fueron']],
        ex: [
          ['Ayer visité el museo.', 'אתמול ביקרתי במוזיאון.', 'Yesterday I visited the museum.', 'زرت المتحف أمس.', 'Вчера я был в музее.'],
          ['Comimos paella en Valencia.', 'אכלנו פאייה בוולנסיה.', 'We ate paella in Valencia.', 'أكلنا الباييا في فالنسيا.', 'Мы ели паэлью в Валенсии.'],
          ['¿Fuiste a la playa?', 'הלכת לחוף?', 'Did you go to the beach?', 'هل ذهبت إلى الشاطئ؟', 'Ты ходил на пляж?'],
          ['El viaje fue fantástico.', 'הטיול היה מעולה.', 'The trip was fantastic.', 'كانت الرحلة رائعة.', 'Поездка была замечательной.']
        ],
        drills: [['Ayer yo ___ con mi madre.', 'hablé', ['hablo', 'hablé', 'habló']], ['Nosotros ___ en un restaurante.', 'comimos', ['comemos', 'comimos', 'comieron']], ['Ella ___ a Barcelona.', 'fue', ['fue', 'fui', 'va']], ['¿Tú ___ la catedral?', 'visitaste', ['visitaste', 'visitó', 'visitas']]]
      },
      {
        id: 'possessives', icon: '🏷️', level: 'A2',
        title: { he: 'שייכות: mi, tu, su, nuestro', en: 'Possessives: mi, tu, su, nuestro', ar: 'الملكية: mi, tu, su, nuestro', ru: 'Притяжательные: mi, tu, su, nuestro' },
        explain: {
          he: ['mi = שלי, tu = שלך, su = שלו / שלה / שלכם (בנימוס), nuestro / nuestra = שלנו.', 'ברבים מוסיפים s: mis maletas, tus amigos.', 'nuestro משתנה לפי מין: nuestro hotel, nuestra habitación.'],
          en: ['mi = my, tu = your, su = his / her / your (polite), nuestro / nuestra = our.', 'Add -s in the plural: mis maletas, tus amigos.', 'nuestro changes with gender: nuestro hotel, nuestra habitación.'],
          ar: ['mi = ـي، tu = ـك، su = ـه / ـها / ـكم (للتهذيب)، nuestro / nuestra = ـنا.', 'في الجمع نضيف s: mis maletas, tus amigos.', 'nuestro يتغير حسب الجنس: nuestro hotel, nuestra habitación.'],
          ru: ['mi — мой, tu — твой, su — его / её / ваш (вежл.), nuestro / nuestra — наш.', 'Во множественном числе + s: mis maletas, tus amigos.', 'nuestro меняется по роду: nuestro hotel, nuestra habitación.']
        },
        table: [['mi', 'mis'], ['tu', 'tus'], ['su', 'sus'], ['nuestro · nuestra', 'nuestros · nuestras']],
        ex: [
          ['Esta es mi maleta.', 'זאת המזוודה שלי.', 'This is my suitcase.', 'هذه حقيبتي.', 'Это мой чемодан.'],
          ['¿Cuál es tu número?', 'מה המספר שלך?', 'What is your number?', 'ما رقمك؟', 'Какой у тебя номер?'],
          ['Nuestro hotel está en el centro.', 'המלון שלנו במרכז.', 'Our hotel is in the centre.', 'فندقنا في وسط المدينة.', 'Наш отель в центре.'],
          ['Su pasaporte, por favor.', 'הדרכון שלך, בבקשה.', 'Your passport, please.', 'جواز سفرك، من فضلك.', 'Ваш паспорт, пожалуйста.']
        ],
        drills: [['Yo tengo ___ billete aquí.', 'mi', ['mi', 'mis', 'nuestra']], ['¿Dónde están ___ maletas?', 'mis', ['mi', 'mis', 'nuestro']], ['Nosotros buscamos ___ habitación.', 'nuestra', ['nuestro', 'nuestra', 'mis']], ['Ellos tienen ___ pasaportes.', 'sus', ['su', 'sus', 'tu']]]
      }
    ],

    fr: [
      {
        id: 'etre-avoir', icon: '🧩', level: 'A1',
        title: { he: 'être ו-avoir — "להיות" ו"שיש לי"', en: 'Être and avoir — "to be" and "to have"', ar: 'être و avoir — «يكون» و«يملك»', ru: 'Être и avoir — «быть» и «иметь»' },
        explain: {
          he: ['être (להיות): je suis, tu es, il / elle est, nous sommes, vous êtes, ils sont.', "avoir (שיש לי): j'ai, tu as, il a, nous avons, vous avez, ils ont.", "בצרפתית אומרים \"יש לי\" לגיל, לרעב ולקור: J'ai 25 ans. J'ai faim."],
          en: ['être (to be): je suis, tu es, il / elle est, nous sommes, vous êtes, ils sont.', "avoir (to have): j'ai, tu as, il a, nous avons, vous avez, ils ont.", "French uses \"have\" for age, hunger and cold: J'ai 25 ans. J'ai faim."],
          ar: ['être (يكون): je suis, tu es, il / elle est, nous sommes, vous êtes, ils sont.', "avoir (يملك): j'ai, tu as, il a, nous avons, vous avez, ils ont.", "في الفرنسية نقول «لدي» للعمر والجوع والبرد: J'ai 25 ans. J'ai faim."],
          ru: ['être (быть): je suis, tu es, il / elle est, nous sommes, vous êtes, ils sont.', "avoir (иметь): j'ai, tu as, il a, nous avons, vous avez, ils ont.", "Возраст, голод и холод выражают через «иметь»: J'ai 25 ans. J'ai faim."]
        },
        table: [['je', "suis · j'ai"], ['tu', 'es · as'], ['il / elle', 'est · a'], ['nous', 'sommes · avons'], ['vous', 'êtes · avez'], ['ils / elles', 'sont · ont']],
        ex: [
          ['Je suis étudiant.', 'אני סטודנט.', 'I am a student.', 'أنا طالب.', 'Я студент.'],
          ["J'ai faim.", 'אני רעב.', 'I am hungry.', 'أنا جائع.', 'Я голоден.'],
          ['Le musée est fermé.', 'המוזיאון סגור.', 'The museum is closed.', 'المتحف مغلق.', 'Музей закрыт.'],
          ['Nous avons une réservation.', 'יש לנו הזמנה.', 'We have a reservation.', 'لدينا حجز.', 'У нас есть бронь.']
        ],
        drills: [['Je ___ français.', 'suis', ['suis', 'es', 'ai']], ['Tu ___ faim?', 'as', ['as', 'es', 'a']], ['Nous ___ en vacances.', 'sommes', ['sommes', 'avons', 'sont']], ['Ils ___ deux enfants.', 'ont', ['ont', 'sont', 'a']]]
      },
      {
        id: 'articles', icon: '📰', level: 'A1',
        title: { he: 'מין ומיליות: le, la, les, un, une, des', en: 'Gender and articles: le, la, les, un, une, des', ar: 'الجنس وأدوات التعريف: le, la, les, un, une, des', ru: 'Род и артикли: le, la, les, un, une, des' },
        explain: {
          he: ["לכל שם עצם יש מין. זכר: le (le train), נקבה: la (la gare). לפני תנועה: l' (l'hôtel).", 'ברבים תמיד les: les trains, les gares. ה-s בסוף לא נשמעת.', 'אחד / אחת: un (un billet), une (une table). ברבים: des (des billets).'],
          en: ["Every noun has a gender. Masculine: le (le train), feminine: la (la gare). Before a vowel: l' (l'hôtel).", 'The plural is always les: les trains, les gares. The final s is silent.', '"A": un (un billet), une (une table). Plural: des (des billets).'],
          ar: ["لكل اسم جنس. المذكر: le (le train)، المؤنث: la (la gare). قبل حرف علة: l' (l'hôtel).", 'الجمع دائمًا les: les trains, les gares. حرف s في النهاية لا يُنطق.', 'النكرة: un (un billet)، une (une table). الجمع: des (des billets).'],
          ru: ["У каждого существительного есть род. Мужской: le (le train), женский: la (la gare). Перед гласной: l' (l'hôtel).", 'Во множественном всегда les: les trains, les gares. Конечная s не читается.', 'Неопределённый: un (un billet), une (une table). Множественное: des (des billets).']
        },
        table: [['le train', 'les trains'], ['la gare', 'les gares'], ["l'hôtel", 'les hôtels'], ['un billet · une table', 'des billets · des tables']],
        ex: [
          ['Le train part à huit heures.', 'הרכבת יוצאת בשמונה.', 'The train leaves at eight.', 'يغادر القطار في الثامنة.', 'Поезд отправляется в восемь.'],
          ['La plage est près.', 'החוף קרוב.', 'The beach is close.', 'الشاطئ قريب.', 'Пляж рядом.'],
          ["Je voudrais une bouteille d'eau.", 'הייתי רוצה בקבוק מים.', 'I would like a bottle of water.', 'أريد زجاجة ماء.', 'Я бы хотел бутылку воды.'],
          ['Les valises sont dans la chambre.', 'המזוודות בחדר.', 'The suitcases are in the room.', 'الحقائب في الغرفة.', 'Чемоданы в номере.']
        ],
        drills: [['___ gare est loin.', 'La', ['Le', 'La', 'Les']], ['___ train est en retard.', 'Le', ['Le', 'La', "L'"]], ["J'ai ___ question.", 'une', ['un', 'une', 'des']], ['___ billets sont ici.', 'Les', ['Le', 'La', 'Les']]]
      },
      {
        id: 'er-verbs', icon: '🔁', level: 'A1',
        title: { he: 'הווה: פעלים ב-er (parler)', en: 'Present tense: -er verbs (parler)', ar: 'المضارع: الأفعال المنتهية بـ er (parler)', ru: 'Настоящее время: глаголы на -er (parler)' },
        explain: {
          he: ['פעלים ב-er: מורידים er ומוסיפים סיומת: je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent.', 'ב-parle, parles ו-parlent הסוף לא נשמע — שלושתם נשמעים "פַּארְל".', "לפני תנועה je הופך ל-j': j'aime, j'habite."],
          en: ['-er verbs: drop -er and add the ending: je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent.', 'parle, parles and parlent all sound the same — "parl".', "Before a vowel je becomes j': j'aime, j'habite."],
          ar: ['الأفعال المنتهية بـ er: نحذف er ونضيف النهاية: je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent.', 'parle و parles و parlent تُنطق كلها «بارل».', "قبل حرف علة يصبح je ‏j': j'aime, j'habite."],
          ru: ['Глаголы на -er: отбрасываем -er и добавляем окончание: je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent.', 'parle, parles и parlent звучат одинаково — «парль».', "Перед гласной je становится j': j'aime, j'habite."]
        },
        table: [['je', 'parle'], ['tu', 'parles'], ['il / elle', 'parle'], ['nous', 'parlons'], ['vous', 'parlez'], ['ils / elles', 'parlent']],
        ex: [
          ['Je parle un peu français.', 'אני מדבר קצת צרפתית.', 'I speak a little French.', 'أتكلم قليلًا من الفرنسية.', 'Я немного говорю по-французски.'],
          ['Tu habites où?', 'איפה אתה גר?', 'Where do you live?', 'أين تسكن؟', 'Где ты живёшь?'],
          ["Nous attendons le bus.", 'אנחנו מחכים לאוטובוס.', 'We are waiting for the bus.', 'ننتظر الحافلة.', 'Мы ждём автобус.'],
          ['Ils mangent au restaurant.', 'הם אוכלים במסעדה.', 'They eat at the restaurant.', 'يأكلون في المطعم.', 'Они едят в ресторане.']
        ],
        drills: [['Je ___ dans un hôtel.', 'travaille', ['travaille', 'travailles', 'travaillez']], ['Tu ___ anglais?', 'parles', ['parle', 'parles', 'parlons']], ['Nous ___ un taxi.', 'appelons', ['appelons', 'appellent', 'appelez']], ['Vous ___ ici?', 'habitez', ['habitez', 'habitons', 'habite']]]
      },
      {
        id: 'negation', icon: '🚫', level: 'A1',
        title: { he: 'שלילה: ne … pas', en: 'Saying no: ne … pas', ar: 'النفي: ne … pas', ru: 'Отрицание: ne … pas' },
        explain: {
          he: ['שלילה עוטפת את הפועל: ne לפניו ו-pas אחריו: Je ne parle pas anglais.', "לפני תנועה ne הופך ל-n': Je n'ai pas de billet.", 'בדיבור מהיר הרבה פעמים משמיטים את ne: Je sais pas.'],
          en: ['The negative wraps the verb: ne before it, pas after it: Je ne parle pas anglais.', "Before a vowel ne becomes n': Je n'ai pas de billet.", 'In fast speech ne is often dropped: Je sais pas.'],
          ar: ['النفي يحيط بالفعل: ne قبله و pas بعده: Je ne parle pas anglais.', "قبل حرف علة يصبح ne ‏n': Je n'ai pas de billet.", 'في الكلام السريع كثيرًا ما تُحذف ne: Je sais pas.'],
          ru: ['Отрицание обнимает глагол: ne перед ним, pas после: Je ne parle pas anglais.', "Перед гласной ne становится n': Je n'ai pas de billet.", 'В быстрой речи ne часто опускают: Je sais pas.']
        },
        table: [['je parle', 'je ne parle pas'], ["c'est loin", "ce n'est pas loin"], ["j'ai un billet", "je n'ai pas de billet"]],
        ex: [
          ['Je ne parle pas anglais.', 'אני לא מדבר אנגלית.', "I don't speak English.", 'لا أتكلم الإنجليزية.', 'Я не говорю по-английски.'],
          ["Ce n'est pas loin.", 'זה לא רחוק.', "It isn't far.", 'ليس بعيدًا.', 'Это недалеко.'],
          ["Je n'ai pas de réservation.", 'אין לי הזמנה.', "I don't have a reservation.", 'ليس لدي حجز.', 'У меня нет брони.'],
          ['Le musée ne ferme pas à midi.', 'המוזיאון לא נסגר בצהריים.', "The museum doesn't close at noon.", 'المتحف لا يُغلق ظهرًا.', 'Музей не закрывается в полдень.']
        ],
        drills: [['Je ne parle ___ espagnol.', 'pas', ['pas', 'ne', 'plus']], ['Ce ___ pas cher.', "n'est", ["n'est", 'est', 'ne']], ["Je n'ai pas ___ billet.", 'de', ['de', 'un', 'le']], ['Nous ___ mangeons pas ici.', 'ne', ['ne', 'pas', "n'"]]]
      },
      {
        id: 'irregular', icon: '⚡', level: 'A1',
        title: { he: 'פעלים חריגים: aller, faire, vouloir, pouvoir', en: 'Irregular verbs: aller, faire, vouloir, pouvoir', ar: 'أفعال شاذة: aller, faire, vouloir, pouvoir', ru: 'Неправильные глаголы: aller, faire, vouloir, pouvoir' },
        explain: {
          he: ['aller (ללכת): je vais, tu vas, il va, nous allons, vous allez, ils vont.', 'faire (לעשות): je fais, tu fais, il fait, nous faisons, vous faites, ils font.', "vouloir (לרצות): je veux · pouvoir (יכול): je peux. בנימוס אומרים je voudrais — \"הייתי רוצה\"."],
          en: ['aller (to go): je vais, tu vas, il va, nous allons, vous allez, ils vont.', 'faire (to do / make): je fais, tu fais, il fait, nous faisons, vous faites, ils font.', 'vouloir (to want): je veux · pouvoir (can): je peux. Politely: je voudrais — "I would like".'],
          ar: ['aller (يذهب): je vais, tu vas, il va, nous allons, vous allez, ils vont.', 'faire (يفعل): je fais, tu fais, il fait, nous faisons, vous faites, ils font.', 'vouloir (يريد): je veux · pouvoir (يستطيع): je peux. بأدب نقول je voudrais — «أودّ».'],
          ru: ['aller (идти): je vais, tu vas, il va, nous allons, vous allez, ils vont.', 'faire (делать): je fais, tu fais, il fait, nous faisons, vous faites, ils font.', 'vouloir (хотеть): je veux · pouvoir (мочь): je peux. Вежливо: je voudrais — «я бы хотел».']
        },
        table: [['aller', 'vais · vas · va · allons · allez · vont'], ['faire', 'fais · fais · fait · faisons · faites · font'], ['vouloir', 'veux · veux · veut · voulons · voulez · veulent'], ['pouvoir', 'peux · peux · peut · pouvons · pouvez · peuvent']],
        ex: [
          ['Je vais à la gare.', 'אני הולך לתחנת הרכבת.', "I'm going to the station.", 'أذهب إلى المحطة.', 'Я иду на вокзал.'],
          ['Il fait beau aujourd\'hui.', 'מזג האוויר יפה היום.', 'The weather is nice today.', 'الطقس جميل اليوم.', 'Сегодня хорошая погода.'],
          ['Je voudrais un croissant.', 'הייתי רוצה קרואסון.', 'I would like a croissant.', 'أودّ كرواسون.', 'Я бы хотел круассан.'],
          ['Vous pouvez répéter, s\'il vous plaît?', 'אפשר לחזור על זה, בבקשה?', 'Could you repeat, please?', 'هل يمكنك أن تكرر من فضلك؟', 'Повторите, пожалуйста.']
        ],
        drills: [['Nous ___ au musée.', 'allons', ['allons', 'allez', 'vont']], ['Qu\'est-ce que tu ___ ce soir?', 'fais', ['fais', 'fait', 'faites']], ['Je ___ un café, s\'il vous plaît.', 'voudrais', ['voudrais', 'veut', 'voulons']], ['Ils ___ venir demain.', 'peuvent', ['peut', 'peuvent', 'pouvez']]]
      },
      {
        id: 'questions', icon: '❓', level: 'A1',
        title: { he: 'שאלות: est-ce que, où, quand, combien', en: 'Questions: est-ce que, où, quand, combien', ar: 'الأسئلة: est-ce que, où, quand, combien', ru: 'Вопросы: est-ce que, où, quand, combien' },
        explain: {
          he: ['הדרך הקלה: משפט רגיל עם טון עולה: Vous parlez anglais?', 'או להוסיף est-ce que בהתחלה: Est-ce que vous parlez anglais?', 'où = איפה, quand = מתי, combien = כמה, comment = איך, pourquoi = למה, qui = מי, quoi / qu\'est-ce que = מה.'],
          en: ['The easy way: a normal sentence with a rising tone: Vous parlez anglais?', 'Or add est-ce que at the start: Est-ce que vous parlez anglais?', "où = where, quand = when, combien = how much, comment = how, pourquoi = why, qui = who, quoi / qu'est-ce que = what."],
          ar: ['الطريقة السهلة: جملة عادية بنبرة صاعدة: Vous parlez anglais?', 'أو نضيف est-ce que في البداية: Est-ce que vous parlez anglais?', "où = أين، quand = متى، combien = كم، comment = كيف، pourquoi = لماذا، qui = من، quoi / qu'est-ce que = ماذا."],
          ru: ['Простой способ: обычная фраза с повышением тона: Vous parlez anglais?', 'Или добавить est-ce que в начале: Est-ce que vous parlez anglais?', "où = где, quand = когда, combien = сколько, comment = как, pourquoi = почему, qui = кто, quoi / qu'est-ce que = что."]
        },
        table: [['où', 'quand', 'combien'], ['comment', 'pourquoi', 'qui']],
        ex: [
          ['Où sont les toilettes?', 'איפה השירותים?', 'Where are the toilets?', 'أين الحمّامات؟', 'Где туалет?'],
          ['Quand part le train?', 'מתי הרכבת יוצאת?', 'When does the train leave?', 'متى يغادر القطار؟', 'Когда отправляется поезд?'],
          ['Est-ce que vous parlez anglais?', 'אתה מדבר אנגלית?', 'Do you speak English?', 'هل تتكلم الإنجليزية؟', 'Вы говорите по-английски?'],
          ["Qu'est-ce que c'est?", 'מה זה?', 'What is it?', 'ما هذا؟', 'Что это?']
        ],
        drills: [['___ est la gare?', 'Où', ['Où', 'Quand', 'Qui']], ['___ coûte le billet?', 'Combien', ['Combien', 'Comment', 'Où']], ['___ tu t\'appelles?', 'Comment', ['Comment', 'Pourquoi', 'Combien']], ['___ ferme le musée?', 'Quand', ['Quand', 'Qui', 'Où']]]
      },
      {
        id: 'partitive', icon: '🥖', level: 'A2',
        title: { he: 'קצת מ…: du, de la, des', en: 'Some: du, de la, des', ar: 'بعض: du, de la, des', ru: 'Немного чего-то: du, de la, des' },
        explain: {
          he: ['כשמזמינים "קצת" ממשהו שלא סופרים — אוכל, שתייה: du (זכר), de la (נקבה), de l\' (לפני תנועה).', 'Je voudrais du pain, de la soupe, de l\'eau.', "בשלילה כולם הופכים ל-de: Je ne veux pas de sucre."],
          en: ["For \"some\" of something you don't count — food, drinks: du (masc.), de la (fem.), de l' (before a vowel).", "Je voudrais du pain, de la soupe, de l'eau.", 'After a negative they all become de: Je ne veux pas de sucre.'],
          ar: ["لـ«بعض» من شيء لا يُعدّ — طعام أو شراب: du (مذكر)، de la (مؤنث)، de l' (قبل حرف علة).", "Je voudrais du pain, de la soupe, de l'eau.", 'بعد النفي تصبح كلها de: Je ne veux pas de sucre.'],
          ru: ["Для «немного» того, что не считают, — еды и напитков: du (м. р.), de la (ж. р.), de l' (перед гласной).", "Je voudrais du pain, de la soupe, de l'eau.", 'После отрицания всё становится de: Je ne veux pas de sucre.']
        },
        table: [['du pain', 'du café'], ['de la soupe', 'de la salade'], ["de l'eau", 'des frites']],
        ex: [
          ['Je voudrais du pain.', 'הייתי רוצה לחם.', 'I would like some bread.', 'أريد بعض الخبز.', 'Я бы хотел хлеба.'],
          ["Vous avez de l'eau?", 'יש לכם מים?', 'Do you have water?', 'هل لديكم ماء؟', 'У вас есть вода?'],
          ['Nous prenons de la salade.', 'אנחנו לוקחים סלט.', 'We will have salad.', 'سنأخذ سلطة.', 'Мы возьмём салат.'],
          ['Je ne mange pas de viande.', 'אני לא אוכל בשר.', "I don't eat meat.", 'لا آكل اللحم.', 'Я не ем мясо.']
        ],
        drills: [['Je voudrais ___ café.', 'du', ['du', 'de la', 'des']], ['Vous avez ___ soupe?', 'de la', ['du', 'de la', "de l'"]], ['Vous avez ___ pain?', 'du', ['du', 'de la', 'des']], ['Je ne veux pas ___ sucre.', 'de', ['de', 'du', 'des']]]
      },
      {
        id: 'futur-proche', icon: '⏭️', level: 'A2',
        title: { he: 'עתיד קרוב: aller + פועל', en: 'Near future: aller + verb', ar: 'المستقبل القريب: aller + فعل', ru: 'Ближайшее будущее: aller + глагол' },
        explain: {
          he: ['הדרך הכי נפוצה לדבר על עתיד: aller בהווה + פועל בשם הפועל.', 'Je vais visiter le Louvre — אני הולך לבקר בלובר.', 'שלילה עוטפת את aller: Je ne vais pas prendre le bus.'],
          en: ['The most common way to talk about the future: aller in the present + the infinitive.', "Je vais visiter le Louvre — I'm going to visit the Louvre.", "The negative wraps aller: Je ne vais pas prendre le bus."],
          ar: ['أشيع طريقة للحديث عن المستقبل: aller في المضارع + المصدر.', 'Je vais visiter le Louvre — سأزور اللوفر.', 'النفي يحيط بـ aller: Je ne vais pas prendre le bus.'],
          ru: ['Самый частый способ говорить о будущем: aller в настоящем + инфинитив.', 'Je vais visiter le Louvre — я собираюсь посетить Лувр.', 'Отрицание обнимает aller: Je ne vais pas prendre le bus.']
        },
        table: [['je vais', 'visiter'], ['tu vas', 'manger'], ['il / elle va', 'partir'], ['nous allons', 'voyager'], ['vous allez', 'réserver'], ['ils / elles vont', 'arriver']],
        ex: [
          ['Je vais visiter le Louvre.', 'אני הולך לבקר בלובר.', "I'm going to visit the Louvre.", 'سأزور اللوفر.', 'Я собираюсь посетить Лувр.'],
          ['Nous allons prendre un taxi.', 'ניקח מונית.', "We're going to take a taxi.", 'سنأخذ تاكسي.', 'Мы возьмём такси.'],
          ['Il va pleuvoir demain.', 'מחר ירד גשם.', "It's going to rain tomorrow.", 'ستمطر غدًا.', 'Завтра будет дождь.'],
          ['Tu vas aimer Paris!', 'אתה תאהב את פריז!', "You're going to love Paris!", 'ستحب باريس!', 'Тебе понравится Париж!']
        ],
        drills: [['Je ___ manger au restaurant.', 'vais', ['vais', 'va', 'allons']], ['Nous ___ partir à huit heures.', 'allons', ['allons', 'allez', 'vont']], ['Ils ___ arriver demain.', 'vont', ['va', 'vont', 'vas']], ['Tu ___ prendre le métro?', 'vas', ['vas', 'vais', 'va']]]
      },
      {
        id: 'passe-compose', icon: '⏮️', level: 'A2',
        title: { he: 'עבר: passé composé', en: 'Past tense: passé composé', ar: 'الماضي: passé composé', ru: 'Прошедшее время: passé composé' },
        explain: {
          he: ["עבר = avoir בהווה + צורת עבר של הפועל: j'ai mangé, tu as parlé.", 'פעלים ב-er מקבלים é: manger → mangé. חריגים: fait, pris, vu, eu, été.', 'פעלי תנועה כמו aller, arriver, partir משתמשים ב-être: je suis allé, elle est arrivée.'],
          en: ["Past = avoir in the present + the past participle: j'ai mangé, tu as parlé.", '-er verbs take é: manger → mangé. Irregular: fait, pris, vu, eu, été.', 'Verbs of movement like aller, arriver, partir use être: je suis allé, elle est arrivée.'],
          ar: ["الماضي = avoir في المضارع + اسم المفعول: j'ai mangé, tu as parlé.", 'أفعال er تأخذ é: manger ← mangé. الشاذة: fait, pris, vu, eu, été.', 'أفعال الحركة مثل aller و arriver و partir تستخدم être: je suis allé, elle est arrivée.'],
          ru: ["Прошедшее = avoir в настоящем + причастие: j'ai mangé, tu as parlé.", 'Глаголы на -er получают é: manger → mangé. Неправильные: fait, pris, vu, eu, été.', 'Глаголы движения — aller, arriver, partir — используют être: je suis allé, elle est arrivée.']
        },
        table: [["j'ai", 'mangé'], ['tu as', 'visité'], ['il / elle a', 'pris'], ['nous avons', 'fait'], ['je suis', 'allé(e)'], ['elle est', 'arrivée']],
        ex: [
          ["J'ai mangé une crêpe.", 'אכלתי קרפ.', 'I ate a crêpe.', 'أكلت كريب.', 'Я съел блин.'],
          ['Nous avons visité le musée.', 'ביקרנו במוזיאון.', 'We visited the museum.', 'زرنا المتحف.', 'Мы посетили музей.'],
          ['Tu as pris le train?', 'לקחת את הרכבת?', 'Did you take the train?', 'هل أخذت القطار؟', 'Ты поехал на поезде?'],
          ['Je suis arrivé hier.', 'הגעתי אתמול.', 'I arrived yesterday.', 'وصلت أمس.', 'Я приехал вчера.']
        ],
        drills: [["J'___ mangé au café.", 'ai', ['ai', 'as', 'suis']], ['Nous avons ___ le Louvre.', 'visité', ['visiter', 'visité', 'visitons']], ['Elle ___ arrivée à midi.', 'est', ['est', 'a', 'ai']], ['Tu as ___ des photos?', 'pris', ['pris', 'prendre', 'prends']]]
      },
      {
        id: 'possessives', icon: '🏷️', level: 'A2',
        title: { he: 'שייכות: mon, ma, mes, ton, votre', en: 'Possessives: mon, ma, mes, ton, votre', ar: 'الملكية: mon, ma, mes, ton, votre', ru: 'Притяжательные: mon, ma, mes, ton, votre' },
        explain: {
          he: ['השייכות מתאימה לחפץ, לא לבעלים: mon passeport (זכר), ma valise (נקבה), mes billets (רבים).', 'שלך: ton / ta / tes · שלו או שלה: son / sa / ses · שלנו: notre / nos · שלכם או שלך בנימוס: votre / vos.', 'לפני נקבה שמתחילה בתנועה משתמשים ב-mon: mon adresse.'],
          en: ['The possessive agrees with the thing, not the owner: mon passeport (masc.), ma valise (fem.), mes billets (plural).', 'your: ton / ta / tes · his or her: son / sa / ses · our: notre / nos · your (plural or polite): votre / vos.', 'Before a feminine word starting with a vowel use mon: mon adresse.'],
          ar: ['الملكية تتبع الشيء لا المالك: mon passeport (مذكر)، ma valise (مؤنث)، mes billets (جمع).', 'ـك: ton / ta / tes · ـه أو ـها: son / sa / ses · ـنا: notre / nos · ـكم أو بأدب: votre / vos.', 'قبل كلمة مؤنثة تبدأ بحرف علة نستخدم mon: mon adresse.'],
          ru: ['Притяжательное согласуется с предметом, а не с владельцем: mon passeport (м. р.), ma valise (ж. р.), mes billets (мн. ч.).', 'твой: ton / ta / tes · его или её: son / sa / ses · наш: notre / nos · ваш (или вежливо): votre / vos.', 'Перед словом женского рода на гласную — mon: mon adresse.']
        },
        table: [['mon passeport', 'ma valise', 'mes billets'], ['ton', 'ta', 'tes'], ['son', 'sa', 'ses'], ['votre', 'votre', 'vos']],
        ex: [
          ["J'ai perdu mon passeport.", 'איבדתי את הדרכון שלי.', 'I lost my passport.', 'فقدت جواز سفري.', 'Я потерял паспорт.'],
          ['Voici ma clé.', 'הנה המפתח שלי.', 'Here is my key.', 'ها هو مفتاحي.', 'Вот мой ключ.'],
          ['Où sont vos bagages?', 'איפה המזוודות שלכם?', 'Where is your luggage?', 'أين أمتعتكم؟', 'Где ваш багаж?'],
          ['Ma mère parle français.', 'אמא שלי מדברת צרפתית.', 'My mother speaks French.', 'أمي تتكلم الفرنسية.', 'Моя мама говорит по-французски.']
        ],
        drills: [["J'ai ___ billet ici.", 'mon', ['mon', 'ma', 'mes']], ['Où est ___ valise?', 'ma', ['mon', 'ma', 'mes']], ['Voici ___ passeports.', 'nos', ['notre', 'nos', 'mon']], ['Monsieur, ___ chambre est prête.', 'votre', ['votre', 'vos', 'ton']]]
      }
    ],
    // Hebrew track (for English, Arabic and Russian speakers) — no Hebrew explanations: Hebrew can't be the base language for learning Hebrew
    he: [
      {
        id: 'no-to-be', icon: '🧩', level: 'A1',
        title: { he: 'כינויי גוף ומשפט בלי "להיות"', en: 'Pronouns — and no "to be" in the present', ar: 'الضمائر — وجملة بلا فعل «كان» في الحاضر', ru: 'Местоимения — и без «быть» в настоящем' },
        explain: {
          en: ['In the present, Hebrew has no "am / is / are": אני סטודנט = I (am a) student.', 'אני (I), אתה / את (you, m. / f.), הוא / היא (he / she), אנחנו (we), אתם / אתן (you all), הם / הן (they).', 'There is no "a / an" either: זה מלון = this is a hotel.'],
          ar: ['في الحاضر لا يوجد فعل «يكون» في العبرية: אני סטודנט = أنا طالب — تمامًا كالعربية.', 'אני (أنا)، אתה / את (أنتَ / أنتِ)، הוא / היא (هو / هي)، אנחנו (نحن)، אתם / אתן (أنتم / أنتنّ)، הם / הן (هم / هنّ).', 'ولا توجد أداة نكرة: זה מלון = هذا فندق.'],
          ru: ['В настоящем времени в иврите нет связки «быть» — как в русском: אני סטודנט = я студент.', 'אני (я), אתה / את (ты, м. / ж.), הוא / היא (он / она), אנחנו (мы), אתם / אתן (вы), הם / הן (они).', 'Неопределённого артикля тоже нет: זה מלון = это гостиница.']
        },
        table: [['אני', 'אנחנו'], ['אתה · את', 'אתם · אתן'], ['הוא · היא', 'הם · הן']],
        ex: [
          ['אני סטודנט.', 'אני סטודנט.', 'I am a student.', 'أنا طالب.', 'Я студент.'],
          ['היא מחיפה.', 'היא מחיפה.', 'She is from Haifa.', 'هي من حيفا.', 'Она из Хайфы.'],
          ['אנחנו בתל אביב.', 'אנחנו בתל אביב.', 'We are in Tel Aviv.', 'نحن في تل أبيب.', 'Мы в Тель-Авиве.'],
          ['זה מלון טוב.', 'זה מלון טוב.', 'This is a good hotel.', 'هذا فندق جيد.', 'Это хорошая гостиница.']
        ],
        drills: [['___ סטודנט.', 'אני', ['אני', 'אתה', 'הוא'], { en: 'I', ar: 'أنا', ru: 'я' }], ['___ מירושלים.', 'היא', ['הוא', 'היא', 'הן'], { en: 'she', ar: 'هي', ru: 'она' }], ['___ בבית.', 'אנחנו', ['אנחנו', 'אתם', 'הם'], { en: 'we', ar: 'نحن', ru: 'мы' }], ['___ תיירים.', 'הם', ['הם', 'הן', 'הוא'], { en: 'they, m.', ar: 'هم', ru: 'они (м.)' }]]
      },
      {
        id: 'gender-plural', icon: '👥', level: 'A1',
        title: { he: 'זכר, נקבה ורבים', en: 'Masculine, feminine and plural', ar: 'المذكر والمؤنث والجمع', ru: 'Мужской, женский род и множественное число' },
        explain: {
          en: ['Every noun is masculine or feminine. Feminine words usually end in ה- or ת-: עוגה (cake), מגבת (towel).', 'Plural: masculine adds ים- (כרטיס → כרטיסים), feminine ה- / ת- becomes ות- (עוגה → עוגות).', 'Adjectives follow the noun and agree with it: מלון גדול, עיר גדולה, חדרים גדולים.'],
          ar: ['كل اسم مذكر أو مؤنث. المؤنث ينتهي عادة بـ ה- أو ת-: עוגה (كعكة)، מגבת (منشفة).', 'الجمع: المذكر يضيف ים- (כרטיס ← כרטיסים)، والمؤنث يصبح ות- (עוגה ← עוגות) — يشبه «ـين» و«ـات».', 'الصفة تأتي بعد الاسم وتطابقه: מלון גדול، עיר גדולה، חדרים גדולים.'],
          ru: ['Каждое существительное — мужского или женского рода. Женские обычно оканчиваются на ה- или ת-: עוגה (торт), מגבת (полотенце).', 'Множественное: мужской род + ים- (כרטיס → כרטיסים), женский ה- / ת- → ות- (עוגה → עוגות).', 'Прилагательное стоит после существительного и согласуется с ним: מלון גדול, עיר גדולה, חדרים גדולים.']
        },
        table: [['כרטיס', 'כרטיסים'], ['עוגה', 'עוגות'], ['גדול', 'גדולים'], ['גדולה', 'גדולות']],
        ex: [
          ['שני כרטיסים, בבקשה.', 'שני כרטיסים, בבקשה.', 'Two tickets, please.', 'تذكرتان من فضلك.', 'Два билета, пожалуйста.'],
          ['החדר גדול.', 'החדר גדול.', 'The room is big.', 'الغرفة كبيرة.', 'Комната большая.'],
          ['העיר יפה.', 'העיר יפה.', 'The city is beautiful.', 'المدينة جميلة.', 'Город красивый.'],
          ['העוגות טעימות.', 'העוגות טעימות.', 'The cakes are tasty.', 'الكعكات لذيذة.', 'Торты вкусные.']
        ],
        drills: [['שלושה ___', 'כרטיסים', ['כרטיסים', 'כרטיסות', 'כרטיס'], { en: 'tickets', ar: 'تذاكر', ru: 'билеты' }], ['עיר ___', 'גדולה', ['גדול', 'גדולה', 'גדולים'], { en: 'big', ar: 'كبير', ru: 'большой' }], ['שתי ___', 'עוגות', ['עוגות', 'עוגים', 'עוגה'], { en: 'cakes', ar: 'كعكات', ru: 'торты' }], ['חדרים ___', 'גדולים', ['גדולים', 'גדולות', 'גדול'], { en: 'big', ar: 'كبير', ru: 'большой' }]]
      },
      {
        id: 'the-et', icon: '📰', level: 'A1',
        title: { he: 'ה־ הידיעה ו-את', en: 'The ה־ "the" — and את', ar: 'أداة التعريف ה־ — و את', ru: 'Определённый артикль ה־ — и את' },
        explain: {
          en: ['"The" is ה־ attached to the front of the word: מלון (a hotel) → המלון (the hotel).', 'An adjective of a definite noun takes ה־ too: המלון הגדול = the big hotel.', 'Before a definite direct object Hebrew adds את: אני רואה את הים = I see the sea.'],
          ar: ['أداة التعريف ה־ تلتصق بأول الكلمة — مثل «الـ»: מלון (فندق) ← המלון (الفندق).', 'صفة الاسم المعرّف تأخذ ה־ أيضًا: המלון הגדול = الفندق الكبير.', 'قبل المفعول به المعرّف نضيف את: אני רואה את הים = أرى البحر.'],
          ru: ['«Определённость» — приставка ה־ в начале слова: מלון (гостиница) → המלון (эта гостиница).', 'Прилагательное при определённом существительном тоже получает ה־: המלון הגדול.', 'Перед определённым прямым дополнением ставится את: אני רואה את הים = я вижу море.']
        },
        table: [['מלון', 'המלון'], ['חדר', 'החדר'], ['המלון הגדול', 'את המלון']],
        ex: [
          ['המלון קרוב לים.', 'המלון קרוב לים.', 'The hotel is close to the sea.', 'الفندق قريب من البحر.', 'Гостиница рядом с морем.'],
          ['אני רואה את הים.', 'אני רואה את הים.', 'I see the sea.', 'أرى البحر.', 'Я вижу море.'],
          ['איפה החדר שלי?', 'איפה החדר שלי?', 'Where is my room?', 'أين غرفتي؟', 'Где мой номер?'],
          ['אפשר את התפריט?', 'אפשר את התפריט?', 'Can I have the menu?', 'هل يمكنني الحصول على القائمة؟', 'Можно меню?']
        ],
        drills: [['איפה ___?', 'החדר', ['החדר', 'חדר', 'את חדר'], { en: 'the room', ar: 'الغرفة', ru: 'номер (этот)' }], ['אני רוצה ___ החשבון.', 'את', ['את', 'ה', 'של']], ['המלון ___', 'הגדול', ['הגדול', 'גדול', 'גדולה'], { en: 'the big', ar: 'الكبير', ru: 'большой (этот)' }], ['אני אוהב ___', 'את הים', ['את הים', 'ים', 'הים את'], { en: 'the sea', ar: 'البحر', ru: 'море' }]]
      },
      {
        id: 'present', icon: '🔁', level: 'A1',
        title: { he: 'הווה: ארבע צורות', en: 'Present tense: four forms', ar: 'المضارع: أربع صيغ', ru: 'Настоящее время: четыре формы' },
        explain: {
          en: ['The present has only four forms — by gender and number, not by person: כותב, כותבת, כותבים, כותבות.', 'אני / אתה / הוא כותב · אני / את / היא כותבת · אנחנו / אתם / הם כותבים · אנחנו / אתן / הן כותבות.', 'So "I" depends on who is speaking: a man says אני מדבר, a woman says אני מדברת.'],
          ar: ['في المضارع أربع صيغ فقط — حسب الجنس والعدد لا حسب الشخص: כותב، כותבת، כותבים، כותבות.', 'אני / אתה / הוא כותב · אני / את / היא כותבת · אנחנו / אתם / הם כותבים · אנחנו / אתן / הן כותבות.', 'لذلك «أنا» تتعلق بالمتكلم: الرجل يقول אני מדבר والمرأة تقول אני מדברת.'],
          ru: ['В настоящем времени всего четыре формы — по роду и числу, а не по лицу: כותב, כותבת, כותבים, כותבות.', 'אני / אתה / הוא כותב · אני / את / היא כותבת · אנחנו / אתם / הם כותבים · אנחנו / אתן / הן כותבות.', 'Поэтому «я» зависит от того, кто говорит: мужчина — אני מדבר, женщина — אני מדברת.']
        },
        table: [['כותב', 'כותבת'], ['כותבים', 'כותבות'], ['מדבר', 'מדברת'], ['גר', 'גרה']],
        ex: [
          ['אני מדבר קצת עברית.', 'אני מדבר קצת עברית.', 'I speak a little Hebrew.', 'أتكلم قليلًا من العبرية.', 'Я немного говорю на иврите.'],
          ['איפה את גרה?', 'איפה את גרה?', 'Where do you live? (to a woman)', 'أين تسكنين؟', 'Где ты живёшь? (к женщине)'],
          ['הם עובדים במלון.', 'הם עובדים במלון.', 'They work at the hotel.', 'يعملون في الفندق.', 'Они работают в гостинице.'],
          ['אנחנו לומדים עברית.', 'אנחנו לומדים עברית.', 'We are learning Hebrew.', 'نتعلم العبرية.', 'Мы учим иврит.']
        ],
        drills: [['היא ___ עברית.', 'מדברת', ['מדבר', 'מדברת', 'מדברים'], { en: 'speaks', ar: 'تتكلم', ru: 'говорит' }], ['הם ___ בתל אביב.', 'גרים', ['גר', 'גרה', 'גרים'], { en: 'live', ar: 'يسكنون', ru: 'живут' }], ['אתה ___ אנגלית?', 'מדבר', ['מדבר', 'מדברת', 'מדברות'], { en: 'speak', ar: 'تتكلم', ru: 'говоришь' }], ['הן ___ במסעדה.', 'עובדות', ['עובדים', 'עובדות', 'עובדת'], { en: 'work', ar: 'يعملن', ru: 'работают' }]]
      },
      {
        id: 'yesh-ein', icon: '🎒', level: 'A1',
        title: { he: 'יש ואין — "יש לי"', en: 'יש and אין — "I have"', ar: 'יש و אין — «لديّ»', ru: 'יש и אין — «у меня есть»' },
        explain: {
          en: ['יש = there is / there are; אין = there isn\'t / there aren\'t: יש פה אינטרנט? — אין.', 'Hebrew has no verb "to have": יש לי = I have (literally "there is to me"), אין לי = I don\'t have.', 'לי (me), לך (you), לו / לה (him / her), לנו (us), להם (them): יש לנו הזמנה.'],
          ar: ['יש = يوجد؛ אין = لا يوجد: יש פה אינטרנט? — אין.', 'لا يوجد فعل «يملك» في العبرية: יש לי = لديّ (حرفيًا «يوجد لي»)، אין לי = ليس لديّ.', 'לי (لي)، לך (لك)، לו / לה (له / لها)، לנו (لنا)، להם (لهم): יש לנו הזמנה.'],
          ru: ['יש = есть (имеется); אין = нет: יש פה אינטרנט? — אין.', 'Глагола «иметь» нет: יש לי = у меня есть, אין לי = у меня нет — как в русском!', 'לי (мне), לך (тебе), לו / לה (ему / ей), לנו (нам), להם (им): יש לנו הזמנה.']
        },
        table: [['יש לי', 'אין לי'], ['יש לך', 'אין לך'], ['יש לנו', 'אין לנו']],
        ex: [
          ['יש לי שאלה.', 'יש לי שאלה.', 'I have a question.', 'لديّ سؤال.', 'У меня вопрос.'],
          ['אין לי כסף קטן.', 'אין לי כסף קטן.', "I don't have small change.", 'ليس لديّ فكّة.', 'У меня нет мелочи.'],
          ['יש לכם חדר פנוי?', 'יש לכם חדר פנוי?', 'Do you have a free room?', 'هل لديكم غرفة فارغة؟', 'У вас есть свободный номер?'],
          ['אין בעיה!', 'אין בעיה!', 'No problem!', 'لا مشكلة!', 'Нет проблем!']
        ],
        drills: [['___ לי הזמנה.', 'יש', ['יש', 'אין', 'את'], { en: 'I have', ar: 'لديّ', ru: 'у меня есть' }], ['___ לי זמן.', 'אין', ['אין', 'יש', 'לא'], { en: 'I don\'t have', ar: 'ليس لديّ', ru: 'у меня нет' }], ['יש ___ שאלה?', 'לך', ['לך', 'לי', 'אתה'], { en: 'you have', ar: 'لديك', ru: 'у тебя есть' }], ['יש ___ חדר?', 'לכם', ['לכם', 'לנו', 'אתם'], { en: 'you all have', ar: 'لديكم', ru: 'у вас есть' }]]
      },
      {
        id: 'questions', icon: '❓', level: 'A1',
        title: { he: 'מילות שאלה', en: 'Question words', ar: 'أدوات الاستفهام', ru: 'Вопросительные слова' },
        explain: {
          en: ['A yes / no question is just a sentence with a rising tone: יש פה אינטרנט?', 'מה = what, מי = who, איפה = where, מתי = when, למה = why, איך = how, כמה = how much.', 'מאיפה = from where, לאן = where to: לאן אתה נוסע?'],
          ar: ['سؤال نعم / لا هو جملة عادية بنبرة صاعدة: יש פה אינטרנט?', 'מה = ماذا، מי = من، איפה = أين، מתי = متى، למה = لماذا، איך = كيف، כמה = كم — كثير منها يشبه العربية.', 'מאיפה = من أين، לאן = إلى أين: לאן אתה נוסע?'],
          ru: ['Вопрос «да / нет» — обычная фраза с повышением тона: יש פה אינטרנט?', 'מה = что, מי = кто, איפה = где, מתי = когда, למה = почему, איך = как, כמה = сколько.', 'מאיפה = откуда, לאן = куда: לאן אתה נוסע?']
        },
        table: [['מה', 'מי', 'איפה'], ['מתי', 'למה', 'איך'], ['כמה', 'מאיפה', 'לאן']],
        ex: [
          ['מה השעה?', 'מה השעה?', 'What time is it?', 'كم الساعة؟', 'Который час?'],
          ['לאן אתה נוסע?', 'לאן אתה נוסע?', 'Where are you going?', 'إلى أين أنت ذاهب؟', 'Куда ты едешь?'],
          ['למה הרכבת מאחרת?', 'למה הרכבת מאחרת?', 'Why is the train late?', 'لماذا تأخر القطار؟', 'Почему поезд опаздывает?'],
          ['מי זה?', 'מי זה?', 'Who is it?', 'من هذا؟', 'Кто это?']
        ],
        drills: [['___ התחנה?', 'איפה', ['איפה', 'מתי', 'מי'], { en: 'where', ar: 'أين', ru: 'где' }], ['___ זה עולה?', 'כמה', ['כמה', 'איך', 'מה'], { en: 'how much', ar: 'كم', ru: 'сколько' }], ['___ אתה?', 'מאיפה', ['מאיפה', 'לאן', 'איפה'], { en: 'from where', ar: 'من أين', ru: 'откуда' }], ['___ המוזיאון נסגר?', 'מתי', ['מתי', 'למה', 'כמה'], { en: 'when', ar: 'متى', ru: 'когда' }]]
      },
      {
        id: 'prepositions', icon: '📍', level: 'A2',
        title: { he: 'מילות יחס: ב־, ל־, מ־', en: 'Prepositions: ב־ (in), ל־ (to), מ־ (from)', ar: 'حروف الجر: ב־ (في)، ל־ (إلى)، מ־ (من)', ru: 'Предлоги: ב־ (в), ל־ (к), מ־ (из)' },
        explain: {
          en: ['ב־ (in / at), ל־ (to / for) and מ־ (from) are written attached to the word: בתל אביב, לירושלים, מחיפה.', 'With "the" ב־ and ל־ swallow the ה: ב + הבית = בבית, ל + הים = לים.', 'They take endings for "me / you…": לי, לך, לו · בי, בך, בו · ממני, ממך.'],
          ar: ['ב־ (في)، ל־ (إلى / لـ)، מ־ (من) تُكتب ملتصقة بالكلمة — مثل «بـ» و«لـ»: בתל אביב، לירושלים، מחיפה.', 'مع أداة التعريف تبتلع ב־ و ל־ حرف ה: ב + הבית = בבית، ל + הים = לים.', 'تأخذ ضمائر متصلة: לי، לך، לו · בי، בך، בו · ממני، ממך.'],
          ru: ['ב־ (в), ל־ (к / для) и מ־ (из / от) пишутся слитно со словом: בתל אביב, לירושלים, מחיפה.', 'С артиклем ב־ и ל־ «поглощают» ה: ב + הבית = בבית, ל + הים = לים.', 'К ним присоединяются окончания: לי, לך, לו · בי, בך, בו · ממני, ממך.']
        },
        table: [['ב + הבית', 'בבית'], ['ל + הים', 'לים'], ['מ + הבית', 'מהבית']],
        ex: [
          ['אני גר בירושלים.', 'אני גר בירושלים.', 'I live in Jerusalem.', 'أسكن في القدس.', 'Я живу в Иерусалиме.'],
          ['אנחנו נוסעים לים.', 'אנחנו נוסעים לים.', "We're going to the beach.", 'نحن ذاهبون إلى البحر.', 'Мы едем на море.'],
          ['הרכבת מגיעה מחיפה.', 'הרכבת מגיעה מחיפה.', 'The train comes from Haifa.', 'يصل القطار من حيفا.', 'Поезд прибывает из Хайфы.'],
          ['נתראה במסעדה בשמונה.', 'נתראה במסעדה בשמונה.', 'See you at the restaurant at eight.', 'نلتقي في المطعم في الثامنة.', 'Увидимся в ресторане в восемь.']
        ],
        drills: [['אני גר ___תל אביב.', 'ב', ['ב', 'ל', 'מ'], { en: 'in', ar: 'في', ru: 'в' }], ['אני נוסע ___אילת.', 'ל', ['ל', 'ב', 'מ'], { en: 'to', ar: 'إلى', ru: 'в (куда)' }], ['הוא ___חיפה.', 'מ', ['מ', 'ל', 'ב'], { en: 'from', ar: 'من', ru: 'из' }], ['אנחנו ___ים.', 'ב', ['ב', 'מ', 'את'], { en: 'at the', ar: 'في الـ', ru: 'на (море)' }]]
      },
      {
        id: 'shel', icon: '🏷️', level: 'A2',
        title: { he: 'שייכות: של, שלי, שלך', en: 'Possession: של, שלי, שלך', ar: 'الملكية: של، שלי، שלך', ru: 'Принадлежность: של, שלי, שלך' },
        explain: {
          en: ['של = of: הדרכון של דנה = Dana\'s passport.', 'With endings: שלי (my), שלך (your), שלו / שלה (his / her), שלנו (our), שלכם (your, pl.), שלהם (their).', 'The owner comes after the thing, and the thing usually takes ה־: הטלפון שלי = my phone.'],
          ar: ['של = لـ (ملكية): הדרכון של דנה = جواز سفر دانا.', 'مع الضمائر: שלי (لي)، שלך (لك)، שלו / שלה (له / لها)، שלנו (لنا)، שלכם (لكم)، שלהם (لهم).', 'المالك يأتي بعد الشيء، والشيء يأخذ عادة ה־: הטלפון שלי = هاتفي.'],
          ru: ['של = «принадлежащий»: הדרכון של דנה = паспорт Даны.', 'С окончаниями: שלי (мой), שלך (твой), שלו / שלה (его / её), שלנו (наш), שלכם (ваш), שלהם (их).', 'Владелец идёт после предмета, а предмет обычно с ה־: הטלפון שלי = мой телефон.']
        },
        table: [['שלי', 'שלנו'], ['שלך', 'שלכם'], ['שלו · שלה', 'שלהם']],
        ex: [
          ['הנה הדרכון שלי.', 'הנה הדרכון שלי.', 'Here is my passport.', 'ها هو جواز سفري.', 'Вот мой паспорт.'],
          ['זה התיק שלך?', 'זה התיק שלך?', 'Is this your bag?', 'هل هذه حقيبتك؟', 'Это твоя сумка?'],
          ['החדר שלנו בקומה השנייה.', 'החדר שלנו בקומה השנייה.', 'Our room is on the second floor.', 'غرفتنا في الطابق الثاني.', 'Наш номер на втором этаже.'],
          ['אמא שלי מדברת עברית.', 'אמא שלי מדברת עברית.', 'My mother speaks Hebrew.', 'أمي تتكلم العبرية.', 'Моя мама говорит на иврите.']
        ],
        drills: [['הטלפון ___', 'שלי', ['שלי', 'שלך', 'שלו'], { en: 'my', ar: 'لي', ru: 'мой' }], ['זה הכרטיס ___?', 'שלך', ['שלך', 'שלי', 'שלנו'], { en: 'your', ar: 'لك', ru: 'твой' }], ['המלון ___ קרוב.', 'שלנו', ['שלנו', 'שלהם', 'שלי'], { en: 'our', ar: 'لنا', ru: 'наш' }], ['המזוודה ___', 'שלה', ['שלה', 'שלו', 'שלהם'], { en: 'her', ar: 'لها', ru: 'её' }]]
      },
      {
        id: 'past', icon: '⏮️', level: 'A2',
        title: { he: 'עבר', en: 'Past tense', ar: 'الماضي', ru: 'Прошедшее время' },
        explain: {
          en: ['The past adds endings for each person to the root: כתב (he wrote) → כתבתי (I wrote).', 'כתבתי, כתבת, כתב, כתבה, כתבנו, כתבתם, כתבו.', 'Common verbs: הייתי (I was), הלכתי (I went), אכלתי (I ate), הגעתי (I arrived).'],
          ar: ['الماضي يضيف نهاية لكل شخص على الجذر — مثل العربية: כתב (كتب) ← כתבתי (كتبتُ).', 'כתבתי، כתבת، כתב، כתבה، כתבנו، כתבתם، כתבו.', 'أفعال شائعة: הייתי (كنتُ)، הלכתי (ذهبتُ)، אכלתי (أكلتُ)، הגעתי (وصلتُ).'],
          ru: ['Прошедшее время добавляет окончания к корню: כתב (он написал) → כתבתי (я написал).', 'כתבתי, כתבת, כתב, כתבה, כתבנו, כתבתם, כתבו.', 'Частые глаголы: הייתי (я был), הלכתי (я пошёл), אכלתי (я поел), הגעתי (я приехал).']
        },
        table: [['אני', 'כתבתי'], ['אתה · את', 'כתבת'], ['הוא · היא', 'כתב · כתבה'], ['אנחנו', 'כתבנו'], ['אתם', 'כתבתם'], ['הם · הן', 'כתבו']],
        ex: [
          ['הגעתי אתמול.', 'הגעתי אתמול.', 'I arrived yesterday.', 'وصلتُ أمس.', 'Я приехал вчера.'],
          ['אכלנו בשוק.', 'אכלנו בשוק.', 'We ate at the market.', 'أكلنا في السوق.', 'Мы поели на рынке.'],
          ['היית בירושלים?', 'היית בירושלים?', 'Have you been to Jerusalem?', 'هل كنت في القدس؟', 'Ты был в Иерусалиме?'],
          ['הם הלכו לים.', 'הם הלכו לים.', 'They went to the beach.', 'ذهبوا إلى البحر.', 'Они пошли на море.']
        ],
        drills: [['אני ___ בחיפה.', 'הייתי', ['הייתי', 'היה', 'היינו'], { en: 'was', ar: 'كنتُ', ru: 'был' }], ['אנחנו ___ פלאפל.', 'אכלנו', ['אכלנו', 'אכלתי', 'אכלו'], { en: 'ate', ar: 'أكلنا', ru: 'поели' }], ['היא ___ בשמונה.', 'הגיעה', ['הגיעה', 'הגיע', 'הגעתי'], { en: 'arrived', ar: 'وصلت', ru: 'приехала' }], ['הם ___ למוזיאון.', 'הלכו', ['הלכו', 'הלכנו', 'הלך'], { en: 'went', ar: 'ذهبوا', ru: 'пошли' }]]
      },
      {
        id: 'want-going', icon: '⏭️', level: 'A2',
        title: { he: 'רוצה ל… / הולך ל…', en: 'Want to… / going to…', ar: 'أريد أن… / سوف…', ru: 'Хочу… / собираюсь…' },
        explain: {
          en: ['רוצה + infinitive (ל־…): אני רוצה לאכול = I want to eat. רוצה / רוצה / רוצים / רוצות like any present verb.', 'Near future: הולך + infinitive: אני הולך לישון = I\'m going to sleep.', 'Polite asking: אפשר + infinitive: אפשר לשלם? = Can I pay?'],
          ar: ['רוצה + المصدر (ל־…): אני רוצה לאכול = أريد أن آكل. صيغه: רוצה / רוצה / רוצים / רוצות.', 'المستقبل القريب: הולך + المصدر: אני הולך לישון = سأنام.', 'الطلب بأدب: אפשר + المصدر: אפשר לשלם? = هل يمكنني الدفع؟'],
          ru: ['רוצה + инфинитив (ל־…): אני רוצה לאכול = я хочу есть. Формы: רוצה / רוצה / רוצים / רוצות.', 'Ближайшее будущее: הולך + инфинитив: אני הולך לישון = я иду спать.', 'Вежливая просьба: אפשר + инфинитив: אפשר לשלם? = можно заплатить?']
        },
        table: [['רוצה', 'לאכול'], ['רוצים', 'לנסוע'], ['הולך', 'לישון'], ['אפשר', 'לשלם']],
        ex: [
          ['אני רוצה להזמין מונית.', 'אני רוצה להזמין מונית.', 'I want to order a taxi.', 'أريد أن أطلب تاكسي.', 'Я хочу заказать такси.'],
          ['אנחנו רוצים לראות את הים.', 'אנחנו רוצים לראות את הים.', 'We want to see the sea.', 'نريد أن نرى البحر.', 'Мы хотим увидеть море.'],
          ['אני הולך לישון.', 'אני הולך לישון.', "I'm going to sleep.", 'سأذهب لأنام.', 'Я иду спать.'],
          ['אפשר לשלם בכרטיס?', 'אפשר לשלם בכרטיס?', 'Can I pay by card?', 'هل يمكنني الدفع بالبطاقة؟', 'Можно заплатить картой?']
        ],
        drills: [['אני ___ לאכול.', 'רוצה', ['רוצה', 'רוצים', 'רציתי'], { en: 'want, m.', ar: 'أريد', ru: 'хочу (м.)' }], ['הם ___ לנסוע לאילת.', 'רוצים', ['רוצים', 'רוצה', 'רוצות'], { en: 'want', ar: 'يريدون', ru: 'хотят' }], ['אני רוצה ___ את העיר.', 'לראות', ['לראות', 'רואה', 'ראיתי'], { en: 'to see', ar: 'أن أرى', ru: 'увидеть' }], ['___ לשלם?', 'אפשר', ['אפשר', 'יש', 'רוצה'], { en: 'may I', ar: 'هل يمكن', ru: 'можно' }]]
      }
    ],
    it: [
      {
        id: 'essere-avere', icon: '🧩', level: 'A1',
        title: { he: 'essere ו-avere — "להיות" ו"שיש לי"', en: 'Essere and avere — "to be" and "to have"', ar: 'essere و avere — «يكون» و«يملك»', ru: 'Essere и avere — «быть» и «иметь»' },
        explain: {
          he: ['essere (להיות): sono, sei, è, siamo, siete, sono.', 'avere (שיש לי): ho, hai, ha, abbiamo, avete, hanno — ה-h לא נשמעת.', 'באיטלקית אומרים "יש לי" גם לרעב ולגיל: Ho fame. Ho 25 anni.'],
          en: ['essere (to be): sono, sei, è, siamo, siete, sono.', 'avere (to have): ho, hai, ha, abbiamo, avete, hanno — the h is silent.', 'Italian uses "have" for hunger and age: Ho fame. Ho 25 anni.'],
          ar: ['essere (يكون): sono, sei, è, siamo, siete, sono.', 'avere (يملك): ho, hai, ha, abbiamo, avete, hanno — حرف h لا يُنطق.', 'في الإيطالية نقول «لدي» للجوع والعمر: Ho fame. Ho 25 anni.'],
          ru: ['essere (быть): sono, sei, è, siamo, siete, sono.', 'avere (иметь): ho, hai, ha, abbiamo, avete, hanno — h не читается.', 'Голод и возраст выражают через «иметь»: Ho fame. Ho 25 anni.']
        },
        table: [['io', 'sono · ho'], ['tu', 'sei · hai'], ['lui / lei', 'è · ha'], ['noi', 'siamo · abbiamo'], ['voi', 'siete · avete'], ['loro', 'sono · hanno']],
        ex: [
          ['Sono uno studente.', 'אני סטודנט.', 'I am a student.', 'أنا طالب.', 'Я студент.'],
          ['Ho fame.', 'אני רעב.', 'I am hungry.', 'أنا جائع.', 'Я голоден.'],
          ['Il museo è chiuso.', 'המוזיאון סגור.', 'The museum is closed.', 'المتحف مغلق.', 'Музей закрыт.'],
          ['Abbiamo una prenotazione.', 'יש לנו הזמנה.', 'We have a reservation.', 'لدينا حجز.', 'У нас есть бронь.']
        ],
        drills: [['Io ___ italiano.', 'sono', ['sono', 'sei', 'ho']], ['Tu ___ fame?', 'hai', ['hai', 'sei', 'ha']], ['Noi ___ in vacanza.', 'siamo', ['siamo', 'abbiamo', 'sono']], ['Loro ___ due figli.', 'hanno', ['hanno', 'sono', 'ha']]]
      },
      {
        id: 'articles', icon: '📰', level: 'A1',
        title: { he: 'מין ומיליות: il, lo, la, un, una', en: 'Gender and articles: il, lo, la, un, una', ar: 'الجنس وأدوات التعريف: il, lo, la, un, una', ru: 'Род и артикли: il, lo, la, un, una' },
        explain: {
          he: ["זכר: il (il treno), ולפני s + עיצור, z, ps: lo (lo zaino). נקבה: la (la casa). לפני תנועה: l' (l'hotel).", 'רבים: il → i, lo → gli, la → le: i treni, gli zaini, le case.', "אחד / אחת: un, uno (uno zaino), una, un' (un'amica)."],
          en: ["Masculine: il (il treno); before s + consonant, z, ps: lo (lo zaino). Feminine: la (la casa). Before a vowel: l' (l'hotel).", 'Plural: il → i, lo → gli, la → le: i treni, gli zaini, le case.', "\"A\": un, uno (uno zaino), una, un' (un'amica)."],
          ar: ["المذكر: il (il treno)، وقبل s + ساكن أو z أو ps: lo (lo zaino). المؤنث: la (la casa). قبل حرف علة: l' (l'hotel).", 'الجمع: il ← i، lo ← gli، la ← le: i treni, gli zaini, le case.', "النكرة: un، uno (uno zaino)، una، un' (un'amica)."],
          ru: ["Мужской род: il (il treno); перед s + согласная, z, ps — lo (lo zaino). Женский: la (la casa). Перед гласной: l' (l'hotel).", 'Множественное: il → i, lo → gli, la → le: i treni, gli zaini, le case.', "Неопределённый: un, uno (uno zaino), una, un' (un'amica)."]
        },
        table: [['il treno', 'i treni'], ['lo zaino', 'gli zaini'], ["l'amica", "le amiche"], ['la casa', 'le case']],
        ex: [
          ['Il treno parte alle otto.', 'הרכבת יוצאת בשמונה.', 'The train leaves at eight.', 'يغادر القطار في الثامنة.', 'Поезд отправляется в восемь.'],
          ['La spiaggia è vicina.', 'החוף קרוב.', 'The beach is close.', 'الشاطئ قريب.', 'Пляж рядом.'],
          ["Vorrei una bottiglia d'acqua.", 'הייתי רוצה בקבוק מים.', 'I would like a bottle of water.', 'أريد زجاجة ماء.', 'Я бы хотел бутылку воды.'],
          ['Gli zaini sono in camera.', 'התיקים בחדר.', 'The backpacks are in the room.', 'حقائب الظهر في الغرفة.', 'Рюкзаки в номере.']
        ],
        drills: [['___ casa è grande.', 'La', ['Il', 'La', 'Lo']], ['___ zaino è pesante.', 'Lo', ['Il', 'Lo', 'La']], ['Ho ___ domanda.', 'una', ['un', 'una', 'uno']], ['___ treni sono in ritardo.', 'I', ['I', 'Gli', 'Le']]]
      },
      {
        id: 'are-verbs', icon: '🔁', level: 'A1',
        title: { he: 'הווה: פעלים ב-are (parlare)', en: 'Present tense: -are verbs (parlare)', ar: 'المضارع: الأفعال المنتهية بـ are (parlare)', ru: 'Настоящее время: глаголы на -are (parlare)' },
        explain: {
          he: ['פעלים ב-are: מורידים are ומוסיפים סיומת: parlo, parli, parla, parliamo, parlate, parlano.', 'בדרך כלל משמיטים את הגוף: Parlo italiano.', 'ב-loro ההטעמה נשארת בתחילת המילה: PAR-la-no.'],
          en: ['-are verbs: drop -are and add the ending: parlo, parli, parla, parliamo, parlate, parlano.', 'The subject pronoun is usually dropped: Parlo italiano.', 'In the loro form the stress stays early: PAR-la-no.'],
          ar: ['الأفعال المنتهية بـ are: نحذف are ونضيف النهاية: parlo, parli, parla, parliamo, parlate, parlano.', 'عادة نحذف الضمير: Parlo italiano.', 'في صيغة loro يبقى النبر في أول الكلمة: PAR-la-no.'],
          ru: ['Глаголы на -are: отбрасываем -are и добавляем окончание: parlo, parli, parla, parliamo, parlate, parlano.', 'Местоимение обычно опускают: Parlo italiano.', 'В форме loro ударение остаётся в начале: PAR-la-no.']
        },
        table: [['io', 'parlo'], ['tu', 'parli'], ['lui / lei', 'parla'], ['noi', 'parliamo'], ['voi', 'parlate'], ['loro', 'parlano']],
        ex: [
          ["Parlo un po' di italiano.", 'אני מדבר קצת איטלקית.', 'I speak a little Italian.', 'أتكلم قليلًا من الإيطالية.', 'Я немного говорю по-итальянски.'],
          ['Dove lavori?', 'איפה אתה עובד?', 'Where do you work?', 'أين تعمل؟', 'Где ты работаешь?'],
          ["Aspettiamo l'autobus.", 'אנחנו מחכים לאוטובוס.', 'We are waiting for the bus.', 'ننتظر الحافلة.', 'Мы ждём автобус.'],
          ['Loro mangiano la pizza.', 'הם אוכלים פיצה.', 'They eat pizza.', 'يأكلون البيتزا.', 'Они едят пиццу.']
        ],
        drills: [['Io ___ in un albergo.', 'lavoro', ['lavoro', 'lavori', 'lavora']], ['Tu ___ inglese?', 'parli', ['parlo', 'parli', 'parla']], ['Noi ___ un taxi.', 'chiamiamo', ['chiamiamo', 'chiamano', 'chiamo']], ['Loro ___ la cena.', 'mangiano', ['mangia', 'mangiano', 'mangiamo']]]
      },
      {
        id: 'ere-ire-verbs', icon: '🔂', level: 'A1',
        title: { he: 'הווה: פעלים ב-ere וב-ire (prendere, dormire)', en: 'Present tense: -ere and -ire verbs (prendere, dormire)', ar: 'المضارع: الأفعال المنتهية بـ ere و ire', ru: 'Настоящее время: глаголы на -ere и -ire' },
        explain: {
          he: ['prendere (לקחת): prendo, prendi, prende, prendiamo, prendete, prendono.', 'dormire (לישון): dormo, dormi, dorme, dormiamo, dormite, dormono.', 'הרבה פעלים ב-ire מוסיפים isc: capire → capisco, capisci, capisce… capiscono.'],
          en: ['prendere (to take): prendo, prendi, prende, prendiamo, prendete, prendono.', 'dormire (to sleep): dormo, dormi, dorme, dormiamo, dormite, dormono.', 'Many -ire verbs add -isc-: capire → capisco, capisci, capisce… capiscono.'],
          ar: ['prendere (يأخذ): prendo, prendi, prende, prendiamo, prendete, prendono.', 'dormire (ينام): dormo, dormi, dorme, dormiamo, dormite, dormono.', 'كثير من أفعال ire تضيف isc: capire ← capisco, capisci, capisce… capiscono.'],
          ru: ['prendere (брать): prendo, prendi, prende, prendiamo, prendete, prendono.', 'dormire (спать): dormo, dormi, dorme, dormiamo, dormite, dormono.', 'Многие глаголы на -ire добавляют -isc-: capire → capisco, capisci, capisce… capiscono.']
        },
        table: [['io', 'prendo · dormo · capisco'], ['tu', 'prendi · dormi · capisci'], ['lui / lei', 'prende · dorme · capisce'], ['noi', 'prendiamo · dormiamo · capiamo'], ['loro', 'prendono · dormono · capiscono']],
        ex: [
          ['Prendo un caffè.', 'אני לוקח קפה.', "I'll have a coffee.", 'سآخذ قهوة.', 'Я возьму кофе.'],
          ['Non capisco.', 'אני לא מבין.', "I don't understand.", 'لا أفهم.', 'Я не понимаю.'],
          ['Dormiamo in un albergo.', 'אנחנו ישנים במלון.', 'We are sleeping in a hotel.', 'ننام في فندق.', 'Мы ночуем в гостинице.'],
          ['Il negozio apre alle nove.', 'החנות נפתחת בתשע.', 'The shop opens at nine.', 'يفتح المتجر في التاسعة.', 'Магазин открывается в девять.']
        ],
        drills: [['Io ___ il treno.', 'prendo', ['prendo', 'prende', 'prendono']], ['Tu ___ bene?', 'dormi', ['dormo', 'dormi', 'dorme']], ['Loro non ___.', 'capiscono', ['capisce', 'capiscono', 'capiamo']], ['Noi ___ un taxi.', 'prendiamo', ['prendiamo', 'prendete', 'prende']]]
      },
      {
        id: 'irregular', icon: '⚡', level: 'A1',
        title: { he: 'פעלים חריגים חשובים: andare, fare, volere', en: 'Key irregular verbs: andare, fare, volere', ar: 'أفعال شاذة مهمة: andare, fare, volere', ru: 'Важные неправильные глаголы: andare, fare, volere' },
        explain: {
          he: ['andare (ללכת / לנסוע): vado, vai, va, andiamo, andate, vanno.', 'fare (לעשות): faccio, fai, fa, facciamo, fate, fanno · Fa caldo = חם.', 'volere (לרצות): voglio, vuoi, vuole, vogliamo, volete, vogliono · בנימוס: vorrei.'],
          en: ['andare (to go): vado, vai, va, andiamo, andate, vanno.', 'fare (to do / make): faccio, fai, fa, facciamo, fate, fanno · Fa caldo = it is hot.', 'volere (to want): voglio, vuoi, vuole, vogliamo, volete, vogliono · politely: vorrei.'],
          ar: ['andare (يذهب): vado, vai, va, andiamo, andate, vanno.', 'fare (يفعل): faccio, fai, fa, facciamo, fate, fanno · Fa caldo = الجو حار.', 'volere (يريد): voglio, vuoi, vuole, vogliamo, volete, vogliono · بتهذيب: vorrei.'],
          ru: ['andare (идти, ехать): vado, vai, va, andiamo, andate, vanno.', 'fare (делать): faccio, fai, fa, facciamo, fate, fanno · Fa caldo = жарко.', 'volere (хотеть): voglio, vuoi, vuole, vogliamo, volete, vogliono · вежливо: vorrei.']
        },
        table: [['io', 'vado · faccio · voglio'], ['tu', 'vai · fai · vuoi'], ['lui / lei', 'va · fa · vuole'], ['noi', 'andiamo · facciamo · vogliamo'], ['loro', 'vanno · fanno · vogliono']],
        ex: [
          ['Andiamo al mare.', 'אנחנו הולכים לים.', 'We are going to the sea.', 'نذهب إلى البحر.', 'Мы идём на море.'],
          ['Oggi fa molto caldo.', 'היום חם מאוד.', 'It is very hot today.', 'الجو حار جدًا اليوم.', 'Сегодня очень жарко.'],
          ['Vorrei un gelato.', 'הייתי רוצה גלידה.', 'I would like an ice cream.', 'أريد بوظة.', 'Я бы хотел мороженое.'],
          ['Dove vai stasera?', 'לאן אתה הולך הערב?', 'Where are you going tonight?', 'إلى أين تذهب الليلة؟', 'Куда ты идёшь сегодня вечером?']
        ],
        drills: [['Io ___ a Roma.', 'vado', ['vado', 'va', 'andiamo']], ['Cosa ___ tu oggi?', 'fai', ['faccio', 'fai', 'fa']], ['Loro ___ una pizza.', 'vogliono', ['vuole', 'vogliono', 'vogliamo']], ['Noi ___ in centro.', 'andiamo', ['andiamo', 'vanno', 'vado']]]
      },
      {
        id: 'questions', icon: '❓', level: 'A1',
        title: { he: 'מילות שאלה: cosa, dove, quando, quanto…', en: 'Question words: cosa, dove, quando, quanto…', ar: 'كلمات السؤال: cosa, dove, quando, quanto…', ru: 'Вопросительные слова: cosa, dove, quando, quanto…' },
        explain: {
          he: ['באיטלקית שאלה יכולה להישמע כמו משפט רגיל — רק הטון עולה בסוף: Parli inglese?', 'cosa = מה, dove = איפה, quando = מתי, quanto = כמה, chi = מי, come = איך, perché = למה.', "dove + è מתקצר ל-dov'è: Dov'è la stazione?"],
          en: ['An Italian question can sound like a normal sentence — only the tone rises: Parli inglese?', 'cosa = what, dove = where, quando = when, quanto = how much, chi = who, come = how, perché = why.', "dove + è shortens to dov'è: Dov'è la stazione?"],
          ar: ['السؤال الإيطالي قد يبدو كجملة عادية — فقط النغمة ترتفع في النهاية: Parli inglese?', 'cosa = ماذا، dove = أين، quando = متى، quanto = كم، chi = من، come = كيف، perché = لماذا.', "dove + è تُختصر إلى dov'è: Dov'è la stazione?"],
          ru: ['Итальянский вопрос может звучать как обычная фраза — только интонация повышается: Parli inglese?', 'cosa — что, dove — где, quando — когда, quanto — сколько, chi — кто, come — как, perché — почему.', "dove + è сокращается до dov'è: Dov'è la stazione?"]
        },
        table: [['Cosa?', 'Dove?', 'Quando?'], ['Quanto?', 'Chi?', 'Come?']],
        ex: [
          ['Quando parte il treno?', 'מתי יוצאת הרכבת?', 'When does the train leave?', 'متى يغادر القطار؟', 'Когда отправляется поезд?'],
          ['Come ti chiami?', 'איך קוראים לך?', 'What is your name?', 'ما اسمك؟', 'Как тебя зовут?'],
          ['Chi è lui?', 'מי הוא?', 'Who is he?', 'من هو؟', 'Кто он?'],
          ['Perché è chiuso?', 'למה זה סגור?', 'Why is it closed?', 'لماذا هو مغلق؟', 'Почему закрыто?']
        ],
        drills: [['___ costa il biglietto?', 'Quanto', ['Quanto', 'Come', 'Chi']], ['___ ti chiami?', 'Come', ['Cosa', 'Come', 'Dove']], ['___ apre il museo?', 'Quando', ['Quando', 'Chi', 'Quanto']], ['___ abiti?', 'Dove', ['Dove', 'Chi', 'Cosa']]]
      },
      {
        id: 'piacere', icon: '❤️', level: 'A2',
        title: { he: 'piacere — איך אומרים שאוהבים', en: 'Piacere — saying what you like', ar: 'piacere — كيف نعبّر عمّا نحب', ru: 'Piacere — как сказать, что нравится' },
        explain: {
          he: ['כמו בספרדית: Mi piace = מוצא חן בעיניי. Mi piace il caffè.', 'piace עם דבר אחד או פועל, piacciono עם רבים: Mi piacciono i musei.', 'למי: mi, ti, gli (לו), le (לה), ci (לנו), vi, gli (להם).'],
          en: ['Literally "it pleases me": Mi piace il caffè.', 'piace with one thing or a verb, piacciono with plural things: Mi piacciono i musei.', 'To whom: mi, ti, gli (him), le (her), ci (us), vi, gli (them).'],
          ar: ['حرفيًا «يعجبني»: Mi piace il caffè.', 'piace مع شيء واحد أو فعل، وpiacciono مع الجمع: Mi piacciono i musei.', 'لمن: mi، ti، gli (له)، le (لها)، ci (لنا)، vi، gli (لهم).'],
          ru: ['Буквально «мне нравится»: Mi piace il caffè.', 'piace — с одним предметом или глаголом, piacciono — с множественным: Mi piacciono i musei.', 'Кому: mi, ti, gli (ему), le (ей), ci (нам), vi, gli (им).']
        },
        table: [['mi piace', 'il caffè · viaggiare'], ['mi piacciono', 'i musei · le spiagge']],
        ex: [
          ['Mi piace viaggiare.', 'אני אוהב לטייל.', 'I like travelling.', 'أحب السفر.', 'Я люблю путешествовать.'],
          ['Ti piace la cucina italiana?', 'אתה אוהב את המטבח האיטלקי?', 'Do you like Italian food?', 'هل يعجبك المطبخ الإيطالي؟', 'Тебе нравится итальянская кухня?'],
          ['Ci piacciono le spiagge.', 'אנחנו אוהבים חופים.', 'We like beaches.', 'نحب الشواطئ.', 'Нам нравятся пляжи.'],
          ['Non mi piace il freddo.', 'אני לא אוהב קור.', "I don't like the cold.", 'لا أحب البرد.', 'Я не люблю холод.']
        ],
        drills: [['Mi ___ la pizza.', 'piace', ['piace', 'piacciono', 'piaccio']], ['Mi ___ i gatti.', 'piacciono', ['piace', 'piacciono', 'piacere']], ['___ piace ballare?', 'Ti', ['Ti', 'Tu', 'Io']], ['A lei ___ piace il mare.', 'le', ['le', 'gli', 'mi']]]
      },
      {
        id: 'passato', icon: '⏮️', level: 'A2',
        title: { he: 'עבר: passato prossimo (ho mangiato, sono andato)', en: 'The past: passato prossimo (ho mangiato, sono andato)', ar: 'الماضي: passato prossimo', ru: 'Прошедшее время: passato prossimo' },
        explain: {
          he: ['עבר מדובר: avere / essere בהווה + צורת עבר: ho mangiato, ho visto.', 'פעלי תנועה ושינוי מצב באים עם essere, וצורת העבר מתאימה במין: sono andato / sono andata.', 'סיומות: ‎-are → ato, -ere → uto, -ire → ito (parlato, venduto, dormito). חריגים: fatto, visto, preso.'],
          en: ['Spoken past: avere / essere in the present + past participle: ho mangiato, ho visto.', 'Verbs of movement and change take essere and agree in gender: sono andato / sono andata.', 'Endings: -are → ato, -ere → uto, -ire → ito (parlato, venduto, dormito). Irregulars: fatto, visto, preso.'],
          ar: ['الماضي المحكي: avere / essere في المضارع + اسم المفعول: ho mangiato, ho visto.', 'أفعال الحركة وتغيّر الحال تأتي مع essere وتتوافق في الجنس: sono andato / sono andata.', 'النهايات: ‎-are ← ato، ‎-ere ← uto، ‎-ire ← ito (parlato, venduto, dormito). الشواذ: fatto, visto, preso.'],
          ru: ['Разговорное прошедшее: avere / essere в настоящем + причастие: ho mangiato, ho visto.', 'Глаголы движения и изменения состояния — с essere и согласуются по роду: sono andato / sono andata.', 'Окончания: -are → ato, -ere → uto, -ire → ito (parlato, venduto, dormito). Неправильные: fatto, visto, preso.']
        },
        table: [['avere', 'ho mangiato · hai visto · ha fatto'], ['essere', 'sono andato · è arrivata · siamo usciti']],
        ex: [
          ['Ieri ho visitato il Colosseo.', 'אתמול ביקרתי בקולוסיאום.', 'Yesterday I visited the Colosseum.', 'زرت الكولوسيوم أمس.', 'Вчера я был в Колизее.'],
          ['Abbiamo mangiato molto bene.', 'אכלנו טוב מאוד.', 'We ate very well.', 'أكلنا جيدًا جدًا.', 'Мы очень хорошо поели.'],
          ['Sei andato al mare?', 'הלכת לים?', 'Did you go to the sea?', 'هل ذهبت إلى البحر؟', 'Ты ходил на море?'],
          ['Il treno è arrivato in ritardo.', 'הרכבת הגיעה באיחור.', 'The train arrived late.', 'وصل القطار متأخرًا.', 'Поезд пришёл с опозданием.']
        ],
        drills: [['Ieri ___ mangiato la pasta.', 'ho', ['ho', 'sono', 'ha']], ['Lei è ___ a Milano.', 'andata', ['andato', 'andata', 'andare']], ['Noi ___ visto un film.', 'abbiamo', ['abbiamo', 'siamo', 'hanno']], ['Hai ___ i biglietti?', 'preso', ['prenduto', 'preso', 'prendo']]]
      },
      {
        id: 'possessives', icon: '🏷️', level: 'A2',
        title: { he: 'שייכות: il mio, la tua, il suo', en: 'Possessives: il mio, la tua, il suo', ar: 'الملكية: il mio, la tua, il suo', ru: 'Притяжательные: il mio, la tua, il suo' },
        explain: {
          he: ['באיטלקית לפני מילת שייכות בא בדרך כלל ה־ הידיעה: il mio passaporto, la mia valigia.', 'mio / mia (שלי), tuo / tua (שלך), suo / sua (שלו / שלה), nostro / nostra (שלנו).', 'עם בן משפחה אחד אין מילית: mia madre, tuo fratello.'],
          en: ['Italian usually puts the article before a possessive: il mio passaporto, la mia valigia.', 'mio / mia (my), tuo / tua (your), suo / sua (his / her), nostro / nostra (our).', 'With a single family member there is no article: mia madre, tuo fratello.'],
          ar: ['في الإيطالية تأتي أداة التعريف عادة قبل الملكية: il mio passaporto, la mia valigia.', 'mio / mia (ـي)، tuo / tua (ـك)، suo / sua (ـه / ـها)، nostro / nostra (ـنا).', 'مع فرد واحد من العائلة لا نضع الأداة: mia madre, tuo fratello.'],
          ru: ['Перед притяжательным обычно ставится артикль: il mio passaporto, la mia valigia.', 'mio / mia (мой), tuo / tua (твой), suo / sua (его / её), nostro / nostra (наш).', 'С одним членом семьи артикль не нужен: mia madre, tuo fratello.']
        },
        table: [['il mio', 'la mia'], ['il tuo', 'la tua'], ['il suo', 'la sua'], ['il nostro', 'la nostra']],
        ex: [
          ['Questa è la mia valigia.', 'זאת המזוודה שלי.', 'This is my suitcase.', 'هذه حقيبتي.', 'Это мой чемодан.'],
          ['Qual è il tuo numero?', 'מה המספר שלך?', 'What is your number?', 'ما رقمك؟', 'Какой у тебя номер?'],
          ['Il nostro albergo è in centro.', 'המלון שלנו במרכז.', 'Our hotel is in the centre.', 'فندقنا في وسط المدينة.', 'Наша гостиница в центре.'],
          ['Mia madre parla italiano.', 'אמא שלי מדברת איטלקית.', 'My mother speaks Italian.', 'أمي تتكلم الإيطالية.', 'Моя мама говорит по-итальянски.']
        ],
        drills: [["Dov'è ___ mio zaino?", 'il', ['il', 'la', 'lo']], ['Questa è la ___ camera.', 'nostra', ['nostro', 'nostra', 'nostri']], ['___ madre è a Roma.', 'Mia', ['Mia', 'La mia', 'Mio']], ['È il ___ passaporto?', 'tuo', ['tuo', 'tua', 'tue']]]
      },
      {
        id: 'prepositions', icon: '📍', level: 'A2',
        title: { he: 'מילות יחס: a, in, da, di — ו-al, nel, dal', en: 'Prepositions: a, in, da, di — and al, nel, dal', ar: 'حروف الجر: a, in, da, di — و al, nel, dal', ru: 'Предлоги: a, in, da, di — и al, nel, dal' },
        explain: {
          he: ['a — לעיר ולשעה: a Roma, alle otto · in — למדינה ולמקום סגור: in Italia, in albergo.', 'da — מאיפה, או אצל מישהו: da Milano, dal medico · di — של: il biglietto di Marco.', 'מילת יחס + ה־ הידיעה מתחברות: a + il = al, in + la = nella, da + il = dal.'],
          en: ['a — to a city or at a time: a Roma, alle otto · in — to a country or inside a place: in Italia, in albergo.', "da — from, or at someone's place: da Milano, dal medico · di — of: il biglietto di Marco.", 'Preposition + article merge: a + il = al, in + la = nella, da + il = dal.'],
          ar: ['a — لمدينة أو لساعة: a Roma, alle otto · in — لبلد أو داخل مكان: in Italia, in albergo.', 'da — من، أو عند شخص: da Milano, dal medico · di — للملكية: il biglietto di Marco.', 'حرف الجر + أداة التعريف يندمجان: a + il = al، in + la = nella، da + il = dal.'],
          ru: ['a — в город и о времени: a Roma, alle otto · in — в страну или внутрь: in Italia, in albergo.', 'da — откуда или у кого-то: da Milano, dal medico · di — чей: il biglietto di Marco.', 'Предлог + артикль сливаются: a + il = al, in + la = nella, da + il = dal.']
        },
        table: [['a + il = al', 'in + il = nel', 'da + il = dal'], ['a + la = alla', 'in + la = nella', 'da + la = dalla']],
        ex: [
          ['Vado a Firenze domani.', 'אני נוסע לפירנצה מחר.', 'I am going to Florence tomorrow.', 'سأذهب إلى فلورنسا غدًا.', 'Завтра я еду во Флоренцию.'],
          ['Abito in Italia da un anno.', 'אני גר באיטליה כבר שנה.', 'I have lived in Italy for a year.', 'أعيش في إيطاليا منذ سنة.', 'Я живу в Италии уже год.'],
          ['Il treno arriva da Napoli.', 'הרכבת מגיעה מנאפולי.', 'The train is coming from Naples.', 'يصل القطار من نابولي.', 'Поезд прибывает из Неаполя.'],
          ['Ci vediamo al bar alle sei.', 'ניפגש בבר בשש.', 'See you at the café at six.', 'نلتقي في المقهى في السادسة.', 'Увидимся в баре в шесть.']
        ],
        drills: [['Vado ___ Venezia.', 'a', ['a', 'in', 'di']], ['Abitiamo ___ Spagna.', 'in', ['a', 'in', 'da']], ['Il treno arriva ___ Milano.', 'da', ['da', 'di', 'in']], ['Ci vediamo ___ ristorante.', 'al', ['al', 'il', 'a']]]
      }
    ]
  };

  window.LQGrammar = GRAMMAR;
})();
