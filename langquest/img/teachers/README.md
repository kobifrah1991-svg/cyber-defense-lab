# תמונות המורים והדמויות — בריף לצילום / יצירה

הלומדה מציגה תמונה ריאליסטית לכל מורה ולכל דמות Boss **ברגע שהקובץ קיים בתיקייה ורשום ב-`img/media.json`** — מריצים `npm run media` (או מוסיפים את שם הקובץ ל-JSON ידנית). אין צורך לשנות קוד.
עד אז מוצג מונוגרמה (אות ראשונה על רקע צבעוני) למורים ואימוג׳י לדמויות.

## קבצים

| קובץ | מי | מבטא / תפקיד |
|---|---|---|
| `img/teachers/emma.webp` | Emma, 24 | אנגלית אמריקאית · ניו יורק |
| `img/teachers/oliver.webp` | Oliver, 26 | אנגלית בריטית · לונדון |
| `img/teachers/noa.webp` | Noa, 24 | עברית · תל אביב |
| `img/teachers/camille.webp` | Camille, 25 | צרפתית · פריז |
| `img/teachers/louis.webp` | Louis, 27 | צרפתית קנדית · מונטריאול |
| `img/teachers/lucia.webp` | Lucía, 23 | ספרדית אירופאית · מדריד |
| `img/teachers/mateo.webp` | Mateo, 25 | ספרדית מקסיקנית · מקסיקו סיטי |
| `img/npc/airport.webp` | פקיד/ת גבולות | דמות Boss — שדה תעופה |
| `img/npc/hotel.webp` | פקידת קבלה | דמות Boss — מלון |
| `img/npc/restaurant.webp` | מלצר | דמות Boss — מסעדה |
| `img/npc/shopping.webp` | מוכרת | דמות Boss — קניות |
| `img/npc/emergency.webp` | פרמדיקית | דמות Boss — חירום |

**מפרט:** ריבוע 1024×1024, WebP באיכות 80 (≈60–120KB), פנים במרכז ובשליש העליון (התמונה נחתכת לעיגול), רקע רך ומטושטש, תאורה טבעית.

## פרומפטים (Midjourney / DALL·E / Flux / Imagen)

סגנון אחיד לכולם — להדביק בסוף כל פרומפט:

```
photorealistic portrait photo, head and shoulders, centered, looking at camera with a warm friendly smile,
natural soft daylight, shallow depth of field, softly blurred background, 85mm lens, high detail skin texture,
no text, no watermark, square 1:1
```

- **Emma** — `a 24-year-old American woman, friendly language teacher, wavy brown hair, light makeup, casual denim jacket, blurred New York street café behind her`
- **Oliver** — `a 26-year-old British man, friendly tour guide, short tousled light-brown hair, light stubble, navy knit sweater, blurred London street with red brick behind him`
- **Noa** — `a 24-year-old Israeli woman from Tel Aviv, music student, curly dark hair, light summer shirt, warm smile, blurred Tel Aviv beach promenade behind her`
- **Camille** — `a 25-year-old French woman from Paris, illustrator, short dark bob haircut, striped top and a light trench coat, blurred Paris street with a bakery behind her`
- **Louis** — `a 27-year-old French-Canadian man from Montréal, ski instructor, short sandy hair, friendly grin, red flannel shirt, blurred snowy Montréal street behind him`
- **Lucía** — `a 23-year-old Spanish woman from Madrid, design student, long dark hair, small gold earrings, cream linen shirt, blurred sunny Madrid plaza behind her`
- **Mateo** — `a 25-year-old Mexican man, young chef, short black hair, warm smile, dark apron over a white shirt, blurred colorful Mexico City market behind him`
- **airport** — `a 35-year-old border control officer in a neat uniform, professional and kind expression, blurred airport hall behind`
- **hotel** — `a 28-year-old hotel receptionist in an elegant uniform, welcoming smile, blurred modern hotel lobby behind`
- **restaurant** — `a 30-year-old waiter in a white shirt and black apron, blurred cozy restaurant behind`
- **shopping** — `a 26-year-old shop assistant in a stylish clothing store, blurred clothing racks behind`
- **emergency** — `a 32-year-old paramedic in a uniform, calm reassuring expression, blurred ambulance behind`

## וידאו מדבר (אופציונלי, לשלב הבא)

לדמויות "חיות" אפשר להפיק מכל תמונה לולאת וידאו קצרה (3–5 שניות, ללא קול) בכלי כמו HeyGen / D-ID / Runway:
`<id>-idle.mp4` (מקשיב/ה, ממצמץ/ת) ו־`<id>-talk.mp4` (שפתיים זזות). ההקראה עצמה נשארת מנוע הקול של הלומדה.

## זכויות ואתיקה

- הדמויות **בדיוניות** — אסור להשתמש בתמונה או בדמיון של אדם אמיתי (כולל מפורסמים) בלי הסכמה כתובה.
- לוודא שרישיון כלי היצירה / מאגר התמונות מתיר **שימוש מסחרי** (חנות אפליקציות, אתר מכירה, פרסום).
- כדאי לשמור את הפרומפט והתאריך של כל תמונה כתיעוד מקור.
