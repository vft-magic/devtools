<script setup lang="ts">
import { useRouter } from 'vue-router';
import { VueButton } from '@vue/devtools-ui';

import DevToolsLogo from '~/components/common/DevToolsLogo.vue';
import { devtoolsClientState } from '~/composables/state';

const router = useRouter();
const clientState = devtoolsClientState;

function visit() {
  clientState.value.isFirstVisit = false;
  router.replace('/overview');
}
</script>

<template>
  <div flex="~ col gap3" relative h-screen w-full items-center justify-center text-center>
    <p my2 text-3em text-primary-600 font-bold font-stylish>👋 Hi there, welcome to TMagic DevTools!</p>
    <p max-w-190 text-lg>
      <DevToolsLogo mr-0.5 inline-block h-8 translate-y--1.1 align-mid /> is a set of visual tools that help you to know
      your TMagic app better, and enhance your development experience with TMagic. Enjoy!<br />
    </p>
    <p mb6 op50>
      Learn more at
      <a href="https://github.com/vft-magic/devtools#readme" target="_blank" rel="noopener noreferrer" n="primary">
        https://github.com/vft-magic/devtools
      </a>
    </p>

    <VueButton type="primary" @click="visit">
      <span>Get Started</span>
    </VueButton>
  </div>
</template>
