import { createHooks } from 'hookable';

export interface DevToolsPluginAPIHookPayloads {
  [DevToolsPluginAPIHookKeys.GET_INSPECTOR_TREE]: {
    inspectorId: string;
  };
}

export interface DevToolsPluginAPIHooks {
  [DevToolsPluginAPIHookKeys.GET_INSPECTOR_TREE]: (
    payload: DevToolsPluginAPIHookPayloads[DevToolsPluginAPIHookKeys.GET_INSPECTOR_TREE],
  ) => void;
}

export enum DevToolsPluginAPIHookKeys {
  GET_INSPECTOR_TREE = 'getInspectorTree',
  GET_INSPECTOR_STATE = 'getInspectorState',
}

export enum DevToolsContextHookKeys {
  SEND_INSPECTOR_TREE = 'sendInspectorTree',
  SEND_INSPECTOR_STATE = 'sendInspectorState',
}

// devtools client hooks
export enum DevToolsMessagingHookKeys {
  SEND_INSPECTOR_TREE_TO_CLIENT = 'sendInspectorTreeToClient',
  SEND_INSPECTOR_STATE_TO_CLIENT = 'sendInspectorStateToClient',
  DEVTOOLS_STATE_UPDATED = 'devtoolsStateUpdated',
  DEVTOOLS_CONNECTED_UPDATED = 'devtoolsConnectedUpdated',
  SEND_ACTIVE_APP_UNMOUNTED_TO_CLIENT = 'sendActiveAppUpdatedToClient',
}

export function createDevToolsCtxHooks() {
  const hooks = createHooks();

  // send inspector tree
  hooks.hook(DevToolsContextHookKeys.SEND_INSPECTOR_TREE, async ({ config, inspectorId, plugin }) => {
    if (!config || !plugin?.descriptor?.app) return;

    const _payload = {
      config,
      inspectorId,
    };

    hooks.callHookWith(async (callbacks) => {
      await Promise.all(callbacks.map((cb) => cb(_payload)));
    }, DevToolsMessagingHookKeys.SEND_INSPECTOR_TREE_TO_CLIENT);
  });

  return hooks;
}
