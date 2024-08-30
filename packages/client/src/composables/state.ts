import { watch } from 'vue';
import { type RemovableRef, useLocalStorage } from '@vueuse/core';

import { TabSettings } from './state-tab';

interface DevtoolsClientState {
  isFirstVisit: boolean;
  route: string;
  tabSettings: TabSettings;
  expandSidebar: boolean;
  scrollableSidebar: boolean;
  splitScreen: {
    enabled: boolean;
    view: string;
    size: [number, number];
  };
  scale: number;
  interactionCloseOnOutsideClick: boolean;
  showPanel: boolean;
  minimizePanelInteractive: number;
}

function clientStateFactory(): DevtoolsClientState {
  return {
    isFirstVisit: true,
    route: '/',
    tabSettings: {
      hiddenTabCategories: [],
      hiddenTabs: [],
      pinnedTabs: [],
    },
    expandSidebar: false,
    scrollableSidebar: true,
    splitScreen: {
      enabled: false,
      view: 'overview',
      size: [50, 50],
    },
    scale: 1,
    interactionCloseOnOutsideClick: false,
    showPanel: true,
    minimizePanelInteractive: 5000,
  };
}

export const devtoolsClientState: RemovableRef<DevtoolsClientState> = useLocalStorage(
  '__TMAGIC_DEVTOOLS_CLIENT_STATE__',
  clientStateFactory(),
  { mergeDefaults: true },
);

export function resetDevtoolsClientState() {
  devtoolsClientState.value = clientStateFactory();
}

// #region split screen related
watch(
  () => devtoolsClientState.value.splitScreen.enabled,
  (enabled, o) => {
    if (o && !enabled) {
      // reset size
      devtoolsClientState.value.splitScreen.size = [50, 50];
    }
  },
);
// #endregion
