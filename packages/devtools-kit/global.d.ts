import type { DevToolsHook } from './src/types';

/* eslint-disable vars-on-top, no-var */
declare global {
  var __TMAGIC_DEVTOOLS_GLOBAL_HOOK__: DevToolsHook;
  var __TMAGIC_DEVTOOLS_NEXT_APP_RECORD_INFO__: {
    id: number;
    appIds: Set<string>;
  };
  var __TMAGIC_DEVTOOLS_ENV__: {
    vitePluginDetected: boolean;
  };
  var __TMAGIC_DEVTOOLS_COMPONENT_INSPECTOR_ENABLED__: boolean;
  var __TMAGIC_DEVTOOLS_VITE_PLUGIN_DETECTED__: boolean;
  var __TMAGIC_DEVTOOLS_VITE_PLUGIN_CLIENT_URL__: string;
  var __TMAGIC_DEVTOOLS_BROWSER_EXTENSION_DETECTED__: boolean;
}

export {};
