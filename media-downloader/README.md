# 📥 MediaDownloader Pro — שרת

שרת Node.js קטן שמוריד סרטונים ושמע מהרשתות החברתיות בעזרת [yt-dlp](https://github.com/yt-dlp/yt-dlp), ומגיש גם את האתר (`products.html`, `media-downloader.html` ומעבדת ההגנה).

בלי השרת, `media-downloader.html` עובד במצב דמו שרק מזהה קישורים. כשהעמוד נטען מהשרת, הוא מזהה את ה־API ועובר להורדות אמיתיות.

## הפעלה עם Docker (מומלץ)

מתיקיית השורש של המאגר:

```bash
docker build -f media-downloader/Dockerfile -t media-downloader .
docker run -d --name media-downloader -p 8080:8080 --restart unless-stopped media-downloader
```

פותחים את `http://localhost:8080`. ה־image כולל את Node.js 22, את yt-dlp ואת ffmpeg, ורץ כמשתמש שאינו root.

הפלטפורמות משנות דברים כל הזמן, ולכן כדאי לבנות את ה־image מחדש מדי פעם כדי לקבל yt-dlp עדכני:

```bash
docker build --no-cache -f media-downloader/Dockerfile -t media-downloader .
```

## הפעלה ישירה

דרישות: Node.js 20 ומעלה, [yt-dlp](https://github.com/yt-dlp/yt-dlp#installation) ו־ffmpeg.

```bash
cd media-downloader
npm install
npm start          # http://localhost:8080
npm run dev        # עם טעינה מחדש בשינוי קוד
npm test           # 30 בדיקות, עם yt-dlp ו־Google Play מדומים (לא צריך רשת)
```

בלי ffmpeg השרת עדיין עובד, אבל יציע רק קבצים שלא צריך למזג (לרוב עד 720p) ושמע ב־M4A במקום MP3.

## הגדרות (משתני סביבה)

| משתנה | ברירת מחדל | מה עושה |
|-------|------------|---------|
| `PORT` | `8080` | פורט השרת |
| `YTDLP_BIN` | `yt-dlp` | הפקודה להרצת yt-dlp (למשל `python3 -m yt_dlp`) |
| `YTDLP_JS_RUNTIME` | ה־Node של השרת | מועבר ל־`--js-runtimes` (נדרש ל־YouTube). ריק = כבוי, לגרסאות ישנות של yt-dlp |
| `FFMPEG_BIN` | `ffmpeg` | הפקודה ל־ffmpeg |
| `MAX_FILESIZE_MB` | `500` | גודל קובץ מרבי |
| `MAX_CONCURRENT_DOWNLOADS` | `2` | הורדות שרצות במקביל |
| `MAX_QUEUED_DOWNLOADS` | `20` | הורדות שממתינות בתור |
| `MAX_ACTIVE_PER_CLIENT` | `2` | הורדות פעילות לכל כתובת IP |
| `FILE_TTL_MINUTES` | `15` | אחרי כמה זמן קבצים נמחקים מהשרת |
| `INFO_REQUESTS_PER_MINUTE` | `30` | בדיקות קישור לדקה לכל IP |
| `DOWNLOADS_PER_10_MIN` | `15` | הורדות ל־10 דקות לכל IP |
| `TRUST_PROXY` | `0` | מספר ה־proxies שלפני השרת (למשל `1` מאחורי nginx), כדי שהגבלת הקצב תראה את ה־IP האמיתי |
| `SITE_ROOT` | שורש המאגר | התיקייה שממנה מוגש האתר |
| `CORS_ORIGINS` | `https://localhost,capacitor://localhost` | מקורות שמורשים לקרוא ל־API מבחוץ (אפליקציית Android) |

### מנויים (Google Play)

כשמגדירים `GOOGLE_PLAY_PACKAGE`, השרת עובר למודל חינם/Premium. בלי המשתנה הזה הכול חינמי וללא הגבלה, כמו קודם. מדריך מלא ב־[`android-app/README.md`](../android-app/README.md).

| משתנה | ברירת מחדל | מה עושה |
|-------|------------|---------|
| `GOOGLE_PLAY_PACKAGE` | — | שם החבילה ב־Play. מפעיל את המנויים |
| `GOOGLE_SERVICE_ACCOUNT_FILE` / `_JSON` | — | מפתח ה־service account לאימות רכישות |
| `SUBSCRIPTION_PRODUCT_ID` | `premium` | מזהה המנוי ב־Play Console |
| `ENTITLEMENT_SECRET` | אקראי בכל הפעלה | מפתח לחתימת אישורי Premium. כדאי לקבוע ערך קבוע |
| `FREE_DOWNLOADS_PER_DAY` | `3` | הורדות חינם ביום |
| `FREE_MAX_HEIGHT` | `720` | האיכות המרבית בגרסה החינמית |

## API

| בקשה | תיאור |
|------|-------|
| `GET /api/health` | מצב השרת: גרסת yt-dlp, האם יש ffmpeg, פלטפורמות נתמכות |
| `POST /api/info` `{ url }` | כותרת, יוצר, משך, תמונה ואפשרויות ההורדה שקיימות בפועל |
| `POST /api/jobs` `{ url, option }` | פתיחת הורדה (`option` הוא `v2160`/`v1440`/`v1080`/`v720`/`v480`/`v360`/`best`/`audio`) |
| `GET /api/jobs/:id` | סטטוס, שלב, אחוזים, מהירות וזמן משוער |
| `GET /api/jobs/:id/file` | הקובץ המוכן, עם שם קובץ מהכותרת |
| `GET /api/plan` | חינם או Premium, כמה הורדות חינם נשארו היום |
| `POST /api/billing/verify` `{ purchaseToken, productId }` | אימות רכישה מול Google Play, מחזיר אישור Premium חתום |

בקשה שדורשת Premium מחזירה `402` עם `premium_required` או `quota_exceeded`.

## אבטחה

- **רשימת פלטפורמות סגורה** — רק YouTube, TikTok, Instagram, Facebook, X, Vimeo, Reddit ו־SoundCloud. כתובות פנימיות, IP ופורטים אחרים נחסמים (הגנה מ־SSRF).
- **בלי shell** — yt-dlp מופעל עם מערך ארגומנטים, הקישור מגיע אחרי `--`, וקבצי config של המחשב לא נטענים (`--ignore-config`).
- **קלט מאומת** — אפשרות ההורדה נבדקת מול רשימה קבועה, גוף הבקשה מוגבל ל־4KB, ומזהי הורדה הם UUID אקראיים.
- **מגבלות** — הגבלת קצב לכל IP, תור עם תקרה, מגבלת גודל קובץ, timeout לכל הורדה, ומחיקה אוטומטית של קבצים.
- **כותרות אבטחה** — CSP בלי סקריפטים חיצוניים או inline, `X-Frame-Options: DENY`, `nosniff`. רק קבצי האתר מוגשים, אף פעם לא קוד השרת.
- **פרטיות** — אין חשבונות, אין לוגים של קישורים בהורדות מוצלחות, וההיסטוריה נשמרת רק בדפדפן.

## עיצוב ואייקונים

ה־CSS נבנה מ־Tailwind וה־Font Awesome נשמר מקומית, כך שהעמוד לא תלוי ב־CDN. אחרי שינוי מחלקות ב־`media-downloader.html` או ב־`js/media-downloader.js`:

```bash
npm run build:css      # בונה את ../css/media-downloader.css
npm run vendor:assets  # מעתיק מחדש את Font Awesome ו־Heebo (רק אחרי עדכון החבילות)
```

## מה לא נתמך

- תוכן פרטי, Stories או כל דבר שדורש התחברות — השרת לא שומר ולא מקבל עוגיות או סיסמאות.
- רשימות השמעה שלמות — רק סרטון אחד בכל פעם.
- YouTube באפליקציית Android (מדיניות Google Play). באתר הוא נתמך.

## שימוש הוגן

לשימוש אישי בלבד, לתוכן שמותר לך לשמור. יש לכבד זכויות יוצרים ואת תנאי השימוש של כל פלטפורמה. רישיון MIT.
