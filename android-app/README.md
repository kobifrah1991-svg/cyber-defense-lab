# 📱 MediaDownloader Pro — אפליקציית Android

אפליקציית Capacitor שעוטפת את ממשק ההורדה, עם מנוי Premium דרך Google Play Billing, שבוע ניסיון חינם, ושיתוף ישיר מאפליקציות אחרות ("שיתוף ← MediaDownloader").

| מה | איפה |
|----|------|
| מסך ראשי, הגדרות ומסך המנוי | `web/index.html`, `web/app.js` |
| לוגיקת ההורדה (משותפת עם האתר) | `../js/media-downloader.js` |
| קבלת קישורים משותפים | `android/app/src/main/java/.../ShareIntentPlugin.java` |
| אייקונים, מסך פתיחה וגרפיקה לחנות | `scripts/brand-assets.cjs` ← `store-assets/` |
| בנייה וחתימה | `.github/workflows/android-release.yml` |

## איך המנוי עובד

1. האפליקציה מציגה את המסלולים והמחירים כפי שהם מוגדרים ב־Play Console (ספריית `cordova-plugin-purchase`).
2. אחרי רכישה, האפליקציה שולחת את אסימון הרכישה לשרת (`POST /api/billing/verify`).
3. השרת בודק מול Google Play Developer API שהמנוי פעיל, מאשר (acknowledge) את הרכישה, ומחזיר אישור Premium חתום לעד 24 שעות.
4. האפליקציה מצרפת את האישור לכל בקשה. **המגבלות של הגרסה החינמית נאכפות בשרת**, כך שאי אפשר לעקוף אותן מהמכשיר.

| | חינם | Premium |
|--|------|---------|
| הורדות ביום | 3 (`FREE_DOWNLOADS_PER_DAY`) | ללא הגבלה |
| איכות | עד 720p (`FREE_MAX_HEIGHT`) | עד 4K |
| MP3 | ✗ | ✓ |

YouTube חסום באפליקציה (גם בממשק וגם בשרת, לפי הכותרת `X-Client: android`), כי מדיניות Google Play אוסרת אפליקציות שמורידות ממנו. גרסת הדפדפן ממשיכה לתמוך בו.

---

## מדריך: מאפס ועד Google Play

### 0. לפני ההעלאה הראשונה: שם החבילה

מזהה האפליקציה הוא `com.kobifrah.mediadownloader`. **אחרי ההעלאה הראשונה ל־Play אי אפשר לשנות אותו.** כדי לבחור מזהה אחר, צריך לעדכן אותו ב:
- `capacitor.config.json` ← `appId`
- `android/app/build.gradle` ← `namespace` ו־`applicationId`
- `android/app/src/main/res/values/strings.xml` ← `package_name`, `custom_url_scheme`
- התיקייה `android/app/src/main/java/com/kobifrah/mediadownloader/` והשורה `package` בשני קובצי ה־Java

### 1. מפתח חתימה (פעם אחת)

```bash
keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 upload.jks > upload.jks.b64
```

שמרו את `upload.jks` והסיסמאות במקום בטוח, מחוץ למאגר. ב־Play Console מומלץ להפעיל **Play App Signing**: Google מחזיקה את מפתח ההפצה, והמפתח הזה משמש רק להעלאה (ואפשר לאפס אותו אם הוא אובד).

ב־GitHub: **Settings ← Secrets and variables ← Actions**:

| סוג | שם | ערך |
|-----|----|-----|
| Secret | `ANDROID_KEYSTORE_BASE64` | התוכן של `upload.jks.b64` |
| Secret | `ANDROID_KEYSTORE_PASSWORD` | סיסמת ה־keystore |
| Secret | `ANDROID_KEY_ALIAS` | `upload` |
| Secret | `ANDROID_KEY_PASSWORD` | סיסמת המפתח |
| Variable | `MDP_API_BASE` | כתובת השרת, למשל `https://dl.example.com` |
| Variable | `MDP_SITE_URL` | (לא חובה) הכתובת שבה נמצאים `privacy.html` ו־`terms.html`. ברירת מחדל: `MDP_API_BASE` |
| Variable | `MDP_SUPPORT_URL` | (לא חובה) קישור תמיכה, למשל `mailto:support@example.com` |

### 2. בניית גרסה

```bash
git tag app-v1.0.0 && git push origin app-v1.0.0
```

ה־workflow בונה APK ו־AAB חתומים:
- **AAB** (מה ש־Google Play מקבלת) — ב־artifact בשם `android-bundle`.
- **APK** + קובץ SHA-256 — ב־GitHub Release, לדף ההורדה הישירה.
- בסיכום הריצה (Summary) מופיע הקטע המוכן להדבקה ב־`app-release.json`.

> ⚠ אם המאגר פרטי, קבצים ב־GitHub Releases לא יהיו נגישים לציבור. במקרה כזה מעלים את ה־APK לשרת או ל־CDN, ומעדכנים את `apk.url` בהתאם.

### 3. יצירת האפליקציה ב־Play Console

