import { colors, radius, spacing } from '../tokens';

describe('design tokens', () => {
  it('exposes a consistent spacing scale', () => {
    const values = Object.values(spacing);
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });

  it('defines the core semantic colors', () => {
    expect(colors.primary).toMatch(/^#[0-9A-F]{6}$/i);
    expect(colors.background).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('defines border radius tokens used by ui components', () => {
    expect(radius.md).toBeGreaterThan(radius.sm);
  });
});
