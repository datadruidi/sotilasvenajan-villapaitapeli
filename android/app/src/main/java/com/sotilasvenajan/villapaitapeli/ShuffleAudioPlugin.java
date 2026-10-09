package com.sotilasvenajan.villapaitapeli;

import android.content.Intent;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ShuffleAudio")
public class ShuffleAudioPlugin extends Plugin {
    static ShuffleAudioPlugin instance;

    @Override public void load() { instance = this; }

    @PluginMethod public void start(PluginCall call) {
        try {
            String[] tracks = call.getArray("tracks").toList().toArray(new String[0]);
            if (tracks.length == 0) { call.reject("No tracks"); return; }
            Intent intent = new Intent(getContext(), ShuffleAudioService.class);
            intent.setAction("start");
            intent.putExtra("tracks", tracks);
            ContextCompat.startForegroundService(getContext(), intent);
            call.resolve();
        } catch (Exception error) { call.reject("Could not start shuffle", error); }
    }

    @PluginMethod public void control(PluginCall call) {
        if (ShuffleAudioService.instance != null) {
            String action = call.getString("action", "stop");
            getActivity().runOnUiThread(() -> {
                if (ShuffleAudioService.instance != null) ShuffleAudioService.instance.control(action);
            });
        }
        call.resolve();
    }

    @PluginMethod public void status(PluginCall call) {
        call.resolve(ShuffleAudioService.state());
    }

    static void publish() {
        if (instance != null) instance.notifyListeners("state", ShuffleAudioService.state());
    }

    @Override protected void handleOnDestroy() {
        if (instance == this) instance = null;
    }
}
