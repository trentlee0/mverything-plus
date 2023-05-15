<template>
  <div class="tw-h-full tw-w-full">
    <Header height="49px">
      <div class="tw-w-72 tw-flex-none">
        <SearchInput
          ref="searchInputRef"
          v-model="query"
          @update:model-value="handleQueryChange"
        >
          <template #prepend-inner>
            <v-icon
              v-show="!settingStore.isFindFileContent"
              title="仅搜索文件名"
              @click="handleSearchAttrChange(true)"
            >
              {{ mdiMagnify }}
            </v-icon>
            <v-icon
              v-show="settingStore.isFindFileContent"
              title="搜索任意内容"
              @click="handleSearchAttrChange(false)"
            >
              {{ mdiTextSearch }}
            </v-icon>
          </template>
        </SearchInput>
      </div>
      <div class="tw-w-10"></div>
      <v-tabs v-model="searchKind" density="compact" show-arrows center-active>
        <v-tab
          v-for="kind in settingStore.enabledKindFilters"
          :key="kind.id"
          :value="kind"
        >
          {{ kind.label }}
        </v-tab>
      </v-tabs>
    </Header>

    <div class="tw-h-px">
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        height="1"
      ></v-progress-linear>
    </div>

    <div
      class="tw-relative tw-w-full"
      style="height: calc(100% - 49px - 1px - 45px)"
    >
      <v-row class="tw-h-full tw-w-full" no-gutters>
        <v-col class="tw-relative tw-h-full">
          <FileList
            ref="fileListRef"
            :items="list"
            :item-height="itemHeight"
            :selected-index="selectedIndex"
            :list-mode="isListMode"
            :display-size="9"
            :is-keystroke="isCurrentScope"
            @update:selected-index="handleSelect"
            @open-item="menuActions.open"
            @open-item-in-finder="menuActions.openInFinder"
            @show-item-info="menuActions.showInfo"
            @quick-look-item="menuActions.quickLook"
            @copy-item="menuActions.copy"
            @copy-item-name="menuActions.copyName"
            @copy-item-path="menuActions.copyPath"
            @move-item-to-trash="menuActions.moveToTrash"
          ></FileList>

          <OverlaySideNum
            v-show="isShowListShortcuts"
            :item-count="Math.min(list.length, 9)"
            :item-height="itemHeight"
          />
        </v-col>
        <v-col class="tw-h-full" :cols="5" v-if="isPreviewMode">
          <Preview
            :item="fileInfo"
            :is-preview="isPreviewContent"
            :loading="previewLoading"
          ></Preview>
        </v-col>
      </v-row>

      <div
        v-show="!list.length"
        class="tw-absolute tw-left-0 tw-top-0 tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center"
      >
        <div
          class="tw-pointer-events-none tw-absolute tw-flex tw-h-full tw-w-full tw-justify-center tw-p-28"
        >
          <v-img :src="emptyImg" />
        </div>
      </div>
    </div>

    <v-row no-gutters style="height: 45px" align="center">
      <v-col class="tw-flex tw-items-center">
        <Hover class="tw-ml-5">
          <div class="tw-px-3 tw-py-1" @click="router.push('/setting')">
            <v-icon size="default">{{ mdiCogOutline }}</v-icon>
          </div>
        </Hover>
      </v-col>
      <v-col class="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">
        <Hover v-show="!isFindInTempScope">
          <SelectBox
            class="tw-w-full"
            v-model="searchScopeId"
            :items="settingStore.allSearchScopes"
            :title="searchScopeTitle"
            item-label="label"
            item-value="id"
            @select="handleSearchScopeChange"
          />
        </Hover>
        <span v-show="isFindInTempScope" :title="searchScopeTitle">
          {{ tempDirectory }}
        </span>
      </v-col>
      <v-col class="tw-flex tw-items-center tw-justify-center">
        <Hover>
          <SortType
            class="tw-px-3 tw-py-1"
            v-model="sortOrder.sortType"
            @update:model-value="handleSortOrderChange"
          />
        </Hover>
        <Hover>
          <SelectBox
            v-model="sortOrder.fieldName"
            :items="sortProps"
            @update:model-value="handleSortOrderChange"
          />
        </Hover>
      </v-col>
      <v-col class="tw-flex tw-justify-center">
        <Hover>
          <DisplayMode
            v-model="currentDisplayMode"
            :items="displayModes"
            @update:model-value="commonStore.setDisplayMode($event as number)"
          />
        </Hover>
      </v-col>
      <v-col>
        <v-switch
          v-show="isPreviewMode"
          v-model="isPreviewContent"
          hide-details
          density="compact"
          title="预览内容，对于文本文件仅读取部分内容"
          @update:model-value="commonStore.setIsPreviewContent(!!$event)"
        >
          <template #label> 预览内容</template>
        </v-switch>
      </v-col>
      <v-col>
        <span v-show="list.length">共搜索到 {{ list.length }} 条</span>
      </v-col>
    </v-row>
  </div>

  <v-navigation-drawer
    v-model="previewDrawer"
    temporary
    location="right"
    width="450"
  >
    <Preview v-if="isListMode" :item="fileInfo" :loading="previewLoading" />
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import {
  mdiMagnify,
  mdiTextSearch,
  mdiCogOutline,
  mdiFormatListBulleted,
  mdiViewWeekOutline
} from '@mdi/js'
import Preview from '@/components/home/Preview.vue'
import DisplayMode from '@/components/home/DisplayMode.vue'
import SortType from '@/components/home/SortType.vue'
import FileList from '@/components/home/FileList.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import Header from '@/components/common/Header.vue'
import SearchInput from '@/components/home/SearchInput.vue'
import OverlaySideNum from '@/components/home/OverlaySideNum.vue'
import Hover from '@/components/common/Hover.vue'
import {
  computed,
  ref,
  watch,
  reactive,
  onActivated,
  onBeforeUnmount
} from 'vue'
import { debounce, isUndefined } from 'lodash'
import { onKeyDown, onStartTyping, useWindowFocus } from '@vueuse/core'
import {
  DisplayModeEnum,
  SortTypeEnum,
  FilePreviewType,
  ScopeName
} from '@/constant'
import { useCommonStore, useSettingStore } from '@/store'
import { toMap } from '@/utils/collections'
import {
  highlightFileInfos,
  mapToFileInfos,
  sortFileInfos
} from '@/utils/handler'
import { getFileExtension } from '@/utils/strings'
import {
  existsDir,
  find,
  getFileMetadata,
  killFind,
  readFileList,
  readFilePartText,
  trashFile,
  openInfoWindow
} from '@/preload'
import {
  shellShowItemInFolder,
  copyText,
  shellOpenPath,
  onPluginEnter,
  onPluginOut,
  getPath,
  getFileIcon,
  readCurrentFolderPath,
  createBrowserWindow,
  showMainWindow,
  ActionType,
  FilesPayload,
  Payload
} from 'utools-api'
import emptyImg from '@/assets/empty_inbox.svg'
import { buildQuery, getSearchRegExp, splitKeyword } from '@/utils/query'
import { copyFromPath } from '@/utils/common'
import { useHotkeysScope, useHotkeys } from '@/hooks/useHotkeys'
import { useKeyLongPress } from '@/hooks/useKeyLongPress'
import { toRef } from 'vue'
import { ContentType } from '@/constant'
import { BaseFileInfo, KindFilterModel, PreviewFileInfo } from '@/models'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const toast = useToast()

