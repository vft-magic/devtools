<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDevToolsColorMode } from '@vue/devtools-ui';
import { useEventListener } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';

import {
  DevToolsMessagingEvents,
  onDevToolsConnected,
  onRpcConnected,
  refreshCurrentPageData,
  rpc,
  useDevToolsState,
} from '@tmagic/devtools-core';

import AppConnecting from './components/AppConnecting.vue';
import SideNav from './components/common/SideNav.vue';
import SplitScreen from './components/common/SplitScreen.vue';
import { activeAppRecordId, activeAppRecords } from './composables/app';
import { devtoolsClientState } from './composables/state';

useDevToolsColorMode();
const router = useRouter();
const route = useRoute();
const {
  connected,
  clientConnected,
  activeAppRecordId: _activeAppRecordId,
  appRecords: _appRecords,
} = useDevToolsState();
const clientState = devtoolsClientState;

const devtoolsReady = computed(() => connected.value && clientConnected.value);
const isUtilityView = computed(() => route.path.startsWith('/__') || route.path === '/');
const sidebarExpanded = computed(() => clientState.value.expandSidebar);
const splitScreenEnabled = computed(() => clientState.value.splitScreen.enabled);
const splitScreenSize = computed({
  get: () => clientState.value.splitScreen.size,
  set: (v) => (clientState.value.splitScreen.size = v),
});

watchEffect(() => {
  const { scale } = devtoolsClientState.value;
  document.documentElement.style.fontSize = `${scale * 15}px`;
});

onRpcConnected(() => {
  watchEffect(() => {
    rpc.value.emit('update-client-state', {
      minimizePanelInteractive: devtoolsClientState.value.minimizePanelInteractive,
      closeOnOutsideClick: devtoolsClientState.value.interactionCloseOnOutsideClick,
      showFloatingPanel: devtoolsClientState.value.showPanel,
    });
  });
});

watch(
  devtoolsReady,
  (v) => {
    if (v) {
      router.replace(clientState.value.isFirstVisit ? '/' : clientState.value.route);
      router.afterEach(() => {
        const { path } = route;
        if (path.includes('__')) return;
        clientState.value.route = path;
      });
    }
  },
  {
    immediate: true,
  },
);

useEventListener('keydown', (e) => {
  if (e.code === 'KeyD' && e.altKey && e.shiftKey) rpc.value.emit('toggle-panel');
});

watchEffect(() => {
  activeAppRecords.value = _appRecords.value;
  activeAppRecordId.value = _activeAppRecordId.value;
});

onRpcConnected(() => {
  rpc.value.initDevToolsServerListener();
});

function onActiveAppUnmounted() {
  router.push('/overview').then(() => {
    refreshCurrentPageData();
  });
}

onDevToolsConnected(() => {
  rpc.functions.on(DevToolsMessagingEvents.ACTIVE_APP_UNMOUNTED, onActiveAppUnmounted);
});

onMounted(() => {
  onRpcConnected(() => {
    rpc.value.toggleClientConnected(true);
  });
});

onUnmounted(() => {
  rpc.value.toggleClientConnected(false);
  rpc.functions.off(DevToolsMessagingEvents.ACTIVE_APP_UNMOUNTED, onActiveAppUnmounted);
});
</script>

<template>
  <main class="fixed inset-0 h-screen w-screen $ui-bg-base">
    <AppConnecting v-if="!devtoolsReady" />
    <div
      v-else
      class="h-full of-auto transition-base"
      :class="isUtilityView ? 'flex' : sidebarExpanded ? 'grid grid-cols-[250px_1fr]' : 'grid grid-cols-[50px_1fr]'"
      h-full
      h-screen
      of-hidden
      font-sans
      bg-base
    >
      <SideNav v-if="!isUtilityView" of-x-hidden of-y-auto />
      <Splitpanes h-full of-hidden @resize="splitScreenSize = $event.map((v) => v.size)">
        <Pane h-full class="of-auto!" min-size="10" :size="splitScreenSize[0]">
          <RouterView />
        </Pane>
        <Pane v-if="!isUtilityView && splitScreenEnabled" relative h-full class="of-auto!" :size="splitScreenSize[1]">
          <SplitScreen />
        </Pane>
      </Splitpanes>
    </div>
    <CommandPalette />
  </main>
</template>
