package com.sotilasvenajan.villapaitapeli;

import android.app.Service;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.AudioManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;
import com.getcapacitor.JSObject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ShuffleAudioService extends Service {
    static ShuffleAudioService instance;
    private static final String CHANNEL = "shuffle-audio";
    private MediaPlayer player;
    private MediaPlayer queuedPlayer;
    private String queuedTrack;
    private boolean queuedReady;
    private List<String> tracks = new ArrayList<>();
    private final List<String> remaining = new ArrayList<>();
    private String track = "";
    private boolean playing;
    private boolean ready;
    private boolean playWhenReady;
    private AudioManager audioManager;
    private boolean resumeOnFocusGain;
    private final AudioManager.OnAudioFocusChangeListener focusListener = change -> {
        if (change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) {
            if (player != null) player.setVolume(0.2f, 0.2f);
        } else if (change == AudioManager.AUDIOFOCUS_GAIN) {
            if (player != null) player.setVolume(1f, 1f);
            if (resumeOnFocusGain) {
                resumeOnFocusGain = false;
                control("play");
            }
        } else if (change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
            boolean resume = playWhenReady;
            control("pause");
            resumeOnFocusGain = resume;
        } else if (change == AudioManager.AUDIOFOCUS_LOSS) {
            control("pause");
        }
    };

    @Override public void onCreate() {
        super.onCreate();
        instance = this;
        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) {
            getSystemService(NotificationManager.class).createNotificationChannel(
                new NotificationChannel(CHANNEL, "Sekoita kappaleet", NotificationManager.IMPORTANCE_LOW));
        }
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) { stopSelf(); return START_NOT_STICKY; }
        if ("start".equals(intent.getAction())) {
            String[] files = intent.getStringArrayExtra("tracks");
            if (files == null || files.length == 0) { stopSelf(); return START_NOT_STICKY; }
            tracks = Arrays.asList(files);
            remaining.clear();
            track = "";
            updateNotification();
            if (!requestFocus()) { stopSelf(); return START_NOT_STICKY; }
            next();
        } else control(intent.getAction());
        return START_NOT_STICKY;
    }

    private void updateNotification() {
        Intent open = new Intent(this, MainActivity.class);
        PendingIntent content = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Intent stop = new Intent(this, ShuffleAudioService.class).setAction("stop");
        PendingIntent stopAction = PendingIntent.getService(this, 1, stop, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        startForeground(41, new NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle("Sekoita kappaleet")
            .setContentText(track)
            .setContentIntent(content)
            .setOngoing(true)
            .addAction(android.R.drawable.ic_media_pause, "Pysäytä", stopAction)
            .build());
    }

    private String takeTrack() {
        if (remaining.isEmpty()) {
            remaining.addAll(tracks);
            Collections.shuffle(remaining);
            int last = remaining.size() - 1;
            if (last > 0 && remaining.get(last).equals(track)) Collections.swap(remaining, 0, last);
        }
        return remaining.remove(remaining.size() - 1);
    }

    private void next() {
        releasePlayer();
        track = takeTrack();
        playWhenReady = true;
        try {
            player = prepareTrack(track);
            player.prepareAsync();
            updateNotification();
            ShuffleAudioPlugin.publish();
        } catch (Exception error) { stopSelf(); }
    }

    private MediaPlayer prepareTrack(String file) throws Exception {
        if (file.contains("/") || file.contains("\\") || !file.toLowerCase(java.util.Locale.ROOT).endsWith(".mp3")) {
            throw new IllegalArgumentException("Invalid soundtrack file");
        }
        MediaPlayer media = new MediaPlayer();
        try (AssetFileDescriptor asset = getAssets().openFd("public/learning-materials/soundtrack-loop/" + file)) {
            media.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            media.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            media.setDataSource(asset.getFileDescriptor(), asset.getStartOffset(), asset.getLength());
            media.setOnPreparedListener(prepared -> {
                if (prepared == player) {
                    ready = true;
                    if (playWhenReady) { prepared.start(); playing = true; }
                    queueNext();
                    ShuffleAudioPlugin.publish();
                } else if (prepared == queuedPlayer) {
                    queuedReady = true;
                    if (player != null && ready) player.setNextMediaPlayer(prepared);
                }
            });
            media.setOnCompletionListener(this::advance);
            media.setOnErrorListener((failed, what, extra) -> { stopSelf(); return true; });
            return media;
        } catch (Exception error) { media.release(); throw error; }
    }

    private void queueNext() {
        if (queuedPlayer != null) return;
        try {
            queuedTrack = takeTrack();
            queuedPlayer = prepareTrack(queuedTrack);
            queuedReady = false;
            queuedPlayer.prepareAsync();
        } catch (Exception error) { stopSelf(); }
    }

    private void advance(MediaPlayer completed) {
        if (completed != player) return;
        // Android starts the prepared successor itself, preserving playback while
        // the screen is locked instead of tearing down the session at each end.
        player = queuedPlayer;
        track = queuedTrack;
        ready = queuedReady;
        queuedPlayer = null;
        queuedTrack = null;
        queuedReady = false;
        completed.release();
        if (player == null) { next(); return; }
        playing = ready && playWhenReady;
        if (ready) {
            if (playWhenReady) player.start();
            else player.pause();
            queueNext();
        }
        updateNotification();
        ShuffleAudioPlugin.publish();
    }

    void control(String action) {
        resumeOnFocusGain = false;
        if ("stop".equals(action)) { stopSelf(); return; }
        if (player == null) return;
        if ("pause".equals(action)) {
            playWhenReady = false;
            if (ready) player.pause();
            playing = false;
        } else if ("play".equals(action)) {
            if (!requestFocus()) return;
            playWhenReady = true;
            if (ready) { player.start(); playing = true; }
        }
        ShuffleAudioPlugin.publish();
    }

    @SuppressWarnings("deprecation")
    private boolean requestFocus() {
        return audioManager.requestAudioFocus(focusListener, AudioManager.STREAM_MUSIC,
            AudioManager.AUDIOFOCUS_GAIN) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
    }

    static JSObject state() {
        JSObject state = new JSObject();
        state.put("track", instance == null ? "" : instance.track);
        state.put("playing", instance != null && instance.playing);
        return state;
    }

    private void releasePlayer() {
        if (player != null) {
            if (ready) player.setNextMediaPlayer(null);
            player.release(); player = null;
        }
        if (queuedPlayer != null) { queuedPlayer.release(); queuedPlayer = null; }
        queuedTrack = null;
        queuedReady = false;
        playing = false;
        ready = false;
    }

    @Override public void onDestroy() {
        releasePlayer();
        audioManager.abandonAudioFocus(focusListener);
        instance = null;
        ShuffleAudioPlugin.publish();
        stopForeground(true);
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }
}
