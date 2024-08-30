import { type App, computed, inject, type InjectionKey, onUnmounted, type Ref, ref, watch } from 'vue';

import type { AppRecord, CustomTab } from '@tmagic/devtools-kit';

import { DevToolsMessagingEvents, onRpcConnected, rpc } from '../rpc';

interface DevToolsState {
  connected: boolean;
  clientConnected: boolean;
  tmagicVersion: string;
  tabs: CustomTab[];
  vitePluginDetected: boolean;
  appRecords: AppRecord[];
  activeAppRecordId: string;
}

type DevToolsRefState = {
  [P in keyof DevToolsState]: Ref<DevToolsState[P]>;
};

const TMagicDevToolsStateSymbol: InjectionKey<DevToolsRefState> = Symbol.for('__TMagicDevToolsStateSymbol__');

export function TMagicDevToolsVuePlugin() {
  return {
    install(app: App) {
      const state = createDevToolsStateContext();
      state.getDevToolsState();
      app.provide(TMagicDevToolsStateSymbol, state);
      app.config.globalProperties.$getDevToolsState = state.getDevToolsState;
      app.config.globalProperties.$disconnectDevToolsClient = () => {
        state.clientConnected.value = false;
        state.connected.value = false;
      };
    },
  };
}

export function createDevToolsStateContext() {
  const connected = ref(false);
  const clientConnected = ref(false);
  const tmagicVersion = ref('');
  const tabs = ref<CustomTab[]>([]);
  const vitePluginDetected = ref(false);
  const appRecords = ref<Array<AppRecord>>([]);
  const activeAppRecordId = ref('');

  function updateState(data: DevToolsState) {
    connected.value = data.connected;
    clientConnected.value = data.clientConnected;
    tmagicVersion.value = data.tmagicVersion || '';
    tabs.value = data.tabs || [];
    vitePluginDetected.value = data.vitePluginDetected;
    appRecords.value = data.appRecords;
    activeAppRecordId.value = data.activeAppRecordId!;
  }

  function getDevToolsState() {
    onRpcConnected(() => {
      rpc.value.devtoolsState().then((data) => {
        updateState(data as DevToolsState);
      });
      rpc.functions.off(DevToolsMessagingEvents.DEVTOOLS_STATE_UPDATED, updateState);
      rpc.functions.on(DevToolsMessagingEvents.DEVTOOLS_STATE_UPDATED, updateState);
    });
  }
  return {
    getDevToolsState,
    connected,
    clientConnected,
    tmagicVersion,
    tabs,
    vitePluginDetected,
    appRecords,
    activeAppRecordId,
  };
}

export function useDevToolsState() {
  return inject(TMagicDevToolsStateSymbol)!;
}

const fns: (() => void)[] = [];

export function onDevToolsConnected(fn: () => void) {
  const { connected, clientConnected } = useDevToolsState();

  fns.push(fn);

  onUnmounted(() => {
    fns.splice(fns.indexOf(fn), 1);
  });

  const devtoolsReady = computed(() => clientConnected.value && connected.value);

  if (devtoolsReady.value) {
    fn();
  } else {
    const stop = watch(devtoolsReady, (v) => {
      if (v) {
        fn();
        stop();
      }
    });
  }

  return () => {
    fns.splice(fns.indexOf(fn), 1);
  };
}

export function refreshCurrentPageData() {
  fns.forEach((fn) => fn());
}
