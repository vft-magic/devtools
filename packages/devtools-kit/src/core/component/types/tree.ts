export interface InspectorTreeApiPayload {
  app?: any;
  inspectorId?: string;
  filter?: string;
  instanceId?: string;
  rootNodes?: any[];
}

export interface InspectorTree {
  id: string;
  label: string;
  tags?: any[];
  children?: InspectorTree[];
}
