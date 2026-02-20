import { getPlatformAdapter } from '../platform';
import { getDb } from './db';

const IDB_SENTINEL_KEY = 'fediway_idb_sentinel';

export async function writeSentinel(): Promise<void> {
  await getDb().metadata.put({ key: 'idb_sentinel', value: '1' });
  await getPlatformAdapter().secureSet(IDB_SENTINEL_KEY, '1');
}

export async function checkDbIntegrity(): Promise<boolean> {
  const platformHas = await getPlatformAdapter().secureGet(IDB_SENTINEL_KEY);
  if (!platformHas)
    return true;

  const dbHas = await getDb().metadata.get('idb_sentinel');
  if (!dbHas) {
    await getPlatformAdapter().secureRemove(IDB_SENTINEL_KEY);
    return false;
  }
  return true;
}
