import { PiniaPluginContext, StateTree, Store } from 'pinia'
import { storage } from 'utools-utils'
import { StorageLike } from './type'

export * from './type'

function restore(store: Store, db: StorageLike, key: string) {
  const state = db.get<StateTree>(key)
  if (state !== null) {
    store.$patch(state)
  }
}

function persist(db: StorageLike, key: string, state: StateTree) {
  db.set(key, state)
}

export default function persistPiniaPlugin(context: PiniaPluginContext) {
  const { store, options } = context
  const db = options.persist?.storage ?? storage.sync
  const mapFn = options.persist?.map ?? ((state: StateTree) => state)

  store.$restore = () => restore(store, db, store.$id)

  store.$persist = () => persist(db, store.$id, mapFn(store.$state))

  if (options.persist?.enable) {
    options.persist.beforeRestored?.(store)
    restore(store, db, store.$id)
    options.persist.restored?.(store)

    store.$subscribe(
      (mutation, state) => {
        options.persist?.beforePersisted?.(store)
        persist(db, mutation.storeId, mapFn(state))
        options.persist?.persisted?.(store)
      },
      { detached: true }
    )
  }
}
