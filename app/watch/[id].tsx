import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View, useTVEventHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlayerState, YoutubeView, useYouTubeEvent, useYouTubePlayer } from 'react-native-youtube-bridge';
import FocusButton from '@/components/focus-button';
import SessionTimer from '@/components/session-timer';
import { getNextVideo } from '@/hooks/use-videos';
import { useWatchRecorder } from '@/hooks/use-watch-recorder';
import { useSession } from '@/contexts/session-context';

const OVERLAY_HIDE_MS = 4000;
const SEEK_SECONDS = 10;
// Remounts allowed after the WebView's renderer dies before showing the error
// screen. The count resets once the video has played on for a while.
const MAX_WEBVIEW_RESTARTS = 2;
const RESTARTS_RESET_AFTER_SECONDS = 30;

type Phase = 'playing' | 'ended' | 'error' | 'blocked';

export default function PlayerPage() {
  const { id } = useLocalSearchParams<'/watch/[id]'>();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('playing');
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false); // actually playing: not loading, buffering or paused
  const [overlay, setOverlay] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const player = useYouTubePlayer(id, {
    autoplay: true,
    controls: false, // our overlay replaces YouTube's UI (no links out of the app)
    rel: false,
    playsinline: true,
  });

  const showOverlay = useCallback(() => {
    setOverlay(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setOverlay(false), OVERLAY_HIDE_MS);
  }, []);

  useEffect(() => {
    showOverlay();
    return () => clearTimeout(hideTimer.current);
  }, [showOverlay]);

  useWatchRecorder(id, playing);

  // Android can crash or kill the WebView's renderer process mid-video, which
  // leaves a dead black view with no events. Remount it and carry on from the
  // last reported position; if it keeps dying, show the error screen instead.
  const [webViewKey, setWebViewKey] = useState(0);
  const restarts = useRef(0);
  const position = useRef(0);
  const resumeAt = useRef(0);
  useEffect(() => {
    restarts.current = 0;
    position.current = 0;
    resumeAt.current = 0;
  }, [id]);

  const onRenderProcessGone = useCallback(() => {
    setPlaying(false);
    if (restarts.current >= MAX_WEBVIEW_RESTARTS) {
      setPhase('error');
      return;
    }
    restarts.current += 1;
    resumeAt.current = position.current;
    setWebViewKey((key) => key + 1);
  }, []);

  useYouTubeEvent(player, 'ready', () => {
    if (resumeAt.current > 0) player.seekTo(resumeAt.current, true);
  }, [player]);

  // Tell the session when this video will end, so it can finish if time runs
  // out mid-video. Anything but playing (pause, end, leaving) reports null.
  const { reportPlayback, graceUntil } = useSession();
  useYouTubeEvent(player, 'progress', (progress) => {
    position.current = progress.currentTime;
    if (progress.currentTime > resumeAt.current + RESTARTS_RESET_AFTER_SECONDS) restarts.current = 0;
    if (playing && progress.duration > 0) {
      reportPlayback(Date.now() + Math.max(0, progress.duration - progress.currentTime) * 1000);
    }
  }, [playing, reportPlayback]);
  useEffect(() => {
    if (!playing) reportPlayback(null);
  }, [playing, reportPlayback]);
  useEffect(() => () => reportPlayback(null), [reportPlayback]);

  useYouTubeEvent(player, 'stateChange', (state) => {
    setPlaying(state === PlayerState.PLAYING);
    if (state === PlayerState.PLAYING) {
      setPaused(false);
      setPhase('playing');
    }
    if (state === PlayerState.PAUSED) setPaused(true);
    if (state === PlayerState.ENDED) setPhase('ended');
  }, []);
  useYouTubeEvent(player, 'error', () => {
    setPlaying(false);
    setPhase('error');
  }, []);
  useYouTubeEvent(player, 'autoplayBlocked', () => setPhase('blocked'), []);

  const togglePlay = () => {
    if (paused || phase === 'blocked') player.play();
    else player.pause();
    showOverlay();
  };

  const seek = async (delta: number) => {
    const t = (await player.getCurrentTime()) ?? 0;
    await player.seekTo(Math.max(0, t + delta), true);
    showOverlay();
  };

  const nextVideo = useMemo(() => getNextVideo(id), [id]);
  const next = graceUntil === null ? nextVideo : null;
  const playNext = () => {
    if (next) router.replace({ pathname: '/watch/[id]', params: { id: next.id } });
  };

  // Remote keys while the overlay is hidden: any key shows it, media keys act directly.
  useTVEventHandler((evt) => {
    if (phase !== 'playing') return;
    if (evt.eventType === 'playPause') return togglePlay();
    if (!overlay && evt.eventType === 'left') return seek(-SEEK_SECONDS);
    if (!overlay && evt.eventType === 'right') return seek(SEEK_SECONDS);
    if (!overlay) showOverlay();
    else if (evt.eventType !== 'blur' && evt.eventType !== 'focus') showOverlay(); // keep visible while navigating
  });

  return (
    <View className='flex-1 bg-black'>
      <YoutubeView
        key={webViewKey}
        player={player}
        // The library defaults width to the window width read at import time (portrait),
        // which leaves the player square after rotating to landscape.
        style={{ flex: 1, width: '100%' }}
        webViewProps={{ focusable: false, importantForAccessibility: 'no-hide-descendants', onRenderProcessGone }}
      />

      {/* Touch shield: blocks taps on the YouTube iframe (logo/links) and shows controls. */}
      <Pressable className='absolute inset-0' onPress={showOverlay} focusable={false} />

      {phase === 'playing' && overlay && (
        <View className='absolute inset-0 justify-between bg-black/30' pointerEvents='box-none'>
          {/* Solid backing so YouTube's own title overlay doesn't show through our buttons. */}
          <View className='flex-row items-center justify-between p-6 bg-black/70'>
            <ControlButton label='← Back' onPress={() => router.back()} />
            <SessionTimer />
          </View>
          <View className='flex-row items-center justify-center gap-6 pb-10'>
            <ControlButton label={`⏪ ${SEEK_SECONDS}`} onPress={() => seek(-SEEK_SECONDS)} />
            <ControlButton label={paused ? '▶ Play' : '⏸ Pause'} onPress={togglePlay} big preferred />
            <ControlButton label={`${SEEK_SECONDS} ⏩`} onPress={() => seek(SEEK_SECONDS)} />
          </View>
        </View>
      )}

      {phase !== 'playing' && (
        <View className='absolute inset-0 items-center justify-center bg-black/80 gap-6 p-8'>
          <Text className='text-white text-3xl font-bold text-center'>
            {phase === 'ended' && 'All done! 🎉'}
            {phase === 'error' && "This video can't play here 😕"}
            {phase === 'blocked' && 'Press play to start'}
          </Text>
          {phase === 'ended' && next && (
            <Text className='text-gray-300 text-xl text-center' numberOfLines={2}>Next: {next.title}</Text>
          )}
          <View className='flex-row gap-4'>
            {phase === 'blocked' ? (
              <ControlButton label='▶ Play' onPress={togglePlay} big preferred />
            ) : (
              next && <ControlButton label='▶ Next video' onPress={playNext} big preferred />
            )}
            <ControlButton label='Back to videos' onPress={() => router.back()} preferred={!next && phase !== 'blocked'} />
          </View>
        </View>
      )}
    </View>
  );
}

function ControlButton({ label, onPress, big, preferred }: { label: string; onPress: () => void; big?: boolean; preferred?: boolean }) {
  return (
    <FocusButton
      hasTVPreferredFocus={preferred}
      onPress={onPress}
      className={big ? 'px-8 py-4 rounded-full bg-white/20' : 'px-5 py-3 rounded-full bg-white/20'}
      focusClassName='bg-white'
    >
      {({ focused }) => (
        <Text className={`${big ? 'text-2xl' : 'text-lg'} font-bold ${focused ? 'text-gray-900' : 'text-white'}`}>{label}</Text>
      )}
    </FocusButton>
  );
}
