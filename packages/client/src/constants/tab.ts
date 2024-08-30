import { deepClone } from '@vue/devtools-shared';

import type { ModuleBuiltinTab } from '~/types';

// @unocss-include
export const builtinTab: [string, ModuleBuiltinTab[]][] = [
  [
    'app',
    [
      {
        icon: 'i-carbon-information',
        name: 'overview',
        order: -100,
        path: 'overview',
        title: 'Overview',
      },
      {
        icon: 'i-carbon-assembly-cluster',
        name: 'nodes',
        order: -100,
        path: 'nodes',
        title: 'Nodes',
      },
      {
        icon: 'i-carbon-tree-view-alt',
        name: 'pages',
        order: -100,
        path: 'pages',
        title: 'Pages',
      },
    ],
  ],
];

export function getBuiltinTab(): [string, ModuleBuiltinTab[]][] {
  const tab = deepClone(builtinTab);
  return tab;
}

export const CUSTOM_TAB_VIEW = 'custom-tab-view';
export const CUSTOM_INSPECTOR_TAB_VIEW = 'custom-inspector-tab-view';
