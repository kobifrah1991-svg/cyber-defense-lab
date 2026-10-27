/* LangQuest — platform layer: web browser vs. Android app (Capacitor)
 * In the APK the Capacitor runtime injects window.Capacitor; native plugins are reached through
 * Capacitor.Plugins (no bundler needed). On the web every call falls back to browser APIs.
 */
(function () {
  const cap = window.Capacitor;
  const isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const platform = isNative ? cap.getPlatform() : 'web';

  function plugin(name) {
    return isNative && cap.Plugins ? cap.Plugins[name] || null : null;
  }

  /** External links (checkout, store pages) leave the app WebView. */
  function openExternal(url) {
    const browser = plugin('Browser');
    if (browser) return browser.open({ url });
    window.open(url, '_blank', 'noopener');
  }

  document.documentElement.classList.toggle('native', isNative);
  document.documentElement.dataset.platform = platform;

  window.LQNative = { isNative, platform, plugin, openExternal };
})();
