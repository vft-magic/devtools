import { target } from '@vue/devtools-shared';

import { DevToolsPluginAPI } from '../../api';
import { devtoolsContext, devtoolsPluginBuffer } from '../../ctx';
import { hook } from '../../hook';
import type { PluginDescriptor, PluginSetupFunction, TMagicApp } from '../../types';

export * from './components';

target.__TMAGIC_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__ ??= new Set<TMagicApp>();

export function setupDevToolsPlugin(pluginDescriptor: PluginDescriptor, setupFn: PluginSetupFunction) {
  return hook.setupDevToolsPlugin(pluginDescriptor, setupFn);
}

export function callDevToolsPluginSetupFn(plugin: [PluginDescriptor, PluginSetupFunction], app: TMagicApp) {
  const [pluginDescriptor, setupFn] = plugin;
  if (pluginDescriptor.app !== app) return;

  const api = new DevToolsPluginAPI({
    plugin: {
      setupFn,
      descriptor: pluginDescriptor,
    },
    ctx: devtoolsContext,
  });

  setupFn(api);
}

export function removeRegisteredPluginApp(app: TMagicApp) {
  target.__TMAGIC_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.delete(app);
}

export function registerDevToolsPlugin(app: TMagicApp) {
  if (target.__TMAGIC_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.has(app)) return;

  target.__TMAGIC_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.add(app);

  devtoolsPluginBuffer.forEach((plugin) => {
    callDevToolsPluginSetupFn(plugin, app);
  });
}
