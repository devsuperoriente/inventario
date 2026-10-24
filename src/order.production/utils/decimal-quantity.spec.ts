import { BadRequestException } from '@nestjs/common';
import { addDecimalStrings, multiplyAndDivideDecimals, multiplyDecimals, parsePositiveModelDecimal, roundDecimalToScale } from './decimal-quantity.js';

describe('decimal quantity helpers', () => {
  it('multiplies model decimals exactly without integer rounding', () => {
    const amount = parsePositiveModelDecimal('0.15', 'amount');
    const scheduled = parsePositiveModelDecimal('2.25', 'quantity');

    expect(multiplyDecimals(amount, scheduled)).toBe('0.3375');
  });

  it('scales recipe materials by the scheduled quantity and base yield', () => {
    const amount = parsePositiveModelDecimal('0.15', 'amount');
    const scheduled = parsePositiveModelDecimal('2.25', 'quantity');
    const baseYield = parsePositiveModelDecimal('1.5', 'baseYield');

    expect(multiplyAndDivideDecimals(amount, scheduled, baseYield)).toBe('0.225');
  });

  it('preserves fractional results to decimal precision instead of rounding to integers', () => {
    const amount = parsePositiveModelDecimal('1', 'amount');
    const scheduled = parsePositiveModelDecimal('1', 'quantity');
    const baseYield = parsePositiveModelDecimal('3', 'baseYield');

    expect(multiplyAndDivideDecimals(amount, scheduled, baseYield)).toBe('0.3333333333');
  });

  it('rounds persisted consumption values to model scale and combines duplicate recipe lines', () => {
    expect(roundDecimalToScale('0.225', 2)).toBe('0.23');
    expect(addDecimalStrings('1.25', '0.75')).toBe('2');
  });

  it('rejects non-positive and out-of-model-precision values', () => {
    expect(() => parsePositiveModelDecimal('0', 'amount')).toThrow(BadRequestException);
    expect(() => parsePositiveModelDecimal('1.001', 'amount')).toThrow(BadRequestException);
    expect(() => parsePositiveModelDecimal('100000000', 'amount')).toThrow(BadRequestException);
  });
});
