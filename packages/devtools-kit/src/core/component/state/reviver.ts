import { target } from '@vue/devtools-shared';

import { activeAppRecord } from '../../../ctx';

import { INFINITY, NAN, NEGATIVE_INFINITY, specialTypeRE, symbolRE, UNDEFINED } from './constants';

export function reviveSet(val) {
  const result = new Set();
  const list = val._custom.value;

  for (const value of list) {
    result.add(revive(value));
  }

  return result;
}

export function reviveMap(val) {
  const result = new Map();
  const list = val._custom.value;

  for (const { key, value } of list) {
    result.set(key, revive(value));
  }

  return result;
}

export function revive(val) {
  if (val === UNDEFINED) {
    return undefined;
  }
  if (val === INFINITY) {
    return Number.POSITIVE_INFINITY;
  }
  if (val === NEGATIVE_INFINITY) {
    return Number.NEGATIVE_INFINITY;
  }
  if (val === NAN) {
    return Number.NaN;
  }
  if (val?._custom) {
    const { _custom: custom } = val;
    if (custom.type === 'component') return activeAppRecord.value.app.getNode(custom.id);
    if (custom.type === 'map') return reviveMap(val);
    if (custom.type === 'set') return reviveSet(val);
    if (custom.type === 'bigint') return BigInt(custom.value);
    return revive(custom.value);
  }
  if (symbolRE.test(val)) {
    // @ts-expect-error skip type check
    const [, string] = symbolRE.exec(val);
    return Symbol.for(string);
  }
  if (specialTypeRE.test(val)) {
    const [, type, string, , details] = specialTypeRE.exec(val);
    const result = new target[type](string);
    if (type === 'Error' && details) result.stack = details;

    return result;
  }

  return val;
}

export function reviver(key: string, value: unknown) {
  return revive(value);
}
