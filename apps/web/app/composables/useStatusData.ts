import type { Context, FediwayStatus, Status } from '@repo/types';
import type { DataResult } from './useDataHelpers';
import { useClient, useStatusStore } from '@repo/api';
import { createDataResult } from './useDataHelpers';

export function useStatusData() {
  const client = useClient();
  const store = useStatusStore();

  function getStatusById(id: string): DataResult<Status | undefined> {
    return createDataResult(`status:${id}`, undefined as Status | undefined, async () => {
      const status = await client.rest.v1.statuses.$select(id).fetch();
      store.set(status as FediwayStatus);
      return status;
    });
  }

  function getStatusContext(id: string): DataResult<Context> {
    const empty: Context = { ancestors: [], descendants: [] };
    return createDataResult(`context:${id}`, empty, async () => {
      const context = await client.rest.v1.statuses.$select(id).context.fetch();
      store.setMany([...context.ancestors, ...context.descendants] as FediwayStatus[]);
      return context;
    });
  }

  return { getStatusById, getStatusContext };
}
