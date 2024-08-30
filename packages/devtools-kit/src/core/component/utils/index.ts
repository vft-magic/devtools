import type { Node as TMagicNode } from '@tmagic/core';
import type { Id } from '@tmagic/schema';

import type { AppRecord } from '../../../types';

export function getComponentName(options: TMagicNode['data']) {
  const name = options.name || options.id;
  if (name) return `${name}`;

  return 'Anonymous Node';
}

/**
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {string}
 */
export function getInstanceName(instance: TMagicNode) {
  return getComponentName(instance.data);
}

export function returnError(cb: () => unknown): number | string {
  try {
    return cb() as number | string;
  } catch (e) {
    return e as string;
  }
}

export function getComponentInstance(appRecord: AppRecord, instanceId?: Id) {
  if (instanceId) return appRecord.app?.getNode(instanceId);
}

export function ensurePropertyExists<R = Record<string, unknown>>(
  obj: unknown,
  key: string,
  skipObjCheck = false,
): obj is R {
  // eslint-disable-next-line no-nested-ternary
  return skipObjCheck ? key in (obj as object) : typeof obj === 'object' && obj !== null ? key in obj : false;
}
