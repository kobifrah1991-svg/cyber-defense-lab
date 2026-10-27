/* LangQuest — content registry (languages · accents · stations · phrases · boss dialogues)
 *
 * Word format: "token|meaning-he|syl·la·bles|תַּעְ·תּוּק|stressIndex"
 *   - token        : the word as it appears in the phrase (punctuation is stripped for matching)
 *   - meaning-he   : quick Hebrew gloss shown on tap
 *   - syllables    : split with "·"
 *   - translit     : Hebrew niqqud transliteration, same syllable count, split with "·"
 *   - stressIndex  : 0-based index of the stressed syllable (default 0)
 *
 * Adding a language = add an entry to LANGS with the same shape. Boss turns reference
 * phrase indices of the station (`expect`).
 */

function W(spec) {
  const [token, meaning, syl, he, stress] = spec.split('|');
  const clean = token.replace(/[¿¡?!.,]/g, '');
  return {
    token,
    clean,
    meaning,
    syl: (syl || clean).split('·'),
    he: (he || '').split('·'),
    stress: Number(stress || 0)
  };
}

function P(text, he, emoji, words) {
  return { text, he, emoji, words: words.map(W) };
}

const STATIONS = [
  { id: 'airport', npcGender: 'm', name: 'שדה תעופה', name_en: 'Airport', name_ar: 'المطار', name_ru: 'Аэропорт', icon: '✈️', npc: '🛂' },
  { id: 'taxi', npcGender: 'm', name: 'מוניות ותחבורה', name_en: 'Taxi & transport', name_ar: 'التاكسي والمواصلات', name_ru: 'Такси и транспорт', icon: '🚕', npc: '🧔' },
  { id: 'hotel', npcGender: 'f', name: 'מלון', name_en: 'Hotel', name_ar: 'الفندق', name_ru: 'Отель', icon: '🏨', npc: '🛎️' },
  { id: 'cafe', npcGender: 'f', name: 'בית קפה', name_en: 'Café', name_ar: 'المقهى', name_ru: 'Кафе', icon: '☕', npc: '👩' },
  { id: 'restaurant', npcGender: 'm', name: 'מסעדה', name_en: 'Restaurant', name_ar: 'المطعم', name_ru: 'Ресторан', icon: '🍽️', npc: '🧑‍🍳' },
  { id: 'directions', npcGender: 'f', name: 'התמצאות ברחוב', name_en: 'Getting around', name_ar: 'التنقل في الشوارع', name_ru: 'Ориентирование', icon: '🧭', npc: '🙋‍♀️' },
  { id: 'sights', npcGender: 'm', name: 'אטרקציות ומוזיאונים', name_en: 'Sights & museums', name_ar: 'المعالم والمتاحف', name_ru: 'Достопримечательности', icon: '🏛️', npc: '👨‍💼' },
  { id: 'shopping', npcGender: 'f', name: 'קניות', name_en: 'Shopping', name_ar: 'التسوق', name_ru: 'Покупки', icon: '🛍️', npc: '🧑‍💼' },
  { id: 'smalltalk', npcGender: 'f', name: 'היכרות ושיחת חולין', name_en: 'Meeting people', name_ar: 'التعارف والدردشة', name_ru: 'Знакомства', icon: '💬', npc: '💁‍♀️' },
  { id: 'emergency', npcGender: 'f', name: 'חירום ורפואה', name_en: 'Emergency & health', name_ar: 'الطوارئ والصحة', name_ru: 'Экстренная помощь', icon: '🚑', npc: '🧑‍⚕️' }
];

