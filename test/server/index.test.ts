import { describe } from 'vitest';
import { pixelift } from '@/server';

describe('Pixelift Server', () => {
  it('should export pixelift function', async () => {
    expect(typeof pixelift).toBe('function');
  });
});
