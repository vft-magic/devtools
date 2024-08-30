<script setup lang="ts">
import { computed, ref } from 'vue';
import { target } from '@vue/devtools-shared';
import { useDevToolsColorMode } from '@vue/devtools-ui';

import { getDevToolsClientUrl } from '@tmagic/devtools-core';
import { devtools, getRpcServer, onDevToolsConnected, setIframeServerContext } from '@tmagic/devtools-kit';

import FrameBox from '~/components/FrameBox.vue';
import { useFrameState, useIframe, usePanelVisible, usePosition } from '~/composables';
import { checkIsSafari } from '~/utils';

type ViewMode = 'xs' | 'default' | 'fullscreen';
const anchorEle = ref<HTMLDivElement>();
const panelEle = ref<HTMLDivElement>();
const { colorMode: mode } = useDevToolsColorMode({
  selector: anchorEle,
});
const panelState = ref<{
  viewMode: ViewMode;
}>({
  viewMode: 'default',
});
const cssVars = computed(() => {
  const dark = mode.value === 'dark';
  return {
    '--tmagic-devtools-widget-bg': dark ? '#111' : '#ffffff',
    '--tmagic-devtools-widget-fg': dark ? '#F5F5F5' : '#111',
    '--tmagic-devtools-widget-border': dark ? '#3336' : '#efefef',
    '--tmagic-devtools-widget-shadow': dark ? 'rgba(0,0,0,0.3)' : 'rgba(128,128,128,0.1)',
  };
});

const { onPointerDown, bringUp, anchorStyle, iframeStyle, isDragging, isVertical, isHidden, panelStyle } =
  usePosition(panelEle);
const { togglePanelVisible, closePanel, panelVisible } = usePanelVisible();

const clientUrl = getDevToolsClientUrl();
const overlayVisible = ref(true);

target.__TMAGIC_DEVTOOLS_TOGGLE_OVERLAY__ = (visible: boolean) => {
  overlayVisible.value = visible;
};

const { state } = useFrameState();
function waitForClientInjection(iframe: HTMLIFrameElement, _retry = 50, _timeout = 200): Promise<void> | void {
  return new Promise((resolve) => {
    iframe?.contentWindow?.postMessage('__TMAGIC_DEVTOOLS_CREATE_CLIENT__', '*');

    window.addEventListener('message', (data) => {
      if (data.data === '__TMAGIC_DEVTOOLS_CLIENT_READY__') resolve();
    });
  });
}

const tmagicInspector = ref();

onDevToolsConnected(() => {
  const rpcServer = getRpcServer();
  rpcServer.functions.on('toggle-panel', (state = !panelVisible) => {
    togglePanelVisible(undefined, state);
  });

  devtools.ctx.api.getTMagicInspector().then((inspector) => {
    tmagicInspector.value = inspector;

    let previousPanelVisible = panelVisible.value;

    tmagicInspector.value.onEnabled = () => {
      previousPanelVisible = panelVisible.value;
      togglePanelVisible(undefined, false);
    };

    tmagicInspector.value.onDisabled = () => {
      togglePanelVisible(undefined, previousPanelVisible);
    };
  });
});

addEventListener('keyup', (e) => {
  if (e.key?.toLowerCase() === 'escape' && tmagicInspector.value?.enabled) {
    tmagicInspector.value?.disable();
  }
});

const tmagicInspectorEnabled = computed(() => !!tmagicInspector.value);

function enableVueInspector() {
  tmagicInspector.value.enable();
}

const { getIframe } = useIframe(clientUrl, async () => {
  const iframe = getIframe();
  setIframeServerContext(iframe);
  await waitForClientInjection(iframe);
});
</script>

