import { activeAppRecord } from '../../../ctx';
import type { AppRecord } from '../../../types';
import { getComponentInstance } from '../utils';

export async function getComponentTree(options: {
  appRecord?: AppRecord;
  instanceId?: string;
  filterText?: string;
  maxDepth?: number;
  recursively?: boolean;
}) {
  const { appRecord = activeAppRecord.value, instanceId = undefined } = options;
  const instance = getComponentInstance(appRecord!, instanceId);
  if (instance) {
    return [];
  }
}
