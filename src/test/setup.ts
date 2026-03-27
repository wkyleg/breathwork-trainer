import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

class MockAudioContext {
  currentTime = 0;
  destination = { maxChannelCount: 2 };
  sampleRate = 44100;
  state = 'running' as AudioContextState;

  createOscillator = vi.fn(() => ({
    type: 'sine',
    frequency: { value: 440, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    detune: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  }));

  createGain = vi.fn(() => ({
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createBufferSource = vi.fn(() => ({
    buffer: null,
    loop: false,
    playbackRate: { value: 1 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  }));

  createBuffer = vi.fn((channels: number, length: number, sampleRate: number) => ({
    numberOfChannels: channels,
    length,
    sampleRate,
    duration: length / sampleRate,
    getChannelData: vi.fn(() => new Float32Array(length)),
  }));

  resume = vi.fn(() => Promise.resolve());
  suspend = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
}

// @ts-expect-error - Mock global AudioContext
globalThis.AudioContext = MockAudioContext;
// @ts-expect-error - Mock webkit prefix
globalThis.webkitAudioContext = MockAudioContext;

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

globalThis.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(() => callback(performance.now()), 16) as unknown as number;
});

globalThis.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});

export { localStorageMock, MockAudioContext };
