import { describe } from 'vitest';
import { pixelift } from '@/server';

describe('Pixelift decoder', () => {
  it('should export pixelift function', async () => {
    expect(typeof pixelift).toBe('function');
  });
});
