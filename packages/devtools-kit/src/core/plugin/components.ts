import { debounce } from 'perfect-debounce';

import type { MApp } from '@tmagic/schema';

import { hook } from '../../hook';
import type { PluginDescriptor, PluginSetupFunction, TMagicApp } from '../../types';

const INSPECTOR_ID = 'components';

export function createComponentsDevToolsPlugin(app: TMagicApp): [PluginDescriptor, PluginSetupFunction] {
  const descriptor: PluginDescriptor = {
    id: INSPECTOR_ID,
    label: 'Components',
    app,
  };

  const setupFn: PluginSetupFunction = (api) => {
    const debounceSendInspectorTree = debounce((data: { config: MApp; inspectorId: string }) => {
      api.sendInspectorTree(data);
    }, 120);

    hook.on.tmagicConfigChange((config: MApp) => {
      debounceSendInspectorTree({ config, inspectorId: 'root' });
    });
  };

  return [descriptor, setupFn];
}