const LANGS = {
  en: {
    id: 'en',
    name: 'אנגלית',
    name_en: 'English',
    name_ar: 'الإنجليزية',
    name_ru: 'Английский',
    native: 'English',
    flag: '🇬🇧',
    status: 'ready',
    accents: [
      { code: 'en-US', label: 'אמריקאית', label_en: 'American', label_ar: 'أمريكية', label_ru: 'Американский', flag: '🇺🇸' },
      { code: 'en-GB', label: 'בריטית', label_en: 'British', label_ar: 'بريطانية', label_ru: 'Британский', flag: '🇬🇧' }
    ],
    stations: {
      taxi: {
        phrases: [
          P('Can you take me to this address?', 'אפשר לקחת אותי לכתובת הזאת?', '🚕', [
            'Can|האם אפשר|can|קֶן', 'you|אתה|you|יוּ', 'take|לקחת|take|טֵייק', 'me|אותי|me|מִי', 'to|אל|to|טוּ',
            'this|הזאת|this|דִיס', 'address?|כתובת|ad·dress|אֶ·דְרֶס|0'
          ]),
          P('How long does it take?', 'כמה זמן זה לוקח?', '⏱️', [
            'How|איך|how|הָאוּ', 'long|ארוך (כמה זמן)|long|לוֹנְג', 'does|(פועל עזר)|does|דָאז', 'it|זה|it|אִיט', 'take?|לוקח|take|טֵייק'
          ]),
          P('Please stop here.', 'עצור כאן, בבקשה.', '🛑', [
            'Please|בבקשה|please|פְּלִיז', 'stop|עצור|stop|סְטוֹפּ', 'here.|כאן|here|הִיר'
          ])
        ],
        boss: {
          title: 'נהג המונית', title_en: 'Taxi driver', title_ar: 'سائق التاكسي', title_ru: 'Таксист',
          intro: ['Hi there! Where to?', 'היי! לאן?'],
          turns: [
            { expect: 0, reply: ['No problem. Buckle up!', 'אין בעיה. תחגור חגורה!'] },
            { expect: 1, reply: ['About twenty minutes with this traffic.', 'בערך עשרים דקות עם הפקקים האלה.'] },
            { expect: 2, reply: ["Here you go. That's fifteen dollars.", 'הגענו. זה חמישה־עשר דולר.'] }
          ]
        }
      },
      cafe: {
        phrases: [
          P('A coffee with milk, please.', 'קפה עם חלב, בבקשה.', '☕', [
            'A|(אחד)|a|אָ', 'coffee|קפה|cof·fee|קוֹ·פִי|0', 'with|עם|with|וִויד׳', 'milk,|חלב|milk|מִילְק', 'please.|בבקשה|please|פְּלִיז'
          ]),
          P('Is there Wi-Fi here?', 'יש כאן Wi-Fi?', '📶', [
            'Is|האם|is|אִיז', 'there|(יש)|there|דֶ׳ר', 'Wi-Fi|אינטרנט אלחוטי|wi·fi|וַאי·פַאי|0', 'here?|כאן|here|הִיר'
          ]),
          P('Can I have it to go?', 'אפשר לקחת את זה איתי?', '🥡', [
            'Can|האם אפשר|can|קֶן', 'I|אני|I|אַיי', 'have|לקבל|have|הֶב', 'it|את זה|it|אִיט', 'to|ל־|to|טוּ', 'go?|ללכת (לקחת)|go|גוֹאוּ'
          ])
        ],
        boss: {
          title: 'הבריסטה', title_en: 'Barista', title_ar: 'الباريستا', title_ru: 'Бариста',
          intro: ['Hi! What can I get you?', 'היי! מה להביא לך?'],
          turns: [
            { expect: 0, reply: ['Coming right up. Anything else?', 'מיד מגיע. עוד משהו?'] },
            { expect: 1, reply: ['Yes, the password is on the board.', 'כן, הסיסמה על הלוח.'] },
            { expect: 2, reply: ['Sure! Here you go. Have a great day!', 'בטח! בבקשה. יום נהדר!'] }
          ]
        }
      },
      directions: {
        phrases: [
          P("Excuse me, I'm lost.", 'סליחה, הלכתי לאיבוד.', '🗺️', [
            'Excuse|סליחה|ex·cuse|אֶקְס·קְיוּז|1', 'me,|לי (סליחה)|me|מִי', "I'm|אני|I'm|אַיים", 'lost.|אבוד|lost|לוֹסְט'
          ]),
          P('How do I get to the station?', 'איך מגיעים לתחנה?', '🚉', [
            'How|איך|how|הָאוּ', 'do|(פועל עזר)|do|דוּ', 'I|אני|I|אַיי', 'get|מגיע|get|גֶט', 'to|אל|to|טוּ', 'the|ה־|the|דָה',
            'station?|תחנה|sta·tion|סְטֵיי·שֶׁן|0'
          ]),
          P('Is it far from here?', 'זה רחוק מכאן?', '📍', [
            'Is|האם|is|אִיז', 'it|זה|it|אִיט', 'far|רחוק|far|פָאר', 'from|מ־|from|פְרוֹם', 'here?|כאן|here|הִיר'
          ])
        ],
        boss: {
          title: 'מקומית שעוזרת', title_en: 'Friendly local', title_ar: 'امرأة من السكان المحليين', title_ru: 'Местная жительница',
          intro: ['Hi! You look a little confused.', 'היי! אתה נראה קצת מבולבל.'],
          turns: [
            { expect: 0, reply: ['No worries, I can help. Where do you want to go?', 'אל דאגה, אני יכולה לעזור. לאן אתה רוצה להגיע?'] },
            { expect: 1, reply: ['Go straight and turn left at the bank.', 'לך ישר ופנה שמאלה ליד הבנק.'] },
            { expect: 2, reply: ["No, it's only five minutes on foot.", 'לא, זה רק חמש דקות ברגל.'] }
          ]
        }
      },
      sights: {
        phrases: [
          P('Two tickets, please.', 'שני כרטיסים, בבקשה.', '🎟️', [
            'Two|שניים|two|טוּ', 'tickets,|כרטיסים|tick·ets|טִי·קֶטְס|0', 'please.|בבקשה|please|פְּלִיז'
          ]),
          P('What time does it close?', 'באיזו שעה זה נסגר?', '🕔', [
            'What|מה|what|ווֹט', 'time|שעה|time|טַיים', 'does|(פועל עזר)|does|דָאז', 'it|זה|it|אִיט', 'close?|נסגר|close|קְלוֹאוּז'
          ]),
          P('Can I take a photo?', 'אפשר לצלם?', '📸', [
            'Can|האם אפשר|can|קֶן', 'I|אני|I|אַיי', 'take|לקחת (לצלם)|take|טֵייק', 'a|(אחת)|a|אָ', 'photo?|תמונה|pho·to|פוֹ·טוֹ|0'
          ])
        ],
        boss: {
          title: 'הקופאי במוזיאון', title_en: 'Ticket clerk', title_ar: 'موظف التذاكر', title_ru: 'Кассир музея',
          intro: ['Welcome to the museum!', 'ברוכים הבאים למוזיאון!'],
          turns: [
            { expect: 0, reply: ["That's thirty dollars. Here you go.", 'זה שלושים דולר. בבקשה.'] },
            { expect: 1, reply: ['We close at six today.', 'היום אנחנו סוגרים בשש.'] },
            { expect: 2, reply: ['Yes, but no flash, please.', 'כן, אבל בלי פלאש, בבקשה.'] }
          ]
        }
      },
      smalltalk: {
        phrases: [
          P('Nice to meet you!', 'נעים מאוד להכיר!', '🤝', [
            'Nice|נעים|nice|נַייס', 'to|ל־|to|טוּ', 'meet|לפגוש|meet|מִיט', 'you!|אותך|you|יוּ'
          ]),
          P('Where are you from?', 'מאיפה אתה?', '🌍', [
            'Where|איפה|where|וֶר', 'are|(אתה)|are|אָר', 'you|אתה|you|יוּ', 'from?|מ־|from|פְרוֹם'
          ]),
          P('See you later!', 'נתראה אחר כך!', '👋', [
            'See|לראות|see|סִי', 'you|אותך|you|יוּ', 'later!|אחר כך|la·ter|לֵיי·טֶר|0'
          ])
        ],
        boss: {
          title: 'חברה חדשה', title_en: 'New friend', title_ar: 'صديقة جديدة', title_ru: 'Новая знакомая',
          intro: ["Hi! I'm Kate. Welcome to the party!", 'היי! אני קייט. ברוך הבא למסיבה!'],
          turns: [
            { expect: 0, reply: ['Nice to meet you too!', 'גם לי נעים!'] },
            { expect: 1, reply: ["I'm from Chicago. Oh, my friends are calling me!", 'אני משיקגו. אוי, החברים שלי קוראים לי!'] },
            { expect: 2, reply: ['Bye! Enjoy the party!', 'ביי! תהנה במסיבה!'] }
          ]
        }
      },
      airport: {
        phrases: [
          P('Here is my passport.', 'הנה הדרכון שלי.', '🛂', [
            'Here|הנה|here|הִיר', 'is|נמצא / הוא|is|אִיז', 'my|שלי|my|מַאי',
            'passport.|דרכון|pass·port|פַּאס·פּוֹרְט|0'
          ]),
          P('I have a connecting flight.', 'יש לי טיסת המשך.', '🔁', [
            'I|אני|I|אַיי', 'have|יש לי|have|הֶב', 'a|(אחד / אחת)|a|אָ',
            'connecting|מחברת / המשך|con·nect·ing|קָה·נֶק·טִינְג|1', 'flight.|טיסה|flight|פְלַייט'
          ]),
          P('Where is the gate?', 'איפה השער?', '🚪', [
            'Where|איפה|where|וֶר', 'is|נמצא|is|אִיז', 'the|ה־|the|דָה', 'gate?|שער|gate|גֵייט'
          ])
        ],
        boss: {
          title: 'פקיד הגבולות', title_en: 'Border officer', title_ar: 'ضابط الحدود', title_ru: 'Пограничник',
          intro: ['Good morning! Passport, please.', 'בוקר טוב! דרכון, בבקשה.'],
          turns: [
            { expect: 0, reply: ['Thank you. What is your final destination?', 'תודה. מה היעד הסופי שלך?'] },
            { expect: 1, reply: ['Okay. Do you have any questions?', 'בסדר. יש לך שאלות?'] },
            { expect: 2, reply: ['Gate twelve, on your left. Have a good flight!', 'שער 12, משמאלך. טיסה טובה!'] }
          ]
        }
      },
      hotel: {
        phrases: [
          P('I have a reservation.', 'יש לי הזמנה.', '📋', [
            'I|אני|I|אַיי', 'have|יש לי|have|הֶב', 'a|(אחת)|a|אָ',
            'reservation.|הזמנה|res·er·va·tion|רֶ·זֶר·וֵוי·שֶׁן|2'
          ]),
          P('What time is breakfast?', 'באיזו שעה ארוחת הבוקר?', '🥐', [
            'What|מה|what|ווֹט', 'time|שעה / זמן|time|טַיים', 'is|היא|is|אִיז',
            'breakfast?|ארוחת בוקר|break·fast|בְּרֶק·פַסְט|0'
          ]),
          P('Could I have another towel?', 'אפשר לקבל עוד מגבת?', '🧺', [
            'Could|האם אפשר|could|קוּד', 'I|אני|I|אַיי', 'have|לקבל|have|הֶב',
            'another|עוד אחד|an·oth·er|אָ·נָ·דֶ׳ר|1', 'towel?|מגבת|tow·el|טָא·וֶל|0'
          ])
        ],
        boss: {
          title: 'פקידת הקבלה', title_en: 'Receptionist', title_ar: 'موظفة الاستقبال', title_ru: 'Администратор',
          intro: ['Welcome! How can I help you?', 'ברוכים הבאים! איך אפשר לעזור?'],
          turns: [
            { expect: 0, reply: ['Perfect, here is your key. Anything else?', 'מצוין, הנה המפתח שלך. עוד משהו?'] },
            { expect: 1, reply: ['From seven to ten. Anything else?', 'משבע עד עשר. עוד משהו?'] },
            { expect: 2, reply: ['Of course, I will send one up. Enjoy your stay!', 'כמובן, אשלח אחת לחדר. שהייה נעימה!'] }
          ]
        }
      },
      restaurant: {
        phrases: [
          P('A table for two, please.', 'שולחן לשניים, בבקשה.', '🍽️', [
            'A|(אחד)|a|אָ', 'table|שולחן|ta·ble|טֵיי·בֶּל|0', 'for|עבור / ל־|for|פוֹר',
            'two,|שניים|two|טוּ', 'please.|בבקשה|please|פְּלִיז'
          ]),
          P('Can I see the menu?', 'אפשר לראות את התפריט?', '📜', [
            'Can|האם אפשר|can|קֶן', 'I|אני|I|אַיי', 'see|לראות|see|סִי', 'the|ה־|the|דָה',
            'menu?|תפריט|men·u|מֶנ·יוּ|0'
          ]),
          P('The check, please.', 'החשבון, בבקשה.', '🧾', [
            'The|ה־|the|דָה', 'check,|חשבון|check|צֶ׳ק', 'please.|בבקשה|please|פְּלִיז'
          ])
        ],
        boss: {
          title: 'המלצר', title_en: 'Waiter', title_ar: 'النادل', title_ru: 'Официант',
          intro: ['Good evening! How many people?', 'ערב טוב! כמה אנשים?'],
          turns: [
            { expect: 0, reply: ['Right this way. Would you like to order?', 'בבקשה, מכאן. תרצו להזמין?'] },
            { expect: 1, reply: ['Here you go. How was everything?', 'בבקשה. איך היה הכול?'] },
            { expect: 2, reply: ['Here you are. Have a nice evening!', 'הנה. ערב נעים!'] }
          ]
        }
      },
      shopping: {
        phrases: [
          P('Do you have this in a medium?', 'יש לכם את זה במידה בינונית?', '👕', [
            'Do|(פועל עזר לשאלה)|do|דוּ', 'you|אתם|you|יוּ', 'have|יש לכם|have|הֶב',
            'this|זה|this|דִיס', 'in|ב־|in|אִין', 'a|(אחד)|a|אָ',
            'medium?|בינוני (M)|me·di·um|מִי·דִי·אָם|0'
          ]),
          P('How much does this cost?', 'כמה זה עולה?', '💰', [
            'How|איך|how|הָאוּ', 'much|הרבה (כמה)|much|מָאץ׳', 'does|(פועל עזר)|does|דָאז',
            'this|זה|this|דִיס', 'cost?|עולה|cost|קוֹסְט'
          ]),
          P('Can I pay by card?', 'אפשר לשלם בכרטיס?', '💳', [
            'Can|האם אפשר|can|קֶן', 'I|אני|I|אַיי', 'pay|לשלם|pay|פֵּיי',
            'by|באמצעות|by|בַּאי', 'card?|כרטיס|card|קַארְד'
          ])
        ],
        boss: {
          title: 'המוכרת', title_en: 'Shop assistant', title_ar: 'البائعة', title_ru: 'Продавец',
          intro: ['Hi! Are you looking for something?', 'היי! מחפשים משהו?'],
          turns: [
            { expect: 0, reply: ['Yes, here it is.', 'כן, הנה.'] },
            { expect: 1, reply: ['It is twenty dollars.', 'זה עשרים דולר.'] },
            { expect: 2, reply: ['Sure! Here is your bag. Thank you!', 'בטח! הנה השקית שלך. תודה!'] }
          ]
        }
      },
      emergency: {
        phrases: [
          P('I need a doctor.', 'אני צריך רופא.', '🩺', [
            'I|אני|I|אַיי', 'need|צריך|need|נִיד', 'a|(אחד)|a|אָ', 'doctor.|רופא|doc·tor|דּוֹק·טוֹר|0'
          ]),
          P('Call an ambulance!', 'תזמינו אמבולנס!', '🚑', [
            'Call|התקשרו / הזמינו|call|קוֹל', 'an|(אחד)|an|אֶן',
            'ambulance!|אמבולנס|am·bu·lance|אֶמ·בְּיוּ·לֶנְס|0'
          ]),
          P('Where is the nearest pharmacy?', 'איפה בית המרקחת הקרוב?', '💊', [
            'Where|איפה|where|וֶר', 'is|נמצא|is|אִיז', 'the|ה־|the|דָה',
            'nearest|הקרוב ביותר|near·est|נִי·רֶסְט|0', 'pharmacy?|בית מרקחת|phar·ma·cy|פַאר·מָה·סִי|0'
          ])
        ],
        boss: {
          title: 'הפרמדיקית', title_en: 'Paramedic', title_ar: 'المسعفة', title_ru: 'Фельдшер',
          intro: ['Hello, what is wrong?', 'שלום, מה קרה?'],
          turns: [
            { expect: 0, reply: ['Is it serious? Can you breathe?', 'זה רציני? אתה יכול לנשום?'] },
            { expect: 1, reply: ['They are on the way. Anything else?', 'הם בדרך. עוד משהו?'] },
            { expect: 2, reply: ['Two blocks away, on the right. Take care!', 'שני רחובות מכאן, מימין. שמור על עצמך!'] }
          ]
        }
      }
    }
  },

  es: {
    id: 'es',
    name: 'ספרדית',
    name_en: 'Spanish',
    name_ar: 'الإسبانية',
    name_ru: 'Испанский',
    native: 'Español',
    flag: '🇪🇸',
    status: 'ready',
    accents: [
      { code: 'es-ES', label: 'אירופאית', label_en: 'European', label_ar: 'أوروبية', label_ru: 'Европейский', flag: '🇪🇸' },
      { code: 'es-MX', label: 'לטינית', label_en: 'Latin American', label_ar: 'لاتينية', label_ru: 'Латиноамериканский', flag: '🇲🇽' }
    ],
    stations: {
      taxi: {
        phrases: [
          P('¿Me puede llevar a esta dirección?', 'אפשר לקחת אותי לכתובת הזאת?', '🚕', [
            '¿Me|אותי|me|מֶה', 'puede|יכול|pue·de|פּוּאֶ·דֶה|0', 'llevar|לקחת|lle·var|יֶה·בַאר|1', 'a|אל|a|אָה',
            'esta|הזאת|es·ta|אֶס·טָה|0', 'dirección?|כתובת|di·rec·ción|דִי·רֶק·סְיוֹן|2'
          ]),
          P('¿Cuánto tiempo tarda?', 'כמה זמן זה לוקח?', '⏱️', [
            '¿Cuánto|כמה|cuán·to|קוּאַנְ·טוֹ|0', 'tiempo|זמן|tiem·po|טְיֶם·פּוֹ|0', 'tarda?|לוקח|tar·da|טַאר·דָה|0'
          ]),
          P('Pare aquí, por favor.', 'עצור כאן, בבקשה.', '🛑', [
            'Pare|עצור|pa·re|פָּ·רֶה|0', 'aquí,|כאן|a·quí|אָ·קִי|1', 'por|(בבקשה)|por|פּוֹר', 'favor.|טובה (בבקשה)|fa·vor|פָה·בוֹר|1'
          ])
        ],
        boss: {
          title: 'נהג המונית', title_en: 'Taxi driver', title_ar: 'سائق التاكسي', title_ru: 'Таксист',
          intro: ['¡Hola! ¿Adónde vamos?', 'שלום! לאן נוסעים?'],
          turns: [
            { expect: 0, reply: ['Claro. Abróchese el cinturón.', 'בטח. תחגור חגורה.'] },
            { expect: 1, reply: ['Unos veinte minutos con este tráfico.', 'בערך עשרים דקות עם התנועה הזאת.'] },
            { expect: 2, reply: ['Aquí tiene. Son quince euros.', 'הגענו. זה חמישה־עשר יורו.'] }
          ]
        }
      },
      cafe: {
        phrases: [
          P('Un café con leche, por favor.', 'קפה עם חלב, בבקשה.', '☕', [
            'Un|(אחד)|un|אוּן', 'café|קפה|ca·fé|קָה·פֶה|1', 'con|עם|con|קוֹן', 'leche,|חלב|le·che|לֶה·צֶ׳ה|0',
            'por|(בבקשה)|por|פּוֹר', 'favor.|טובה (בבקשה)|fa·vor|פָה·בוֹר|1'
          ]),
          P('¿Hay wifi aquí?', 'יש כאן Wi-Fi?', '📶', [
            '¿Hay|יש|hay|אַיי', 'wifi|אינטרנט אלחוטי|wi·fi|וּאִי·פִי|0', 'aquí?|כאן|a·quí|אָ·קִי|1'
          ]),
          P('¿Me lo pone para llevar?', 'אפשר לקחת את זה איתי?', '🥡', [
            '¿Me|לי|me|מֶה', 'lo|אותו|lo|לוֹ', 'pone|שם (מגיש)|po·ne|פּוֹ·נֶה|0', 'para|ל־|pa·ra|פָּ·רָה|0', 'llevar?|לקחת|lle·var|יֶה·בַאר|1'
          ])
        ],
        boss: {
          title: 'הבריסטה', title_en: 'Barista', title_ar: 'الباريستا', title_ru: 'Бариста',
          intro: ['¡Hola! ¿Qué le pongo?', 'שלום! מה להגיש לך?'],
          turns: [
            { expect: 0, reply: ['Ahora mismo. ¿Algo más?', 'מיד. עוד משהו?'] },
            { expect: 1, reply: ['Sí, la contraseña está en la pizarra.', 'כן, הסיסמה על הלוח.'] },
            { expect: 2, reply: ['¡Claro! Aquí tiene. ¡Que tenga buen día!', 'בטח! בבקשה. שיהיה לך יום טוב!'] }
          ]
        }
      },
      directions: {
        phrases: [
          P('Perdone, estoy perdido.', 'סליחה, הלכתי לאיבוד.', '🗺️', [
            'Perdone,|סליחה|per·do·ne|פֶּר·דוֹ·נֶה|1', 'estoy|אני (נמצא)|es·toy|אֶס·טוֹי|1', 'perdido.|אבוד|per·di·do|פֶּר·דִי·דוֹ|1'
          ]),
          P('¿Cómo llego a la estación?', 'איך מגיעים לתחנה?', '🚉', [
            '¿Cómo|איך|có·mo|קוֹ·מוֹ|0', 'llego|אני מגיע|lle·go|יֶה·גוֹ|0', 'a|אל|a|אָה', 'la|ה־|la|לָה',
            'estación?|תחנה|es·ta·ción|אֶס·טָה·סְיוֹן|2'
          ]),
          P('¿Está lejos de aquí?', 'זה רחוק מכאן?', '📍', [
            '¿Está|זה (נמצא)|es·tá|אֶס·טָה|1', 'lejos|רחוק|le·jos|לֶה·חוֹס|0', 'de|מ־|de|דֶה', 'aquí?|כאן|a·quí|אָ·קִי|1'
          ])
        ],
        boss: {
          title: 'מקומית שעוזרת', title_en: 'Friendly local', title_ar: 'امرأة من السكان المحليين', title_ru: 'Местная жительница',
          intro: ['¡Hola! Parece un poco perdido.', 'שלום! נראה שאתה קצת אבוד.'],
          turns: [
            { expect: 0, reply: ['Tranquilo, le ayudo. ¿Adónde quiere ir?', 'אל דאגה, אני אעזור. לאן אתה רוצה ללכת?'] },
            { expect: 1, reply: ['Siga recto y gire a la izquierda en el banco.', 'המשך ישר ופנה שמאלה ליד הבנק.'] },
            { expect: 2, reply: ['No, está a cinco minutos andando.', 'לא, זה חמש דקות הליכה.'] }
          ]
        }
      },
      sights: {
        phrases: [
          P('Dos entradas, por favor.', 'שני כרטיסים, בבקשה.', '🎟️', [
            'Dos|שניים|dos|דּוֹס', 'entradas,|כרטיסי כניסה|en·tra·das|אֶנְ·טְרָה·דָס|1', 'por|(בבקשה)|por|פּוֹר',
            'favor.|טובה (בבקשה)|fa·vor|פָה·בוֹר|1'
          ]),
          P('¿A qué hora cierra?', 'באיזו שעה זה נסגר?', '🕔', [
            '¿A|ב־|a|אָה', 'qué|מה / איזו|qué|קֶה', 'hora|שעה|ho·ra|אוֹ·רָה|0', 'cierra?|נסגר|cie·rra|סְיֶה·רָה|0'
          ]),
          P('¿Puedo hacer una foto?', 'אפשר לצלם?', '📸', [
            '¿Puedo|אני יכול|pue·do|פּוּאֶ·דוֹ|0', 'hacer|לעשות|ha·cer|אָה·סֶר|1', 'una|(אחת)|u·na|אוּ·נָה|0', 'foto?|תמונה|fo·to|פוֹ·טוֹ|0'
          ])
        ],
        boss: {
          title: 'הקופאי במוזיאון', title_en: 'Ticket clerk', title_ar: 'موظف التذاكر', title_ru: 'Кассир музея',
          intro: ['¡Bienvenidos al museo!', 'ברוכים הבאים למוזיאון!'],
          turns: [
            { expect: 0, reply: ['Son treinta euros. Aquí tienen.', 'זה שלושים יורו. בבקשה.'] },
            { expect: 1, reply: ['Hoy cerramos a las seis.', 'היום אנחנו סוגרים בשש.'] },
            { expect: 2, reply: ['Sí, pero sin flash, por favor.', 'כן, אבל בלי פלאש, בבקשה.'] }
          ]
        }
      },
      smalltalk: {
        phrases: [
          P('¡Encantado de conocerte!', 'נעים מאוד להכיר!', '🤝', [
            '¡Encantado|נעים לי (מוקסם)|en·can·ta·do|אֶנְ·קָאנְ·טָה·דוֹ|2', 'de|ל־|de|דֶה', 'conocerte!|להכיר אותך|co·no·cer·te|קוֹ·נוֹ·סֶר·טֶה|2'
          ]),
          P('¿De dónde eres?', 'מאיפה אתה?', '🌍', [
            '¿De|מ־|de|דֶה', 'dónde|איפה|dón·de|דּוֹנְ·דֶה|0', 'eres?|אתה|e·res|אֶה·רֶס|0'
          ]),
          P('¡Hasta luego!', 'נתראה אחר כך!', '👋', [
            '¡Hasta|עד|has·ta|אָס·טָה|0', 'luego!|אחר כך|lue·go|לוּאֶה·גוֹ|0'
          ])
        ],
        boss: {
          title: 'חברה חדשה', title_en: 'New friend', title_ar: 'صديقة جديدة', title_ru: 'Новая знакомая',
          intro: ['¡Hola! Soy Carmen. ¡Bienvenido a la fiesta!', 'שלום! אני כרמן. ברוך הבא למסיבה!'],
          turns: [
            { expect: 0, reply: ['¡Igualmente!', 'גם לי!'] },
            { expect: 1, reply: ['Soy de Sevilla. ¡Ay, mis amigos me llaman!', 'אני מסביליה. אוי, החברים שלי קוראים לי!'] },
            { expect: 2, reply: ['¡Chao! ¡Disfruta de la fiesta!', 'ביי! תהנה במסיבה!'] }
          ]
        }
      },
      airport: {
        phrases: [
          P('Aquí está mi pasaporte.', 'הנה הדרכון שלי.', '🛂', [
            'Aquí|כאן / הנה|a·quí|אָ·קִי|1', 'está|נמצא|es·tá|אֶס·טָה|1', 'mi|שלי|mi|מִי',
            'pasaporte.|דרכון|pa·sa·por·te|פָּ·סָה·פּוֹר·טֶה|2'
          ]),
          P('Tengo un vuelo de conexión.', 'יש לי טיסת המשך.', '🔁', [
            'Tengo|יש לי|ten·go|טֶנְ·גוֹ|0', 'un|(אחד)|un|אוּן', 'vuelo|טיסה|vue·lo|בּוּאֶ·לוֹ|0',
            'de|של|de|דֶה', 'conexión.|קונקשן / המשך|co·ne·xión|קוֹ·נֶק·סְיוֹן|2'
          ]),
          P('¿Dónde está la puerta de embarque?', 'איפה שער העלייה למטוס?', '🚪', [
            '¿Dónde|איפה|dón·de|דּוֹנְ·דֶה|0', 'está|נמצא|es·tá|אֶס·טָה|1', 'la|ה־|la|לָה',
            'puerta|דלת / שער|puer·ta|פּוּאֶר·טָה|0', 'de|של|de|דֶה',
            'embarque?|עלייה למטוס|em·bar·que|אֶמְ·בַּאר·קֶה|1'
          ])
        ],
        boss: {
          title: 'פקיד הגבולות', title_en: 'Border officer', title_ar: 'ضابط الحدود', title_ru: 'Пограничник',
          intro: ['¡Buenos días! Su pasaporte, por favor.', 'בוקר טוב! הדרכון שלך, בבקשה.'],
          turns: [
            { expect: 0, reply: ['Gracias. ¿Cuál es su destino final?', 'תודה. מה היעד הסופי שלך?'] },
            { expect: 1, reply: ['Muy bien. ¿Alguna pregunta?', 'טוב מאוד. יש שאלה?'] },
            { expect: 2, reply: ['Puerta doce, a la izquierda. ¡Buen viaje!', 'שער 12, משמאל. נסיעה טובה!'] }
          ]
        }
      },
      hotel: {
        phrases: [
          P('Tengo una reserva.', 'יש לי הזמנה.', '📋', [
            'Tengo|יש לי|ten·go|טֶנְ·גוֹ|0', 'una|(אחת)|u·na|אוּ·נָה|0',
            'reserva.|הזמנה|re·ser·va|רֶ·סֶר·בָה|1'
          ]),
          P('¿A qué hora es el desayuno?', 'באיזו שעה ארוחת הבוקר?', '🥐', [
            '¿A|ב־|a|אָה', 'qué|מה / איזו|qué|קֶה', 'hora|שעה|ho·ra|אוֹ·רָה|0', 'es|היא|es|אֶס',
            'el|ה־|el|אֶל', 'desayuno?|ארוחת בוקר|de·sa·yu·no|דֶּ·סָה·יוּ·נוֹ|2'
          ]),
          P('¿Me puede dar otra toalla?', 'אפשר לקבל עוד מגבת?', '🧺', [
            '¿Me|לי|me|מֶה', 'puede|יכול/ה|pue·de|פּוּאֶ·דֶה|0', 'dar|לתת|dar|דַּאר',
            'otra|עוד (אחרת)|o·tra|אוֹ·טְרָה|0', 'toalla?|מגבת|to·a·lla|טוֹ·אָ·יָה|1'
          ])
        ],
        boss: {
          title: 'פקידת הקבלה', title_en: 'Receptionist', title_ar: 'موظفة الاستقبال', title_ru: 'Администратор',
          intro: ['¡Bienvenido! ¿En qué puedo ayudarle?', 'ברוך הבא! במה אפשר לעזור?'],
          turns: [
            { expect: 0, reply: ['Perfecto, aquí tiene su llave. ¿Algo más?', 'מצוין, הנה המפתח שלך. עוד משהו?'] },
            { expect: 1, reply: ['De siete a diez. ¿Algo más?', 'משבע עד עשר. עוד משהו?'] },
            { expect: 2, reply: ['Claro, se la subimos. ¡Disfrute su estancia!', 'כמובן, נעלה אותה לחדר. שהייה נעימה!'] }
          ]
        }
      },
      restaurant: {
        phrases: [
          P('Una mesa para dos, por favor.', 'שולחן לשניים, בבקשה.', '🍽️', [
            'Una|(אחת)|u·na|אוּ·נָה|0', 'mesa|שולחן|me·sa|מֶה·סָה|0', 'para|עבור / ל־|pa·ra|פָּ·רָה|0',
            'dos,|שניים|dos|דּוֹס', 'por|(בבקשה)|por|פּוֹר', 'favor.|טובה (בבקשה)|fa·vor|פָה·בוֹר|1'
          ]),
          P('¿Me trae la carta, por favor?', 'תביא לי את התפריט, בבקשה?', '📜', [
            '¿Me|לי|me|מֶה', 'trae|מביא/ה|tra·e|טְרָה·אֶה|0', 'la|ה־|la|לָה',
            'carta,|תפריט|car·ta|קַאר·טָה|0', 'por|(בבקשה)|por|פּוֹר', 'favor?|טובה (בבקשה)|fa·vor|פָה·בוֹר|1'
          ]),
          P('La cuenta, por favor.', 'החשבון, בבקשה.', '🧾', [
            'La|ה־|la|לָה', 'cuenta,|חשבון|cuen·ta|קוּאֶנ·טָה|0', 'por|(בבקשה)|por|פּוֹר',
            'favor.|טובה (בבקשה)|fa·vor|פָה·בוֹר|1'
          ])
        ],
        boss: {
          title: 'המלצר', title_en: 'Waiter', title_ar: 'النادل', title_ru: 'Официант',
          intro: ['¡Buenas noches! ¿Cuántas personas?', 'ערב טוב! כמה אנשים?'],
          turns: [
            { expect: 0, reply: ['Por aquí, por favor. ¿Desean pedir?', 'מכאן, בבקשה. תרצו להזמין?'] },
            { expect: 1, reply: ['Aquí tiene. ¿Qué tal todo?', 'בבקשה. איך היה הכול?'] },
            { expect: 2, reply: ['Aquí tiene. ¡Buenas noches!', 'הנה. לילה טוב!'] }
          ]
        }
      },
      shopping: {
        phrases: [
          P('¿Lo tiene en talla mediana?', 'יש לכם את זה במידה בינונית?', '👕', [
            '¿Lo|אותו|lo|לוֹ', 'tiene|יש לך / לכם|tie·ne|טְיֶה·נֶה|0', 'en|ב־|en|אֶן',
            'talla|מידה|ta·lla|טָה·יָה|0', 'mediana?|בינונית (M)|me·dia·na|מֶה·דְיָה·נָה|1'
          ]),
          P('¿Cuánto cuesta esto?', 'כמה זה עולה?', '💰', [
            '¿Cuánto|כמה|cuán·to|קוּאַנְ·טוֹ|0', 'cuesta|עולה|cues·ta|קוּאֶס·טָה|0',
            'esto?|זה|es·to|אֶס·טוֹ|0'
          ]),
          P('¿Puedo pagar con tarjeta?', 'אפשר לשלם בכרטיס?', '💳', [
            '¿Puedo|אני יכול|pue·do|פּוּאֶ·דוֹ|0', 'pagar|לשלם|pa·gar|פָּ·גַאר|1', 'con|עם / ב־|con|קוֹן',
            'tarjeta?|כרטיס|tar·je·ta|טַאר·חֶה·טָה|1'
          ])
        ],
        boss: {
          title: 'המוכרת', title_en: 'Shop assistant', title_ar: 'البائعة', title_ru: 'Продавец',
          intro: ['¡Hola! ¿Busca algo?', 'שלום! מחפשים משהו?'],
          turns: [
            { expect: 0, reply: ['Sí, aquí está.', 'כן, הנה.'] },
            { expect: 1, reply: ['Veinte euros.', 'עשרים יורו.'] },
            { expect: 2, reply: ['¡Claro! Aquí tiene su bolsa. ¡Gracias!', 'בטח! הנה השקית שלך. תודה!'] }
          ]
        }
      },
      emergency: {
        phrases: [
          P('Necesito un médico.', 'אני צריך רופא.', '🩺', [
            'Necesito|אני צריך|ne·ce·si·to|נֶה·סֶה·סִי·טוֹ|2', 'un|(אחד)|un|אוּן',
            'médico.|רופא|mé·di·co|מֶה·דִי·קוֹ|0'
          ]),
          P('¡Llame a una ambulancia!', 'תזמינו אמבולנס!', '🚑', [
            '¡Llame|התקשר / הזמן|lla·me|יָה·מֶה|0', 'a|ל־|a|אָה', 'una|(אחת)|u·na|אוּ·נָה|0',
            'ambulancia!|אמבולנס|am·bu·lan·cia|אַמְ·בּוּ·לַאן·סְיָה|2'
          ]),
          P('¿Dónde está la farmacia más cercana?', 'איפה בית המרקחת הקרוב?', '💊', [
            '¿Dónde|איפה|dón·de|דּוֹנְ·דֶה|0', 'está|נמצא|es·tá|אֶס·טָה|1', 'la|ה־|la|לָה',
            'farmacia|בית מרקחת|far·ma·cia|פַאר·מָה·סְיָה|1', 'más|הכי / יותר|más|מַאס',
            'cercana?|קרובה|cer·ca·na|סֶר·קָה·נָה|1'
          ])
        ],
        boss: {
          title: 'הפרמדיקית', title_en: 'Paramedic', title_ar: 'المسعفة', title_ru: 'Фельдшер',
          intro: ['Hola, ¿qué le pasa?', 'שלום, מה קרה לך?'],
          turns: [
            { expect: 0, reply: ['¿Es grave? ¿Puede respirar?', 'זה חמור? אתה יכול לנשום?'] },
            { expect: 1, reply: ['Ya vienen. ¿Algo más?', 'הם כבר בדרך. עוד משהו?'] },
            { expect: 2, reply: ['A dos calles, a la derecha. ¡Cuídese!', 'שני רחובות מכאן, מימין. שמור על עצמך!'] }
          ]
        }
      }
    }
  },

  // Planned languages — shown on the picker as "בקרוב"; fill `stations` to activate.
  fr: { id: 'fr', name: 'צרפתית', name_en: 'French', name_ar: 'الفرنسية', name_ru: 'Французский', native: 'Français', flag: '🇫🇷', status: 'soon', accents: [{ code: 'fr-FR', label: 'צרפת', label_en: 'France', label_ar: 'فرنسا', label_ru: 'Франция', flag: '🇫🇷' }, { code: 'fr-CA', label: 'קנדה', label_en: 'Canada', label_ar: 'كندا', label_ru: 'Канада', flag: '🇨🇦' }], stations: {} },
  it: {
    id: 'it',
    name: 'איטלקית',
    name_en: 'Italian',
    name_ar: 'الإيطالية',
    name_ru: 'Итальянский',
    native: 'Italiano',
    flag: '🇮🇹',
    status: 'ready',
    accents: [
      { code: 'it-IT', label: 'איטליה', label_en: 'Italy', label_ar: 'إيطاليا', label_ru: 'Италия', flag: '🇮🇹' }
    ],
    stations: {
      airport: {
        phrases: [
          P('Ecco il mio passaporto.', 'הנה הדרכון שלי.', '🛂', [
            'Ecco|הנה|ec·co|אֶק·קוֹ|0', 'il|ה־|il|אִיל', 'mio|שלי|mi·o|מִי·אוֹ|0', 'passaporto.|דרכון|pas·sa·por·to|פָּס·סָה·פּוֹר·טוֹ|2'
          ]),
          P('Ho un volo in coincidenza.', 'יש לי טיסת המשך.', '🔁', [
            'Ho|יש לי|ho|אוֹ', 'un|(אחד)|un|אוּן', 'volo|טיסה|vo·lo|ווֹ·לוֹ|0', 'in|ב־|in|אִין',
            'coincidenza.|קונקשן / המשך|co·in·ci·den·za|קוֹ·אִין·צִ׳י·דֶנְ·צָה|3'
          ]),
          P("Dov'è il gate?", 'איפה השער?', '🚪', [
            "Dov'è|איפה (נמצא)|do·vè|דוֹ·וֶה|1", 'il|ה־|il|אִיל', 'gate?|שער|gate|גֵייט'
          ])
        ],
        boss: {
          title: 'פקיד הגבולות', title_en: 'Border officer', title_ar: 'ضابط الحدود', title_ru: 'Пограничник',
          intro: ['Buongiorno! Passaporto, per favore.', 'בוקר טוב! דרכון, בבקשה.'],
          turns: [
            { expect: 0, reply: ['Grazie. Qual è la sua destinazione finale?', 'תודה. מה היעד הסופי שלך?'] },
            { expect: 1, reply: ['Va bene. Ha qualche domanda?', 'בסדר. יש לך שאלות?'] },
            { expect: 2, reply: ['Gate dodici, sulla sinistra. Buon viaggio!', 'שער 12, משמאל. נסיעה טובה!'] }
          ]
        }
      },
      taxi: {
        phrases: [
          P('Mi può portare a questo indirizzo?', 'אפשר לקחת אותי לכתובת הזאת?', '🚕', [
            'Mi|אותי|mi|מִי', 'può|יכול|può|פּוּאוֹ', 'portare|לקחת|por·ta·re|פּוֹר·טָה·רֶה|1', 'a|אל|a|אָה',
            'questo|הזאת|que·sto|קְוֶוס·טוֹ|0', 'indirizzo?|כתובת|in·di·riz·zo|אִינְ·דִי·רִיצְ·צוֹ|2'
          ]),
          P('Quanto tempo ci vuole?', 'כמה זמן זה לוקח?', '⏱️', [
            'Quanto|כמה|quan·to|קְוָאנְ·טוֹ|0', 'tempo|זמן|tem·po|טֶמְ·פּוֹ|0', 'ci|(זה)|ci|צִ׳י', 'vuole?|לוקח (צריך)|vuo·le|ווּאוֹ·לֶה|0'
          ]),
          P('Si fermi qui, per favore.', 'עצור כאן, בבקשה.', '🛑', [
            'Si|(את עצמך)|si|סִי', 'fermi|עצור|fer·mi|פֶר·מִי|0', 'qui,|כאן|qui|קְוִוי', 'per|(בבקשה)|per|פֶּר',
            'favore.|טובה (בבקשה)|fa·vo·re|פָה·ווֹ·רֶה|1'
          ])
        ],
        boss: {
          title: 'נהג המונית', title_en: 'Taxi driver', title_ar: 'سائق التاكسي', title_ru: 'Таксист',
          intro: ['Buongiorno! Dove andiamo?', 'שלום! לאן נוסעים?'],
          turns: [
            { expect: 0, reply: ['Certo. Allacci la cintura.', 'בטח. תחגור חגורה.'] },
            { expect: 1, reply: ['Circa venti minuti con questo traffico.', 'בערך עשרים דקות עם התנועה הזאת.'] },
            { expect: 2, reply: ['Eccoci. Sono quindici euro.', 'הגענו. זה חמישה־עשר יורו.'] }
          ]
        }
      },
      hotel: {
        phrases: [
          P('Ho una prenotazione.', 'יש לי הזמנה.', '📋', [
            'Ho|יש לי|ho|אוֹ', 'una|(אחת)|u·na|אוּ·נָה|0', 'prenotazione.|הזמנה|pre·no·ta·zio·ne|פְּרֶה·נוֹ·טָה·צְיוֹ·נֶה|3'
          ]),
          P('A che ora è la colazione?', 'באיזו שעה ארוחת הבוקר?', '🥐', [
            'A|ב־|a|אָה', 'che|מה / איזו|che|קֶה', 'ora|שעה|o·ra|אוֹ·רָה|0', 'è|היא|è|אֶה', 'la|ה־|la|לָה',
            'colazione?|ארוחת בוקר|co·la·zio·ne|קוֹ·לָה·צְיוֹ·נֶה|2'
          ]),
          P('Posso avere un altro asciugamano?', 'אפשר לקבל עוד מגבת?', '🧺', [
            'Posso|אני יכול|pos·so|פּוֹס·סוֹ|0', 'avere|לקבל|a·ve·re|אָ·וֶה·רֶה|1', 'un|(אחד)|un|אוּן',
            'altro|עוד (אחר)|al·tro|אָל·טְרוֹ|0', 'asciugamano?|מגבת|a·sciu·ga·ma·no|אָ·שׁוּ·גָה·מָה·נוֹ|3'
          ])
        ],
        boss: {
          title: 'פקידת הקבלה', title_en: 'Receptionist', title_ar: 'موظفة الاستقبال', title_ru: 'Администратор',
          intro: ['Benvenuto! Come posso aiutarla?', 'ברוך הבא! איך אפשר לעזור?'],
          turns: [
            { expect: 0, reply: ['Perfetto, ecco la sua chiave. Altro?', 'מצוין, הנה המפתח שלך. עוד משהו?'] },
            { expect: 1, reply: ['Dalle sette alle dieci. Altro?', 'משבע עד עשר. עוד משהו?'] },
            { expect: 2, reply: ['Certo, gliela porto in camera. Buon soggiorno!', 'כמובן, אביא לך לחדר. שהייה נעימה!'] }
          ]
        }
      },
      cafe: {
        phrases: [
          P('Un cappuccino, per favore.', 'קפוצ׳ינו, בבקשה.', '☕', [
            'Un|(אחד)|un|אוּן', 'cappuccino,|קפוצ׳ינו|cap·puc·ci·no|קָאפּ·פּוּץ׳·צִ׳י·נוֹ|2', 'per|(בבקשה)|per|פֶּר',
            'favore.|טובה (בבקשה)|fa·vo·re|פָה·ווֹ·רֶה|1'
          ]),
          P("C'è il wifi?", 'יש כאן Wi-Fi?', '📶', [
            "C'è|יש|c'è|צֶ׳ה", 'il|ה־|il|אִיל', 'wifi?|אינטרנט אלחוטי|wi·fi|וָאי·פָאי|0'
          ]),
          P('È da portare via.', 'זה לקחת איתי.', '🥡', [
            'È|זה|è|אֶה', 'da|ל־|da|דָה', 'portare|לקחת|por·ta·re|פּוֹר·טָה·רֶה|1', 'via.|משם (לקחת)|vi·a|וִי·אָה|0'
          ])
        ],
        boss: {
          title: 'הבריסטה', title_en: 'Barista', title_ar: 'الباريستا', title_ru: 'Бариста',
          intro: ['Ciao! Cosa le preparo?', 'שלום! מה להכין לך?'],
          turns: [
            { expect: 0, reply: ['Subito. Altro?', 'מיד. עוד משהו?'] },
            { expect: 1, reply: ['Sì, la password è sulla lavagna.', 'כן, הסיסמה על הלוח.'] },
            { expect: 2, reply: ['Certo! Ecco a lei. Buona giornata!', 'בטח! בבקשה. יום טוב!'] }
          ]
        }
      },
      restaurant: {
        phrases: [
          P('Un tavolo per due, per favore.', 'שולחן לשניים, בבקשה.', '🍽️', [
            'Un|(אחד)|un|אוּן', 'tavolo|שולחן|ta·vo·lo|טָה·ווֹ·לוֹ|0', 'per|עבור / ל־|per|פֶּר', 'due,|שניים|du·e|דוּ·אֶה|0',
            'per|(בבקשה)|per|פֶּר', 'favore.|טובה (בבקשה)|fa·vo·re|פָה·ווֹ·רֶה|1'
          ]),
          P('Posso vedere il menù?', 'אפשר לראות את התפריט?', '📜', [
            'Posso|אני יכול|pos·so|פּוֹס·סוֹ|0', 'vedere|לראות|ve·de·re|וֶה·דֶה·רֶה|1', 'il|ה־|il|אִיל', 'menù?|תפריט|me·nù|מֶה·נוּ|1'
          ]),
          P('Il conto, per favore.', 'החשבון, בבקשה.', '🧾', [
            'Il|ה־|il|אִיל', 'conto,|חשבון|con·to|קוֹנְ·טוֹ|0', 'per|(בבקשה)|per|פֶּר', 'favore.|טובה (בבקשה)|fa·vo·re|פָה·ווֹ·רֶה|1'
          ])
        ],
        boss: {
          title: 'המלצר', title_en: 'Waiter', title_ar: 'النادل', title_ru: 'Официант',
          intro: ['Buonasera! Quante persone?', 'ערב טוב! כמה אנשים?'],
          turns: [
            { expect: 0, reply: ['Prego, da questa parte. Volete ordinare?', 'בבקשה, מכאן. תרצו להזמין?'] },
            { expect: 1, reply: ["Ecco a lei. Com'era tutto?", 'בבקשה. איך היה הכול?'] },
            { expect: 2, reply: ['Ecco il conto. Buona serata!', 'הנה החשבון. ערב טוב!'] }
          ]
        }
      },
      directions: {
        phrases: [
          P('Scusi, mi sono perso.', 'סליחה, הלכתי לאיבוד.', '🗺️', [
            'Scusi,|סליחה|scu·si|סְקוּ·זִי|0', 'mi|(את עצמי)|mi|מִי', 'sono|אני|so·no|סוֹ·נוֹ|0', 'perso.|אבוד|per·so|פֶּר·סוֹ|0'
          ]),
          P('Come arrivo alla stazione?', 'איך מגיעים לתחנה?', '🚉', [
            'Come|איך|co·me|קוֹ·מֶה|0', 'arrivo|אני מגיע|ar·ri·vo|אָר·רִי·ווֹ|1', 'alla|אל ה־|al·la|אָל·לָה|0',
            'stazione?|תחנה|sta·zio·ne|סְטָה·צְיוֹ·נֶה|1'
          ]),
          P('È lontano da qui?', 'זה רחוק מכאן?', '📍', [
            'È|זה|è|אֶה', 'lontano|רחוק|lon·ta·no|לוֹנְ·טָה·נוֹ|1', 'da|מ־|da|דָה', 'qui?|כאן|qui|קְוִוי'
          ])
        ],
        boss: {
          title: 'מקומית שעוזרת', title_en: 'Friendly local', title_ar: 'امرأة من السكان المحليين', title_ru: 'Местная жительница',
          intro: ["Ciao! Sembra un po' perso.", 'שלום! נראה שאתה קצת אבוד.'],
          turns: [
            { expect: 0, reply: ['Tranquillo, la aiuto io. Dove vuole andare?', 'אל דאגה, אני אעזור. לאן אתה רוצה ללכת?'] },
            { expect: 1, reply: ['Vada dritto e giri a sinistra alla banca.', 'לך ישר ופנה שמאלה ליד הבנק.'] },
            { expect: 2, reply: ['No, sono cinque minuti a piedi.', 'לא, זה חמש דקות ברגל.'] }
          ]
        }
      },
      sights: {
        phrases: [
          P('Due biglietti, per favore.', 'שני כרטיסים, בבקשה.', '🎟️', [
            'Due|שניים|du·e|דוּ·אֶה|0', 'biglietti,|כרטיסים|bi·gliet·ti|בִּי·לְיֶט·טִי|1', 'per|(בבקשה)|per|פֶּר',
            'favore.|טובה (בבקשה)|fa·vo·re|פָה·ווֹ·רֶה|1'
          ]),
          P('A che ora chiude?', 'באיזו שעה זה נסגר?', '🕔', [
            'A|ב־|a|אָה', 'che|מה / איזו|che|קֶה', 'ora|שעה|o·ra|אוֹ·רָה|0', 'chiude?|נסגר|chiu·de|קְיוּ·דֶה|0'
          ]),
          P('Posso fare una foto?', 'אפשר לצלם?', '📸', [
            'Posso|אני יכול|pos·so|פּוֹס·סוֹ|0', 'fare|לעשות|fa·re|פָה·רֶה|0', 'una|(אחת)|u·na|אוּ·נָה|0', 'foto?|תמונה|fo·to|פוֹ·טוֹ|0'
          ])
        ],
        boss: {
          title: 'הקופאי במוזיאון', title_en: 'Ticket clerk', title_ar: 'موظف التذاكر', title_ru: 'Кассир музея',
          intro: ['Benvenuti al museo!', 'ברוכים הבאים למוזיאון!'],
          turns: [
            { expect: 0, reply: ['Sono trenta euro. Ecco a voi.', 'זה שלושים יורו. בבקשה.'] },
            { expect: 1, reply: ['Oggi chiudiamo alle sei.', 'היום אנחנו סוגרים בשש.'] },
            { expect: 2, reply: ['Sì, ma senza flash, per favore.', 'כן, אבל בלי פלאש, בבקשה.'] }
          ]
        }
      },
      shopping: {
        phrases: [
          P("Ce l'ha in taglia media?", 'יש לכם את זה במידה בינונית?', '👕', [
            'Ce|(יש)|ce|צֶ׳ה', "l'ha|את זה (יש לך)|l'ha|לָה", 'in|ב־|in|אִין', 'taglia|מידה|ta·glia|טָה·לְיָה|0',
            'media?|בינונית (M)|me·dia|מֶה·דְיָה|0'
          ]),
          P('Quanto costa questo?', 'כמה זה עולה?', '💰', [
            'Quanto|כמה|quan·to|קְוָאנְ·טוֹ|0', 'costa|עולה|co·sta|קוֹס·טָה|0', 'questo?|זה|que·sto|קְוֶוס·טוֹ|0'
          ]),
          P('Posso pagare con la carta?', 'אפשר לשלם בכרטיס?', '💳', [
            'Posso|אני יכול|pos·so|פּוֹס·סוֹ|0', 'pagare|לשלם|pa·ga·re|פָּ·גָה·רֶה|1', 'con|עם / ב־|con|קוֹן', 'la|ה־|la|לָה',
            'carta?|כרטיס|car·ta|קָאר·טָה|0'
          ])
        ],
        boss: {
          title: 'המוכרת', title_en: 'Shop assistant', title_ar: 'البائعة', title_ru: 'Продавец',
          intro: ['Ciao! Cerca qualcosa?', 'שלום! מחפשים משהו?'],
          turns: [
            { expect: 0, reply: ['Sì, eccola.', 'כן, הנה.'] },
            { expect: 1, reply: ['Venti euro.', 'עשרים יורו.'] },
            { expect: 2, reply: ['Certo! Ecco la sua borsa. Grazie!', 'בטח! הנה השקית שלך. תודה!'] }
          ]
        }
      },
      smalltalk: {
        phrases: [
          P('Piacere di conoscerti!', 'נעים מאוד להכיר!', '🤝', [
            'Piacere|נעים (הנאה)|pia·ce·re|פְּיָה·צֶ׳ה·רֶה|1', 'di|ל־|di|דִי', 'conoscerti!|להכיר אותך|co·no·scer·ti|קוֹ·נוֹ·שֶׁר·טִי|2'
          ]),
          P('Di dove sei?', 'מאיפה אתה?', '🌍', [
            'Di|מ־|di|דִי', 'dove|איפה|do·ve|דוֹ·וֶה|0', 'sei?|אתה|sei|סֵיי'
          ]),
          P('A dopo!', 'נתראה אחר כך!', '👋', [
            'A|ל־|a|אָה', 'dopo!|אחר כך|do·po|דוֹ·פּוֹ|0'
          ])
        ],
        boss: {
          title: 'חברה חדשה', title_en: 'New friend', title_ar: 'صديقة جديدة', title_ru: 'Новая знакомая',
          intro: ['Ciao! Sono Chiara. Benvenuto alla festa!', 'היי! אני קיארה. ברוך הבא למסיבה!'],
          turns: [
            { expect: 0, reply: ['Piacere mio!', 'גם לי נעים!'] },
            { expect: 1, reply: ['Sono di Napoli. Oh, i miei amici mi chiamano!', 'אני מנאפולי. אוי, החברים שלי קוראים לי!'] },
            { expect: 2, reply: ['Ciao! Divertiti alla festa!', 'ביי! תהנה במסיבה!'] }
          ]
        }
      },
      emergency: {
        phrases: [
          P('Ho bisogno di un medico.', 'אני צריך רופא.', '🩺', [
            'Ho|יש לי|ho|אוֹ', 'bisogno|צורך|bi·so·gno|בִּי·זוֹ·נְיוֹ|1', 'di|של / ל־|di|דִי', 'un|(אחד)|un|אוּן',
            'medico.|רופא|me·di·co|מֶה·דִי·קוֹ|0'
          ]),
          P("Chiami un'ambulanza!", 'תזמינו אמבולנס!', '🚑', [
            'Chiami|התקשר / הזמן|chia·mi|קְיָה·מִי|0', "un'ambulanza!|אמבולנס|un'am·bu·lan·za|אוּנָם·בּוּ·לָאנְ·צָה|2"
          ]),
          P("Dov'è la farmacia più vicina?", 'איפה בית המרקחת הקרוב?', '💊', [
            "Dov'è|איפה (נמצא)|do·vè|דוֹ·וֶה|1", 'la|ה־|la|לָה', 'farmacia|בית מרקחת|far·ma·ci·a|פָאר·מָה·צִ׳י·אָה|2',
            'più|יותר / הכי|più|פְּיוּ', 'vicina?|קרובה|vi·ci·na|וִי·צִ׳י·נָה|1'
          ])
        ],
        boss: {
          title: 'הפרמדיקית', title_en: 'Paramedic', title_ar: 'المسعفة', title_ru: 'Фельдшер',
          intro: ['Salve, cosa succede?', 'שלום, מה קרה?'],
          turns: [
            { expect: 0, reply: ['È grave? Riesce a respirare?', 'זה חמור? אתה יכול לנשום?'] },
            { expect: 1, reply: ['Stanno arrivando. Altro?', 'הם בדרך. עוד משהו?'] },
            { expect: 2, reply: ['A due isolati, sulla destra. Si riguardi!', 'שני רחובות מכאן, מימין. שמור על עצמך!'] }
          ]
        }
      }
    }
  },
  de: { id: 'de', name: 'גרמנית', name_en: 'German', name_ar: 'الألمانية', name_ru: 'Немецкий', native: 'Deutsch', flag: '🇩🇪', status: 'soon', accents: [{ code: 'de-DE', label: 'גרמניה', label_en: 'Germany', label_ar: 'ألمانيا', label_ru: 'Германия', flag: '🇩🇪' }], stations: {} }
};

