import 'pinia'
import { storage } from 'utools-utils'
import { Store } from 'pinia'
import { StateTree } from 'pinia'

export type StorageLike = Pick<storage.AbstractStorage, 'get' | 'set'>

export interface PersistOptions {
  /**
   * 是否启用持久化状态
   * @default false
   */
  enable?: boolean

  /**
   * 持久化存储
   * @default utools.dbStorage
   */
  storage?: StorageLike

  /**
   * 在持久化之前对状态的处理函数
   */
  map?: (state: StateTree) => StateTree

  /**
   * 在恢复状态开始前的回调，在调用 `store.$restore()` 方法时不会触发
   */
  beforeRestored?: (store: Store) => void

  /**
   * 完成恢复状态后的回调，在调用 `store.$restore()` 方法时不会触发
   */
  restored?: (store: Store) => void

  /**
   * 在持久化状态开始前的回调，在调用 `store.$persist()` 方法时不会触发
   */
  beforePersisted?: (store: Store) => void

  /**
   * 完成持久化状态后的回调，在调用 `store.$persist()` 方法时不会触发
   */
  persisted?: (store: Store) => void
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    /**
     * 恢复状态
     */
    $restore: () => void

    /**
     * 持久化状态
     */
    $persist: () => void
  }

  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    /**
     * 持久化配置
     */
    persist?: PersistOptions
  }
}
