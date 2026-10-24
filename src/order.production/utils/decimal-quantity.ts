import { BadRequestException } from '@nestjs/common';

type DecimalValue = number | string | null | undefined;

interface Decimal {
  coefficient: bigint;
  scale: number;
}

export function parsePositiveModelDecimal(value: DecimalValue, label: string): Decimal {
  if (value === null || value === undefined || (typeof value === 'number' && !Number.isFinite(value))) {
    throw new BadRequestException(`${label} debe ser un número decimal positivo`);
  }

  const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(String(value));
  if (!match) {
    throw new BadRequestException(`${label} debe ser un número decimal positivo`);
  }

  const [, sign, integer, fraction = '', exponentText = '0'] = match;
  const exponent = Number(exponentText);
  if (!Number.isSafeInteger(exponent) || exponent < -100 || exponent > 100) {
    throw new BadRequestException(`${label} excede la precisión permitida`);
  }

  let digits = `${integer}${fraction}`.replace(/^0+/, '') || '0';
  let scale = fraction.length - exponent;
  let coefficient = BigInt(digits);
  if (scale < 0) {
    coefficient *= 10n ** BigInt(-scale);
    scale = 0;
  }
  while (scale > 0 && coefficient % 10n === 0n) {
    coefficient /= 10n;
    scale -= 1;
  }

  if (sign === '-' || coefficient <= 0n) {
    throw new BadRequestException(`${label} debe ser un número decimal positivo`);
  }
  const integerDigits = Math.max(0, digits.length - scale);
  if (scale > 2 || integerDigits > 8) {
    throw new BadRequestException(`${label} excede la precisión numeric(10,2) del modelo`);
  }

  return { coefficient, scale };
}

export function multiplyDecimals(left: Decimal, right: Decimal): string {
  const coefficient = left.coefficient * right.coefficient;
  const scale = left.scale + right.scale;
  const digits = coefficient.toString().padStart(scale + 1, '0');
  if (scale === 0) {
    return digits;
  }
  const integer = digits.slice(0, -scale);
  const fraction = digits.slice(-scale).replace(/0+$/, '');
  return fraction ? `${integer}.${fraction}` : integer;
}

export function multiplyAndDivideDecimals(left: Decimal, right: Decimal, divisor: Decimal): string {
  const numerator = left.coefficient * right.coefficient * 10n ** BigInt(divisor.scale + 10);
  const denominator = divisor.coefficient * 10n ** BigInt(left.scale + right.scale);
  const roundedCoefficient = (numerator + denominator / 2n) / denominator;
  const digits = roundedCoefficient.toString().padStart(11, '0');
  const integer = digits.slice(0, -10);
  const fraction = digits.slice(-10).replace(/0+$/, '');
  return fraction ? `${integer}.${fraction}` : integer;
}

function formatDecimal(coefficient: bigint, scale: number): string {
  const digits = coefficient.toString().padStart(scale + 1, '0');
  if (scale === 0) {
    return digits;
  }
  const integer = digits.slice(0, -scale);
  const fraction = digits.slice(-scale).replace(/0+$/, '');
  return fraction ? `${integer}.${fraction}` : integer;
}

function parseDecimalString(value: string): Decimal {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(value);
  if (!match) {
    throw new BadRequestException('El valor decimal no tiene un formato válido');
  }
  const [, integer, fraction = ''] = match;
  const digits = `${integer}${fraction}`.replace(/^0+/, '') || '0';
  let coefficient = BigInt(digits);
  let scale = fraction.length;
  while (scale > 0 && coefficient % 10n === 0n) {
    coefficient /= 10n;
    scale -= 1;
  }
  return { coefficient, scale };
}

export function addDecimalStrings(left: string, right: string): string {
  const leftDecimal = parseDecimalString(left);
  const rightDecimal = parseDecimalString(right);
  const scale = Math.max(leftDecimal.scale, rightDecimal.scale);
  const coefficient = leftDecimal.coefficient * 10n ** BigInt(scale - leftDecimal.scale) + rightDecimal.coefficient * 10n ** BigInt(scale - rightDecimal.scale);
  return formatDecimal(coefficient, scale);
}

export function roundDecimalToScale(value: string, scale: number): string {
  const decimal = parseDecimalString(value);
  if (!Number.isInteger(scale) || scale < 0) {
    throw new BadRequestException('La escala decimal debe ser un entero no negativo');
  }
  if (decimal.scale <= scale) {
    return formatDecimal(decimal.coefficient * 10n ** BigInt(scale - decimal.scale), scale);
  }
  const divisor = 10n ** BigInt(decimal.scale - scale);
  const rounded = (decimal.coefficient + divisor / 2n) / divisor;
  return formatDecimal(rounded, scale);
}

export function decimalToScaledInteger(decimal: Decimal, scale: number): bigint {
  if (decimal.scale > scale) {
    throw new BadRequestException('El valor excede la escala decimal permitida');
  }
  return decimal.coefficient * 10n ** BigInt(scale - decimal.scale);
}

export function scaledIntegerToDecimal(value: bigint, scale: number): string {
  if (value < 0n) {
    throw new BadRequestException('El saldo no puede ser negativo');
  }
  return formatDecimal(value, scale);
}
