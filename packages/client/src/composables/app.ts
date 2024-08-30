import { computed, ref, shallowRef } from 'vue';

import type { AppRecord } from '@tmagic/devtools-kit';

export const activeAppRecords = shallowRef<AppRecord[]>([]);
export const activeAppRecordId = ref<string | null>(null);
export const activeAppRecord = computed(() => activeAppRecords.value.find((r) => r.id === activeAppRecordId.value));
