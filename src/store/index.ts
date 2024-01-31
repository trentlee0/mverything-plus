import { defineStore, createPinia, Store } from 'pinia'
import persistencePiniaPlugin from 'pinia-persistence'
import { sync } from 'utools-utils'
import { StoreKey } from '@/constant'
import { DisplayModeEnum } from '@/constant'
import { toRaw } from 'vue'
import { db } from 'utools-api'
import { isIllegalIndex } from '@/utils/collections'
import { KindFilterModel, SearchScopeModel, SettingModel } from '@/models'

export const useCommonStore = defineStore('common', {
  state: () => ({
    isPreviewContent: sync.get(StoreKey.IS_PREVIEW_CONTENT, true),
    displayMode: sync.get(StoreKey.DISPLAY_MODE, DisplayModeEnum.PREVIEW),
    isShowRecent: sync.get(StoreKey.IS_SHOW_RECENT, true),
    defaultSearchScopes: SearchScopeModel.defaultSearchScopes()
  }),
  actions: {
    setIsPreviewContent(isPreview: boolean) {
      sync.set(StoreKey.IS_PREVIEW_CONTENT, isPreview)
      this.isPreviewContent = isPreview
    },
    setDisplayMode(displayMode: DisplayModeEnum) {
      sync.set(StoreKey.DISPLAY_MODE, displayMode)
      this.displayMode = displayMode
    },
    setIsShowRecent(showRecent: boolean) {
      sync.set(StoreKey.IS_SHOW_RECENT, showRecent)
      this.isShowRecent = showRecent
    },
    async refreshDefaultSearchScopes() {
      this.defaultSearchScopes = await SearchScopeModel.refreshDefaultSearchScopes()
    }
  }
})

const dbRevMap = new Map<string, string | undefined>()
export const useSettingStore = defineStore(StoreKey.SETTING, {
  state: (): SettingModel => ({ ...new SettingModel() }),
  persist: {
    enable: true,
    storage: {
      get<T>(key: string): T | null {
        const doc = db.get(key)
        dbRevMap.set(key, doc?._rev)
        return doc?.data ?? null
      },
      set(key: string, value: any) {
        const res = db.put({ _id: key, _rev: dbRevMap.get(key), data: value })
        dbRevMap.set(key, res.rev)
      }
    },
    map: toRaw,
    restored(store: Store) {
      const setting = toRaw(store.$state as SettingModel)
      if (SettingModel.migrateDatabase(setting)) {
        store.$patch(setting)
        store.$persist()
        console.log('database migrated:', setting)
      }
    },
    persisted(store: Store) {
      if (import.meta.env.DEV) {
        console.log('persisted', store.$id, toRaw(store.$state))
      }
    }
  },
  getters: {
    allSearchScopes(): Array<SearchScopeModel> {
      const commonStore = useCommonStore()
      return [...commonStore.defaultSearchScopes, ...this.searchScopes]
    },
    enabledKindFilters(): Array<KindFilterModel> {
      return this.kindFilters.filter((kind) => kind.enabled)
    }
  },
  actions: {
    removeSearchScope(indexInAll: number) {
      const commonStore = useCommonStore()
      const index = indexInAll - commonStore.defaultSearchScopes.length
      if (isIllegalIndex(this.searchScopes, index)) return
      this.searchScopes.splice(index, 1)
    },
    getSearchScope(searchScopeId: string) {
      const scope = this.allSearchScopes.find((s) => s.id === searchScopeId)
      if (scope) return scope

      // fallback
      this.searchRoot = SearchScopeModel.USER_ID
      return SearchScopeModel.USER
    }
  }
})

const pinia = createPinia()
pinia.use(persistencePiniaPlugin)
export default pinia