const router = useRouter()
const commonStore = useCommonStore()
const settingStore = useSettingStore()

const previewDrawer = ref(false)
const query = ref<string>('')

const tempDirectory = ref<string>('')
const isFindInTempScope = computed(() => !!tempDirectory.value)
const isShowFilesInTempScope = computed(
  () => isFindInTempScope.value && settingStore.isShowFilesInTempDir
)

const searchScopeId = toRef(settingStore, 'searchRoot')
const searchScopeDirectories = computed<string[]>(() => {
  if (isFindInTempScope.value) {
    return [tempDirectory.value]
  }
  return settingStore.getOrFallbackSearchScope(searchScopeId.value).paths
})
const searchScopeTitle = computed(() => searchScopeDirectories.value.join(','))

function handleSearchScopeChange() {
  search(query.value)
}

function handleSearchAttrChange(isFindContent: boolean) {
  settingStore.isFindFileContent = isFindContent
  search(query.value)
}

const searchKind = ref(KindFilterModel.ANY)
const searchKindIndex = computed(() =>
  settingStore.enabledKindFilters.findIndex(
    (kind) => kind.id === searchKind.value.id
  )
)
const notKindFilter = computed(
  () => searchKind.value.id === KindFilterModel.ANY.id
)

watch(searchKind, () => {
  search(query.value)
})

