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
  { id: 'airport', name: 'שדה תעופה', name_en: 'Airport', icon: '✈️', npc: '🛂' },
  { id: 'hotel', name: 'מלון', name_en: 'Hotel', icon: '🏨', npc: '🛎️' },
  { id: 'restaurant', name: 'מסעדה', name_en: 'Restaurant', icon: '🍽️', npc: '🧑‍🍳' },
  { id: 'shopping', name: 'קניות', name_en: 'Shopping', icon: '🛍️', npc: '🧑‍💼' },
  { id: 'emergency', name: 'חירום ורפואה', name_en: 'Emergency & health', icon: '🚑', npc: '🧑‍⚕️' }
];

const LANGS = {
  en: {
    id: 'en',
    name: 'אנגלית',
    name_en: 'English',
    native: 'English',
    flag: '🇬🇧',
    status: 'ready',
    accents: [
      { code: 'en-US', label: 'אמריקאית', label_en: 'American', flag: '🇺🇸' },
      { code: 'en-GB', label: 'בריטית', label_en: 'British', flag: '🇬🇧' }
    ],
    stations: {
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
          title: 'פקיד הגבולות', title_en: 'Border officer',
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
          title: 'פקידת הקבלה', title_en: 'Receptionist',
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
          title: 'המלצר', title_en: 'Waiter',
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
          title: 'המוכרת', title_en: 'Shop assistant',
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
          title: 'הפרמדיקית', title_en: 'Paramedic',
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
    native: 'Español',
    flag: '🇪🇸',
    status: 'ready',
    accents: [
      { code: 'es-ES', label: 'אירופאית', label_en: 'European', flag: '🇪🇸' },
      { code: 'es-MX', label: 'לטינית', label_en: 'Latin American', flag: '🇲🇽' }
    ],
    stations: {
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
          title: 'פקיד הגבולות', title_en: 'Border officer',
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
          title: 'פקידת הקבלה', title_en: 'Receptionist',
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
          title: 'המלצר', title_en: 'Waiter',
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
          title: 'המוכרת', title_en: 'Shop assistant',
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
          title: 'הפרמדיקית', title_en: 'Paramedic',
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
  fr: { id: 'fr', name: 'צרפתית', name_en: 'French', native: 'Français', flag: '🇫🇷', status: 'soon', accents: [{ code: 'fr-FR', label: 'צרפת', label_en: 'France', flag: '🇫🇷' }, { code: 'fr-CA', label: 'קנדה', label_en: 'Canada', flag: '🇨🇦' }], stations: {} },
  it: { id: 'it', name: 'איטלקית', name_en: 'Italian', native: 'Italiano', flag: '🇮🇹', status: 'soon', accents: [{ code: 'it-IT', label: 'איטליה', label_en: 'Italy', flag: '🇮🇹' }], stations: {} },
  de: { id: 'de', name: 'גרמנית', name_en: 'German', native: 'Deutsch', flag: '🇩🇪', status: 'soon', accents: [{ code: 'de-DE', label: 'גרמניה', label_en: 'Germany', flag: '🇩🇪' }], stations: {} }
};

/* ---------- proficiency levels & learning paces ---------- */
const LEVELS = [
  { id: 0, name: 'מתחיל מאפס', cefr: 'Pre-A1', icon: '🌱', desc: 'לא מכיר את השפה, או רק כמה מילים בודדות',
    name_en: 'Absolute beginner', desc_en: "I don't know the language, or only a few words" },
  { id: 1, name: 'בסיסי', cefr: 'A1–A2', icon: '🌿', desc: 'מבין ביטויים פשוטים, מסתדר בקושי בהזמנה או בשאלת כיוונים',
    name_en: 'Basic', desc_en: 'I understand simple phrases and can just about order food or ask the way' },
  { id: 2, name: 'בינוני', cefr: 'B1–B2', icon: '🌳', desc: 'מנהל שיחה יומיומית, אבל ההגייה והביטחון עוד לא שם',
    name_en: 'Intermediate', desc_en: 'I can hold an everyday conversation, but my pronunciation and confidence lag behind' },
  { id: 3, name: 'מתקדם', cefr: 'C1–C2', icon: '🏔️', desc: 'שוטף — רוצה ללטש מבטא והגייה',
    name_en: 'Advanced', desc_en: 'Fluent — I want to polish my accent and pronunciation' },
  { id: 4, name: 'שפת אם', cefr: 'Native', icon: '🏠', desc: 'שפת אם / דובר ילידי', knownOnly: true,
    name_en: 'Native', desc_en: 'Mother tongue / native speaker' }
];

// pace per target-language level: slow-mode speed, transliteration default, stations open at start,
// whether the Boss is open without the lesson, whether steps 1–2 can be skipped, and the voice pass mark
const PACES = [
  { id: 0, name: 'עדין', icon: '🐢', slowRate: 0.5, translit: true, unlocked: 1, bossFree: false, skipSteps: false, pass: 50,
    desc: 'הקראה איטית במיוחד (50%), תעתיק עברי מלא, תחנה אחת בכל פעם ורף הגייה מקל',
    name_en: 'Gentle', desc_en: 'Extra-slow narration (50%), one stop at a time and a forgiving pronunciation bar' },
  { id: 1, name: 'רגיל', icon: '🚶', slowRate: 0.6, translit: true, unlocked: 1, bossFree: false, skipSteps: false, pass: 60,
    desc: 'מצב צב 60%, תעתיק עברי, תחנות נפתחות בהדרגה',
    name_en: 'Regular', desc_en: 'Turtle mode at 60%, stops unlock one by one' },
  { id: 2, name: 'מהיר', icon: '🏃', slowRate: 0.7, translit: false, unlocked: 3, bossFree: false, skipSteps: true, pass: 65,
    desc: '3 תחנות פתוחות מיד, אפשר לדלג על שלבי השמיעה, תעתיק כבוי (ניתן להפעיל)',
    name_en: 'Fast', desc_en: '3 stops open right away and you can skip the listening steps' },
  { id: 3, name: 'ליטוש מבטא', icon: '🚀', slowRate: 0.7, translit: false, unlocked: 5, bossFree: true, skipSteps: true, pass: 75,
    desc: 'כל המפה פתוחה, Boss זמין מיד, רף הגייה גבוה — מתמקדים במבטא',
    name_en: 'Accent polish', desc_en: 'The whole map is open, Bosses right away and a high pronunciation bar — focus on accent' }
];

// languages a learner may already know (for the profile); `family` drives the "related language" boost
const KNOWN_LANGS = [
  { id: 'he', name: 'עברית', name_en: 'Hebrew', flag: '🇮🇱', family: 'semitic' },
  { id: 'en', name: 'אנגלית', name_en: 'English', flag: '🇬🇧', family: 'germanic' },
  { id: 'ar', name: 'ערבית', name_en: 'Arabic', flag: '🇸🇦', family: 'semitic' },
  { id: 'ru', name: 'רוסית', name_en: 'Russian', flag: '🇷🇺', family: 'slavic' },
  { id: 'es', name: 'ספרדית', name_en: 'Spanish', flag: '🇪🇸', family: 'romance' },
  { id: 'fr', name: 'צרפתית', name_en: 'French', flag: '🇫🇷', family: 'romance' },
  { id: 'it', name: 'איטלקית', name_en: 'Italian', flag: '🇮🇹', family: 'romance' },
  { id: 'pt', name: 'פורטוגזית', name_en: 'Portuguese', flag: '🇵🇹', family: 'romance' },
  { id: 'de', name: 'גרמנית', name_en: 'German', flag: '🇩🇪', family: 'germanic' },
  { id: 'am', name: 'אמהרית', name_en: 'Amharic', flag: '🇪🇹', family: 'semitic' },
  { id: 'yi', name: 'יידיש', name_en: 'Yiddish', flag: '🕍', family: 'germanic' }
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
  }
};

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
  });
  const line = ([text, he]) => ({ text, tr: attach(text, he) });
  st.boss.intro = line(st.boss.intro);
  st.boss.turns.forEach(tn => { tn.reply = line(tn.reply); });
}));

function getPhrase(langId, stationId, idx) {
  const st = LANGS[langId] && LANGS[langId].stations[stationId];
  return st ? st.phrases[idx] : null;
}

window.LQData = { STATIONS, LANGS, LEVELS, PACES, KNOWN_LANGS, LANG_FAMILY, getPhrase };
