# HackerBot Defense Lab · מעבדת הגנה

אימון אבטחת מידע **הגנתי בלבד** בעברית — חדרי תרגול אינטראקטיביים עם סימולציות גרפיות, XP, רמות והתקדמות (בהשראת UX של חדרי למידה כמו TryHackMe, בלי מעבדות תקיפה).

## איך לפתוח

1. פתחו את הקובץ:
   ```
   /workspace/cyber-defense-lab/index.html
   ```
2. בדפדפן מודרני (Chrome / Firefox / Edge / Safari).
3. אין צורך ב־build, npm או שרת — אפשר לפתוח ישירות (`file://`) או דרך שרת סטטי פשוט:
   ```bash
   cd /workspace/cyber-defense-lab
   python3 -m http.server 8080
   ```
   ואז לגלוש אל `http://localhost:8080`

ההתקדמות נשמרת ב־**LocalStorage** של הדפדפן.

## מה כלול

| חדר | קושי | תוכן |
|-----|------|------|
| 1 · מבצר הסיסמאות | קל | מד חוזק, צ׳קליסט, מדיניות סיסמאות, המחשת זמן ניחוש תיאורטי |
| 2 · מפת הרשת | קל | SVG אינטראקטיבי + הצבת בקרות + טריאז׳ התחברות חשודה בסדר נכון |
| 3 · מגן HTTPS | בינוני | אנימציית לחיצת יד TLS + חידון מה מוגן / מה לא |
| 4 · טריאז׳ התראות SOC | בינוני | הזנת SIEM מדומה — TP / FP / הסלמה + משוב |
| 5 · מידול איומים | קשה | לוח גרירה: נכסים / איומים / בקרות (נפתח אחרי השלמת האחרים) |

## דף המוצרים

`products.html` מרכז את כל המוצרים, ומכל עמוד יש קישור אליו (בכותרת ובפוטר):

| מוצר | עמוד | סטטוס |
|------|------|-------|
| HackerBot Defense Lab | `index.html` | זמין ועובד |
| MediaDownloader Pro | `media-downloader.html` + שרת ב־`media-downloader/` | Web עובד עם השרת; בלי שרת — מצב דמו. Android בפיתוח |

להפעלת ההורדות האמיתיות ראו [`media-downloader/README.md`](media-downloader/README.md). השרת מגיש גם את האתר כולו, כך שאחרי ההפעלה הכול זמין ב־`http://localhost:8080`.

## מבנה קבצים

```
cyber-defense-lab/
├── index.html          # נקודת כניסה
├── products.html       # דף המוצרים
├── media-downloader.html  # MediaDownloader Pro (ממשק)
├── media-downloader/   # שרת MediaDownloader: Node.js + yt-dlp, בדיקות, Dockerfile
├── css/styles.css      # עיצוב כהה / ניאון
├── css/media-downloader.css  # נבנה מ־Tailwind (npm run build:css)
├── css/vendor/fontawesome/   # אייקונים מקומיים, בלי CDN
├── js/
│   ├── storage.js      # LocalStorage · XP · רמות
│   ├── rooms-meta.js   # מטא־דאטה של חדרים
│   ├── room1.js … room5.js
│   ├── app.js          # ניווט ולוח בקרה
│   └── media-downloader.js  # לקוח MediaDownloader
└── README.md
```

## עקרונות תוכן (Defense-Only)

- אין קוד exploit, payloads, מחרוזות SQL/XSS עובדות, reverse shells או מתכוני פריצה.
- נושאי OWASP מוצגים רק כ־"מה זה + איך מגינים".
- זמן ניחוש סיסמה הוא **המחשה קונספטואלית** — לא כלי פריצה.

## איפוס התקדמות

בלוח הבקרה — כפתור **איפוס התקדמות**, או ניקוי LocalStorage עבור האתר.

---

🛡️ HackerBot Defense Lab — ללמוד להגן, לא לתקוף.
