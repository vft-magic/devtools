<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { isInChromePanel, isInElectron, isMacOS } from '@vue/devtools-shared';
import { VueButton } from '@vue/devtools-ui';

import { DevToolsMessagingEvents, onDevToolsConnected, rpc, useDevToolsState } from '@tmagic/devtools-core';
import { parse } from '@tmagic/devtools-kit';

import { version } from '../../../core/package.json';

import DevToolsLogo from '~/components/common/DevToolsLogo.vue';

const { tmagicVersion } = useDevToolsState();
const pageCount = ref(0);
const nodeCount = ref(0);

function normalizeComponentCount(data: any[]) {
  let count = 0;
  for (const node of data) {
    count += 1;
    if (node.items?.length) count += normalizeComponentCount(node.items);
  }
  return count;
}

function onInspectorTreeUpdated(_data: string) {
  const data = parse(_data) as {
    inspectorId: string;
    config: any;
  };

  if (data.inspectorId !== 'root') return;

  pageCount.value = data.config.items?.length;
  nodeCount.value = normalizeComponentCount(data.config.items || []);
}

onDevToolsConnected(() => {
  rpc.value.getInspectorTree({ inspectorId: 'root' }).then((_data) => {
    onInspectorTreeUpdated(_data);
  });
});

rpc.functions.on(DevToolsMessagingEvents.INSPECTOR_TREE_UPDATED, onInspectorTreeUpdated);

onUnmounted(() => {
  rpc.functions.off(DevToolsMessagingEvents.INSPECTOR_TREE_UPDATED, onInspectorTreeUpdated);
});
</script>

<template>
  <div h-full w-full flex of-auto>
    <div flex="~ col gap2" ma h-full max-w-300 w-full px20>
      <div flex-auto />

      <!-- Banner -->
      <div flex="~ col" mt-20 items-center>
        <div flex="~" mt--10 items-center justify-center>
          <DevToolsLogo h-18 />
        </div>
        <div v-if="!isInChromePanel" mb6 mt--1 text-center text-sm flex="~ gap-1">
          <span op40> TMagic DevTools </span>
          <code op40>v{{ version }}</code>
        </div>
      </div>

      <!-- Main Grid -->
      <div flex="~ gap2 wrap">
        <div p4 theme-card-green flex="~ col auto">
          <div text-3xl>
            <img
              src="https://vip.image.video.qpic.cn/vupload/20240823/a5a9ab1724395652351.png"
              alt="TMagic logo"
              class="h-18"
            />
          </div>
          <code>v{{ tmagicVersion }}</code>
        </div>
        <RouterLink flex="~ col auto" to="/pages" replace min-w-40 p4 theme-card-lime>
          <div i-carbon-tree-view-alt text-3xl />
          <div>{{ pageCount }} pages</div>
        </RouterLink>
        <RouterLink v-if="nodeCount" flex="~ col auto" to="/nodes" replace min-w-40 p4 theme-card-lime>
          <div i-carbon-assembly-cluster text-3xl />
          <div>{{ nodeCount }} nodes</div>
        </RouterLink>
      </div>
      <div flex="~ gap-6 wrap" mt-5 items-center justify-center>
        <a
          href="https://github.com/vft-magic/devtools"
          target="_blank"
          flex="~ gap1"
          items-center
          op50
          hover="op100 text-blue"
          transition
        >
          <div i-carbon-star />
          Star on GitHub
        </a>
        <a
          href="https://github.com/vft-magic/devtools/issues"
          target="_blank"
          flex="~ gap1"
          items-center
          op50
          hover="op100 text-rose"
          transition
        >
          <div i-carbon-debug />
          Bug Reports
        </a>
        <RouterLink to="/settings" flex="~ gap1" replace inline-block items-center op50 hover:op80>
          <div i-carbon-settings />
          Settings
        </RouterLink>
      </div>
      <div flex-auto />
      <div flex="~ gap-1" cursor-default items-center justify-center pb-2 text-sm op40>
        Press
        <template v-if="isMacOS()">
          <VueButton> ⌘ Command </VueButton>
          <span>+</span>
          <VueButton> K </VueButton>
        </template>
        <template v-else>
          <VueButton> Alt </VueButton>
          <span>+</span>
          <VueButton> K </VueButton>
        </template>
        to toggle Command Palette
      </div>
      <template v-if="!isInElectron && !isInChromePanel">
        <div flex="~ gap-1" cursor-default items-center justify-center pb-8 text-sm op40>
          Press
          <template v-if="isMacOS()">
            <VueButton> ⇧ Shift </VueButton>
            <span>+</span>
            <VueButton> ⌥ Option </VueButton>
            <span>+</span>
            <VueButton> D </VueButton>
          </template>
          <template v-else>
            <VueButton> Shift </VueButton>
            <span>+</span>
            <VueButton> Alt </VueButton>
            <span>+</span>
            <VueButton> D </VueButton>
          </template>
          to toggle DevTools
        </div>
      </template>
    </div>
  </div>
</template>
