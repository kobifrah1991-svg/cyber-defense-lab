/* Room catalog metadata */
window.ROOMS_META = [
  {
    id: 'password-fortress',
    num: 1,
    title: 'מבצר הסיסמאות',
    titleEn: 'Password Fortress',
    difficulty: 'easy',
    difficultyHe: 'קל',
    xp: 50,
    desc: 'בנו מדיניות סיסמאות חזקה וראו כיצד היא משפיעה על זמן ניחוש תיאורטי.',
    icon: '🔐',
    requires: [],
    learnings: [
      'סיסמה ארוכה ומגוונת קשה בהרבה לניחוש מאשר סיסמה קצרה.',
      'מדיניות ארגונית: אורך מינימלי, MFA, ואיסור סיסמאות נפוצות.',
      'מגינים מודדים חוזק — לא תוקפים. אין צורך בכלי פריצה.'
    ]
  },
  {
    id: 'network-map',
    num: 2,
    title: 'מפת הרשת',
    titleEn: 'Network Map',
    difficulty: 'easy',
    difficultyHe: 'קל',
    xp: 60,
    desc: 'מקמו בקרות הגנה על צמתי רשת וטפלו בהתראת התחברות חשודה בסדר הנכון.',
    icon: '🗺️',
    requires: ['password-fortress'],
    learnings: [
      'הפרדת רשתות וחומת אש מגבילות נזק פוטנציאלי.',
      'MFA, עדכונים והרשאות מינימום הם בקרות יסוד.',
      'בטריאז׳: אמת → בודד → חקור → תעד — לא לקפוץ למסקנות.'
    ]
  },
  {
    id: 'https-shield',
    num: 3,
    title: 'מגן HTTPS',
    titleEn: 'HTTPS Shield',
    difficulty: 'medium',
    difficultyHe: 'בינוני',
    xp: 80,
    desc: 'צפו בלחיצת יד TLS מונפשת ולמדו מה הצפנה מגנה — ומה לא.',
    icon: '🛡️',
    requires: ['network-map'],
    learnings: [
      'TLS מצפין את התעבורה בין הלקוח לשרת ומוודא זהות השרת.',
      'HTTPS לא מחליף אימות משתמש, הרשאות, או הגנה על האפליקציה.',
      'תעודה תקינה + פרוטוקול מעודכן = בסיס תקשורת מאובטחת.'
    ]
  },
  {
    id: 'alert-triage',
    num: 4,
    title: 'טריאז׳ התראות SOC',
    titleEn: 'Alert Triage SOC',
    difficulty: 'medium',
    difficultyHe: 'בינוני',
    xp: 90,
    desc: 'סווגו התראות SIEM מדומות: חיובי אמיתי, חיובי שגוי, או הסלמה.',
    icon: '📡',
    requires: ['https-shield'],
    learnings: [
      'לא כל התראה היא תקיפה — הקשר וקו בסיס חשובים.',
      'חיובי שגוי גוזל זמן; אי-זיהוי חיובי אמיתי מסוכן יותר.',
      'הסלמה כשיש חוסר ודאות או השפעה רחבה — זו חוזקה, לא חולשה.'
    ]
  },
  {
    id: 'threat-modeling',
    num: 5,
    title: 'מידול איומים',
    titleEn: 'Threat Modeling',
    difficulty: 'hard',
    difficultyHe: 'קשה',
    xp: 120,
    desc: 'גררו נכסים, איומים ובקרות ללוח — חשבו כמו מגינים.',
    icon: '🎯',
    requires: ['password-fortress', 'network-map', 'https-shield', 'alert-triage'],
    learnings: [
      'מידול איומים מתחיל בנכסים — מה שווה להגן עליו.',
      'לכל איום מתאימים בקרות מונעות/מזהות/מגיבות.',
      'זו מסגרת חשיבה הגנתית — לא תרגיל תקיפה.'
    ]
  }
];