// 只监听已启用的类型筛选改变
watch(settingStore.enabledKindFilters, () => {
  searchKind.value = KindFilterModel.ANY
})

const displayModes = reactive([
  {
    value: DisplayModeEnum.LIST,
    title: '列表模式',
    icon: mdiFormatListBulleted
  },
  {
    value: DisplayModeEnum.PREVIEW,
    title: '预览模式',
    icon: mdiViewWeekOutline
  }
])
const currentDisplayMode = toRef(commonStore, 'displayMode')
const isListMode = computed(
  () => currentDisplayMode.value === DisplayModeEnum.LIST
)
const isPreviewMode = computed(
  () => currentDisplayMode.value === DisplayModeEnum.PREVIEW
)

const isPreviewContent = toRef(commonStore, 'isPreviewContent')

type SortFieldName = 'none' | keyof BaseFileInfo
const sortProps = reactive<Array<{ label: string; value: SortFieldName }>>([
  { label: '无', value: 'none' },
  { label: '名称', value: 'name' },
  { label: '大小', value: 'size' },
  { label: '创建时间', value: 'createDate' },
  { label: '修改时间', value: 'updateDate' }
])
const sortOrder = reactive<{
  fieldName: SortFieldName
  sortType: SortTypeEnum
}>({
  fieldName: 'none',
  sortType: SortTypeEnum.DESC
})

function handleSortOrderChange() {
  const { fieldName, sortType } = sortOrder
  if (fieldName === 'none') {
    // 不排序需要重新搜索
    search(query.value)
  } else {
    refreshList(sortFileInfos(list.value, fieldName, sortType))
  }
}

const loading = ref(false)
const itemHeight = ref(50)
const list = ref<Array<BaseFileInfo>>([])
const selectedIndex = ref<number>()
const fileInfo = ref<PreviewFileInfo>()
const previewLoading = ref(false)

function handleSelect(index: number) {
  selectedIndex.value = index
  loadFileInfo(list.value[index])
}

async function loadFileInfo(item: BaseFileInfo) {
  if (item.path === fileInfo.value?.path) {
    return
  }

  fileInfo.value = {
    ...item,
    thumbnail: getFileIcon(item.path),
    typeTree: [],
    previewType: fileInfo.value?.previewType ?? FilePreviewType.NONE
  }

  const res = await getFileMetadata(item.path)
  fileInfo.value.typeTree = res.contentTypeTree ?? []
  fileInfo.value.pixelWidth = res.pixelWidth
  fileInfo.value.pixelHeight = res.pixelHeight

  // 决定文件预览方式
  if (item.type === ContentType.FOLDER) {
    fileInfo.value.previewType = FilePreviewType.FOLDER
  } else {
    const ext = getFileExtension(item.name)
    if (ext) {
      const { fileExtension, pictureExtension } = settingStore
      const { videoExtension, audioExtension } = settingStore
      if (fileExtension.includes(ext)) {
        fileInfo.value.previewType = FilePreviewType.TEXT
      } else if (pictureExtension.includes(ext)) {
        fileInfo.value.previewType = FilePreviewType.PICTURE
      } else if (videoExtension.includes(ext)) {
        fileInfo.value.previewType = FilePreviewType.VIDEO
      } else if (audioExtension.includes(ext)) {
        fileInfo.value.previewType = FilePreviewType.AUDIO
      } else {
        fileInfo.value.previewType = FilePreviewType.NONE
      }
    } else {
      fileInfo.value.previewType = FilePreviewType.NONE
    }
  }
  if (fileInfo.value.previewType === FilePreviewType.NONE) {
    if (fileInfo.value.typeTree.includes(ContentType.TEXT)) {
      fileInfo.value.previewType = FilePreviewType.TEXT
    }
  }

  await loadFileContent(fileInfo.value)
}

