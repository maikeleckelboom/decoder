import { describe } from 'vitest';
import { pixelift } from '@/browser';

describe('Pixelift Browser', () => {
  it('should export pixelift function', async () => {
    expect(typeof pixelift).toBe('function');
  });
});
