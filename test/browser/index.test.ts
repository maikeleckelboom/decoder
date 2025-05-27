import { describe } from 'vitest';
import { pixelift } from '@/browser';

describe('Pixelift decoder', () => {
  it('should export pixelift function', async () => {
    expect(typeof pixelift).toBe('function');
  });
});