watch(currentDisplayMode, () => {
  if (fileInfo.value && !fileInfo.value.fileText) {
    loadFileContent(fileInfo.value)
  }
})

watch(isPreviewContent, () => {
  if (fileInfo.value && !fileInfo.value.fileText) {
    loadFileContent(fileInfo.value)
  }
})

watch(previewDrawer, () => {
  if (fileInfo.value && !fileInfo.value.fileText) {
    loadFileContent(fileInfo.value)
  }
})

async function loadFileContent(item: PreviewFileInfo) {
  // 加载文件内容的情况
  // 1. 在预览模式，并且开启预览内容
  // 2. 在列表模式，并且打开预览抽屉
  if (
    (isPreviewMode.value && isPreviewContent.value) ||
    (isListMode.value && previewDrawer.value)
  ) {
    if (import.meta.env.DEV) {
      console.log('load file: ' + item.path)
    }

    previewLoading.value = true
    try {
      switch (item.previewType) {
        case FilePreviewType.FOLDER:
          const fileList = await readFileList(item.path)
          item.files = fileList
          item.itemCount = fileList.length
          break
        case FilePreviewType.TEXT:
          const { text, size, partialSize, encoding } = await readFilePartText(
            item.path
          )
          item.size = size
          item.fileText = text
          item.readTextSize = partialSize
          item.textEncoding = encoding
          break
      }
    } catch (err) {
      console.error(err, item.path)
      toast.error(`错误！${err}\n${item.path}`)
    }
    previewLoading.value = false
  }
}

function resetSearch() {
  killFind()
  loading.value = false
  // 清空结果列表
  list.value = []
  fileInfo.value = undefined
}

function search(query: string) {
  let searchText = query

  const { statement, keyword } = splitKeyword(
    searchText,
    settingStore.searchKey
  )

  // 如果搜索文本为空，特殊处理
  if (!searchText || !statement) {
    // 列出所有文件的情况：
    // 1. 不在“不筛选”类型选项卡，并且开启了在类型筛选下列出所有文件
    // 2. 在“不筛选”类型选项卡，并且开启了在临时目录列出所有文件
    if (
      (!notKindFilter.value && settingStore.isShowFilesInKind) ||
      (notKindFilter.value && isShowFilesInTempScope.value)
    ) {
      listAll()
    } else {
      // 重置搜索
      resetSearch()
    }
    return
  }

  searchText = statement

  const currentQuery = buildQuery(
    searchText,
    searchKind.value,
    settingStore.isFindFileContent
  )
  if (import.meta.env.DEV) {
    console.log('start find with:', currentQuery)
  }
  loading.value = true
  find(currentQuery, searchScopeDirectories.value).then((res) => {
    const mappedList = mapToFileInfos(
      res,
      keyword,
      toMap(
        settingStore.keyList,
        (item) => item.key,
        (item) => item.regex
      )
    )
    const sortList = () => {
      if (sortOrder.fieldName === 'none') {
        return mappedList
      }
      return sortFileInfos(mappedList, sortOrder.fieldName, sortOrder.sortType)
    }
    const newList = sortList()

    let re: RegExp
    if (
      settingStore.nameHighlight.enabled &&
      (re = getSearchRegExp(searchText))
    ) {
      refreshList(
        highlightFileInfos(re, newList, settingStore.nameHighlight.style)
      )
    } else {
      refreshList(newList)
    }
    loading.value = false
  })
}

