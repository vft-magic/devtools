export type TMagicApp = any;

export interface AppRecord {
  id: string;
  name: string;
  app?: TMagicApp;
  version?: string;
  types?: Record<string, string | symbol>;
}
