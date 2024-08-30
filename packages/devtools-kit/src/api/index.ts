import type { MApp } from '@tmagic/schema';

import {
  type DevtoolsContext,
  DevToolsContextHookKeys,
  DevToolsPluginAPIHookKeys,
  type DevToolsPluginAPIHooks,
} from '../ctx';
import type { DevToolsPlugin } from '../types';

export class DevToolsPluginAPI {
  private plugin: DevToolsPlugin;
  private hooks: DevtoolsContext['hooks'];
  constructor({ plugin, ctx }: { plugin: DevToolsPlugin; ctx: DevtoolsContext }) {
    this.hooks = ctx.hooks;
    this.plugin = plugin;
  }

  public get on() {
    return {
      getInspectorTree: (handler: DevToolsPluginAPIHooks[DevToolsPluginAPIHookKeys.GET_INSPECTOR_TREE]) => {
        this.hooks.hook(DevToolsPluginAPIHookKeys.GET_INSPECTOR_TREE, handler);
      },
    };
  }

  sendInspectorTree({ config, inspectorId }: { config: MApp; inspectorId: string }) {
    this.hooks.callHook(DevToolsContextHookKeys.SEND_INSPECTOR_TREE, { config, inspectorId, plugin: this.plugin });
  }
}
