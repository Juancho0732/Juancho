import { describe, expect, it } from 'vitest';
import { isSliderApplicable, sliderToAdjustments, SIMULATOR_SLIDERS } from './simulatorSliders';

describe('isSliderApplicable', () => {
  it('es aplicable si al menos uno de sus campos tiene valor base', () => {
    const acquisition = SIMULATOR_SLIDERS.find((s) => s.id === 'acquisitionSpend')!;
    expect(isSliderApplicable(acquisition, { marketingSpend: 1000 })).toBe(true);
  });

  it('no es aplicable si ninguno de sus campos tiene valor base', () => {
    const acquisition = SIMULATOR_SLIDERS.find((s) => s.id === 'acquisitionSpend')!;
    expect(isSliderApplicable(acquisition, { newCustomers: 5 })).toBe(false);
  });
});

describe('sliderToAdjustments', () => {
  it('aplica el mismo porcentaje a todos los campos del slider compuesto', () => {
    const acquisition = SIMULATOR_SLIDERS.find((s) => s.id === 'acquisitionSpend')!;
    expect(sliderToAdjustments(acquisition, 20)).toEqual({ marketingSpend: 20, salesSpend: 20 });
  });

  it('todos los sliders tienen al menos un campo', () => {
    for (const slider of SIMULATOR_SLIDERS) {
      expect(slider.keys.length).toBeGreaterThan(0);
    }
  });
});