<template>
  <div
    v-show="state.preferShowFloatingPanel ? overlayVisible : panelVisible"
    ref="anchorEle"
    class="tmagic-devtools__anchor"
    :style="[anchorStyle, cssVars]"
    :class="{
      'tmagic-devtools__anchor--vertical': isVertical,
      'tmagic-devtools__anchor--hide': isHidden,
      fullscreen: panelState.viewMode === 'fullscreen',
    }"
    @mousemove="bringUp"
  >
    <div
      v-if="!checkIsSafari()"
      class="tmagic-devtools__anchor--glowing"
      :style="isDragging ? 'opacity: 0.6 !important' : ''"
    />

    <!-- panel -->
    <div ref="panelEle" class="tmagic-devtools__panel" :style="panelStyle" @pointerdown="onPointerDown">
      <div
        class="tmagic-devtools__anchor-btn panel-entry-btn"
        title="Toggle TMagic DevTools"
        aria-label="Toggle devtools panel"
        :style="panelVisible ? '' : 'filter:saturate(0)'"
        @click="togglePanelVisible"
      >
        <img width="50%" src="https://vip.image.video.qpic.cn/vupload/20240823/a5a9ab1724395652351.png" />
      </div>
      <template v-if="devtools.ctx.state.vitePluginDetected && tmagicInspectorEnabled">
        <div class="tmagic-devtools__panel-content tmagic-devtools__panel-divider" />
        <div
          class="tmagic-devtools__anchor-btn tmagic-devtools__panel-content tmagic-devtools__inspector-button"
          title="Toggle Component Inspector"
          :class="{ active: tmagicInspectorEnabled }"
          @click="enableVueInspector"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style="height: 1.1em; width: 1.1em; opacity: 0.5"
            :style="tmagicInspectorEnabled ? 'opacity:1;color:#00dc82;' : ''"
            viewBox="0 0 24 24"
          >
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <circle cx="12" cy="12" r=".5" fill="currentColor" />
              <path d="M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0m7-9v2m-9 7h2m7 7v2m7-9h2" />
            </g>
          </svg>
        </div>
      </template>
    </div>

    <!-- iframe -->
    <FrameBox
      :style="iframeStyle"
      :is-dragging="isDragging"
      :client="{
        close: closePanel,
        getIFrame: getIframe,
      }"
      :view-mode="panelState.viewMode"
    />
  </div>
</template>

<style scoped lang="scss">
.tmagic-devtools {
  // anchor
  &__anchor {
    position: fixed;
    z-index: 2147483645;
    transform-origin: center center;
    transform: translate(-50%, -50%) rotate(0);

    &.fullscreen {
      transform: none !important;
      left: 0 !important;
    }

    &-btn {
      border-radius: 100%;
      border-width: 0;
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.8;
      transition: opacity 0.2s ease-in-out;

      &:hover {
        opacity: 1;
      }

      svg {
        width: 14px;
        height: 14px;
      }

      &.active {
        cursor: pointer;
      }
    }

    .panel-entry-btn {
      cursor: pointer;
      flex: none;
    }

    &--vertical {
      .panel-entry-btn {
        transform: rotate(-90deg);
      }

      .tmagic-devtools__panel {
        transform: translate(-50%, -50%) rotate(90deg);
        box-shadow: 2px -2px 8px var(--tmagic-devtools-widget-shadow);
      }
    }

    &--hide {
      .tmagic-devtools__panel {
        max-width: 32px;
        padding: 2px 0;
      }

      .tmagic-devtools__panel-content {
        opacity: 0;
      }
    }

    &--glowing {
      position: absolute;
      left: 0;
      top: 0;
      transform: translate(-50%, -50%);
      width: 160px;
      height: 160px;
      opacity: 0;
      transition: all 1s ease;
      pointer-events: none;
      z-index: -1;
      border-radius: 9999px;
      background-image: linear-gradient(45deg, #00dc82, #36e4da, #0047e1);
      filter: blur(60px);
    }

    &:hover {
      .tmagic-devtools__anchor--glowing {
        opacity: 0.6;
      }
    }
  }

  // panel
  &__panel {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: flex-start;
    overflow: hidden;
    align-items: center;
    gap: 2px;
    height: 30px;
    padding: 4px 4px 4px 5px;
    box-sizing: border-box;
    border: 1px solid var(--tmagic-devtools-widget-border);
    border-radius: 20px;
    background-color: var(--tmagic-devtools-widget-bg);
    backdrop-filter: blur(10px);
    color: var(--tmagic-devtools-widget-fg);
    box-shadow: 2px 2px 8px var(--tmagic-devtools-widget-shadow);
    user-select: none;
    max-width: 150px;
    transition: max-width 0.4s ease, padding 0.5s ease, transform 0.3s ease, all 0.4s ease;

    &-content {
      transition: opacity 0.4s ease;
    }

    &-divider {
      border-left: 1px solid #8883;
      width: 1px;
      height: 10px;
    }
  }
}

@keyframes blink {
  0% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 0.2;
  }
}

@media print {
  #tmagic-devtools-anchor {
    display: none;
  }
}
</style>