/* ---------- proficiency levels & learning paces ---------- */
const LEVELS = [
  { id: 0, name: 'מתחיל מאפס', cefr: 'Pre-A1', icon: '🌱', desc: 'לא מכיר את השפה, או רק כמה מילים בודדות',
    name_en: 'Absolute beginner', desc_en: "I don't know the language, or only a few words",
    name_ar: 'مبتدئ تمامًا', desc_ar: 'لا أعرف اللغة، أو أعرف بضع كلمات فقط', name_ru: 'Абсолютный новичок', desc_ru: 'Не знаю язык или знаю лишь несколько слов' },
  { id: 1, name: 'בסיסי', cefr: 'A1–A2', icon: '🌿', desc: 'מבין ביטויים פשוטים, מסתדר בקושי בהזמנה או בשאלת כיוונים',
    name_en: 'Basic', desc_en: 'I understand simple phrases and can just about order food or ask the way',
    name_ar: 'أساسي', desc_ar: 'أفهم عبارات بسيطة وبالكاد أطلب طعامًا أو أسأل عن الطريق', name_ru: 'Базовый', desc_ru: 'Понимаю простые фразы, с трудом могу заказать еду или спросить дорогу' },
  { id: 2, name: 'בינוני', cefr: 'B1–B2', icon: '🌳', desc: 'מנהל שיחה יומיומית, אבל ההגייה והביטחון עוד לא שם',
    name_en: 'Intermediate', desc_en: 'I can hold an everyday conversation, but my pronunciation and confidence lag behind',
    name_ar: 'متوسط', desc_ar: 'أدير محادثة يومية، لكن النطق والثقة لم يكتملا بعد', name_ru: 'Средний', desc_ru: 'Могу поддержать бытовой разговор, но не хватает произношения и уверенности' },
  { id: 3, name: 'מתקדם', cefr: 'C1–C2', icon: '🏔️', desc: 'שוטף — רוצה ללטש מבטא והגייה',
    name_en: 'Advanced', desc_en: 'Fluent — I want to polish my accent and pronunciation',
    name_ar: 'متقدم', desc_ar: 'أتحدث بطلاقة — أريد تحسين اللهجة والنطق', name_ru: 'Продвинутый', desc_ru: 'Говорю свободно — хочу отточить акцент и произношение' },
  { id: 4, name: 'שפת אם', cefr: 'Native', icon: '🏠', desc: 'שפת אם / דובר ילידי', knownOnly: true,
    name_en: 'Native', desc_en: 'Mother tongue / native speaker',
    name_ar: 'لغة أم', desc_ar: 'اللغة الأم / متحدث أصلي', name_ru: 'Родной', desc_ru: 'Родной язык / носитель' }
];

