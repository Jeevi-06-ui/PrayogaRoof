package org.prayogaproof.stemlab;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private TextToSpeech tts;
    private boolean ttsReady = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable remote debugging of WebView content
        WebView.setWebContentsDebuggingEnabled(true);

        // Initialize Native Android Text-to-Speech Engine
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int res = tts.setLanguage(Locale.US);
                if (res != TextToSpeech.LANG_MISSING_DATA && res != TextToSpeech.LANG_NOT_SUPPORTED) {
                    ttsReady = true;
                }
            }
        });

        // Register Native JavaScript Interface on WebView
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new AndroidSpeechBridge(), "AndroidTTS");
        }
    }

    public class AndroidSpeechBridge {
        @JavascriptInterface
        public boolean isAvailable() {
            return ttsReady;
        }

        @JavascriptInterface
        public void speak(String text, float rate, float pitch) {
            if (ttsReady && tts != null && text != null) {
                tts.setSpeechRate(rate > 0 ? rate : 1.0f);
                tts.setPitch(pitch > 0 ? pitch : 1.0f);
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "PRAYOGAPROOF_TTS");
            }
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) {
                tts.stop();
            }
        }
    }

    @Override
    public void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
