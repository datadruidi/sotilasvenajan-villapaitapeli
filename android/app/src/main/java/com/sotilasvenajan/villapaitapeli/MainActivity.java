package com.sotilasvenajan.villapaitapeli;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(ShuffleAudioPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
