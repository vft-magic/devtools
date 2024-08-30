import { target } from '@vue/devtools-shared';

target.__TMAGIC_DEVTOOLS_ENV__ ??= {
  vitePluginDetected: false,
};

export function getDevToolsEnv() {
  return target.__TMAGIC_DEVTOOLS_ENV__;
}

export function setDevToolsEnv(env: Partial<any>) {
  target.__TMAGIC_DEVTOOLS_ENV__ = {
    ...target.__TMAGIC_DEVTOOLS_ENV__,
    ...env,
  };
}