// pace per target-language level: slow-mode speed, transliteration default, stations open at start,
// whether the Boss is open without the lesson, whether steps 1–2 can be skipped, and the voice pass mark
const PACES = [
  { id: 0, name: 'עדין', icon: '🐢', slowRate: 0.5, translit: true, unlocked: 1, bossFree: false, skipSteps: false, pass: 50,
    desc: 'הקראה איטית במיוחד (50%), תעתיק עברי מלא, תחנה אחת בכל פעם ורף הגייה מקל',
    name_en: 'Gentle', desc_en: 'Extra-slow narration (50%), one stop at a time and a forgiving pronunciation bar',
    name_ar: 'لطيفة', desc_ar: 'قراءة بطيئة جدًا (50%)، محطة واحدة في كل مرة ومعيار نطق متساهل', name_ru: 'Мягкий', desc_ru: 'Очень медленная озвучка (50%), по одной остановке и мягкая планка произношения' },
  { id: 1, name: 'רגיל', icon: '🚶', slowRate: 0.6, translit: true, unlocked: 1, bossFree: false, skipSteps: false, pass: 60,
    desc: 'מצב צב 60%, תעתיק עברי, תחנות נפתחות בהדרגה',
    name_en: 'Regular', desc_en: 'Turtle mode at 60%, stops unlock one by one',
    name_ar: 'عادية', desc_ar: 'وضع السلحفاة 60%، وتُفتح المحطات تدريجيًا', name_ru: 'Обычный', desc_ru: 'Режим черепахи 60%, остановки открываются постепенно' },
  { id: 2, name: 'מהיר', icon: '🏃', slowRate: 0.7, translit: false, unlocked: 4, bossFree: false, skipSteps: true, pass: 65,
    desc: '4 תחנות פתוחות מיד, אפשר לדלג על שלבי השמיעה, תעתיק כבוי (ניתן להפעיל)',
    name_en: 'Fast', desc_en: '4 stops open right away and you can skip the listening steps',
    name_ar: 'سريعة', desc_ar: '4 محطات مفتوحة فورًا ويمكن تخطي خطوات الاستماع', name_ru: 'Быстрый', desc_ru: '4 остановки открыты сразу, можно пропускать шаги прослушивания' },
  { id: 3, name: 'ליטוש מבטא', icon: '🚀', slowRate: 0.7, translit: false, unlocked: 99, bossFree: true, skipSteps: true, pass: 75,
    desc: 'כל המפה פתוחה, Boss זמין מיד, רף הגייה גבוה — מתמקדים במבטא',
    name_en: 'Accent polish', desc_en: 'The whole map is open, Bosses right away and a high pronunciation bar — focus on accent',
    name_ar: 'صقل اللهجة', desc_ar: 'الخريطة كلها مفتوحة، والزعيم متاح فورًا، ومعيار نطق مرتفع — التركيز على اللهجة', name_ru: 'Шлифовка акцента', desc_ru: 'Вся карта открыта, Боссы доступны сразу, высокая планка произношения — фокус на акценте' }
];

// languages a learner may already know (for the profile); `family` drives the "related language" boost
const KNOWN_LANGS = [
  { id: 'he', name: 'עברית', name_en: 'Hebrew', name_ar: 'العبرية', name_ru: 'Иврит', flag: '🇮🇱', family: 'semitic' },
  { id: 'en', name: 'אנגלית', name_en: 'English', name_ar: 'الإنجليزية', name_ru: 'Английский', flag: '🇬🇧', family: 'germanic' },
  { id: 'ar', name: 'ערבית', name_en: 'Arabic', name_ar: 'العربية', name_ru: 'Арабский', flag: '🇸🇦', family: 'semitic' },
  { id: 'ru', name: 'רוסית', name_en: 'Russian', name_ar: 'الروسية', name_ru: 'Русский', flag: '🇷🇺', family: 'slavic' },
  { id: 'es', name: 'ספרדית', name_en: 'Spanish', name_ar: 'الإسبانية', name_ru: 'Испанский', flag: '🇪🇸', family: 'romance' },
  { id: 'fr', name: 'צרפתית', name_en: 'French', name_ar: 'الفرنسية', name_ru: 'Французский', flag: '🇫🇷', family: 'romance' },
  { id: 'it', name: 'איטלקית', name_en: 'Italian', name_ar: 'الإيطالية', name_ru: 'Итальянский', flag: '🇮🇹', family: 'romance' },
  { id: 'pt', name: 'פורטוגזית', name_en: 'Portuguese', name_ar: 'البرتغالية', name_ru: 'Португальский', flag: '🇵🇹', family: 'romance' },
  { id: 'de', name: 'גרמנית', name_en: 'German', name_ar: 'الألمانية', name_ru: 'Немецкий', flag: '🇩🇪', family: 'germanic' },
  { id: 'am', name: 'אמהרית', name_en: 'Amharic', name_ar: 'الأمهرية', name_ru: 'Амхарский', flag: '🇪🇹', family: 'semitic' },
  { id: 'yi', name: 'יידיש', name_en: 'Yiddish', name_ar: 'اليديشية', name_ru: 'Идиш', flag: '🕍', family: 'germanic' }
];

const LANG_FAMILY = { en: 'germanic', es: 'romance', fr: 'romance', it: 'romance', de: 'germanic' };

/* ---------- base-language translations (non-Hebrew) ----------
 * Hebrew lives inline above; other base languages are attached here so content stays readable.
 * Keyed by target text (phrases, NPC lines) or by lower-case clean token (word glosses).
 * A missing translation falls back to Hebrew.
 */
