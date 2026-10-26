"""Localization engine for AlfaMaster.

Supports four UI languages with layout direction metadata so a front-end
can flip to full RTL for Hebrew and Arabic:

    en  English   LTR
    ru  Русский   LTR
    he  עברית     RTL
    ar  العربية   RTL

Usage::

    from alfamaster.i18n import Translator
    t = Translator("he")
    t("app.title")          # -> "AlfaMaster — ערכת אבטחה ורשת"
    t.direction             # -> "rtl"
    t.is_rtl                # -> True
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Language metadata
# ---------------------------------------------------------------------------

LANGUAGES = {
    "en": {"name": "English",  "native": "English",  "dir": "ltr"},
    "ru": {"name": "Russian",  "native": "Русский",  "dir": "ltr"},
    "he": {"name": "Hebrew",   "native": "עברית",    "dir": "rtl"},
    "ar": {"name": "Arabic",   "native": "العربية",  "dir": "rtl"},
}

DEFAULT_LANG = "en"
RTL_LANGS = frozenset(code for code, m in LANGUAGES.items() if m["dir"] == "rtl")

# ---------------------------------------------------------------------------
# String catalog.  Keys are dotted namespaces; every language carries the
# same key set so the UI never shows a blank label.
# ---------------------------------------------------------------------------

STRINGS = {
    "app.title": {
        "en": "AlfaMaster — Security & Network Suite",
        "ru": "AlfaMaster — набор для безопасности и сети",
        "he": "AlfaMaster — ערכת אבטחה ורשת",
        "ar": "AlfaMaster — حزمة الأمن والشبكات",
    },
    "menu.dashboard": {
        "en": "Dashboard", "ru": "Панель", "he": "לוח בקרה", "ar": "لوحة التحكم",
    },
    "menu.hardware": {
        "en": "Hardware", "ru": "Оборудование", "he": "חומרה", "ar": "العتاد",
    },
    "menu.scan": {
        "en": "Network Scan", "ru": "Сканирование сети",
        "he": "סריקת רשת", "ar": "فحص الشبكة",
    },
    "menu.wifi_survey": {
        "en": "Wi-Fi Survey (passive)", "ru": "Обзор Wi-Fi (пассивный)",
        "he": "סקר Wi-Fi (פסיבי)", "ar": "مسح Wi-Fi (سلبي)",
    },
    "hw.detecting": {
        "en": "Detecting adapters…", "ru": "Поиск адаптеров…",
        "he": "מזהה מתאמים…", "ar": "يتم اكتشاف المحولات…",
    },
    "hw.alfa_found": {
        "en": "Alfa AWUS1900 (RTL8814AU) detected",
        "ru": "Обнаружен Alfa AWUS1900 (RTL8814AU)",
        "he": "זוהה Alfa AWUS1900 (RTL8814AU)",
        "ar": "تم اكتشاف Alfa AWUS1900 (RTL8814AU)",
    },
    "hw.alfa_missing": {
        "en": "No Alfa AWUS1900 adapter found",
        "ru": "Адаптер Alfa AWUS1900 не найден",
        "he": "לא נמצא מתאם Alfa AWUS1900",
        "ar": "لم يتم العثور على محول Alfa AWUS1900",
    },
    "scan.profile.quick": {
        "en": "Quick scan", "ru": "Быстрое сканирование",
        "he": "סריקה מהירה", "ar": "فحص سريع",
    },
    "scan.profile.service_os": {
        "en": "Service & OS detection", "ru": "Службы и ОС",
        "he": "זיהוי שירותים ומערכת הפעלה", "ar": "كشف الخدمات ونظام التشغيل",
    },
    "scan.profile.aggressive": {
        "en": "Aggressive scan", "ru": "Агрессивное сканирование",
        "he": "סריקה אגרסיבית", "ar": "فحص قوي",
    },
    "scan.running": {
        "en": "Scanning {target}…", "ru": "Сканирование {target}…",
        "he": "סורק את {target}…", "ar": "يتم فحص {target}…",
    },
    "scan.done": {
        "en": "Scan complete", "ru": "Сканирование завершено",
        "he": "הסריקה הושלמה", "ar": "اكتمل الفحص",
    },
    "err.bad_target": {
        "en": "Invalid target: {target}",
        "ru": "Недопустимая цель: {target}",
        "he": "יעד לא תקין: {target}",
        "ar": "هدف غير صالح: {target}",
    },
    "err.tool_missing": {
        "en": "Required tool not found: {tool}",
        "ru": "Инструмент не найден: {tool}",
        "he": "הכלי הדרוש לא נמצא: {tool}",
        "ar": "الأداة المطلوبة غير موجودة: {tool}",
    },
    "auth.reminder": {
        "en": "Only scan systems you own or are explicitly authorized to test.",
        "ru": "Сканируйте только свои системы или с явным разрешением.",
        "he": "סרוק רק מערכות בבעלותך או שקיבלת אישור מפורש לבדוק.",
        "ar": "افحص فقط الأنظمة التي تملكها أو لديك إذن صريح باختبارها.",
    },
}


class Translator:
    """Resolve string keys for a chosen language, with graceful fallback."""

    def __init__(self, lang: str = DEFAULT_LANG) -> None:
        self.set_language(lang)

    def set_language(self, lang: str) -> None:
        if lang not in LANGUAGES:
            lang = DEFAULT_LANG
        self.lang = lang

    @property
    def direction(self) -> str:
        return LANGUAGES[self.lang]["dir"]

    @property
    def is_rtl(self) -> bool:
        return self.lang in RTL_LANGS

    @property
    def native_name(self) -> str:
        return LANGUAGES[self.lang]["native"]

    def __call__(self, key: str, **fmt: object) -> str:
        entry = STRINGS.get(key)
        if entry is None:
            return key  # surface the missing key rather than crashing
        text = entry.get(self.lang) or entry.get(DEFAULT_LANG) or key
        if fmt:
            try:
                text = text.format(**fmt)
            except (KeyError, IndexError):
                pass
        return text


def available_languages() -> list[dict]:
    """Return language descriptors for building a language picker."""
    return [{"code": code, **meta} for code, meta in LANGUAGES.items()]