function listAll() {
  search('**')
}

function refreshList(newList: Array<BaseFileInfo>) {
  list.value = newList
  if (newList.length) {
    handleSelect(0)
    fileListRef.value?.locateTo(0)
  } else {
    selectedIndex.value = undefined
    fileInfo.value = undefined
  }
}

const delayedSearch = debounce(() => search(query.value), 500, {
  leading: false,
  trailing: true
})

function handleQueryChange() {
  if (settingStore.isAutoSearch) {
    delayedSearch()
  }
}

const searchInputRef = ref<ComponentRef<typeof SearchInput>>(null)

function focusInput() {
  searchInputRef.value?.focus()
}

function isFocusInput() {
  return searchInputRef.value?.isFocus()
}

function blurInput() {
  searchInputRef.value?.blur()
}

function selectText() {
  searchInputRef.value?.selectText()
}

const menuActions = reactive({
  open() {
    if (isUndefined(selectedIndex.value)) return
    shellOpenPath(list.value[selectedIndex.value].path)
  },
  openInFinder() {
    if (isUndefined(selectedIndex.value)) return
    shellShowItemInFolder(list.value[selectedIndex.value].path)
  },
  showInfo() {
    if (isUndefined(selectedIndex.value)) return
    openInfoWindow(list.value[selectedIndex.value].path)
  },
  quickLook() {
    if (isUndefined(selectedIndex.value)) return
    quickLook()
  },
  copy() {
    if (isUndefined(selectedIndex.value)) return
    const path = list.value[selectedIndex.value].path
    copyFromPath(path, settingStore.pictureExtension)
  },
  copyName() {
    if (isUndefined(selectedIndex.value)) return
    copyText(list.value[selectedIndex.value].name)
  },
  copyPath() {
    if (isUndefined(selectedIndex.value)) return
    copyText(list.value[selectedIndex.value].path)
  },
  moveToTrash() {
    if (isUndefined(selectedIndex.value)) return
    trashFile(list.value[selectedIndex.value].path)
    list.value.splice(selectedIndex.value, 1)
  }
})

const debouncedSearch = debounce(() => search(query.value), 500, {
  leading: true,
  trailing: false
})

const { setScope, isCurrentScope } = useHotkeysScope(ScopeName.HOME)
onActivated(() => {
  setScope()
})

useHotkeys(
  'enter',
  (e) => {
    const target = e.target as HTMLElement
    if (target.tagName !== 'INPUT' || settingStore.isAutoSearch) {
      menuActions.open()
    } else {
      debouncedSearch()
    }
  },
  { scope: ScopeName.HOME }
)
useHotkeys(
  'right',
  () => {
    // 只在列表模式有效
    if (!isListMode.value) return
    previewDrawer.value = !previewDrawer.value
  },
  { scope: ScopeName.HOME }
)
useHotkeys('command+enter', () => menuActions.openInFinder(), {
  scope: ScopeName.HOME
})
useHotkeys('command+i', () => menuActions.showInfo(), { scope: ScopeName.HOME })
useHotkeys('command+o', () => menuActions.open(), { scope: ScopeName.HOME })
useHotkeys('command+c', () => menuActions.copy(), { scope: ScopeName.HOME })
useHotkeys('command+shift+c', () => menuActions.copyName(), {
  scope: ScopeName.HOME
})
useHotkeys('command+option+c', () => menuActions.copyPath(), {
  scope: ScopeName.HOME
})
useHotkeys(
  'command+backspace',
  (e) => {
    // 在输入框不处理
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    menuActions.moveToTrash()
  },
  { scope: ScopeName.HOME }
)
useHotkeys('command+f', () => focusInput(), { scope: ScopeName.HOME })

