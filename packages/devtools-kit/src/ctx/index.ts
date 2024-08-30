import { target } from '@vue/devtools-shared';
import { Hookable } from 'hookable';

import type { DevToolsApiType } from './api';
import { createDevToolsApi } from './api';
import { createDevToolsCtxHooks } from './hook';
import type { DevToolsAppRecords, DevToolsState } from './state';
import { activeAppRecord, devtoolsAppRecords, devtoolsState } from './state';

export * from './api';
export * from './hook';
export * from './env';
export * from './state';
export * from './plugin';

export interface DevtoolsContext {
  hooks: Hookable;
  state: DevToolsState & {
    activeAppRecordId: string;
    activeAppRecord: DevToolsAppRecords;
    appRecords: DevToolsAppRecords[];
  };
  api: DevToolsApiType;
}

const hooks = createDevToolsCtxHooks();

target.__TMAGIC_DEVTOOLS_KIT_CONTEXT__ ??= {
  hooks,
  get state() {
    return {
      ...devtoolsState,
      activeAppRecordId: activeAppRecord.id,
      activeAppRecord: activeAppRecord.value,
      appRecords: devtoolsAppRecords.value,
    };
  },
  api: createDevToolsApi(hooks),
};

export const devtoolsContext = target.__TMAGIC_DEVTOOLS_KIT_CONTEXT__ as DevtoolsContext;
