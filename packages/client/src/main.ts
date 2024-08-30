import type { App as VueApp } from 'vue';
import { createApp } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { isInSeparateWindow } from '@vue/devtools-shared';

import { functions, TMagicDevToolsVuePlugin } from '@tmagic/devtools-core';
import { createRpcClient } from '@tmagic/devtools-kit';

import App from './App.vue';

import '@unocss/reset/tailwind.css';
import 'uno.css';
import '@vue/devtools-ui/style.css';
import '~/assets/styles/main.css';

import WaitForConnection from '~/components/WaitForConnection.vue';
import Index from '~/pages/index.vue';
import Overview from '~/pages/overview.vue';
import Pages from '~/pages/pages.vue';

const routes = [
  { path: '/', component: Index },
  { path: '/overview', component: Overview },
  { path: '/pages', component: Pages },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.use(TMagicDevToolsVuePlugin());
app.mount('#app');

// heartbeat()

if (isInSeparateWindow) {
  createRpcClient(functions, {
    preset: 'broadcast',
  });
} else {
  createRpcClient(functions, {
    preset: 'iframe',
  });
}

let vueApp: VueApp = null!;
export function initDevTools() {
  const app = createApp(App);
  app.use(router);
  app.use(TMagicDevToolsVuePlugin());
  vueApp = app;
  app.mount('#app');
}

export function createConnectionApp(container = '#app', props?: Record<string, string>) {
  const app = createApp(WaitForConnection, {
    ...props,
  });
  app.mount(container);
  return app;
}

export function disconnectDevToolsClient() {
  vueApp?.config.globalProperties.$disconnectDevToolsClient();
}

export function reloadDevToolsClient() {
  vueApp?.config?.globalProperties?.$getDevToolsState();
}
