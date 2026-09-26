import { describe, it, expect, afterEach } from 'vitest';
import { getVolume, playCoin, playCorrect, playJump } from '../../src/engine/sounds.js';

afterEach(() => {
  delete globalThis.window;
  delete globalThis.localStorage;
});

describe('sounds without Web Audio', () => {
  it('stays silent instead of throwing when there is no AudioContext', () => {
    globalThis.window = {};
    expect(() => {
      playCorrect();
      playCoin();
      playJump();
    }).not.toThrow();
  });

  it('stays silent when creating the AudioContext throws', () => {
    globalThis.window = {
      AudioContext: function Broken() {
        throw new Error('NotAllowedError');
      },
    };
    expect(() => playCorrect()).not.toThrow();
  });

  it('falls back to the default volume for a corrupt stored value', () => {
    globalThis.localStorage = { getItem: () => 'loud', setItem: () => {} };
    expect(getVolume()).toBe(0.5);
  });
});
