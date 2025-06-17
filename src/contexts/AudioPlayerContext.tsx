
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Track {
  id: string;
  audioUrl: string;
  coverUrl: string;
  title: string;
  artist: string;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  playlist: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (track: Track, playlist?: Track[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setPlaylist: (tracks: Track[], startIndex?: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Update progress from audio tag
  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  // On load, set duration
  const onLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  // When track changes, reset progress/duration
  useEffect(() => {
    setProgress(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
    }
  }, [currentTrack?.audioUrl]);

  const playTrack = (track: Track, newPlaylist?: Track[]) => {
    setCurrentTrack(track);
    if (newPlaylist) {
      setPlaylistState(newPlaylist);
      const index = newPlaylist.findIndex(t => t.id === track.id);
      setCurrentTrackIndex(index >= 0 ? index : 0);
    } else {
      setPlaylistState([track]);
      setCurrentTrackIndex(0);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (playlist.length === 0 || currentTrackIndex >= playlist.length - 1) return;
    const nextIndex = currentTrackIndex + 1;
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
  };

  const previousTrack = () => {
    if (playlist.length === 0 || currentTrackIndex <= 0) return;
    const prevIndex = currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const setPlaylist = (tracks: Track[], startIndex: number = 0) => {
    setPlaylistState(tracks);
    setCurrentTrackIndex(startIndex);
    if (tracks.length > startIndex) {
      setCurrentTrack(tracks[startIndex]);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        playlist,
        currentTrackIndex,
        isPlaying,
        progress,
        duration,
        audioRef,
        playTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
        seekTo,
        setPlaylist,
      }}
    >
      {children}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </AudioPlayerContext.Provider>
  );
};
