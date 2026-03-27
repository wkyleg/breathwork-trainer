import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppSettings {
  protocolId: string;
  sessionDuration: number;
  audioEnabled: boolean;
  audioVolume: number;
  reducedMotion: boolean;
}

interface SettingsStore extends AppSettings {
  setProtocol: (id: string) => void;
  setSessionDuration: (seconds: number) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setAudioVolume: (volume: number) => void;
  setReducedMotion: (enabled: boolean) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      protocolId: 'box',
      sessionDuration: 180,
      audioEnabled: true,
      audioVolume: 0.5,
      reducedMotion: false,

      setProtocol: (id) => set({ protocolId: id }),
      setSessionDuration: (seconds) => set({ sessionDuration: seconds }),
      setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
      setAudioVolume: (volume) => set({ audioVolume: volume }),
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
    }),
    { name: 'breathwork-settings' },
  ),
);
