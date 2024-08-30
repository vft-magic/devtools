import { target } from '@vue/devtools-shared';
import type { Hookable, HookKeys } from 'hookable';
import { createHooks } from 'hookable';

import { DevToolsEvent, DevToolsHook, DevToolsHooks, TMagicHooks } from '../types';

export { TMagicHooks } from '../types';

// eslint-disable-next-line no-multi-assign
export const devtoolsHooks: Hookable<DevToolsEvent, HookKeys<DevToolsEvent>> = (target.__TMAGIC_DEVTOOLS_HOOK ??=
  createHooks<DevToolsEvent>());

const on: TMagicHooks['on'] = {
  tmagicAppInit(fn) {
    devtoolsHooks.hook(DevToolsHooks.APP_INIT, fn);
  },
  tmagicAppDestroy(fn) {
    devtoolsHooks.hook(DevToolsHooks.APP_DESTROY, fn);
  },
  tmagicConfigChange(fn) {
    devtoolsHooks.hook(DevToolsHooks.CONFIG_CHANGE, fn);
  },
  setupDevtoolsPlugin(fn) {
    devtoolsHooks.hook(DevToolsHooks.SETUP_DEVTOOLS_PLUGIN, fn);
  },
};

export function createDevToolsHook(): DevToolsHook {
  return {
    id: 'tmagic-devtools-next',
    devtoolsVersion: '0.0.1',
    enabled: false,
    appRecords: [],
    apps: [],
    events: new Map(),
    on(event, fn) {
      if (!this.events.has(event)) this.events.set(event, []);

      this.events.get(event)?.push(fn);
      // cleanup function
      return () => this.off(event, fn);
    },
    once(event, fn) {
      const onceFn = (...args) => {
        this.off(event, onceFn);
        fn(...args);
      };

      this.on(event, onceFn);
      return [event, onceFn] as const;
    },
    off(event, fn) {
      if (this.events.has(event)) {
        const eventCallbacks = this.events.get(event)!;
        const index = eventCallbacks.indexOf(fn);
        if (index !== -1) eventCallbacks.splice(index, 1);
      }
    },
    emit(event, ...payload) {
      if (this.events.has(event)) this.events.get(event)!.forEach((fn) => fn(...payload));
    },
  };
}

export function subscribeDevToolsHook() {
  const hook = target.__TMAGIC_DEVTOOLS_GLOBAL_HOOK__ as DevToolsHook;
  // app init hook
  hook.on<DevToolsEvent[DevToolsHooks.APP_INIT]>(DevToolsHooks.APP_INIT, (app, version) => {
    devtoolsHooks.callHook(DevToolsHooks.APP_INIT, app, version);
  });

  hook.on<DevToolsEvent[DevToolsHooks.APP_DESTROY]>(DevToolsHooks.APP_DESTROY, (app) => {
    devtoolsHooks.callHook(DevToolsHooks.APP_DESTROY, app);
  });

  hook.on<DevToolsEvent[DevToolsHooks.CONFIG_CHANGE]>(DevToolsHooks.CONFIG_CHANGE, (config) => {
    devtoolsHooks.callHook(DevToolsHooks.CONFIG_CHANGE, config);
  });
}

export const hook: TMagicHooks = {
  on,
  setupDevToolsPlugin(pluginDescriptor, setupFn) {
    return devtoolsHooks.callHook(DevToolsHooks.SETUP_DEVTOOLS_PLUGIN, pluginDescriptor, setupFn);
  },
};
