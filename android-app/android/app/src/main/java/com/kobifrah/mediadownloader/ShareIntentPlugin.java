package com.kobifrah.mediadownloader;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Receives links shared to the app ("Share → MediaDownloader" in TikTok, Instagram, etc.)
 * and hands them to the web layer as a "shared" event.
 */
@CapacitorPlugin(name = "ShareIntent")
public class ShareIntentPlugin extends Plugin {

    private static final Pattern URL = Pattern.compile("https?://[^\\s]+");

    @Override
    protected void handleOnNewIntent(Intent intent) {
        String url = sharedUrl(intent);
        if (url == null) {
            return;
        }
        JSObject data = new JSObject();
        data.put("url", url);
        // Kept until the page registers its listener, so links shared on a cold start aren't lost.
        notifyListeners("shared", data, true);
    }

    static String sharedUrl(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) {
            return null;
        }
        String text = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (text == null) {
            return null;
        }
        Matcher matcher = URL.matcher(text);
        return matcher.find() ? matcher.group() : null;
    }
}
