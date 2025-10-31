
import { createSyncStoragePersister } from './../../node_modules/@tanstack/query-sync-storage-persister/src/index';
export const storagePersister = createSyncStoragePersister({
  storage: window.localStorage,
});