const TRANSLATIONS = {
  en: {
    phrases: {
      'Aquí está mi pasaporte.': 'Here is my passport.',
      'Tengo un vuelo de conexión.': 'I have a connecting flight.',
      '¿Dónde está la puerta de embarque?': 'Where is the boarding gate?',
      'Tengo una reserva.': 'I have a reservation.',
      '¿A qué hora es el desayuno?': 'What time is breakfast?',
      '¿Me puede dar otra toalla?': 'Could you give me another towel?',
      'Una mesa para dos, por favor.': 'A table for two, please.',
      '¿Me trae la carta, por favor?': 'Could you bring me the menu, please?',
      'La cuenta, por favor.': 'The check, please.',
      '¿Lo tiene en talla mediana?': 'Do you have it in a medium?',
      '¿Cuánto cuesta esto?': 'How much does this cost?',
      '¿Puedo pagar con tarjeta?': 'Can I pay by card?',
      'Necesito un médico.': 'I need a doctor.',
      '¡Llame a una ambulancia!': 'Call an ambulance!',
      '¿Dónde está la farmacia más cercana?': 'Where is the nearest pharmacy?',
      '¡Buenos días! Su pasaporte, por favor.': 'Good morning! Your passport, please.',
      'Gracias. ¿Cuál es su destino final?': 'Thank you. What is your final destination?',
      'Muy bien. ¿Alguna pregunta?': 'Very good. Any questions?',
      'Puerta doce, a la izquierda. ¡Buen viaje!': 'Gate twelve, on the left. Have a good trip!',
      '¡Bienvenido! ¿En qué puedo ayudarle?': 'Welcome! How can I help you?',
      'Perfecto, aquí tiene su llave. ¿Algo más?': 'Perfect, here is your key. Anything else?',
      'De siete a diez. ¿Algo más?': 'From seven to ten. Anything else?',
      'Claro, se la subimos. ¡Disfrute su estancia!': "Of course, we'll bring it up. Enjoy your stay!",
      '¡Buenas noches! ¿Cuántas personas?': 'Good evening! How many people?',
      'Por aquí, por favor. ¿Desean pedir?': 'This way, please. Would you like to order?',
      'Aquí tiene. ¿Qué tal todo?': 'Here you go. How was everything?',
      'Aquí tiene. ¡Buenas noches!': 'Here you are. Good night!',
      '¡Hola! ¿Busca algo?': 'Hi! Are you looking for something?',
      'Sí, aquí está.': 'Yes, here it is.',
      'Veinte euros.': 'Twenty euros.',
      '¡Claro! Aquí tiene su bolsa. ¡Gracias!': "Sure! Here's your bag. Thank you!",
      'Hola, ¿qué le pasa?': "Hello, what's wrong?",
      '¿Es grave? ¿Puede respirar?': 'Is it serious? Can you breathe?',
      'Ya vienen. ¿Algo más?': "They're on their way. Anything else?",
      'A dos calles, a la derecha. ¡Cuídese!': 'Two blocks away, on the right. Take care!'
    },
    words: {
      es: {
        'aquí': 'here', 'está': 'is (located)', 'mi': 'my', 'pasaporte': 'passport', 'tengo': 'I have',
        'un': 'a / one', 'una': 'a / one', 'vuelo': 'flight', 'de': 'of', 'conexión': 'connection',
        'dónde': 'where', 'la': 'the', 'el': 'the', 'puerta': 'door / gate', 'embarque': 'boarding',
        'reserva': 'reservation', 'a': 'at / to', 'qué': 'what / which', 'hora': 'hour / time', 'es': 'is',
        'desayuno': 'breakfast', 'me': '(to) me', 'puede': 'can you', 'dar': 'give', 'otra': 'another',
        'toalla': 'towel', 'mesa': 'table', 'para': 'for', 'dos': 'two', 'por': '(please)', 'favor': 'favour (please)',
        'trae': 'bring', 'carta': 'menu', 'cuenta': 'bill / check', 'lo': 'it', 'tiene': 'you have', 'en': 'in',
        'talla': 'size', 'mediana': 'medium', 'cuánto': 'how much', 'cuesta': 'costs', 'esto': 'this',
        'puedo': 'can I', 'pagar': 'to pay', 'con': 'with', 'tarjeta': 'card', 'necesito': 'I need',
        'médico': 'doctor', 'llame': 'call', 'ambulancia': 'ambulance', 'farmacia': 'pharmacy',
        'más': 'most / more', 'cercana': 'nearest / close'
      }
    }
  },
  ar: {
    phrases: {
      'Here is my passport.': 'تفضّل، هذا جواز سفري.', 'Aquí está mi pasaporte.': 'تفضّل، هذا جواز سفري.',
      'I have a connecting flight.': 'لدي رحلة ترانزيت.', 'Tengo un vuelo de conexión.': 'لدي رحلة ترانزيت.',
      'Where is the gate?': 'أين البوابة؟', '¿Dónde está la puerta de embarque?': 'أين بوابة الصعود إلى الطائرة؟',
      'I have a reservation.': 'لدي حجز.', 'Tengo una reserva.': 'لدي حجز.',
      'What time is breakfast?': 'في أي ساعة الفطور؟', '¿A qué hora es el desayuno?': 'في أي ساعة الفطور؟',
      'Could I have another towel?': 'هل يمكنني الحصول على منشفة أخرى؟', '¿Me puede dar otra toalla?': 'هل يمكنكم إعطائي منشفة أخرى؟',
      'A table for two, please.': 'طاولة لشخصين، من فضلك.', 'Una mesa para dos, por favor.': 'طاولة لشخصين، من فضلك.',
      'Can I see the menu?': 'هل يمكنني رؤية قائمة الطعام؟', '¿Me trae la carta, por favor?': 'هل يمكنكم إحضار قائمة الطعام، من فضلك؟',
      'The check, please.': 'الحساب، من فضلك.', 'La cuenta, por favor.': 'الحساب، من فضلك.',
      'Do you have this in a medium?': 'هل لديكم هذا بمقاس متوسط؟', '¿Lo tiene en talla mediana?': 'هل لديكم هذا بمقاس متوسط؟',
      'How much does this cost?': 'كم سعر هذا؟', '¿Cuánto cuesta esto?': 'كم سعر هذا؟',
      'Can I pay by card?': 'هل يمكنني الدفع بالبطاقة؟', '¿Puedo pagar con tarjeta?': 'هل يمكنني الدفع بالبطاقة؟',
      'I need a doctor.': 'أحتاج إلى طبيب.', 'Necesito un médico.': 'أحتاج إلى طبيب.',
      'Call an ambulance!': 'اطلبوا سيارة إسعاف!', '¡Llame a una ambulancia!': 'اطلبوا سيارة إسعاف!',
      'Where is the nearest pharmacy?': 'أين أقرب صيدلية؟', '¿Dónde está la farmacia más cercana?': 'أين أقرب صيدلية؟',

      'Good morning! Passport, please.': 'صباح الخير! جواز السفر، من فضلك.',
      'Thank you. What is your final destination?': 'شكرًا. ما وجهتك النهائية؟',
      'Okay. Do you have any questions?': 'حسنًا. هل لديك أي أسئلة؟',
      'Gate twelve, on your left. Have a good flight!': 'البوابة رقم 12، على يسارك. رحلة سعيدة!',
      'Welcome! How can I help you?': 'أهلًا وسهلًا! كيف يمكنني مساعدتك؟',
      'Perfect, here is your key. Anything else?': 'ممتاز، هذا مفتاحك. هل تحتاج شيئًا آخر؟',
      'From seven to ten. Anything else?': 'من السابعة حتى العاشرة. شيء آخر؟',
      'Of course, I will send one up. Enjoy your stay!': 'بالتأكيد، سأرسل واحدة إلى غرفتك. إقامة سعيدة!',
      'Good evening! How many people?': 'مساء الخير! كم شخصًا؟',
      'Right this way. Would you like to order?': 'من هنا، من فضلكم. هل تودون الطلب؟',
      'Here you go. How was everything?': 'تفضلوا. كيف كان كل شيء؟',
      'Here you are. Have a nice evening!': 'تفضلوا. أمسية سعيدة!',
      'Hi! Are you looking for something?': 'مرحبًا! هل تبحث عن شيء؟',
      'Yes, here it is.': 'نعم، ها هو.',
      'It is twenty dollars.': 'السعر عشرون دولارًا.',
      'Sure! Here is your bag. Thank you!': 'بالتأكيد! هذه حقيبتك. شكرًا!',
      'Hello, what is wrong?': 'مرحبًا، ما المشكلة؟',
      'Is it serious? Can you breathe?': 'هل الأمر خطير؟ هل تستطيع التنفس؟',
      'They are on the way. Anything else?': 'إنهم في الطريق. شيء آخر؟',
      'Two blocks away, on the right. Take care!': 'على بُعد شارعين، على اليمين. اعتنِ بنفسك!',

      '¡Buenos días! Su pasaporte, por favor.': 'صباح الخير! جواز سفرك، من فضلك.',
      'Gracias. ¿Cuál es su destino final?': 'شكرًا. ما وجهتك النهائية؟',
      'Muy bien. ¿Alguna pregunta?': 'جيد جدًا. هل لديك أي سؤال؟',
      'Puerta doce, a la izquierda. ¡Buen viaje!': 'البوابة رقم 12، على اليسار. رحلة سعيدة!',
      '¡Bienvenido! ¿En qué puedo ayudarle?': 'أهلًا وسهلًا! كيف يمكنني مساعدتك؟',
      'Perfecto, aquí tiene su llave. ¿Algo más?': 'ممتاز، هذا مفتاحك. هل تحتاج شيئًا آخر؟',
      'De siete a diez. ¿Algo más?': 'من السابعة حتى العاشرة. شيء آخر؟',
      'Claro, se la subimos. ¡Disfrute su estancia!': 'بالتأكيد، سنرسلها إلى غرفتك. إقامة سعيدة!',
      '¡Buenas noches! ¿Cuántas personas?': 'مساء الخير! كم شخصًا؟',
      'Por aquí, por favor. ¿Desean pedir?': 'من هنا، من فضلكم. هل تودون الطلب؟',
      'Aquí tiene. ¿Qué tal todo?': 'تفضلوا. كيف كان كل شيء؟',
      'Aquí tiene. ¡Buenas noches!': 'تفضلوا. تصبحون على خير!',
      '¡Hola! ¿Busca algo?': 'مرحبًا! هل تبحث عن شيء؟',
      'Sí, aquí está.': 'نعم، ها هو.',
      'Veinte euros.': 'عشرون يورو.',
      '¡Claro! Aquí tiene su bolsa. ¡Gracias!': 'بالتأكيد! هذه حقيبتك. شكرًا!',
      'Hola, ¿qué le pasa?': 'مرحبًا، ما الذي حدث لك؟',
      '¿Es grave? ¿Puede respirar?': 'هل الأمر خطير؟ هل تستطيع التنفس؟',
      'Ya vienen. ¿Algo más?': 'إنهم في الطريق. شيء آخر؟',
      'A dos calles, a la derecha. ¡Cuídese!': 'على بُعد شارعين، على اليمين. اعتنِ بنفسك!'
    },
    words: {
      en: {
        'here': 'هنا / تفضّل', 'is': 'يكون', 'my': 'ـي (لي)', 'passport': 'جواز سفر', 'i': 'أنا', 'have': 'لدي / أحصل',
        'a': '(أداة نكرة)', 'an': '(أداة نكرة)', 'connecting': 'ترانزيت / متصلة', 'flight': 'رحلة جوية', 'where': 'أين',
        'the': 'الـ', 'gate': 'بوابة', 'reservation': 'حجز', 'what': 'ما / أي', 'time': 'وقت / ساعة', 'breakfast': 'فطور',
        'could': 'هل يمكن', 'another': 'أخرى / آخر', 'towel': 'منشفة', 'table': 'طاولة', 'for': 'لـ', 'two': 'اثنان',
        'please': 'من فضلك', 'can': 'هل يمكن', 'see': 'أرى', 'menu': 'قائمة الطعام', 'check': 'الحساب', 'do': '(فعل مساعد للسؤال)',
        'you': 'أنتم', 'this': 'هذا', 'in': 'في / بـ', 'medium': 'متوسط (M)', 'how': 'كيف', 'much': 'كثير (كم)',
        'does': '(فعل مساعد)', 'cost': 'يكلّف', 'pay': 'أدفع', 'by': 'بواسطة', 'card': 'بطاقة', 'need': 'أحتاج',
        'doctor': 'طبيب', 'call': 'اطلبوا / اتصلوا', 'ambulance': 'سيارة إسعاف', 'nearest': 'الأقرب', 'pharmacy': 'صيدلية'
      },
      es: {
        'aquí': 'هنا', 'está': 'يوجد', 'mi': 'ـي (لي)', 'pasaporte': 'جواز سفر', 'tengo': 'لدي', 'un': 'واحد (نكرة)',
        'una': 'واحدة (نكرة)', 'vuelo': 'رحلة جوية', 'de': 'من / لـ', 'conexión': 'ترانزيت', 'dónde': 'أين', 'la': 'الـ',
        'el': 'الـ', 'puerta': 'باب / بوابة', 'embarque': 'الصعود إلى الطائرة', 'reserva': 'حجز', 'a': 'في / إلى',
        'qué': 'ما / أي', 'hora': 'ساعة', 'es': 'يكون', 'desayuno': 'فطور', 'me': 'لي', 'puede': 'هل يمكنكم', 'dar': 'إعطاء',
        'otra': 'أخرى', 'toalla': 'منشفة', 'mesa': 'طاولة', 'para': 'لـ', 'dos': 'اثنان', 'por': '(من فضلك)',
        'favor': 'معروف (من فضلك)', 'trae': 'تُحضر', 'carta': 'قائمة الطعام', 'cuenta': 'الحساب', 'lo': 'إياه',
        'tiene': 'لديكم', 'en': 'في / بـ', 'talla': 'مقاس', 'mediana': 'متوسط', 'cuánto': 'كم', 'cuesta': 'يكلّف',
        'esto': 'هذا', 'puedo': 'هل يمكنني', 'pagar': 'أن أدفع', 'con': 'بـ / مع', 'tarjeta': 'بطاقة',
        'necesito': 'أحتاج', 'médico': 'طبيب', 'llame': 'اطلبوا / اتصلوا', 'ambulancia': 'سيارة إسعاف',
        'farmacia': 'صيدلية', 'más': 'الأكثر', 'cercana': 'قريبة'
      }
    }
  },
  ru: {
    phrases: {
      'Here is my passport.': 'Вот мой паспорт.', 'Aquí está mi pasaporte.': 'Вот мой паспорт.',
      'I have a connecting flight.': 'У меня стыковочный рейс.', 'Tengo un vuelo de conexión.': 'У меня стыковочный рейс.',
      'Where is the gate?': 'Где выход на посадку?', '¿Dónde está la puerta de embarque?': 'Где выход на посадку?',
      'I have a reservation.': 'У меня есть бронь.', 'Tengo una reserva.': 'У меня есть бронь.',
      'What time is breakfast?': 'Во сколько завтрак?', '¿A qué hora es el desayuno?': 'Во сколько завтрак?',
      'Could I have another towel?': 'Можно мне ещё одно полотенце?', '¿Me puede dar otra toalla?': 'Можно мне ещё одно полотенце?',
      'A table for two, please.': 'Столик на двоих, пожалуйста.', 'Una mesa para dos, por favor.': 'Столик на двоих, пожалуйста.',
      'Can I see the menu?': 'Можно посмотреть меню?', '¿Me trae la carta, por favor?': 'Принесите, пожалуйста, меню.',
      'The check, please.': 'Счёт, пожалуйста.', 'La cuenta, por favor.': 'Счёт, пожалуйста.',
      'Do you have this in a medium?': 'У вас есть это в размере M?', '¿Lo tiene en talla mediana?': 'У вас есть это в размере M?',
      'How much does this cost?': 'Сколько это стоит?', '¿Cuánto cuesta esto?': 'Сколько это стоит?',
      'Can I pay by card?': 'Можно оплатить картой?', '¿Puedo pagar con tarjeta?': 'Можно оплатить картой?',
      'I need a doctor.': 'Мне нужен врач.', 'Necesito un médico.': 'Мне нужен врач.',
      'Call an ambulance!': 'Вызовите скорую!', '¡Llame a una ambulancia!': 'Вызовите скорую!',
      'Where is the nearest pharmacy?': 'Где ближайшая аптека?', '¿Dónde está la farmacia más cercana?': 'Где ближайшая аптека?',

      'Good morning! Passport, please.': 'Доброе утро! Паспорт, пожалуйста.',
      'Thank you. What is your final destination?': 'Спасибо. Какой ваш конечный пункт?',
      'Okay. Do you have any questions?': 'Хорошо. У вас есть вопросы?',
      'Gate twelve, on your left. Have a good flight!': 'Выход двенадцать, слева от вас. Хорошего полёта!',
      'Welcome! How can I help you?': 'Добро пожаловать! Чем могу помочь?',
      'Perfect, here is your key. Anything else?': 'Отлично, вот ваш ключ. Что-нибудь ещё?',
      'From seven to ten. Anything else?': 'С семи до десяти. Что-нибудь ещё?',
      'Of course, I will send one up. Enjoy your stay!': 'Конечно, я пришлю его в номер. Приятного отдыха!',
      'Good evening! How many people?': 'Добрый вечер! Сколько человек?',
      'Right this way. Would you like to order?': 'Сюда, пожалуйста. Будете заказывать?',
      'Here you go. How was everything?': 'Пожалуйста. Как вам всё?',
      'Here you are. Have a nice evening!': 'Пожалуйста. Приятного вечера!',
      'Hi! Are you looking for something?': 'Здравствуйте! Что-то ищете?',
      'Yes, here it is.': 'Да, вот он.',
      'It is twenty dollars.': 'Двадцать долларов.',
      'Sure! Here is your bag. Thank you!': 'Конечно! Вот ваш пакет. Спасибо!',
      'Hello, what is wrong?': 'Здравствуйте, что случилось?',
      'Is it serious? Can you breathe?': 'Это серьёзно? Вы можете дышать?',
      'They are on the way. Anything else?': 'Они уже едут. Что-нибудь ещё?',
      'Two blocks away, on the right. Take care!': 'В двух кварталах, справа. Берегите себя!',

      '¡Buenos días! Su pasaporte, por favor.': 'Доброе утро! Ваш паспорт, пожалуйста.',
      'Gracias. ¿Cuál es su destino final?': 'Спасибо. Какой ваш конечный пункт?',
      'Muy bien. ¿Alguna pregunta?': 'Очень хорошо. Есть вопросы?',
      'Puerta doce, a la izquierda. ¡Buen viaje!': 'Выход двенадцать, налево. Счастливого пути!',
      '¡Bienvenido! ¿En qué puedo ayudarle?': 'Добро пожаловать! Чем могу помочь?',
      'Perfecto, aquí tiene su llave. ¿Algo más?': 'Отлично, вот ваш ключ. Что-нибудь ещё?',
      'De siete a diez. ¿Algo más?': 'С семи до десяти. Что-нибудь ещё?',
      'Claro, se la subimos. ¡Disfrute su estancia!': 'Конечно, мы принесём его в номер. Приятного отдыха!',
      '¡Buenas noches! ¿Cuántas personas?': 'Добрый вечер! Сколько человек?',
      'Por aquí, por favor. ¿Desean pedir?': 'Сюда, пожалуйста. Готовы сделать заказ?',
      'Aquí tiene. ¿Qué tal todo?': 'Пожалуйста. Как вам всё?',
      'Aquí tiene. ¡Buenas noches!': 'Пожалуйста. Доброй ночи!',
      '¡Hola! ¿Busca algo?': 'Здравствуйте! Что-то ищете?',
      'Sí, aquí está.': 'Да, вот он.',
      'Veinte euros.': 'Двадцать евро.',
      '¡Claro! Aquí tiene su bolsa. ¡Gracias!': 'Конечно! Вот ваш пакет. Спасибо!',
      'Hola, ¿qué le pasa?': 'Здравствуйте, что с вами?',
      '¿Es grave? ¿Puede respirar?': 'Это серьёзно? Вы можете дышать?',
      'Ya vienen. ¿Algo más?': 'Они уже едут. Что-нибудь ещё?',
      'A dos calles, a la derecha. ¡Cuídese!': 'В двух кварталах, справа. Берегите себя!'
    },
    words: {
      en: {
        'here': 'вот / здесь', 'is': 'есть (является)', 'my': 'мой', 'passport': 'паспорт', 'i': 'я', 'have': 'иметь / получить',
        'a': '(неопр. артикль)', 'an': '(неопр. артикль)', 'connecting': 'стыковочный', 'flight': 'рейс', 'where': 'где',
        'the': '(опр. артикль)', 'gate': 'выход на посадку', 'reservation': 'бронь', 'what': 'что / какой', 'time': 'время',
        'breakfast': 'завтрак', 'could': 'можно ли', 'another': 'ещё один', 'towel': 'полотенце', 'table': 'столик',
        'for': 'для / на', 'two': 'два', 'please': 'пожалуйста', 'can': 'можно / могу', 'see': 'видеть', 'menu': 'меню',
        'check': 'счёт', 'do': '(вспом. глагол)', 'you': 'вы', 'this': 'это', 'in': 'в', 'medium': 'средний (M)',
        'how': 'как', 'much': 'много (сколько)', 'does': '(вспом. глагол)', 'cost': 'стоить', 'pay': 'платить',
        'by': '(способ: чем)', 'card': 'карта', 'need': 'нужен', 'doctor': 'врач', 'call': 'вызовите',
        'ambulance': 'скорая помощь', 'nearest': 'ближайший', 'pharmacy': 'аптека'
      },
      es: {
        'aquí': 'здесь / вот', 'está': 'находится', 'mi': 'мой', 'pasaporte': 'паспорт', 'tengo': 'у меня есть',
        'un': 'один (неопр. артикль)', 'una': 'одна (неопр. артикль)', 'vuelo': 'рейс', 'de': 'из / о', 'conexión': 'пересадка',
        'dónde': 'где', 'la': '(артикль ж. р.)', 'el': '(артикль м. р.)', 'puerta': 'дверь / выход', 'embarque': 'посадка',
        'reserva': 'бронь', 'a': 'в / к', 'qué': 'что / какой', 'hora': 'час', 'es': 'есть (является)', 'desayuno': 'завтрак',
        'me': 'мне', 'puede': 'можете', 'dar': 'дать', 'otra': 'ещё одну', 'toalla': 'полотенце', 'mesa': 'столик',
        'para': 'для / на', 'dos': 'два', 'por': '(пожалуйста)', 'favor': 'одолжение (пожалуйста)', 'trae': 'принесите',
        'carta': 'меню', 'cuenta': 'счёт', 'lo': 'его', 'tiene': 'у вас есть', 'en': 'в', 'talla': 'размер',
        'mediana': 'средний', 'cuánto': 'сколько', 'cuesta': 'стоит', 'esto': 'это', 'puedo': 'могу', 'pagar': 'заплатить',
        'con': 'с / (чем)', 'tarjeta': 'карта', 'necesito': 'мне нужен', 'médico': 'врач', 'llame': 'вызовите',
        'ambulancia': 'скорая', 'farmacia': 'аптека', 'más': 'самый / более', 'cercana': 'близкая'
      }
    }
  }
};

/* ---------- transliteration in the learner's own script ----------
 * Hebrew niqqud lives inline (word.he). Other base languages: TRANSLIT[base][target][word] = 'syl·syl'
 * with the same syllable count as the word, so the stress marker lines up.
 * Arabic uses پ for /p/ and ڤ for /v/; English is a simple respelling.
 */
