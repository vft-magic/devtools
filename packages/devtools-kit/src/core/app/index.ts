import { target } from '@vue/devtools-shared';
import slug from 'speakingurl';

import { AppRecord, TMagicApp } from '../../types';

// eslint-disable-next-line no-multi-assign
const appRecordInfo = (target.__TMAGIC_DEVTOOLS_NEXT_APP_RECORD_INFO__ ??= {
  id: 0,
  appIds: new Set<string>(),
});

export function removeAppRecordId(app: TMagicApp) {
  const id = app.dsl?.id;
  if (id !== null && typeof id !== 'undefined') {
    appRecordInfo.appIds.delete(`${id}`);
    appRecordInfo.id -= 1;
  }
}

function getAppRecordId(app: TMagicApp, defaultId?: string): string {
  if (app.dsl?.id) return `${app.dsl?.id}`;

  let id = defaultId ?? (appRecordInfo.id += 1).toString();

  if (defaultId && appRecordInfo.appIds.has(id)) {
    let count = 1;
    while (appRecordInfo.appIds.has(`${defaultId}_${count}`)) count += 1;
    id = `${defaultId}_${count}`;
  }

  appRecordInfo.appIds.add(id);

  if (app.dsl) {
    app.dsl.id = id;
  }

  return id;
}

export function createAppRecord(app: TMagicApp): AppRecord {
  if (app) {
    appRecordInfo.id += 1;
    const name = 'Tmagic App';
    const id = getAppRecordId(app, slug(name));

    const record: AppRecord = {
      id,
      name,
      app,
    };

    return record;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {} as AppRecord;
}