onStartTyping(() => {
  if (isCurrentScope.value) {
    focusInput()
  }
})

onKeyDown(['Meta', 'Shift', '[', ']'], (e) => {
  if (!isCurrentScope.value) return

  const len = settingStore.enabledKindFilters.length
  // ⇧ ⌘ ]
  if (e.key === ']' && e.metaKey && e.shiftKey) {
    e.preventDefault()
    const index = (searchKindIndex.value + 1) % len
    searchKind.value = settingStore.enabledKindFilters[index]
  }
  // ⇧ ⌘ [
  else if (e.key === '[' && e.metaKey && e.shiftKey) {
    e.preventDefault()
    const index = (searchKindIndex.value - 1 + len) % len
    searchKind.value = settingStore.enabledKindFilters[index]
  }
})

const fileListRef = ref<ComponentRef<typeof FileList>>(null)
onKeyDown(['Meta', '1', '2', '3', '4', '5', '6', '7', '8', '9'], (e) => {
  if (!isCurrentScope.value) return

  if (e.metaKey) {
    // 对齐窗口的数据项
    fileListRef.value?.locateToView()
  }
  if (e.metaKey && '1' <= e.key && e.key <= '9') {
    fileListRef.value?.scrollToView(parseInt(e.key) - 1)
    if (settingStore.isOpenAsShortcutting) {
      menuActions.open()
    }
  }
})

const isShowListShortcuts = ref(false)
const windowFocus = useWindowFocus()
useKeyLongPress(
  ['Meta'],
  () => {
    if (!isCurrentScope.value) return
    // 只有窗口获得焦点才显示
    if (windowFocus.value) {
      isShowListShortcuts.value = true
    }
  },
  (e) => {
    if (!isCurrentScope.value) return
    // 切换左右 ⌘ 键时不隐藏
    if (!e.metaKey) {
      isShowListShortcuts.value = false
    }
  },
  700
)

watch(windowFocus, () => {
  // 窗口失去焦点
  if (!windowFocus.value) {
    isShowListShortcuts.value = false
  }
})

async function init(code: string, type: ActionType, payload: Payload) {
  switch (type) {
    case ActionType.FILES:
      const files = payload as FilesPayload
      tempDirectory.value = files[0].path
      break
    case ActionType.WINDOW:
      try {
        tempDirectory.value = await readCurrentFolderPath()
      } catch (err) {
        console.error(err)
        tempDirectory.value = getPath('desktop')
      }
      break
    case ActionType.REGEX:
      const dir = payload as string
      if (await existsDir(dir)) tempDirectory.value = dir
      break
    case ActionType.OVER:
      query.value = payload as string
      break
  }
}

const qlWin = createBrowserWindow('quicklook.html', {
  width: 0,
  height: 0,
  x: 1200,
  y: 80,
  show: false,
  autoHideMenuBar: true,
  webPreferences: {
    devTools: true
  }
})

function quickLook() {
  if (!fileInfo.value) return

  qlWin.show()
  qlWin.closeFilePreview()
  qlWin.previewFile(fileInfo.value.path, fileInfo.value.name)
  showMainWindow()
}

useHotkeys(
  'Space',
  (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    e.preventDefault()
    quickLook()
  },
  { scope: ScopeName.HOME }
)

onBeforeUnmount(() => {
  qlWin.destroy()
})

onPluginEnter(async ({ code, type, payload }) => {
  // 更新搜索范围
  commonStore.refreshDefaultSearchScopes()

  await init(code, type as ActionType, payload)
  focusInput()
  selectText()

  if (isFindInTempScope.value) {
    query.value = ''
  }

  if (isShowFilesInTempScope.value) {
    listAll()
  }
})
onPluginOut(() => {
  if (isFindInTempScope.value) {
    query.value = ''
    tempDirectory.value = ''
    resetSearch()
  } else {
    killFind()
  }
  qlWin.hide()
})
</script>

<style lang="scss" scoped></style>
