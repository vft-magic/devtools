import { createHooks } from 'hookable';

import {
  devtools,
  DevToolsMessagingHookKeys,
  DevToolsPluginAPIHookKeys,
  DevToolsPluginAPIHookPayloads,
  getRpcClient,
  getRpcServer,
  stringify,
  toggleClientConnected,
} from '@tmagic/devtools-kit';

const hooks = createHooks();

export enum DevToolsMessagingEvents {
  INSPECTOR_TREE_UPDATED = 'inspector-tree-updated',
  INSPECTOR_STATE_UPDATED = 'inspector-state-updated',
  DEVTOOLS_STATE_UPDATED = 'devtools-state-updated',
  ROUTER_INFO_UPDATED = 'router-info-updated',
  TIMELINE_EVENT_UPDATED = 'timeline-event-updated',
  INSPECTOR_UPDATED = 'inspector-updated',
  ACTIVE_APP_UNMOUNTED = 'active-app-updated',
  DESTROY_DEVTOOLS_CLIENT = 'destroy-devtools-client',
  RELOAD_DEVTOOLS_CLIENT = 'reload-devtools-client',
}

function getDevToolsState() {
  const { state } = devtools.ctx;
  return {
    connected: state.connected,
    clientConnected: true,
    tmagicVersion: state?.activeAppRecord?.version || '',
    tabs: state.tabs,
    vitePluginDetected: state.vitePluginDetected,
    appRecords: state.appRecords.map((item) => ({
      id: item.id,
      name: item.name,
      version: item.version,
    })),
    activeAppRecordId: state.activeAppRecordId,
  };
}

export const functions = {
  on: (event: string, handler: Function) => {
    hooks.hook(event, handler);
  },
  off: (event: string, handler: Function) => {
    hooks.removeHook(event, handler);
  },
  once: (event: string, handler: Function) => {
    hooks.hookOnce(event, handler);
  },
  emit: (event: string, ...args: any[]) => {
    hooks.callHook(event, ...args);
  },
  heartbeat: () => true,
  devtoolsState: () => getDevToolsState(),
  async getInspectorTree(
    payload: Pick<DevToolsPluginAPIHookPayloads[DevToolsPluginAPIHookKeys.GET_INSPECTOR_TREE], 'inspectorId'>,
  ) {
    const res = await devtools.ctx.api.getInspectorTree(payload);
    return stringify(res) as string;
  },
  toggleClientConnected(state: boolean) {
    toggleClientConnected(state);
  },
  initDevToolsServerListener() {
    const rpcServer = getRpcServer<RPCFunctions>();
    const { broadcast } = rpcServer;

    devtools.ctx.hooks.hook(DevToolsMessagingHookKeys.SEND_INSPECTOR_TREE_TO_CLIENT, (payload) => {
      broadcast.emit(DevToolsMessagingEvents.INSPECTOR_TREE_UPDATED, stringify(payload));
    });

    devtools.ctx.hooks.hook(DevToolsMessagingHookKeys.DEVTOOLS_STATE_UPDATED, () => {
      broadcast.emit(DevToolsMessagingEvents.DEVTOOLS_STATE_UPDATED, getDevToolsState());
    });

    devtools.ctx.hooks.hook(DevToolsMessagingHookKeys.SEND_ACTIVE_APP_UNMOUNTED_TO_CLIENT, () => {
      broadcast.emit(DevToolsMessagingEvents.ACTIVE_APP_UNMOUNTED);
    });
  },
};

export type RPCFunctions = typeof functions;

export const rpc = new Proxy<{
  value: ReturnType<typeof getRpcClient<RPCFunctions>>;
  functions: ReturnType<typeof getRpcClient<RPCFunctions>>;
}>(
  {
    value: {} as ReturnType<typeof getRpcClient<typeof functions>>,
    functions: {} as ReturnType<typeof getRpcClient<RPCFunctions>>,
  },
  {
    get(target, property) {
      const _rpc = getRpcClient<RPCFunctions>();
      if (property === 'value') {
        return _rpc;
      }
      if (property === 'functions') {
        return _rpc.$functions;
      }
    },
  },
);

export const rpcServer = new Proxy<{
  value: ReturnType<typeof getRpcServer<RPCFunctions>>;
  functions: ReturnType<typeof getRpcServer<RPCFunctions>>;
}>(
  {
    value: {} as ReturnType<typeof getRpcServer<typeof functions>>,
    functions: {} as ReturnType<typeof getRpcServer<RPCFunctions>>,
  },
  {
    get(target, property) {
      const _rpc = getRpcServer<RPCFunctions>();
      if (property === 'value') {
        return _rpc;
      }
      if (property === 'functions') {
        return _rpc.functions;
      }
    },
  },
);

export function onRpcConnected(callback: () => void) {
  let timer: number = null!;
  let retryCount = 0;

  function heartbeat() {
    rpc.value
      ?.heartbeat?.()
      .then(() => {
        callback();
        clearTimeout(timer);
      })
      .catch(() => {});
  }

  timer = setInterval(() => {
    if (retryCount >= 30) {
      clearTimeout(timer);
    }
    retryCount += 1;
    heartbeat();
  }, retryCount * 200 + 200) as unknown as number;
  heartbeat();
}

export function onRpcSeverReady(callback: () => void) {
  let timer: number = null!;
  const timeout = 120;

  function heartbeat() {
    if (rpcServer.value.clients.length > 0) {
      callback();
      clearTimeout(timer);
    }
  }

  timer = setInterval(() => {
    heartbeat();
  }, timeout) as unknown as number;
}
