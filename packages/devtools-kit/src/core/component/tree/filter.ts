import { classify, kebabize } from '@vue/devtools-shared';

import { Node as TMagicNode } from '@tmagic/core';

import { getInstanceName } from '../utils';

export class ComponentFilter {
  filter: string;

  constructor(filter: string) {
    this.filter = filter || '';
  }

  /**
   * Check if an instance is qualified.
   *
   * @param {Vue|Vnode} instance
   * @return {boolean}
   */
  isQualified(instance: TMagicNode): boolean {
    const name = getInstanceName(instance);
    return classify(name).toLowerCase().includes(this.filter) || kebabize(name).toLowerCase().includes(this.filter);
  }
}

export function createComponentFilter(filterText: string) {
  return new ComponentFilter(filterText);
}
