<template>
  <magic-ui-page :config="pageConfig"></magic-ui-page>
</template>

<script lang="ts" setup>
import { inject } from 'vue';

import type Core from '@tmagic/core';
import { useDsl } from '@tmagic/vue-runtime-help';

const app = inject<Core | undefined>('app');
const { pageConfig } = useDsl(app);
</script>
