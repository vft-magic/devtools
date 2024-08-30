import { target as global } from '@vue/devtools-shared';
import { debounce } from 'perfect-debounce';

import type { AppRecord } from '../types';

import { DevToolsMessagingHookKeys } from './hook';
import { devtoolsContext } from '.';

export type DevToolsAppRecords = AppRecord;

export interface DevToolsState {
  connected: boolean;
  clientConnected: boolean;
  vitePluginDetected: boolean;
  appRecords: DevToolsAppRecords[];
  activeAppRecordId: string;
  tabs: [];
  highPerfModeEnabled: boolean;
}

global.__TMAGIC_DEVTOOLS_KIT_APP_RECORDS__ ??= [];
global.__TMAGIC_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ ??= {};
global.__TMAGIC_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ ??= '';
global.__TMAGIC_DEVTOOLS_KIT_CUSTOM_TABS__ ??= [];
global.__TMAGIC_DEVTOOLS_KIT_CUSTOM_COMMANDS__ ??= [];

const STATE_KEY = '__TMAGIC_DEVTOOLS_KIT_GLOBAL_STATE__';
function initStateFactory() {
  return {
    connected: false,
    clientConnected: false,
    vitePluginDetected: true,
    appRecords: [],
    activeAppRecordId: '',
    tabs: [],
    commands: [],
    highPerfModeEnabled: false,
  };
}
global[STATE_KEY] ??= initStateFactory();

export const callStateUpdatedHook = debounce((state: DevToolsState) => {
  devtoolsContext.hooks.callHook(DevToolsMessagingHookKeys.DEVTOOLS_STATE_UPDATED, { state });
});

export const callConnectedUpdatedHook = debounce((state: DevToolsState, oldState: DevToolsState) => {
  devtoolsContext.hooks.callHook(DevToolsMessagingHookKeys.DEVTOOLS_CONNECTED_UPDATED, { state, oldState });
});

export const devtoolsAppRecords = new Proxy<DevToolsAppRecords[] & { value: DevToolsAppRecords[] }>(
  global.__TMAGIC_DEVTOOLS_KIT_APP_RECORDS__,
  {
    get(_target, prop) {
      if (prop === 'value') return global.__TMAGIC_DEVTOOLS_KIT_APP_RECORDS__;

      return global.__TMAGIC_DEVTOOLS_KIT_APP_RECORDS__[prop];
    },
  },
);

export const addDevToolsAppRecord = (app: AppRecord) => {
  global.__TMAGIC_DEVTOOLS_KIT_APP_RECORDS__ = [...global.__TMAGIC_DEVTOOLS_KIT_APP_RECORDS__, app];
};

export const removeDevToolsAppRecord = (app: AppRecord['app']) => {
  global.__TMAGIC_DEVTOOLS_KIT_APP_RECORDS__ = devtoolsAppRecords.value.filter((record) => record.app !== app);
};

export const activeAppRecord = new Proxy<AppRecord & { value: AppRecord; id: string }>(
  global.__TMAGIC_DEVTOOLS_KIT_ACTIVE_APP_RECORD__,
  {
    get(_target, prop) {
      if (prop === 'value') return global.__TMAGIC_DEVTOOLS_KIT_ACTIVE_APP_RECORD__;

      if (prop === 'id') return global.__TMAGIC_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__;

      return global.__TMAGIC_DEVTOOLS_KIT_ACTIVE_APP_RECORD__[prop];
    },
  },
);

// @TODO: refactor
function updateAllStates() {
  callStateUpdatedHook({
    ...global[STATE_KEY],
    appRecords: devtoolsAppRecords.value,
    activeAppRecordId: activeAppRecord.id,
    tabs: global.__TMAGIC_DEVTOOLS_KIT_CUSTOM_TABS__,
    commands: global.__TMAGIC_DEVTOOLS_KIT_CUSTOM_COMMANDS__,
  });
}

export function setActiveAppRecord(app: AppRecord) {
  global.__TMAGIC_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ = app;
  updateAllStates();
}

export function setActiveAppRecordId(id: string) {
  global.__TMAGIC_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ = id;
  updateAllStates();
}

export const devtoolsState: DevToolsState = new Proxy(global[STATE_KEY], {
  get(target, property) {
    if (property === 'appRecords') {
      return devtoolsAppRecords;
    }
    if (property === 'activeAppRecordId') {
      return activeAppRecord.id;
    }
    if (property === 'tabs') {
      return global.__TMAGIC_DEVTOOLS_KIT_CUSTOM_TABS__;
    }
    if (property === 'commands') {
      return global.__TMAGIC_DEVTOOLS_KIT_CUSTOM_COMMANDS__;
    }
    return global[STATE_KEY][property];
  },
  deleteProperty(target, property) {
    delete target[property];
    return true;
  },
  set(target, property, value) {
    target[property] = value;
    global[STATE_KEY][property] = value;

    return true;
  },
});

export function resetDevToolsState() {
  Object.assign(global[STATE_KEY], initStateFactory());
}

export function updateDevToolsState(state: Partial<DevToolsState>) {
  const oldState = {
    ...global[STATE_KEY],
    appRecords: devtoolsAppRecords.value,
    activeAppRecordId: activeAppRecord.id,
  };
  if (
    (oldState.connected !== state.connected && state.connected) ||
    (oldState.clientConnected !== state.clientConnected && state.clientConnected)
  ) {
    callConnectedUpdatedHook(global[STATE_KEY], oldState);
  }
  Object.assign(global[STATE_KEY], state);
  updateAllStates();
}

export function onDevToolsConnected(fn: () => void) {
  return new Promise<void>((resolve) => {
    if (devtoolsState.connected) {
      fn();
      resolve();
    }

    devtoolsContext.hooks.hook(DevToolsMessagingHookKeys.DEVTOOLS_CONNECTED_UPDATED, ({ state }) => {
      if (state.connected) {
        fn();
        resolve();
      }
    });
  });
}

export function toggleClientConnected(state: boolean) {
  updateDevToolsState({ clientConnected: state });
}