const TRANSLIT = {
  ar: {
    en: {
      'here': 'هِير', 'is': 'إِز', 'my': 'ماي', 'passport': 'پاس·پورت', 'i': 'آي', 'have': 'هاڤ', 'a': 'أ', 'an': 'أن',
      'connecting': 'كَ·نِك·تِنغ', 'flight': 'فلايت', 'where': 'وِير', 'the': 'ذا', 'gate': 'غيت',
      'reservation': 'رِ·زِر·ڤي·شِن', 'what': 'ووت', 'time': 'تايم', 'breakfast': 'بريك·فَست', 'could': 'كُد',
      'another': 'أ·نا·ذَر', 'towel': 'تا·وِل', 'table': 'تي·بِل', 'for': 'فور', 'two': 'تو', 'please': 'پليز',
      'can': 'كان', 'see': 'سي', 'menu': 'مِن·يو', 'check': 'تشيك', 'do': 'دو', 'you': 'يو', 'this': 'ذِس',
      'in': 'إن', 'medium': 'مي·دي·أم', 'how': 'هاو', 'much': 'ماتش', 'does': 'داز', 'cost': 'كوست', 'pay': 'پاي',
      'by': 'باي', 'card': 'كارد', 'need': 'نيد', 'doctor': 'دوك·تور', 'call': 'كول', 'ambulance': 'أم·بيو·لَنس',
      'nearest': 'ني·رِست', 'pharmacy': 'فار·ما·سي'
    },
    es: {
      'aquí': 'أ·كي', 'está': 'إس·تا', 'mi': 'مي', 'pasaporte': 'پا·سا·پور·تي', 'tengo': 'تين·غو', 'un': 'أون',
      'vuelo': 'بوي·لو', 'de': 'دي', 'conexión': 'كو·نيك·سيون', 'dónde': 'دون·دي', 'la': 'لا', 'puerta': 'پوير·تا',
      'embarque': 'إم·بار·كي', 'una': 'أو·نا', 'reserva': 'ري·سير·با', 'a': 'آ', 'qué': 'كي', 'hora': 'أو·را',
      'es': 'إس', 'el': 'إل', 'desayuno': 'دي·سا·يو·نو', 'me': 'مي', 'puede': 'پوي·دي', 'dar': 'دار',
      'otra': 'أو·ترا', 'toalla': 'تو·آ·يا', 'mesa': 'مي·سا', 'para': 'پا·را', 'dos': 'دوس', 'por': 'پور',
      'favor': 'فا·بور', 'trae': 'ترا·إي', 'carta': 'كار·تا', 'cuenta': 'كوين·تا', 'lo': 'لو', 'tiene': 'تيي·ني',
      'en': 'إن', 'talla': 'تا·يا', 'mediana': 'مي·ديا·نا', 'cuánto': 'كوان·تو', 'cuesta': 'كويس·تا',
      'esto': 'إس·تو', 'puedo': 'پوي·دو', 'pagar': 'پا·غار', 'con': 'كون', 'tarjeta': 'تار·خي·تا',
      'necesito': 'ني·سي·سي·تو', 'médico': 'مي·دي·كو', 'llame': 'يا·مي', 'ambulancia': 'أم·بو·لان·سيا',
      'farmacia': 'فار·ما·سيا', 'más': 'ماس', 'cercana': 'سير·كا·نا'
    }
  },
  ru: {
    en: {
      'here': 'хир', 'is': 'из', 'my': 'май', 'passport': 'пасс·порт', 'i': 'ай', 'have': 'хэв', 'a': 'э', 'an': 'эн',
      'connecting': 'кэ·нэк·тинг', 'flight': 'флайт', 'where': 'уэр', 'the': 'зэ', 'gate': 'гейт',
      'reservation': 'рэ·зэр·вэй·шн', 'what': 'уот', 'time': 'тайм', 'breakfast': 'брэк·фэст', 'could': 'куд',
      'another': 'э·на·зэр', 'towel': 'та·уэл', 'table': 'тэй·бл', 'for': 'фо', 'two': 'ту', 'please': 'плиз',
      'can': 'кэн', 'see': 'си', 'menu': 'мэн·ю', 'check': 'чек', 'do': 'ду', 'you': 'ю', 'this': 'зис',
      'in': 'ин', 'medium': 'ми·ди·эм', 'how': 'хау', 'much': 'мач', 'does': 'даз', 'cost': 'кост', 'pay': 'пэй',
      'by': 'бай', 'card': 'кард', 'need': 'нид', 'doctor': 'док·тэр', 'call': 'кол', 'ambulance': 'эм·бью·ленс',
      'nearest': 'ни·рэст', 'pharmacy': 'фар·мэ·си'
    },
    es: {
      'aquí': 'а·ки', 'está': 'эс·та', 'mi': 'ми', 'pasaporte': 'па·са·пор·тэ', 'tengo': 'тэн·го', 'un': 'ун',
      'vuelo': 'буэ·ло', 'de': 'дэ', 'conexión': 'ко·нэк·сьон', 'dónde': 'дон·дэ', 'la': 'ла', 'puerta': 'пуэр·та',
      'embarque': 'эм·бар·кэ', 'una': 'у·на', 'reserva': 'рэ·сэр·ба', 'a': 'а', 'qué': 'кэ', 'hora': 'о·ра',
      'es': 'эс', 'el': 'эль', 'desayuno': 'дэ·са·ю·но', 'me': 'мэ', 'puede': 'пуэ·дэ', 'dar': 'дар',
      'otra': 'о·тра', 'toalla': 'то·а·я', 'mesa': 'мэ·са', 'para': 'па·ра', 'dos': 'дос', 'por': 'пор',
      'favor': 'фа·бор', 'trae': 'тра·э', 'carta': 'кар·та', 'cuenta': 'куэн·та', 'lo': 'ло', 'tiene': 'тье·нэ',
      'en': 'эн', 'talla': 'та·я', 'mediana': 'мэ·дья·на', 'cuánto': 'куан·то', 'cuesta': 'куэс·та',
      'esto': 'эс·то', 'puedo': 'пуэ·до', 'pagar': 'па·гар', 'con': 'кон', 'tarjeta': 'тар·хэ·та',
      'necesito': 'нэ·сэ·си·то', 'médico': 'мэ·ди·ко', 'llame': 'я·мэ', 'ambulancia': 'ам·бу·лан·сья',
      'farmacia': 'фар·ма·сья', 'más': 'мас', 'cercana': 'сэр·ка·на'
    }
  },
  en: {
    es: {
      'aquí': 'ah·kee', 'está': 'ehs·tah', 'mi': 'mee', 'pasaporte': 'pah·sah·pohr·teh', 'tengo': 'tehn·goh',
      'un': 'oon', 'vuelo': 'bweh·loh', 'de': 'deh', 'conexión': 'koh·nehk·syohn', 'dónde': 'dohn·deh', 'la': 'lah',
      'puerta': 'pwehr·tah', 'embarque': 'ehm·bahr·keh', 'una': 'oo·nah', 'reserva': 'reh·sehr·bah', 'a': 'ah',
      'qué': 'keh', 'hora': 'oh·rah', 'es': 'ehs', 'el': 'ehl', 'desayuno': 'deh·sah·yoo·noh', 'me': 'meh',
      'puede': 'pweh·deh', 'dar': 'dahr', 'otra': 'oh·trah', 'toalla': 'toh·ah·yah', 'mesa': 'meh·sah',
      'para': 'pah·rah', 'dos': 'dohs', 'por': 'pohr', 'favor': 'fah·bohr', 'trae': 'trah·eh', 'carta': 'kahr·tah',
      'cuenta': 'kwehn·tah', 'lo': 'loh', 'tiene': 'tyeh·neh', 'en': 'ehn', 'talla': 'tah·yah',
      'mediana': 'meh·dyah·nah', 'cuánto': 'kwahn·toh', 'cuesta': 'kwehs·tah', 'esto': 'ehs·toh',
      'puedo': 'pweh·doh', 'pagar': 'pah·gahr', 'con': 'kohn', 'tarjeta': 'tahr·heh·tah',
      'necesito': 'neh·seh·see·toh', 'médico': 'meh·dee·koh', 'llame': 'yah·meh', 'ambulancia': 'ahm·boo·lahn·syah',
      'farmacia': 'fahr·mah·syah', 'más': 'mahs', 'cercana': 'sehr·kah·nah'
    }
  }
};

/* ---------- translations & transliteration: taxi · café · directions · sights · meeting people ---------- */
const EXT = {
  phrases: {
    en: {
      '¿Me puede llevar a esta dirección?': 'Can you take me to this address?', '¿Cuánto tiempo tarda?': 'How long does it take?',
      'Pare aquí, por favor.': 'Stop here, please.', 'Un café con leche, por favor.': 'A coffee with milk, please.',
      '¿Hay wifi aquí?': 'Is there Wi-Fi here?', '¿Me lo pone para llevar?': 'Can I have it to go?',
      'Perdone, estoy perdido.': "Excuse me, I'm lost.", '¿Cómo llego a la estación?': 'How do I get to the station?',
      '¿Está lejos de aquí?': 'Is it far from here?', 'Dos entradas, por favor.': 'Two tickets, please.',
      '¿A qué hora cierra?': 'What time does it close?', '¿Puedo hacer una foto?': 'Can I take a photo?',
      '¡Encantado de conocerte!': 'Nice to meet you!', '¿De dónde eres?': 'Where are you from?', '¡Hasta luego!': 'See you later!',
      '¡Hola! ¿Adónde vamos?': 'Hello! Where are we going?', 'Claro. Abróchese el cinturón.': 'Sure. Fasten your seatbelt.',
      'Unos veinte minutos con este tráfico.': 'About twenty minutes in this traffic.', 'Aquí tiene. Son quince euros.': "Here you are. That's fifteen euros.",
      '¡Hola! ¿Qué le pongo?': 'Hi! What can I get you?', 'Ahora mismo. ¿Algo más?': 'Right away. Anything else?',
      'Sí, la contraseña está en la pizarra.': 'Yes, the password is on the board.', '¡Claro! Aquí tiene. ¡Que tenga buen día!': 'Sure! Here you are. Have a nice day!',
      '¡Hola! Parece un poco perdido.': 'Hi! You look a bit lost.', 'Tranquilo, le ayudo. ¿Adónde quiere ir?': "Don't worry, I'll help you. Where do you want to go?",
      'Siga recto y gire a la izquierda en el banco.': 'Go straight on and turn left at the bank.', 'No, está a cinco minutos andando.': "No, it's a five-minute walk.",
      '¡Bienvenidos al museo!': 'Welcome to the museum!', 'Son treinta euros. Aquí tienen.': "That's thirty euros. Here you are.",
      'Hoy cerramos a las seis.': 'Today we close at six.', 'Sí, pero sin flash, por favor.': 'Yes, but no flash, please.',
      '¡Hola! Soy Carmen. ¡Bienvenido a la fiesta!': "Hi! I'm Carmen. Welcome to the party!", '¡Igualmente!': 'Likewise!',
      'Soy de Sevilla. ¡Ay, mis amigos me llaman!': "I'm from Seville. Oh, my friends are calling me!", '¡Chao! ¡Disfruta de la fiesta!': 'Bye! Enjoy the party!'
    },
    ar: {
      'Can you take me to this address?': 'هل يمكنك أن تأخذني إلى هذا العنوان؟', '¿Me puede llevar a esta dirección?': 'هل يمكنك أن تأخذني إلى هذا العنوان؟',
      'How long does it take?': 'كم من الوقت يستغرق؟', '¿Cuánto tiempo tarda?': 'كم من الوقت يستغرق؟',
      'Please stop here.': 'توقف هنا من فضلك.', 'Pare aquí, por favor.': 'توقف هنا من فضلك.',
      'A coffee with milk, please.': 'قهوة بالحليب، من فضلك.', 'Un café con leche, por favor.': 'قهوة بالحليب، من فضلك.',
      'Is there Wi-Fi here?': 'هل يوجد واي فاي هنا؟', '¿Hay wifi aquí?': 'هل يوجد واي فاي هنا؟',
      'Can I have it to go?': 'هل يمكنني أخذه معي؟', '¿Me lo pone para llevar?': 'هل يمكنني أخذه معي؟',
      "Excuse me, I'm lost.": 'عذرًا، لقد ضعت.', 'Perdone, estoy perdido.': 'عذرًا، لقد ضعت.',
      'How do I get to the station?': 'كيف أصل إلى المحطة؟', '¿Cómo llego a la estación?': 'كيف أصل إلى المحطة؟',
      'Is it far from here?': 'هل هو بعيد من هنا؟', '¿Está lejos de aquí?': 'هل هو بعيد من هنا؟',
      'Two tickets, please.': 'تذكرتان من فضلك.', 'Dos entradas, por favor.': 'تذكرتان من فضلك.',
      'What time does it close?': 'متى يُغلق؟', '¿A qué hora cierra?': 'متى يُغلق؟',
      'Can I take a photo?': 'هل يمكنني التقاط صورة؟', '¿Puedo hacer una foto?': 'هل يمكنني التقاط صورة؟',
      'Nice to meet you!': 'تشرفت بمعرفتك!', '¡Encantado de conocerte!': 'تشرفت بمعرفتك!',
      'Where are you from?': 'من أين أنت؟', '¿De dónde eres?': 'من أين أنت؟',
      'See you later!': 'أراك لاحقًا!', '¡Hasta luego!': 'أراك لاحقًا!',
      'Hi there! Where to?': 'مرحبًا! إلى أين؟', 'No problem. Buckle up!': 'لا مشكلة. اربط حزام الأمان!',
      'About twenty minutes with this traffic.': 'حوالي عشرين دقيقة مع هذه الزحمة.', "Here you go. That's fifteen dollars.": 'وصلنا. المبلغ خمسة عشر دولارًا.',
      'Hi! What can I get you?': 'مرحبًا! ماذا أحضر لك؟', 'Coming right up. Anything else?': 'حالًا. شيء آخر؟',
      'Yes, the password is on the board.': 'نعم، كلمة المرور على اللوحة.', 'Sure! Here you go. Have a great day!': 'بالتأكيد! تفضل. يومًا سعيدًا!',
      'Hi! You look a little confused.': 'مرحبًا! تبدو مرتبكًا قليلًا.', 'No worries, I can help. Where do you want to go?': 'لا تقلق، يمكنني المساعدة. إلى أين تريد أن تذهب؟',
      'Go straight and turn left at the bank.': 'امشِ مباشرة ثم انعطف يسارًا عند البنك.', "No, it's only five minutes on foot.": 'لا، إنها خمس دقائق فقط سيرًا على الأقدام.',
      'Welcome to the museum!': 'أهلًا بكم في المتحف!', "That's thirty dollars. Here you go.": 'المبلغ ثلاثون دولارًا. تفضلوا.',
      'We close at six today.': 'نغلق اليوم في السادسة.', 'Yes, but no flash, please.': 'نعم، لكن بدون فلاش من فضلك.',
      "Hi! I'm Kate. Welcome to the party!": 'مرحبًا! أنا كيت. أهلًا بك في الحفلة!', 'Nice to meet you too!': 'وأنا أيضًا تشرفت بمعرفتك!',
      "I'm from Chicago. Oh, my friends are calling me!": 'أنا من شيكاغو. أوه، أصدقائي ينادونني!', 'Bye! Enjoy the party!': 'إلى اللقاء! استمتع بالحفلة!',
      '¡Hola! ¿Adónde vamos?': 'مرحبًا! إلى أين نذهب؟', 'Claro. Abróchese el cinturón.': 'بالتأكيد. اربط حزام الأمان.',
      'Unos veinte minutos con este tráfico.': 'حوالي عشرين دقيقة مع هذه الزحمة.', 'Aquí tiene. Son quince euros.': 'وصلنا. المبلغ خمسة عشر يورو.',
      '¡Hola! ¿Qué le pongo?': 'مرحبًا! ماذا أقدّم لك؟', 'Ahora mismo. ¿Algo más?': 'حالًا. شيء آخر؟',
      'Sí, la contraseña está en la pizarra.': 'نعم، كلمة المرور على اللوحة.', '¡Claro! Aquí tiene. ¡Que tenga buen día!': 'بالتأكيد! تفضل. يومًا سعيدًا!',
      '¡Hola! Parece un poco perdido.': 'مرحبًا! تبدو تائهًا قليلًا.', 'Tranquilo, le ayudo. ¿Adónde quiere ir?': 'لا تقلق، سأساعدك. إلى أين تريد أن تذهب؟',
      'Siga recto y gire a la izquierda en el banco.': 'امشِ مباشرة ثم انعطف يسارًا عند البنك.', 'No, está a cinco minutos andando.': 'لا، إنها على بُعد خمس دقائق سيرًا.',
      '¡Bienvenidos al museo!': 'أهلًا بكم في المتحف!', 'Son treinta euros. Aquí tienen.': 'المبلغ ثلاثون يورو. تفضلوا.',
      'Hoy cerramos a las seis.': 'نغلق اليوم في السادسة.', 'Sí, pero sin flash, por favor.': 'نعم، لكن بدون فلاش من فضلك.',
      '¡Hola! Soy Carmen. ¡Bienvenido a la fiesta!': 'مرحبًا! أنا كارمن. أهلًا بك في الحفلة!', '¡Igualmente!': 'وأنا كذلك!',
      'Soy de Sevilla. ¡Ay, mis amigos me llaman!': 'أنا من إشبيلية. أوه، أصدقائي ينادونني!', '¡Chao! ¡Disfruta de la fiesta!': 'إلى اللقاء! استمتع بالحفلة!'
    },
    ru: {
      'Can you take me to this address?': 'Отвезёте меня по этому адресу?', '¿Me puede llevar a esta dirección?': 'Отвезёте меня по этому адресу?',
      'How long does it take?': 'Сколько времени это займёт?', '¿Cuánto tiempo tarda?': 'Сколько времени это займёт?',
      'Please stop here.': 'Остановите здесь, пожалуйста.', 'Pare aquí, por favor.': 'Остановите здесь, пожалуйста.',
      'A coffee with milk, please.': 'Кофе с молоком, пожалуйста.', 'Un café con leche, por favor.': 'Кофе с молоком, пожалуйста.',
      'Is there Wi-Fi here?': 'Здесь есть Wi-Fi?', '¿Hay wifi aquí?': 'Здесь есть Wi-Fi?',
      'Can I have it to go?': 'Можно с собой?', '¿Me lo pone para llevar?': 'Можно с собой?',
      "Excuse me, I'm lost.": 'Извините, я заблудился.', 'Perdone, estoy perdido.': 'Извините, я заблудился.',
      'How do I get to the station?': 'Как пройти к станции?', '¿Cómo llego a la estación?': 'Как пройти к станции?',
      'Is it far from here?': 'Это далеко отсюда?', '¿Está lejos de aquí?': 'Это далеко отсюда?',
      'Two tickets, please.': 'Два билета, пожалуйста.', 'Dos entradas, por favor.': 'Два билета, пожалуйста.',
      'What time does it close?': 'Во сколько закрывается?', '¿A qué hora cierra?': 'Во сколько закрывается?',
      'Can I take a photo?': 'Можно сфотографировать?', '¿Puedo hacer una foto?': 'Можно сфотографировать?',
      'Nice to meet you!': 'Приятно познакомиться!', '¡Encantado de conocerte!': 'Приятно познакомиться!',
      'Where are you from?': 'Откуда вы?', '¿De dónde eres?': 'Откуда ты?',
      'See you later!': 'До встречи!', '¡Hasta luego!': 'До встречи!',
      'Hi there! Where to?': 'Здравствуйте! Куда едем?', 'No problem. Buckle up!': 'Без проблем. Пристегнитесь!',
      'About twenty minutes with this traffic.': 'Минут двадцать с такими пробками.', "Here you go. That's fifteen dollars.": 'Приехали. С вас пятнадцать долларов.',
      'Hi! What can I get you?': 'Привет! Что вам предложить?', 'Coming right up. Anything else?': 'Сейчас будет. Что-нибудь ещё?',
      'Yes, the password is on the board.': 'Да, пароль на доске.', 'Sure! Here you go. Have a great day!': 'Конечно! Пожалуйста. Хорошего дня!',
      'Hi! You look a little confused.': 'Привет! Вы, кажется, немного растеряны.', 'No worries, I can help. Where do you want to go?': 'Не волнуйтесь, я помогу. Куда вам нужно?',
      'Go straight and turn left at the bank.': 'Идите прямо и поверните налево у банка.', "No, it's only five minutes on foot.": 'Нет, всего пять минут пешком.',
      'Welcome to the museum!': 'Добро пожаловать в музей!', "That's thirty dollars. Here you go.": 'С вас тридцать долларов. Пожалуйста.',
      'We close at six today.': 'Сегодня мы закрываемся в шесть.', 'Yes, but no flash, please.': 'Да, но без вспышки, пожалуйста.',
      "Hi! I'm Kate. Welcome to the party!": 'Привет! Я Кейт. Добро пожаловать на вечеринку!', 'Nice to meet you too!': 'Мне тоже очень приятно!',
      "I'm from Chicago. Oh, my friends are calling me!": 'Я из Чикаго. Ой, меня зовут друзья!', 'Bye! Enjoy the party!': 'Пока! Хорошо повеселиться!',
      '¡Hola! ¿Adónde vamos?': 'Здравствуйте! Куда едем?', 'Claro. Abróchese el cinturón.': 'Конечно. Пристегнитесь.',
      'Unos veinte minutos con este tráfico.': 'Минут двадцать с таким движением.', 'Aquí tiene. Son quince euros.': 'Приехали. С вас пятнадцать евро.',
      '¡Hola! ¿Qué le pongo?': 'Здравствуйте! Что вам предложить?', 'Ahora mismo. ¿Algo más?': 'Сейчас. Что-нибудь ещё?',
      'Sí, la contraseña está en la pizarra.': 'Да, пароль на доске.', '¡Claro! Aquí tiene. ¡Que tenga buen día!': 'Конечно! Пожалуйста. Хорошего дня!',
      '¡Hola! Parece un poco perdido.': 'Здравствуйте! Вы, кажется, заблудились.', 'Tranquilo, le ayudo. ¿Adónde quiere ir?': 'Не волнуйтесь, я помогу. Куда вам нужно?',
      'Siga recto y gire a la izquierda en el banco.': 'Идите прямо и поверните налево у банка.', 'No, está a cinco minutos andando.': 'Нет, это пять минут пешком.',
      '¡Bienvenidos al museo!': 'Добро пожаловать в музей!', 'Son treinta euros. Aquí tienen.': 'С вас тридцать евро. Пожалуйста.',
      'Hoy cerramos a las seis.': 'Сегодня мы закрываемся в шесть.', 'Sí, pero sin flash, por favor.': 'Да, но без вспышки, пожалуйста.',
      '¡Hola! Soy Carmen. ¡Bienvenido a la fiesta!': 'Привет! Я Кармен. Добро пожаловать на вечеринку!', '¡Igualmente!': 'Взаимно!',
      'Soy de Sevilla. ¡Ay, mis amigos me llaman!': 'Я из Севильи. Ой, меня зовут друзья!', '¡Chao! ¡Disfruta de la fiesta!': 'Пока! Хорошо повеселиться!'
    }
  },
  words: {
    en: {
      es: {
        'llevar': 'take / carry', 'esta': 'this', 'dirección': 'address', 'tiempo': 'time', 'tarda': 'takes (time)', 'pare': 'stop',
        'café': 'coffee', 'leche': 'milk', 'hay': 'there is', 'wifi': 'Wi-Fi', 'pone': 'put (serve)', 'perdone': 'excuse me',
        'estoy': 'I am', 'perdido': 'lost', 'cómo': 'how', 'llego': 'I get (arrive)', 'estación': 'station', 'lejos': 'far',
        'entradas': 'tickets', 'cierra': 'closes', 'hacer': 'make / take', 'foto': 'photo', 'encantado': 'delighted',
        'conocerte': 'to meet you', 'eres': 'you are', 'hasta': 'until', 'luego': 'later'
      }
    },
    ar: {
      en: {
        'take': 'تأخذ / تلتقط', 'me': 'ـني (أنا)', 'to': 'إلى', 'address': 'عنوان', 'long': 'طويل (كم من الوقت)', 'it': 'هو / هذا',
        'stop': 'توقف', 'coffee': 'قهوة', 'with': 'مع / بـ', 'milk': 'حليب', 'there': '(يوجد)', 'wi-fi': 'واي فاي', 'go': '(للأخذ معي)',
        'excuse': 'اعذرني', "i'm": 'أنا', 'lost': 'ضائع', 'get': 'أصل', 'station': 'محطة', 'far': 'بعيد', 'from': 'من',
        'tickets': 'تذاكر', 'close': 'يُغلق', 'photo': 'صورة', 'nice': 'لطيف (تشرفت)', 'meet': 'ألتقي', 'are': '(تكون)', 'later': 'لاحقًا'
      },
      es: {
        'llevar': 'تأخذ / توصل', 'esta': 'هذا / هذه', 'dirección': 'عنوان', 'tiempo': 'وقت', 'tarda': 'يستغرق', 'pare': 'توقف',
        'café': 'قهوة', 'leche': 'حليب', 'hay': 'يوجد', 'wifi': 'واي فاي', 'pone': 'تضع (تقدّم)', 'perdone': 'عذرًا', 'estoy': 'أنا',
        'perdido': 'ضائع', 'cómo': 'كيف', 'llego': 'أصل', 'estación': 'محطة', 'lejos': 'بعيد', 'entradas': 'تذاكر', 'cierra': 'يُغلق',
        'hacer': 'أفعل / ألتقط', 'foto': 'صورة', 'encantado': 'مسرور', 'conocerte': 'بمعرفتك', 'eres': 'أنت', 'hasta': 'حتى', 'luego': 'لاحقًا'
      }
    },
    ru: {
      en: {
        'take': 'отвезти / сделать', 'me': 'меня', 'to': 'в / к', 'address': 'адрес', 'long': 'долго', 'it': 'это', 'stop': 'остановите',
        'coffee': 'кофе', 'with': 'с', 'milk': 'молоко', 'there': '(есть)', 'wi-fi': 'Wi-Fi', 'go': '(с собой)', 'excuse': 'извините',
        "i'm": 'я', 'lost': 'заблудился', 'get': 'добраться', 'station': 'станция', 'far': 'далеко', 'from': 'из / от',
        'tickets': 'билеты', 'close': 'закрываться', 'photo': 'фото', 'nice': 'приятно', 'meet': 'встретить', 'are': '(есть)', 'later': 'позже'
      },
      es: {
        'llevar': 'отвезти', 'esta': 'этот / эта', 'dirección': 'адрес', 'tiempo': 'время', 'tarda': 'занимает (время)', 'pare': 'остановите',
        'café': 'кофе', 'leche': 'молоко', 'hay': 'есть (имеется)', 'wifi': 'Wi-Fi', 'pone': 'подайте', 'perdone': 'извините',
        'estoy': 'я (нахожусь)', 'perdido': 'потерянный', 'cómo': 'как', 'llego': 'добираюсь', 'estación': 'станция', 'lejos': 'далеко',
        'entradas': 'билеты', 'cierra': 'закрывается', 'hacer': 'делать', 'foto': 'фото', 'encantado': 'очарован (рад)',
        'conocerte': 'познакомиться с тобой', 'eres': 'ты есть', 'hasta': 'до', 'luego': 'потом'
      }
    }
  },
  translit: {
    ar: {
      en: {
        'take': 'تيك', 'me': 'مي', 'to': 'تو', 'address': 'أد·رِس', 'long': 'لونغ', 'it': 'إت', 'stop': 'ستوپ', 'coffee': 'كو·في',
        'with': 'وِذ', 'milk': 'ميلك', 'there': 'ذير', 'wi-fi': 'واي·فاي', 'go': 'غو', 'excuse': 'إكس·كيوز', "i'm": 'آيم', 'lost': 'لوست',
        'get': 'غيت', 'station': 'ستي·شِن', 'far': 'فار', 'from': 'فروم', 'tickets': 'تي·كِتس', 'close': 'كلوز', 'photo': 'فو·تو',
        'nice': 'نايس', 'meet': 'ميت', 'are': 'آر', 'later': 'لي·تَر'
      },
      es: {
        'llevar': 'يي·بار', 'esta': 'إس·تا', 'dirección': 'دي·ريك·سيون', 'tiempo': 'تييم·پو', 'tarda': 'تار·دا', 'pare': 'پا·ري',
        'café': 'كا·في', 'leche': 'لي·تشي', 'hay': 'آي', 'wifi': 'وي·في', 'pone': 'پو·ني', 'perdone': 'پير·دو·ني', 'estoy': 'إس·توي',
        'perdido': 'پير·دي·دو', 'cómo': 'كو·مو', 'llego': 'يي·غو', 'estación': 'إس·تا·سيون', 'lejos': 'لي·خوس',
        'entradas': 'إن·ترا·داس', 'cierra': 'سيي·را', 'hacer': 'آ·سير', 'foto': 'فو·تو', 'encantado': 'إن·كان·تا·دو',
        'conocerte': 'كو·نو·سير·تي', 'eres': 'إي·ريس', 'hasta': 'آس·تا', 'luego': 'لوي·غو'
      }
    },
    ru: {
      en: {
        'take': 'тейк', 'me': 'ми', 'to': 'ту', 'address': 'эд·рэс', 'long': 'лонг', 'it': 'ит', 'stop': 'стоп', 'coffee': 'ко·фи',
        'with': 'уиз', 'milk': 'милк', 'there': 'зэр', 'wi-fi': 'уай·фай', 'go': 'гоу', 'excuse': 'икс·кьюз', "i'm": 'айм', 'lost': 'лост',
        'get': 'гет', 'station': 'стэй·шн', 'far': 'фар', 'from': 'фром', 'tickets': 'ти·китс', 'close': 'клоуз', 'photo': 'фоу·тоу',
        'nice': 'найс', 'meet': 'мит', 'are': 'ар', 'later': 'лэй·тэр'
      },
      es: {
        'llevar': 'йе·бар', 'esta': 'эс·та', 'dirección': 'ди·рэк·сьон', 'tiempo': 'тьем·по', 'tarda': 'тар·да', 'pare': 'па·рэ',
        'café': 'ка·фэ', 'leche': 'лэ·чэ', 'hay': 'ай', 'wifi': 'уи·фи', 'pone': 'по·нэ', 'perdone': 'пэр·до·нэ', 'estoy': 'эс·той',
        'perdido': 'пэр·ди·до', 'cómo': 'ко·мо', 'llego': 'йе·го', 'estación': 'эс·та·сьон', 'lejos': 'лэ·хос',
        'entradas': 'эн·тра·дас', 'cierra': 'сье·рра', 'hacer': 'а·сэр', 'foto': 'фо·то', 'encantado': 'эн·кан·та·до',
        'conocerte': 'ко·но·сэр·тэ', 'eres': 'э·рэс', 'hasta': 'ас·та', 'luego': 'луэ·го'
      }
    },
    en: {
      es: {
        'llevar': 'yeh·bahr', 'esta': 'ehs·tah', 'dirección': 'dee·rehk·syohn', 'tiempo': 'tyehm·poh', 'tarda': 'tahr·dah', 'pare': 'pah·reh',
        'café': 'kah·feh', 'leche': 'leh·cheh', 'hay': 'eye', 'wifi': 'wee·fee', 'pone': 'poh·neh', 'perdone': 'pehr·doh·neh',
        'estoy': 'ehs·toy', 'perdido': 'pehr·dee·doh', 'cómo': 'koh·moh', 'llego': 'yeh·goh', 'estación': 'ehs·tah·syohn',
        'lejos': 'leh·hohs', 'entradas': 'ehn·trah·dahs', 'cierra': 'syeh·rrah', 'hacer': 'ah·sehr', 'foto': 'foh·toh',
        'encantado': 'ehn·kahn·tah·doh', 'conocerte': 'koh·noh·sehr·teh', 'eres': 'eh·rehs', 'hasta': 'ahs·tah', 'luego': 'lweh·goh'
      }
    }
  }
};
Object.entries(EXT.phrases).forEach(([ui, map]) => Object.assign(TRANSLATIONS[ui].phrases, map));
Object.entries(EXT.words).forEach(([ui, byLang]) => Object.entries(byLang).forEach(([lg, map]) => {
  TRANSLATIONS[ui].words[lg] = Object.assign(TRANSLATIONS[ui].words[lg] || {}, map);
}));
Object.entries(EXT.translit).forEach(([ui, byLang]) => Object.entries(byLang).forEach(([lg, map]) => {
  TRANSLIT[ui][lg] = Object.assign(TRANSLIT[ui][lg] || {}, map);
}));

