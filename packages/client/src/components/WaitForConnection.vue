<script setup lang="ts">
import { ref } from 'vue';
import { VueIcon, VueInput } from '@vue/devtools-ui';

import AppConnecting from './AppConnecting.vue';

import { useCopy } from '~/composables/editor';

const props = defineProps<{
  local?: string;
  network?: string;
}>();

function scriptWrapper(str: string) {
  return `<script src="${str}"><\\/script>`;
}

const _local = scriptWrapper(props.local!);
const _network = scriptWrapper(props.network!);

// eslint-disable-next-line vue/no-dupe-keys
const local = ref(_local);
// eslint-disable-next-line vue/no-dupe-keys
const network = ref(_network);

const { copy } = useCopy();
</script>

<template>
  <div class="h-screen w-screen $ui-fcc">
    <AppConnecting>
      <p class="pt-5 font-bold text-base">Waiting for connection...</p>
      <div v-if="props.local && props.network" class="mt-5">
        <p class="text-center text-sm op80 text-base">Add one of the following to the top of your page 👇:</p>
        <div class="mt-3 $ui-fcc flex-row gap3">
          <VueInput v-model="local" class="w-380px!" />
          <VueIcon
            icon="i-carbon-copy"
            class="cursor-pointer text-primary-300 hover:text-primary-500"
            @click="copy(local)"
          />
        </div>
        <div class="mt-3 $ui-fcc flex-row gap3">
          <VueInput v-model="network" class="w-380px!" />
          <VueIcon
            icon="i-carbon-copy"
            class="cursor-pointer text-primary-300 hover:text-primary-500"
            @click="copy(network)"
          />
        </div>
      </div>
    </AppConnecting>
  </div>
</template>

<style scoped></style>