1. **Create app** ← שם: MediaDownloader Pro, שפת ברירת מחדל: עברית, App, Free (חינמית עם רכישות בתוך האפליקציה).
2. **Store listing**: אייקון `store-assets/play-icon-512.png`, גרפיקה `store-assets/feature-graphic-1024x500.png`, צילומי מסך מ־`store-assets/screenshots/`.
3. **Privacy policy**: הכתובת של `privacy.html` בשרת שלכם.
4. **Data safety** — התשובות שמתאימות לקוד הנוכחי:
   - נאסף: *App activity → Other user-generated content* (הקישורים שהמשתמש שולח), לצורך *App functionality*, לא נשמר לטווח ארוך, לא משותף.
   - נאסף: *Device or other IDs* (מזהה אקראי לספירת הורדות חינם), לצורך *App functionality*.
   - *Purchase history* — מעובד על ידי Google Play.
   - הנתונים מוצפנים בתעבורה: כן. אפשר לבקש מחיקה: כן.
5. **Content rating**, **Target audience** (13+), **Ads**: אין.

> 💡 **תיאור בחנות:** כתבו שהאפליקציה מיועדת לשמירת תוכן שמותר לשמור (התוכן שלכם, תוכן ברישיון חופשי), אל תזכירו YouTube, ואל תבטיחו "הורדה של כל סרטון". Google בודקת אפליקציות הורדה בקפידה, והתיאור משפיע על האישור.

### 4. המנוי והניסיון החינמי

**Monetize ← Products ← Subscriptions ← Create subscription**:

1. **Product ID:** `premium` (חייב להתאים ל־`SUBSCRIPTION_PRODUCT_ID` בשרת ול־`MDP_PRODUCT_ID` באפליקציה, שניהם `premium` כברירת מחדל).
2. **Base plans:**
   - `monthly` ← Auto-renewing, Billing period: 1 month, מחיר.
   - `yearly` ← Auto-renewing, Billing period: 1 year, מחיר. האפליקציה מחשבת ומציגה לבד את אחוז החיסכון.
3. **Offers:** בכל base plan ← Add offer ← ID: `free-trial`, Eligibility: *New customer acquisition* (מי שלא היה מנוי), Phase: **Free trial, 7 days**.
4. **Activate** את ה־base plans וה־offers.

האפליקציה מציגה "התחילו 7 ימים חינם" רק כש־Google מאשרת שהמשתמש זכאי לניסיון, כלומר פעם אחת לכל חשבון.

### 5. חיבור השרת ל־Google Play (Service Account)

1. ב־Google Cloud Console: צרו פרויקט ← הפעילו את **Google Play Android Developer API**.
2. **IAM ← Service accounts ← Create**, ואז **Keys ← Add key ← JSON**. שמרו את הקובץ בשרת בלבד.
3. ב־Play Console: **Users and permissions ← Invite new users**, הזינו את כתובת ה־service account, ותנו הרשאות **View financial data** ו־**Manage orders and subscriptions** לאפליקציה הזו.
4. משתני הסביבה בשרת:

```bash
GOOGLE_PLAY_PACKAGE=com.kobifrah.mediadownloader
GOOGLE_SERVICE_ACCOUNT_FILE=/run/secrets/play-service-account.json
ENTITLEMENT_SECRET=$(openssl rand -hex 32)   # קבוע: בלעדיו המנויים יאומתו מחדש אחרי כל הפעלה מחדש
TRUST_PROXY=1                                # אם יש reverse proxy או CDN לפני השרת
```

ההרשאות מתעדכנות אצל Google עד 24 שעות. אם האימות מחזיר שגיאה בהתחלה, זו הסיבה הנפוצה.

### 6. בדיקה לפני השקה

1. **Setup ← License testing**: הוסיפו את חשבונות ה־Google של הבודקים. אצלם רכישות לא מחויבות, ותקופות המנוי מקוצרות (חודש = 5 דקות, ניסיון = 3 דקות).
2. העלו את ה־AAB ל־**Internal testing**, והתקינו מהקישור שהמסלול נותן (כך Billing עובד).
3. בדקו: ניסיון חינם ← Premium נפתח ← ביטול ב־Play ← אחרי סיום התקופה האפליקציה חוזרת לחינם. בדקו גם "שחזור רכישות" במכשיר שני.
4. עברו ל־**Closed testing**. חשבונות מפתח אישיים חדשים חייבים 12 בודקים במשך 14 יום לפני Production.

### 7. אחרי כל גרסה

עדכנו את `app-release.json` בשורש המאגר (הסיכום של ה־workflow נותן את הערכים), ואחרי פרסום בחנות גם את `playUrl` ואת `prices`, שמוצגים רק לתצוגה בדף הנחיתה. דף `app.html` מתעדכן לבד.

---

## פיתוח מקומי

```bash
npm install
MDP_API_BASE=https://dl.example.com npm run sync   # בונה את www/ ומסנכרן ל־Android
npm run open                                      # פותח ב־Android Studio
```

- בנייה מקומית דורשת Android Studio (או Android SDK) ו־JDK 21.
- אחרי שינוי עיצוב: `cd ../media-downloader && npm run build:css`.
- אחרי שינוי מיתוג: `node scripts/brand-assets.cjs` (דורש Playwright).
- **iPhone:** Apple אוסרת אפליקציות להורדת מדיה ב־App Store (הנחיה 5.2.3), ולכן לאייפון יש גרסת Web שמותקנת על מסך הבית (`manifest.webmanifest`).