/* ---------- Italian: translations (most reuse the matching Spanish line), glosses, transliteration ---------- */
const IT_EQUIV = {
  "Ecco il mio passaporto.": "Aquí está mi pasaporte.",
  "Ho un volo in coincidenza.": "Tengo un vuelo de conexión.",
  "Ho una prenotazione.": "Tengo una reserva.",
  "A che ora è la colazione?": "¿A qué hora es el desayuno?",
  "Un tavolo per due, per favore.": "Una mesa para dos, por favor.",
  "Il conto, per favore.": "La cuenta, por favor.",
  "Ce l'ha in taglia media?": "¿Lo tiene en talla mediana?",
  "Quanto costa questo?": "¿Cuánto cuesta esto?",
  "Posso pagare con la carta?": "¿Puedo pagar con tarjeta?",
  "Ho bisogno di un medico.": "Necesito un médico.",
  "Chiami un'ambulanza!": "¡Llame a una ambulancia!",
  "Dov'è la farmacia più vicina?": "¿Dónde está la farmacia más cercana?",
  "Mi può portare a questo indirizzo?": "¿Me puede llevar a esta dirección?",
  "Quanto tempo ci vuole?": "¿Cuánto tiempo tarda?",
  "Si fermi qui, per favore.": "Pare aquí, por favor.",
  "Scusi, mi sono perso.": "Perdone, estoy perdido.",
  "Come arrivo alla stazione?": "¿Cómo llego a la estación?",
  "È lontano da qui?": "¿Está lejos de aquí?",
  "Due biglietti, per favore.": "Dos entradas, por favor.",
  "A che ora chiude?": "¿A qué hora cierra?",
  "Posso fare una foto?": "¿Puedo hacer una foto?",
  "Piacere di conoscerti!": "¡Encantado de conocerte!",
  "Di dove sei?": "¿De dónde eres?",
  "A dopo!": "¡Hasta luego!",
  "Buongiorno! Passaporto, per favore.": "¡Buenos días! Su pasaporte, por favor.",
  "Grazie. Qual è la sua destinazione finale?": "Gracias. ¿Cuál es su destino final?",
  "Va bene. Ha qualche domanda?": "Muy bien. ¿Alguna pregunta?",
  "Gate dodici, sulla sinistra. Buon viaggio!": "Puerta doce, a la izquierda. ¡Buen viaje!",
  "Benvenuto! Come posso aiutarla?": "¡Bienvenido! ¿En qué puedo ayudarle?",
  "Perfetto, ecco la sua chiave. Altro?": "Perfecto, aquí tiene su llave. ¿Algo más?",
  "Dalle sette alle dieci. Altro?": "De siete a diez. ¿Algo más?",
  "Certo, gliela porto in camera. Buon soggiorno!": "Claro, se la subimos. ¡Disfrute su estancia!",
  "Buonasera! Quante persone?": "¡Buenas noches! ¿Cuántas personas?",
  "Prego, da questa parte. Volete ordinare?": "Por aquí, por favor. ¿Desean pedir?",
  "Ecco a lei. Com'era tutto?": "Aquí tiene. ¿Qué tal todo?",
  "Ciao! Cerca qualcosa?": "¡Hola! ¿Busca algo?",
  "Sì, eccola.": "Sí, aquí está.",
  "Venti euro.": "Veinte euros.",
  "Certo! Ecco la sua borsa. Grazie!": "¡Claro! Aquí tiene su bolsa. ¡Gracias!",
  "Salve, cosa succede?": "Hola, ¿qué le pasa?",
  "È grave? Riesce a respirare?": "¿Es grave? ¿Puede respirar?",
  "Stanno arrivando. Altro?": "Ya vienen. ¿Algo más?",
  "A due isolati, sulla destra. Si riguardi!": "A dos calles, a la derecha. ¡Cuídese!",
  "Buongiorno! Dove andiamo?": "¡Hola! ¿Adónde vamos?",
  "Certo. Allacci la cintura.": "Claro. Abróchese el cinturón.",
  "Circa venti minuti con questo traffico.": "Unos veinte minutos con este tráfico.",
  "Eccoci. Sono quindici euro.": "Aquí tiene. Son quince euros.",
  "Ciao! Cosa le preparo?": "¡Hola! ¿Qué le pongo?",
  "Subito. Altro?": "Ahora mismo. ¿Algo más?",
  "Sì, la password è sulla lavagna.": "Sí, la contraseña está en la pizarra.",
  "Certo! Ecco a lei. Buona giornata!": "¡Claro! Aquí tiene. ¡Que tenga buen día!",
  "Ciao! Sembra un po' perso.": "¡Hola! Parece un poco perdido.",
  "Tranquillo, la aiuto io. Dove vuole andare?": "Tranquilo, le ayudo. ¿Adónde quiere ir?",
  "Vada dritto e giri a sinistra alla banca.": "Siga recto y gire a la izquierda en el banco.",
  "No, sono cinque minuti a piedi.": "No, está a cinco minutos andando.",
  "Benvenuti al museo!": "¡Bienvenidos al museo!",
  "Sono trenta euro. Ecco a voi.": "Son treinta euros. Aquí tienen.",
  "Oggi chiudiamo alle sei.": "Hoy cerramos a las seis.",
  "Sì, ma senza flash, per favore.": "Sí, pero sin flash, por favor.",
  "Piacere mio!": "¡Igualmente!",
  "Ciao! Divertiti alla festa!": "¡Chao! ¡Disfruta de la fiesta!"
};
const IT_CUSTOM = {
  "en": {
    "Dov'è il gate?": "Where is the gate?",
    "Posso avere un altro asciugamano?": "Can I have another towel?",
    "Posso vedere il menù?": "Can I see the menu?",
    "Un cappuccino, per favore.": "A cappuccino, please.",
    "C'è il wifi?": "Is there Wi-Fi?",
    "È da portare via.": "It's to go.",
    "Ecco il conto. Buona serata!": "Here's the check. Have a nice evening!",
    "Ciao! Sono Chiara. Benvenuto alla festa!": "Hi! I'm Chiara. Welcome to the party!",
    "Sono di Napoli. Oh, i miei amici mi chiamano!": "I'm from Naples. Oh, my friends are calling me!"
  },
  "ar": {
    "Dov'è il gate?": "أين البوابة؟",
    "Posso avere un altro asciugamano?": "هل يمكنني الحصول على منشفة أخرى؟",
    "Posso vedere il menù?": "هل يمكنني رؤية قائمة الطعام؟",
    "Un cappuccino, per favore.": "كابتشينو من فضلك.",
    "C'è il wifi?": "هل يوجد واي فاي؟",
    "È da portare via.": "إنه للأخذ معي.",
    "Ecco il conto. Buona serata!": "تفضل الحساب. أمسية سعيدة!",
    "Ciao! Sono Chiara. Benvenuto alla festa!": "مرحبًا! أنا كيارا. أهلًا بك في الحفلة!",
    "Sono di Napoli. Oh, i miei amici mi chiamano!": "أنا من نابولي. أوه، أصدقائي ينادونني!"
  },
  "ru": {
    "Dov'è il gate?": "Где выход на посадку?",
    "Posso avere un altro asciugamano?": "Можно мне ещё одно полотенце?",
    "Posso vedere il menù?": "Можно посмотреть меню?",
    "Un cappuccino, per favore.": "Капучино, пожалуйста.",
    "C'è il wifi?": "Здесь есть Wi-Fi?",
    "È da portare via.": "Это с собой.",
    "Ecco il conto. Buona serata!": "Вот счёт. Хорошего вечера!",
    "Ciao! Sono Chiara. Benvenuto alla festa!": "Привет! Я Кьяра. Добро пожаловать на вечеринку!",
    "Sono di Napoli. Oh, i miei amici mi chiamano!": "Я из Неаполя. Ой, меня зовут друзья!"
  }
};
const IT_GLOSS = {
  "en": {
    "ecco": "here is",
    "il": "the",
    "mio": "my",
    "passaporto": "passport",
    "ho": "I have",
    "un": "a / one",
    "volo": "flight",
    "in": "in",
    "coincidenza": "connection",
    "dov'è": "where is",
    "gate": "gate",
    "una": "a / one",
    "prenotazione": "reservation",
    "a": "at / to",
    "che": "what / which",
    "ora": "hour / time",
    "è": "is",
    "la": "the",
    "colazione": "breakfast",
    "posso": "can I",
    "avere": "to have / get",
    "altro": "another",
    "asciugamano": "towel",
    "tavolo": "table",
    "per": "for / (please)",
    "due": "two",
    "favore": "favour (please)",
    "vedere": "to see",
    "menù": "menu",
    "conto": "bill / check",
    "ce": "(there)",
    "l'ha": "you have it",
    "taglia": "size",
    "media": "medium",
    "quanto": "how much",
    "costa": "costs",
    "questo": "this",
    "pagare": "to pay",
    "con": "with",
    "carta": "card",
    "bisogno": "need",
    "di": "of",
    "medico": "doctor",
    "chiami": "call",
    "un'ambulanza": "an ambulance",
    "farmacia": "pharmacy",
    "più": "more / most",
    "vicina": "near / close",
    "mi": "me",
    "può": "can you",
    "portare": "to take / bring",
    "indirizzo": "address",
    "tempo": "time",
    "ci": "(it)",
    "vuole": "takes (is needed)",
    "si": "(yourself)",
    "fermi": "stop",
    "qui": "here",
    "cappuccino": "cappuccino",
    "c'è": "there is",
    "wifi": "Wi-Fi",
    "da": "from / for",
    "via": "away (to go)",
    "scusi": "excuse me",
    "sono": "I am",
    "perso": "lost",
    "come": "how",
    "arrivo": "I get (arrive)",
    "alla": "to the",
    "stazione": "station",
    "lontano": "far",
    "biglietti": "tickets",
    "chiude": "closes",
    "fare": "to make / take",
    "foto": "photo",
    "piacere": "pleasure",
    "conoscerti": "to meet you",
    "dove": "where",
    "sei": "you are",
    "dopo": "later"
  },
  "ar": {
    "ecco": "ها هو / تفضّل",
    "il": "الـ",
    "mio": "ـي (لي)",
    "passaporto": "جواز سفر",
    "ho": "لدي",
    "un": "واحد (نكرة)",
    "volo": "رحلة جوية",
    "in": "في",
    "coincidenza": "ترانزيت",
    "dov'è": "أين يوجد",
    "gate": "بوابة",
    "una": "واحدة (نكرة)",
    "prenotazione": "حجز",
    "a": "في / إلى",
    "che": "ما / أي",
    "ora": "ساعة",
    "è": "يكون",
    "la": "الـ",
    "colazione": "فطور",
    "posso": "هل يمكنني",
    "avere": "أن أحصل",
    "altro": "آخر",
    "asciugamano": "منشفة",
    "tavolo": "طاولة",
    "per": "لـ / (من فضلك)",
    "due": "اثنان",
    "favore": "معروف (من فضلك)",
    "vedere": "أن أرى",
    "menù": "قائمة الطعام",
    "conto": "الحساب",
    "ce": "(يوجد)",
    "l'ha": "لديك إياه",
    "taglia": "مقاس",
    "media": "متوسط",
    "quanto": "كم",
    "costa": "يكلّف",
    "questo": "هذا",
    "pagare": "أن أدفع",
    "con": "مع / بـ",
    "carta": "بطاقة",
    "bisogno": "حاجة",
    "di": "من",
    "medico": "طبيب",
    "chiami": "اطلبوا / اتصلوا",
    "un'ambulanza": "سيارة إسعاف",
    "farmacia": "صيدلية",
    "più": "أكثر / الأكثر",
    "vicina": "قريبة",
    "mi": "لي / ـني",
    "può": "هل يمكنك",
    "portare": "أن تأخذ / توصل",
    "indirizzo": "عنوان",
    "tempo": "وقت",
    "ci": "(يلزم)",
    "vuole": "يستغرق",
    "si": "(نفسك)",
    "fermi": "توقف",
    "qui": "هنا",
    "cappuccino": "كابتشينو",
    "c'è": "يوجد",
    "wifi": "واي فاي",
    "da": "من / لـ",
    "via": "بعيدًا (للأخذ)",
    "scusi": "عذرًا",
    "sono": "أنا",
    "perso": "ضائع",
    "come": "كيف",
    "arrivo": "أصل",
    "alla": "إلى الـ",
    "stazione": "محطة",
    "lontano": "بعيد",
    "biglietti": "تذاكر",
    "chiude": "يُغلق",
    "fare": "أن أفعل / ألتقط",
    "foto": "صورة",
    "piacere": "سرور",
    "conoscerti": "التعرف عليك",
    "dove": "أين",
    "sei": "أنت",
    "dopo": "لاحقًا"
  },
  "ru": {
    "ecco": "вот",
    "il": "(артикль м. р.)",
    "mio": "мой",
    "passaporto": "паспорт",
    "ho": "у меня есть",
    "un": "один (неопр. артикль)",
    "volo": "рейс",
    "in": "в",
    "coincidenza": "пересадка",
    "dov'è": "где (находится)",
    "gate": "выход на посадку",
    "una": "одна (неопр. артикль)",
    "prenotazione": "бронь",
    "a": "в / к",
    "che": "что / какой",
    "ora": "час",
    "è": "есть (является)",
    "la": "(артикль ж. р.)",
    "colazione": "завтрак",
    "posso": "могу",
    "avere": "получить",
    "altro": "ещё один",
    "asciugamano": "полотенце",
    "tavolo": "столик",
    "per": "для / на (пожалуйста)",
    "due": "два",
    "favore": "одолжение (пожалуйста)",
    "vedere": "посмотреть",
    "menù": "меню",
    "conto": "счёт",
    "ce": "(есть)",
    "l'ha": "у вас это есть",
    "taglia": "размер",
    "media": "средний",
    "quanto": "сколько",
    "costa": "стоит",
    "questo": "этот / это",
    "pagare": "заплатить",
    "con": "с",
    "carta": "карта",
    "bisogno": "нужда (мне нужно)",
    "di": "(предлог) из / о",
    "medico": "врач",
    "chiami": "вызовите",
    "un'ambulanza": "скорую",
    "farmacia": "аптека",
    "più": "более / самый",
    "vicina": "близкая",
    "mi": "мне / меня",
    "può": "можете",
    "portare": "отвезти",
    "indirizzo": "адрес",
    "tempo": "время",
    "ci": "(нужно)",
    "vuole": "требуется",
    "si": "(себя)",
    "fermi": "остановитесь",
    "qui": "здесь",
    "cappuccino": "капучино",
    "c'è": "есть",
    "wifi": "Wi-Fi",
    "da": "от / для",
    "via": "прочь (с собой)",
    "scusi": "извините",
    "sono": "я (есть)",
    "perso": "потерялся",
    "come": "как",
    "arrivo": "добираюсь",
    "alla": "к (с артиклем)",
    "stazione": "станция",
    "lontano": "далеко",
    "biglietti": "билеты",
    "chiude": "закрывается",
    "fare": "сделать",
    "foto": "фото",
    "piacere": "удовольствие (приятно)",
    "conoscerti": "познакомиться с тобой",
    "dove": "где",
    "sei": "ты есть",
    "dopo": "потом"
  }
};
const IT_TRANSLIT = {
  "en": {
    "ecco": "ehk·koh",
    "il": "eel",
    "mio": "mee·oh",
    "passaporto": "pahs·sah·pohr·toh",
    "ho": "oh",
    "un": "oon",
    "volo": "voh·loh",
    "in": "een",
    "coincidenza": "koh·een·chee·dehn·tsah",
    "dov'è": "doh·veh",
    "gate": "gayt",
    "una": "oo·nah",
    "prenotazione": "preh·noh·tah·tsyoh·neh",
    "a": "ah",
    "che": "keh",
    "ora": "oh·rah",
    "è": "eh",
    "la": "lah",
    "colazione": "koh·lah·tsyoh·neh",
    "posso": "pohs·soh",
    "avere": "ah·veh·reh",
    "altro": "ahl·troh",
    "asciugamano": "ah·shoo·gah·mah·noh",
    "tavolo": "tah·voh·loh",
    "per": "pehr",
    "due": "doo·eh",
    "favore": "fah·voh·reh",
    "vedere": "veh·deh·reh",
    "menù": "meh·noo",
    "conto": "kohn·toh",
    "ce": "cheh",
    "l'ha": "lah",
    "taglia": "tah·lyah",
    "media": "meh·dyah",
    "quanto": "kwahn·toh",
    "costa": "kohs·tah",
    "questo": "kwehs·toh",
    "pagare": "pah·gah·reh",
    "con": "kohn",
    "carta": "kahr·tah",
    "bisogno": "bee·zoh·nyoh",
    "di": "dee",
    "medico": "meh·dee·koh",
    "chiami": "kyah·mee",
    "un'ambulanza": "oonahm·boo·lahn·tsah",
    "farmacia": "fahr·mah·chee·ah",
    "più": "pyoo",
    "vicina": "vee·chee·nah",
    "mi": "mee",
    "può": "pwoh",
    "portare": "pohr·tah·reh",
    "indirizzo": "een·dee·reet·tsoh",
    "tempo": "tehm·poh",
    "ci": "chee",
    "vuole": "vwoh·leh",
    "si": "see",
    "fermi": "fehr·mee",
    "qui": "kwee",
    "cappuccino": "kahp·poot·chee·noh",
    "c'è": "cheh",
    "wifi": "wy·fy",
    "da": "dah",
    "via": "vee·ah",
    "scusi": "skoo·zee",
    "sono": "soh·noh",
    "perso": "pehr·soh",
    "come": "koh·meh",
    "arrivo": "ahr·ree·voh",
    "alla": "ahl·lah",
    "stazione": "stah·tsyoh·neh",
    "lontano": "lohn·tah·noh",
    "biglietti": "bee·lyeht·tee",
    "chiude": "kyoo·deh",
    "fare": "fah·reh",
    "foto": "foh·toh",
    "piacere": "pyah·cheh·reh",
    "conoscerti": "koh·noh·shehr·tee",
    "dove": "doh·veh",
    "sei": "say",
    "dopo": "doh·poh"
  },
  "ar": {
    "ecco": "إك·كو",
    "il": "إيل",
    "mio": "مي·و",
    "passaporto": "پاس·سا·پور·تو",
    "ho": "أو",
    "un": "أون",
    "volo": "ڤو·لو",
    "in": "إين",
    "coincidenza": "كو·إين·تشي·دين·تسا",
    "dov'è": "دو·ڤي",
    "gate": "غيت",
    "una": "أو·نا",
    "prenotazione": "پري·نو·تا·تسيو·ني",
    "a": "آ",
    "che": "كي",
    "ora": "أو·را",
    "è": "إي",
    "la": "لا",
    "colazione": "كو·لا·تسيو·ني",
    "posso": "پوس·سو",
    "avere": "آ·ڤي·ري",
    "altro": "آل·ترو",
    "asciugamano": "آ·شو·غا·ما·نو",
    "tavolo": "تا·ڤو·لو",
    "per": "پير",
    "due": "دو·إي",
    "favore": "فا·ڤو·ري",
    "vedere": "ڤي·دي·ري",
    "menù": "مي·نو",
    "conto": "كون·تو",
    "ce": "تشي",
    "l'ha": "لا",
    "taglia": "تا·ليا",
    "media": "مي·ديا",
    "quanto": "كوان·تو",
    "costa": "كوس·تا",
    "questo": "كويس·تو",
    "pagare": "پا·غا·ري",
    "con": "كون",
    "carta": "كار·تا",
    "bisogno": "بي·زو·نيو",
    "di": "دي",
    "medico": "مي·دي·كو",
    "chiami": "كيا·مي",
    "un'ambulanza": "أونام·بو·لان·تسا",
    "farmacia": "فار·ما·تشي·آ",
    "più": "پيو",
    "vicina": "ڤي·تشي·نا",
    "mi": "مي",
    "può": "پوو",
    "portare": "پور·تا·ري",
    "indirizzo": "إين·دي·ريت·تسو",
    "tempo": "تيم·پو",
    "ci": "تشي",
    "vuole": "ڤوو·لي",
    "si": "سي",
    "fermi": "فير·مي",
    "qui": "كوي",
    "cappuccino": "كاپ·پوت·تشي·نو",
    "c'è": "تشي",
    "wifi": "واي·فاي",
    "da": "دا",
    "via": "ڤي·آ",
    "scusi": "سكو·زي",
    "sono": "سو·نو",
    "perso": "پير·سو",
    "come": "كو·مي",
    "arrivo": "آر·ري·ڤو",
    "alla": "آل·لا",
    "stazione": "ستا·تسيو·ني",
    "lontano": "لون·تا·نو",
    "biglietti": "بي·لييت·تي",
    "chiude": "كيو·دي",
    "fare": "فا·ري",
    "foto": "فو·تو",
    "piacere": "پيا·تشي·ري",
    "conoscerti": "كو·نو·شير·تي",
    "dove": "دو·ڤي",
    "sei": "سيي",
    "dopo": "دو·پو"
  },
  "ru": {
    "ecco": "эк·ко",
    "il": "иль",
    "mio": "ми·о",
    "passaporto": "пас·са·пор·то",
    "ho": "о",
    "un": "ун",
    "volo": "во·ло",
    "in": "ин",
    "coincidenza": "ко·ин·чи·дэн·ца",
    "dov'è": "до·вэ",
    "gate": "гейт",
    "una": "у·на",
    "prenotazione": "прэ·но·та·цьо·нэ",
    "a": "а",
    "che": "кэ",
    "ora": "о·ра",
    "è": "э",
    "la": "ла",
    "colazione": "ко·ла·цьо·нэ",
    "posso": "пос·со",
    "avere": "а·вэ·рэ",
    "altro": "аль·тро",
    "asciugamano": "а·шу·га·ма·но",
    "tavolo": "та·во·ло",
    "per": "пэр",
    "due": "ду·э",
    "favore": "фа·во·рэ",
    "vedere": "вэ·дэ·рэ",
    "menù": "мэ·ну",
    "conto": "кон·то",
    "ce": "чэ",
    "l'ha": "ла",
    "taglia": "та·лья",
    "media": "мэ·дья",
    "quanto": "куан·то",
    "costa": "кос·та",
    "questo": "куэс·то",
    "pagare": "па·га·рэ",
    "con": "кон",
    "carta": "кар·та",
    "bisogno": "би·зо·ньо",
    "di": "ди",
    "medico": "мэ·ди·ко",
    "chiami": "кья·ми",
    "un'ambulanza": "унам·бу·лан·ца",
    "farmacia": "фар·ма·чи·а",
    "più": "пью",
    "vicina": "ви·чи·на",
    "mi": "ми",
    "può": "пуо",
    "portare": "пор·та·рэ",
    "indirizzo": "ин·ди·рит·цо",
    "tempo": "тэм·по",
    "ci": "чи",
    "vuole": "вуо·лэ",
    "si": "си",
    "fermi": "фэр·ми",
    "qui": "куи",
    "cappuccino": "кап·пут·чи·но",
    "c'è": "чэ",
    "wifi": "уай·фай",
    "da": "да",
    "via": "ви·а",
    "scusi": "ску·зи",
    "sono": "со·но",
    "perso": "пэр·со",
    "come": "ко·мэ",
    "arrivo": "ар·ри·во",
    "alla": "ал·ла",
    "stazione": "ста·цьо·нэ",
    "lontano": "лон·та·но",
    "biglietti": "би·льет·ти",
    "chiude": "кью·дэ",
    "fare": "фа·рэ",
    "foto": "фо·то",
    "piacere": "пья·чэ·рэ",
    "conoscerti": "ко·но·шэр·ти",
    "dove": "до·вэ",
    "sei": "сэй",
    "dopo": "до·по"
  }
};
['en', 'ar', 'ru'].forEach(ui => {
  const ph = TRANSLATIONS[ui].phrases;
  Object.entries(IT_EQUIV).forEach(([it, es]) => { if (ph[es]) ph[it] = ph[es]; });
  Object.assign(ph, IT_CUSTOM[ui]);
  TRANSLATIONS[ui].words.it = Object.assign(TRANSLATIONS[ui].words.it || {}, IT_GLOSS[ui]);
  TRANSLIT[ui].it = Object.assign(TRANSLIT[ui].it || {}, IT_TRANSLIT[ui]);
});

