import { target } from '@vue/devtools-shared';

import {
  activeAppRecord,
  addDevToolsAppRecord,
  addDevToolsPluginToBuffer,
  devtoolsAppRecords,
  devtoolsContext,
  DevToolsMessagingHookKeys,
  devtoolsState,
  getDevToolsEnv,
  removeDevToolsAppRecord,
  setActiveAppRecord,
  setActiveAppRecordId,
  updateDevToolsState,
} from '../ctx';
import { createDevToolsHook, hook, subscribeDevToolsHook } from '../hook';

import { createAppRecord, removeAppRecordId } from './app';
import { callDevToolsPluginSetupFn, createComponentsDevToolsPlugin, setupDevToolsPlugin } from './plugin';

export function initDevTools() {
  updateDevToolsState({
    vitePluginDetected: getDevToolsEnv().vitePluginDetected,
  });

  const isDevToolsNext = target.__TMAGIC_DEVTOOLS_GLOBAL_HOOK__?.id === 'tmagic-devtools-next';

  // de-duplicate
  if (target.__TMAGIC_DEVTOOLS_GLOBAL_HOOK__ && isDevToolsNext) return;

  if (!target.__TMAGIC_DEVTOOLS_GLOBAL_HOOK__) {
    target.__TMAGIC_DEVTOOLS_GLOBAL_HOOK__ = createDevToolsHook();
  }

  hook.on.setupDevtoolsPlugin((pluginDescriptor, setupFn) => {
    addDevToolsPluginToBuffer(pluginDescriptor, setupFn);
    const { app } = activeAppRecord ?? {};

    if (!app) return;

    callDevToolsPluginSetupFn([pluginDescriptor, setupFn], app);
  });

  // create app record
  hook.on.tmagicAppInit(async (app, version) => {
    const appRecord = createAppRecord(app);
    const normalizedAppRecord = {
      ...appRecord,
      app,
      version,
    };
    addDevToolsAppRecord(normalizedAppRecord);

    if (devtoolsAppRecords.value.length === 1) {
      setActiveAppRecord(normalizedAppRecord);
      setActiveAppRecordId(normalizedAppRecord.id);
    }

    setupDevToolsPlugin(...createComponentsDevToolsPlugin(normalizedAppRecord.app));

    updateDevToolsState({
      connected: true,
    });

    target.__TMAGIC_DEVTOOLS_GLOBAL_HOOK__.apps.push(app);
  });

  hook.on.tmagicAppDestroy(async (app) => {
    const activeRecords = devtoolsAppRecords.value.filter((appRecord) => appRecord.app !== app);

    if (activeRecords.length === 0) {
      updateDevToolsState({
        connected: false,
      });
    }

    removeDevToolsAppRecord(app);

    removeAppRecordId(app);

    if (activeAppRecord.value.app === app) {
      setActiveAppRecord(activeRecords[0]);
      devtoolsContext.hooks.callHook(DevToolsMessagingHookKeys.SEND_ACTIVE_APP_UNMOUNTED_TO_CLIENT);
    }
    target.__TMAGIC_DEVTOOLS_GLOBAL_HOOK__.apps.splice(target.__TMAGIC_DEVTOOLS_GLOBAL_HOOK__.apps.indexOf(app), 1);
  });

  subscribeDevToolsHook();
}

export function onDevToolsClientConnected(fn: () => void) {
  return new Promise<void>((resolve) => {
    if (devtoolsState.connected && devtoolsState.clientConnected) {
      fn();
      resolve();
      return;
    }

    devtoolsContext.hooks.hook(DevToolsMessagingHookKeys.DEVTOOLS_CONNECTED_UPDATED, ({ state }) => {
      if (state.connected && state.clientConnected) {
        fn();
        resolve();
      }
    });
  });
}
