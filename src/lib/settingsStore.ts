import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SoundscapeType = 'none' | 'brown-noise' | 'rain' | 'ocean' | 'singing-bowls' | 'forest';

export const SOUNDSCAPES: { id: SoundscapeType; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'brown-noise', label: 'Brown Noise' },
  { id: 'rain', label: 'Rain' },
  { id: 'ocean', label: 'Ocean Waves' },
  { id: 'singing-bowls', label: 'Singing Bowls' },
  { id: 'forest', label: 'Forest' },
];

interface AppSettings {
  protocolId: string;
  sessionDuration: number;
  audioEnabled: boolean;
  audioVolume: number;
  reducedMotion: boolean;
  soundscape: SoundscapeType;
  customInhale: number;
  customHold: number;
  customExhale: number;
}

interface SettingsStore extends AppSettings {
  setProtocol: (id: string) => void;
  setSessionDuration: (seconds: number) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setAudioVolume: (volume: number) => void;
  setReducedMotion: (enabled: boolean) => void;
  setSoundscape: (soundscape: SoundscapeType) => void;
  setCustomInhale: (seconds: number) => void;
  setCustomHold: (seconds: number) => void;
  setCustomExhale: (seconds: number) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      protocolId: 'box',
      sessionDuration: 180,
      audioEnabled: true,
      audioVolume: 0.5,
      reducedMotion: false,
      soundscape: 'brown-noise',
      customInhale: 4,
      customHold: 2,
      customExhale: 6,

      setProtocol: (id) => set({ protocolId: id }),
      setSessionDuration: (seconds) => set({ sessionDuration: seconds }),
      setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
      setAudioVolume: (volume) => set({ audioVolume: volume }),
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      setSoundscape: (soundscape) => set({ soundscape }),
      setCustomInhale: (seconds) => set({ customInhale: Math.max(1, Math.min(30, seconds)) }),
      setCustomHold: (seconds) => set({ customHold: Math.max(0, Math.min(30, seconds)) }),
      setCustomExhale: (seconds) => set({ customExhale: Math.max(1, Math.min(30, seconds)) }),
    }),
    { name: 'breathwork-settings' },
  ),
);