// attach translations: phrase.tr / line.tr = { he, en, … }, word.meaning_<lang>
Object.values(LANGS).forEach(L => Object.values(L.stations).forEach(st => {
  const attach = (text, he) => {
    const tr = { he };
    Object.entries(TRANSLATIONS).forEach(([ui, T]) => { if (T.phrases[text]) tr[ui] = T.phrases[text]; });
    return tr;
  };
  st.phrases.forEach(p => {
    p.tr = attach(p.text, p.he);
    p.words.forEach(w => Object.entries(TRANSLATIONS).forEach(([ui, T]) => {
      const g = ((T.words || {})[L.id] || {})[w.clean.toLowerCase()];
      if (g) w['meaning_' + ui] = g;
    }));
    p.words.forEach(w => Object.entries(TRANSLIT).forEach(([ui, T]) => {
      const tl = (T[L.id] || {})[w.clean.toLowerCase()];
      if (tl) w['tl_' + ui] = tl.split('·');
    }));
  });
  const line = ([text, he]) => ({ text, tr: attach(text, he) });
  st.boss.intro = line(st.boss.intro);
  st.boss.turns.forEach(tn => { tn.reply = line(tn.reply); });
}));

/* ---------- teachers ----------
 * Each target language has teachers; picking a teacher picks the accent and the narrator's voice gender.
 * Portraits are realistic photos at img/teachers/<id>.webp (optional talking loop <id>-talk.mp4).
 * Missing files fall back to a neutral monogram — see img/teachers/README.md for the photo brief.
 */
const TEACHERS = {
  en: [
    { id: 'emma', name: 'Emma', accent: 'en-US', gender: 'f', age: 24, hue: 200,
      city: { he: 'ניו יורק', en: 'New York', ar: 'نيويورك', ru: 'Нью-Йорк' },
      bio: { he: 'אוהבת קפה, מוזיקה ואת הסלנג של ניו יורק', en: 'Loves coffee, music and New York slang',
        ar: 'تحب القهوة والموسيقى وعامية نيويورك', ru: 'Любит кофе, музыку и нью-йоркский сленг' } },
    { id: 'oliver', name: 'Oliver', accent: 'en-GB', gender: 'm', age: 26, hue: 160,
      city: { he: 'לונדון', en: 'London', ar: 'لندن', ru: 'Лондон' },
      bio: { he: 'מדריך טיולים בלונדון, מדבר לאט וברור', en: 'London tour guide who speaks slowly and clearly',
        ar: 'مرشد سياحي في لندن يتكلم ببطء ووضوح', ru: 'Гид по Лондону, говорит медленно и чётко' } }
  ],
  es: [
    { id: 'lucia', name: 'Lucía', accent: 'es-ES', gender: 'f', age: 23, hue: 12,
      city: { he: 'מדריד', en: 'Madrid', ar: 'مدريد', ru: 'Мадрид' },
      bio: { he: 'סטודנטית לעיצוב ממדריד ומומחית לטאפאס', en: 'Design student from Madrid and a tapas expert',
        ar: 'طالبة تصميم من مدريد وخبيرة في التاباس', ru: 'Студентка-дизайнер из Мадрида и знаток тапас' } },
    { id: 'mateo', name: 'Mateo', accent: 'es-MX', gender: 'm', age: 25, hue: 35,
      city: { he: 'מקסיקו סיטי', en: 'Mexico City', ar: 'مكسيكو سيتي', ru: 'Мехико' },
      bio: { he: 'שף צעיר ממקסיקו סיטי שאוהב לדבר עם אנשים', en: 'Young chef from Mexico City who loves to chat',
        ar: 'طاهٍ شاب من مكسيكو سيتي يحب الحديث مع الناس', ru: 'Молодой шеф-повар из Мехико, любит поболтать' } }
  ],
  it: [
    { id: 'giulia', name: 'Giulia', accent: 'it-IT', gender: 'f', age: 24, hue: 340,
      city: { he: 'רומא', en: 'Rome', ar: 'روما', ru: 'Рим' },
      bio: { he: 'מדריכה ברומא שאוהבת ג׳לטו ואנשים', en: 'Rome tour guide who loves gelato and people',
        ar: 'مرشدة سياحية في روما تحب الجيلاتو والناس', ru: 'Гид по Риму, обожает джелато и людей' } }
  ]
};

function teacherFor(langId, accentCode) {
  const list = TEACHERS[langId] || [];
  return list.find(t => t.accent === accentCode) || list[0] || null;
}

function getPhrase(langId, stationId, idx) {
  const st = LANGS[langId] && LANGS[langId].stations[stationId];
  return st ? st.phrases[idx] : null;
}

window.LQData = { STATIONS, LANGS, LEVELS, PACES, KNOWN_LANGS, LANG_FAMILY, TEACHERS, teacherFor, getPhrase };
