<template>
  <div class="tw-h-full tw-w-full">
    <Header height="49px" v-if="!settingStore.isUseSubInput">
      <div class="tw-w-72 tw-flex-none">
        <SearchInput ref="searchInputRef" v-model="query" @update:model-value="handleQueryChange">
          <template #prepend-inner>
            <template v-if="simpleFilter === SimpleFilterEnum.NONE">
              <v-icon
                v-show="!settingStore.isFindFileContent"
                title="仅搜索文件名"
                size="22"
                @click="handleSearchAttrChange(true)"
              >
                {{ mdiMagnify }}
              </v-icon>
              <v-icon
                v-show="settingStore.isFindFileContent"
                size="22"
                title="搜索文件名和内容"
                @click="handleSearchAttrChange(false)"
              >
                {{ mdiTextSearchVariant }}
              </v-icon>
            </template>
            <template v-else>
              <v-icon v-show="simpleFilter === SimpleFilterEnum.FILE" size="20">
                {{ mdiFileSearch }}
              </v-icon>
              <v-icon v-show="simpleFilter === SimpleFilterEnum.FOLDER" size="20">
                {{ mdiFolderSearch }}
              </v-icon>
            </template>
          </template>
        </SearchInput>
      </div>
      <div class="tw-w-10"></div>
      <v-tabs v-model="searchKind" density="compact" show-arrows center-active>
        <v-tab v-for="kind in settingStore.enabledKindFilters" :key="kind.id" :value="kind">
          {{ kind.label }}
        </v-tab>
      </v-tabs>
    </Header>

    <div class="tw-h-px">
      <v-progress-linear :active="loading" :indeterminate="loading" height="1"></v-progress-linear>
    </div>

    <div v-if="settingStore.isUseSubInput">
      <v-tabs v-model="searchKind" density="compact" height="36px">
        <v-tab v-for="kind in settingStore.enabledKindFilters" :key="kind.id" :value="kind">
          {{ kind.label }}
        </v-tab>
      </v-tabs>
    </div>

    <div
      class="tw-relative tw-w-full"
      :style="`height: calc(100% - 43px - 1px - ${!settingStore.isUseSubInput ? '49px' : '36px'})`"
    >
      <v-row class="tw-h-full tw-w-full" no-gutters>
        <v-col class="tw-relative tw-h-full">
          <FileList
            ref="fileListRef"
            :items="limitArray(list, resultMaxCount)"
            :item-height="itemHeight"
            :selected-index="selectedIndex"
            :list-mode="isListMode"
            :display-size="9"
            :is-keystroke="isCurrentScope"
            @update:selected-index="handleSelectChange"
            @open-item="menuActions.open"
            @open-item-in-finder="menuActions.openInFinder"
            @show-item-info="menuActions.showInfo"
            @quick-look-item="menuActions.quickLook"
            @copy-item="menuActions.copy"
            @copy-item-name="menuActions.copyName"
            @copy-item-path="menuActions.copyPath"
            @move-item-to-trash="menuActions.moveToTrash"
            @open-items="menuActions.open"
            @show-item-infos="menuActions.showInfo"
            @copy-items="menuActions.copy"
            @copy-item-names="menuActions.copyName"
            @copy-items-paths="menuActions.copyPath"
          ></FileList>

          <SideNumOverlay
            v-show="isShowListShortcuts"
            :item-count="Math.min(list.length, 9)"
            :item-height="itemHeight"
          />
        </v-col>
        <v-col class="tw-flex tw-h-full" :cols="5" v-if="isPreviewMode">
          <div
            class="tw-h-full tw-w-px tw-flex-none tw-bg-neutral-100 dark:tw-bg-neutral-950"
            v-if="fileInfo"
          ></div>

          <Preview
            :item="fileInfo"
            :find-words="findWords"
            :is-preview="isPreviewContent"
            :loading="previewLoading"
          ></Preview>
        </v-col>
      </v-row>

      <div
        v-show="!list.length"
        class="tw-absolute tw-left-0 tw-top-0 tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center"
      >
        <div class="tw-pointer-events-none tw-absolute tw-flex tw-h-full tw-w-full tw-justify-center tw-p-28">
          <v-img :src="emptyImg" />
        </div>
      </div>
    </div>

    <v-row no-gutters style="height: 43px" align="center">
      <v-col class="tw-flex tw-items-center">
        <Hover class="tw-ml-5">
          <div
            class="tw-px-3 tw-py-1"
            @click="
              () => {
                router.push('/setting')
                // 解决在返回后虚拟列表空白问题
                if (selectedIndex !== undefined) {
                  fileListRef?.locateTo(selectedIndex)
                }
              }
            "
            title="设置"
          >
            <v-icon size="default">{{ mdiCogOutline }}</v-icon>
          </div>
        </Hover>
        <div class="tw-w-2"></div>
        <Hover v-show="!isFindInTempScope && searchKind.id === KindFilterModel.ANY.id">
          <div
            class="tw-px-3 tw-py-1"
            :class="
              isShowRecent && !query
                ? 'tw-bg-neutral-200 hover:tw-bg-neutral-300 dark:tw-bg-neutral-700 hover:dark:tw-bg-neutral-600'
                : ''
            "
            :title="(query ? (isShowRecent ? '关闭' : '开启') : '') + '最近使用'"
            @click="handleRecentUsedSearch(!isShowRecent)"
          >
            <v-icon size="default">{{ mdiClockTimeNineOutline }}</v-icon>
          </div>
        </Hover>
        <div class="tw-w-3"></div>
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
          {{ getDisplayPath(tempDirectory) }}
        </span>
      </v-col>
      <v-col class="tw-flex tw-items-center tw-justify-center">
        <v-spacer v-if="isNoneSort" />
        <Hover v-else>
          <SortOrder
            class="tw-px-3 tw-py-1"
            v-model="sortRule.sortOrder"
            @update:model-value="handleSortOrderChange"
          />
        </Hover>
        <Hover>
          <SelectBox
            v-model="sortRule.propName"
            :items="sortProps"
            title="排序方式"
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
        <span v-show="list.length">
          <span>共搜索到 </span>
          <span
            v-if="!isUndefined(resultMaxCount) && list.length > resultMaxCount"
            v-text="resultMaxCount + '+'"
            :title="`搜索结果超过 ${resultMaxCount} 条，仅显示 ${resultMaxCount} 条`"
          >
          </span>
          <span v-else>{{ list.length }}</span>
          <span> 条</span>
        </span>
      </v-col>
    </v-row>
  </div>

  <v-navigation-drawer v-model="previewDrawer" temporary location="right" width="450">
    <Preview v-if="isListMode" :find-words="findWords" :item="fileInfo" :loading="previewLoading" />
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import {
  mdiMagnify,
  mdiCogOutline,
  mdiFormatListBulleted,
  mdiViewWeekOutline,
  mdiTextSearchVariant,
  mdiFileSearch,
  mdiFolderSearch,
  mdiClockTimeNineOutline
} from '@mdi/js'
import Preview from '@/components/home/Preview.vue'
import DisplayMode from '@/components/home/DisplayMode.vue'
import SortOrder from '@/components/home/SortOrder.vue'
import FileList from '@/components/home/FileList.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import Header from '@/components/common/Header.vue'
import SearchInput from '@/components/home/SearchInput.vue'
import SideNumOverlay from '@/components/home/SideNumOverlay.vue'
import Hover from '@/components/common/Hover.vue'
import { computed, ref, watch, reactive, onBeforeUnmount, toRaw, onActivated, toRef } from 'vue'
import debounce from 'lodash/debounce'
import isUndefined from 'lodash/isUndefined'
import { onKeyDown, onStartTyping, useWindowFocus } from '@vueuse/core'
import {
  DisplayModeEnum,
  SortOrderEnum,
  FilePreviewType,
  ScopeName,
  FindEndingStatus,
  SimpleFilterEnum
} from '@/constant'
import { useCommonStore, useSettingStore } from '@/store'
import { toMap, limitArray, getFinalIndex } from '@/utils/collections'
import {
  highlightFileInfo,
  highlightFileInfos,
  mapToFileInfo,
  sortFileInfos,
  SortRule,
  getCustomKeywordRegExp,
  getDisplayPath
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
  openInfoWindow,
  findPush,
  findCallback,
  getFileIconBase64,
  openFile,
  existsFile,
  isLocalFile
} from '@/preload'
import {
  shellShowItemInFolder,
  copyText,
  onPluginEnter,
  onPluginOut,
  getPath,
  readCurrentFolderPath,
  createBrowserWindow,
  showMainWindow,
  Action,
  onMainPush,
  MainPushItem,
  setSubInput,
  subInputSelect,
  hideMainWindow,
  copyFile,
  subInputFocus,
  setSubInputValue,
  showNotification
} from 'utools-api'
import emptyImg from '@/assets/empty_inbox.svg'
import {
  buildQuery,
  buildRecentUsedQuery,
  getSearchTextPattern,
  getSimpleFilter,
  splitKeyword
} from '@/utils/query'
import { copyFromPath } from '@/utils/common'
import { useHotkeysScope, useHotkeys } from '@/hooks/useHotkeys'
import { useKeyLongPress } from '@/hooks/useKeyLongPress'
import { ContentType } from '@/constant'
import { BaseFileInfo, FindFileMetadata, KindFilterModel, PreviewFileInfo } from '@/models'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { useLastState } from '@/hooks/useLastState'
import { onNonFirstActivated } from '@/hooks/useActivated'
import { useEventListener } from '@/hooks/useEventListener'
import { closeContextMenu } from '@/hooks/useContextMenu'

const toast = useToast()

const router = useRouter()
const commonStore = useCommonStore()
const settingStore = useSettingStore()

const previewDrawer = ref(false)
const query = ref<string>('')

const resultMaxCount = ref<number | undefined>()

const isShowRecent = toRef(commonStore, 'isShowRecent')

async function handleRecentUsedSearch(show: boolean) {
  if (show !== isShowRecent.value) {
    query.value = ''
    commonStore.setIsShowRecent(show)
  }
  if (show) {
    const limit = 300
    resultMaxCount.value = limit
    const data = await find(
      buildRecentUsedQuery(-1),
      settingStore.getSearchScope(searchScopeId.value).paths,
      null,
      limit + 1
    )
    refreshList(
      sortFileInfos(
        data.map((item) => mapToFileInfo(item)),
        'usedDate',
        SortOrderEnum.DESC
      )
    )
  } else {
    resetResult()
  }
}

function startRecentUsedSearch() {
  // 如果没有搜索词，没有临时搜索目录，并且在“不筛选”，则显示
  if (!query.value && !isFindInTempScope.value && notKindFilter.value) {
    handleRecentUsedSearch(true)
  }
}

const tempDirectory = ref<string>('')
const isFindInTempScope = computed(() => !!tempDirectory.value)
const isShowFilesInTempScope = computed(() => isFindInTempScope.value && settingStore.isShowFilesInTempDir)
const simpleFilter = computed(() => getSimpleFilter(query.value))

const searchScopeId = toRef(settingStore, 'searchRoot')
const searchScopeDirectories = computed<string[]>(() => {
  if (isFindInTempScope.value) {
    return [tempDirectory.value]
  }
  return settingStore.getSearchScope(searchScopeId.value).paths
})
const searchScopeTitle = computed(() => searchScopeDirectories.value.join(','))

function handleSearchScopeChange() {
  search(query.value)
}

function handleSearchAttrChange(isFindContent: boolean) {
  settingStore.isFindFileContent = isFindContent

  // 如果没有搜索词，则不搜索
  if (!query.value) return

  search(query.value)
}

const searchKind = ref(KindFilterModel.ANY)
const searchKindIndex = computed(() =>
  settingStore.enabledKindFilters.findIndex((kind) => kind.id === searchKind.value.id)
)
const notKindFilter = computed(() => searchKind.value.id === KindFilterModel.ANY.id)

watch(searchKind, () => {
  search(query.value)
})

// 只监听已启用的类型筛选改变
watch(settingStore.enabledKindFilters, () => {
  searchKind.value = KindFilterModel.ANY
})

const displayModes = reactive<DisplayModeItem[]>([
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
const isListMode = computed(() => currentDisplayMode.value === DisplayModeEnum.LIST)
const isPreviewMode = computed(() => currentDisplayMode.value === DisplayModeEnum.PREVIEW)

const isPreviewContent = toRef(commonStore, 'isPreviewContent')

type SortObject = BaseFileInfo & { none: any }
const sortProps = reactive<Array<{ label: string; value: keyof SortObject }>>([
  { label: '无', value: 'none' },
  { label: '名称', value: 'name' },
  { label: '类型', value: 'type' },
  { label: '打开时间', value: 'usedDate' },
  { label: '修改时间', value: 'updateDate' },
  { label: '创建时间', value: 'createDate' },
  { label: '大小', value: 'size' }
])

const sortRule = reactive<SortRule<SortObject>>({
  propName: 'none',
  sortOrder: SortOrderEnum.DESC
})

const isNoneSort = computed(() => sortRule.propName === 'none')

function handleSortOrderChange(val: string | number) {
  // 在开启最近使用的情况下，如果不是临时搜索目录，且没有类型筛选和查询词，则不需要排序
  if (isShowRecent.value && !isShowFilesInTempScope.value && notKindFilter.value && !query.value) {
    return
  }

  const { propName, sortOrder } = sortRule
  // 排序字段修改、不排序需要重新搜索
  if (typeof val === 'string' || propName === 'none') {
    search(query.value)
  } else {
    // 排序类型修改，则重新排序
    refreshList(sortFileInfos(list.value, propName, sortOrder))
  }
}

const loading = ref(false)
const itemHeight = ref(50)
const list = ref<Array<BaseFileInfo>>([])
const selectedIndex = ref<number>()
const fileInfo = ref<PreviewFileInfo>()
const previewLoading = ref(false)
const findWords = ref<string[]>([])

function handleSelectChange(index?: number) {
  selectedIndex.value = index
  if (isUndefined(index)) {
    fileInfo.value = undefined
  } else {
    loadFileInfo(list.value[index])
  }
}

async function loadFileInfo(item: BaseFileInfo) {
  if (item.path === fileInfo.value?.path) {
    return
  }

  fileInfo.value = {
    ...item,
    thumbnail: getFileIconBase64(item.path, item.type),
    typeTree: [],
    isCloudFile: fileInfo.value?.isCloudFile ?? false,
    previewType: fileInfo.value?.previewType ?? FilePreviewType.NONE
  }

  const res = await getFileMetadata(item.path)
  fileInfo.value.typeTree = res.kMDItemContentTypeTree ?? []
  fileInfo.value.pixelWidth = res.kMDItemPixelWidth
  fileInfo.value.pixelHeight = res.kMDItemPixelHeight
  fileInfo.value.itemCount = res.kMDItemFSNodeCount
  fileInfo.value.tags = res.kMDItemUserTags
  fileInfo.value.version = res.kMDItemVersion
  fileInfo.value.copyright = res.kMDItemCopyright
  fileInfo.value.architectures = res.kMDItemExecutableArchitectures
  fileInfo.value.createDate = item.createDate ?? res.kMDItemContentCreationDate
  fileInfo.value.updateDate = item.updateDate ?? res.kMDItemContentModificationDate
  fileInfo.value.usedDate = item.usedDate ?? res.kMDItemLastUsedDate

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

    if (fileInfo.value.previewType === FilePreviewType.NONE) {
      if (fileInfo.value.typeTree.includes(ContentType.TEXT)) {
        fileInfo.value.previewType = FilePreviewType.TEXT
      }
    }
  }

  if (!isLocalFile(fileInfo.value.path)) {
    fileInfo.value.previewType = FilePreviewType.NONE
    fileInfo.value.isCloudFile = true
  } else {
    fileInfo.value.isCloudFile = false
  }

  await loadFileContent(fileInfo.value)
  if (settingStore.isFindFileContent && fileInfo.value.previewType === FilePreviewType.TEXT) {
    findWords.value = getSearchTextPattern(query.value).words
  } else {
    findWords.value = []
  }
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
  if ((isPreviewMode.value && isPreviewContent.value) || (isListMode.value && previewDrawer.value)) {
    if (import.meta.env.DEV) {
      console.log('[function] loadFileContent with', toRaw(item))
    }

    previewLoading.value = true
    try {
      switch (item.previewType) {
        case FilePreviewType.FOLDER:
          const fileList = await readFileList(item.path)
          if (fileList) {
            item.files = fileList
            item.itemCount = fileList.length
          }
          break
        case FilePreviewType.TEXT:
          const { text, size, partialSize, encoding } = await readFilePartText(item.path)
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

function resetResult() {
  killFind()
  loading.value = false
  // 清空结果列表
  list.value = []
  fileInfo.value = undefined
  resultMaxCount.value = undefined
}

function resetSearch() {
  resetResult()
  if (lastState.value) {
    lastState.value = null
  }
  if (isShowRecent.value) {
    startRecentUsedSearch()
  }
}

const { lastState, isEqualLast } = useLastState<{
  query: string
  kindFilter: KindFilterModel
  scopes: string[]
  sortName: keyof SortObject
  keywordPrefix: string
  isFindFileContent: boolean
}>(
  (a, b) =>
    a.kindFilter.id === b.kindFilter.id &&
    a.query === b.query &&
    a.keywordPrefix === b.keywordPrefix &&
    a.sortName === b.sortName &&
    a.scopes.length === b.scopes.length &&
    a.isFindFileContent === b.isFindFileContent &&
    a.scopes.every((value, index) => value === b.scopes[index])
)
function search(query: string, limit?: number) {
  let searchText = query

  const { statement, keyword: keywordPrefix } = splitKeyword(searchText, settingStore.searchKey)

  // 列出所有文件的情况：
  // 1. 不在“不筛选”类型选项卡，并且开启了在类型筛选下列出所有文件
  // 2. 在“不筛选”类型选项卡，并且开启了在临时目录列出所有文件
  const isListAll = () =>
    (!notKindFilter.value && settingStore.isShowFilesInKind) ||
    (notKindFilter.value && isShowFilesInTempScope.value)

  // 如果搜索文本为空，特殊处理
  if (!searchText || !statement) {
    if (isListAll()) {
      listAll()
    } else {
      // 重置搜索
      resetSearch()
    }
    return
  }

  // 在非列出所有文件的情况下，只输入空字符就不搜索
  if (
    (!statement.trim() && !isListAll()) ||
    isEqualLast({
      // 仅在临时目录下列出所有文件时，才不去掉结尾的空白字符
      query: isShowFilesInTempScope.value ? statement : statement.trimEnd(),
      keywordPrefix: keywordPrefix,
      kindFilter: searchKind.value,
      sortName: sortRule.propName,
      scopes: searchScopeDirectories.value,
      isFindFileContent: settingStore.isFindFileContent
    })
  ) {
    if (!statement.trim()) resetSearch()
    return
  }

  searchText = statement

  const currentQuery = buildQuery(searchText, searchKind.value, settingStore.isFindFileContent, true)

  loading.value = true

  const searchPattern = settingStore.nameHighlight.enabled ? getSearchTextPattern(searchText) : null
  const keywordPrefixMap = toMap(
    settingStore.keyList,
    (item) => item.key,
    (item) => item.regex
  )

  const prefixRegExp = getCustomKeywordRegExp(keywordPrefix, keywordPrefixMap)

  const newLimit = isUndefined(limit) ? undefined : limit + 1
  // 即时搜索
  if (isNoneSort.value) {
    if (import.meta.env.DEV) {
      console.log('[function] findCallback with', {
        query: currentQuery,
        directories: toRaw(searchScopeDirectories.value),
        filter: prefixRegExp,
        limit: newLimit
      })
    }
    const mapAndHighlight: (data: FindFileMetadata) => BaseFileInfo = !searchPattern
      ? (data) => mapToFileInfo(data)
      : (data) => highlightFileInfo(mapToFileInfo(data), searchPattern, settingStore.nameHighlight.style)
    findCallback(
      currentQuery,
      searchScopeDirectories.value,
      (data, length, endingStatus) => {
        if (data) {
          const item = mapAndHighlight(data)
          // 第一个数据
          if (length === 1) {
            resultMaxCount.value = limit
            refreshList([item])
          } else {
            list.value.push(item)
          }
        } else {
          // 结束
          switch (endingStatus) {
            case FindEndingStatus.NORMAL:
              loading.value = false
              if (length === 0) resetSearch()
              if (import.meta.env.DEV) {
                console.log('[function] findCallback finished')
              }
              break
            case FindEndingStatus.INTERRUPTED:
              resetResult()
              if (import.meta.env.DEV) {
                console.log('[function] findCallback interrupted')
              }
              break
          }
        }
      },
      prefixRegExp,
      newLimit
    )
    return
  }
  if (import.meta.env.DEV) {
    console.log('[function] find with', {
      query: currentQuery,
      directories: toRaw(searchScopeDirectories.value),
      filter: prefixRegExp,
      limit: newLimit
    })
  }
  find(currentQuery, searchScopeDirectories.value, prefixRegExp, newLimit).then((res) => {
    const mappedList = res.map(mapToFileInfo)
    const sortList = () => {
      if (sortRule.propName === 'none') {
        return mappedList
      }
      return sortFileInfos(mappedList, sortRule.propName, sortRule.sortOrder)
    }
    const newList = sortList()

    resultMaxCount.value = limit
    if (searchPattern) {
      refreshList(highlightFileInfos(newList, searchPattern, settingStore.nameHighlight.style))
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
    handleSelectChange(0)
    fileListRef.value?.locateTo(0)
  } else {
    handleSelectChange(undefined)
  }
}

const delayedSearch = debounce(() => search(query.value), 500, {
  leading: false,
  trailing: true
})
const instantSearch = debounce(() => search(query.value), 50, {
  leading: false,
  trailing: true
})

function handleQueryChange() {
  if (settingStore.isAutoSearch) {
    // 排序字段为“无”时，开始即时搜索
    if (isNoneSort.value) {
      instantSearch()
    } else {
      delayedSearch()
    }
  }
}

const searchInputRef = ref<ComponentRef<typeof SearchInput>>(null)

function focusInput() {
  if (settingStore.isUseSubInput) {
    subInputFocus()
  } else {
    searchInputRef.value?.focus()
  }
}

function selectText() {
  if (settingStore.isUseSubInput) {
    setTimeout(() => subInputSelect())
  } else {
    searchInputRef.value?.selectText()
  }
}

function unselectText() {
  if (settingStore.isUseSubInput) {
    setSubInputValue(query.value)
  } else {
    searchInputRef.value?.unselectText()
  }
}

function getSelectedList() {
  return fileListRef.value?.getSelectedList() ?? []
}

function isMultipleSelected() {
  return getSelectedList().length > 1
}

function checkFile(path: string) {
  if (!existsFile(path)) {
    const msg = `文件 “${path}” 不存在！`
    showNotification(msg)
    throw new Error(msg)
  }
}

const menuActions = reactive({
  open() {
    if (isMultipleSelected()) {
      const paths = getSelectedList().map((index) => list.value[index].path)
      for (const path of paths) {
        checkFile(path)
        openFile(path)
      }
    } else {
      if (isUndefined(selectedIndex.value)) return
      const { path } = list.value[selectedIndex.value]
      checkFile(path)
      openFile(path)
    }
    setTimeout(() => hideMainWindow())
  },
  openInFinder() {
    if (!isMultipleSelected()) {
      if (isUndefined(selectedIndex.value)) return
      const { path } = list.value[selectedIndex.value]
      checkFile(path)
      shellShowItemInFolder(path)
    }
  },
  showInfo() {
    if (isMultipleSelected()) {
      const paths = getSelectedList().map((index) => list.value[index].path)
      for (const path of paths) {
        checkFile(path)
      }
      hideMainWindow()
      openInfoWindow(paths)
    } else {
      if (isUndefined(selectedIndex.value)) return
      const { path } = list.value[selectedIndex.value]
      checkFile(path)
      hideMainWindow()
      openInfoWindow(path)
    }
  },
  quickLook() {
    if (!isMultipleSelected()) {
      if (isUndefined(selectedIndex.value)) return
      quickLook()
    }
  },
  copy() {
    if (isMultipleSelected()) {
      const paths = getSelectedList().map((index) => list.value[index].path)
      copyFile(paths)
    } else {
      if (isUndefined(selectedIndex.value)) return
      const { path, type } = list.value[selectedIndex.value]
      copyFromPath(path, type === ContentType.IMAGE)
    }
    setTimeout(() => hideMainWindow())
  },
  copyName() {
    if (isMultipleSelected()) {
      copyText(
        getSelectedList()
          .map((index) => list.value[index].name)
          .join('\n')
      )
    } else {
      if (isUndefined(selectedIndex.value)) return
      copyText(list.value[selectedIndex.value].name)
    }
    setTimeout(() => hideMainWindow())
  },
  copyPath() {
    if (isMultipleSelected()) {
      copyText(
        getSelectedList()
          .map((index) => list.value[index].path)
          .join('\n')
      )
    } else {
      if (isUndefined(selectedIndex.value)) return
      copyText(list.value[selectedIndex.value].path)
    }
    setTimeout(() => hideMainWindow())
  },
  moveToTrash() {
    if (isMultipleSelected()) {
      const indexes = getSelectedList()
      indexes.sort((a, b) => b - a)
      trashFile(indexes.map((index) => list.value[index].path))
      for (const index of indexes) {
        list.value.splice(index, 1)
      }
      handleSelectChange(getFinalIndex(list.value, indexes[indexes.length - 1]))
    } else {
      if (isUndefined(selectedIndex.value)) return
      trashFile(list.value[selectedIndex.value].path)
      list.value.splice(selectedIndex.value, 1)
      handleSelectChange(getFinalIndex(list.value, selectedIndex.value))
    }
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
onNonFirstActivated(() => {
  createSubInputAfterCheck()
  focusInput()
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
useHotkeys('command+enter', () => menuActions.openInFinder(), {
  scope: ScopeName.HOME
})
useHotkeys('command+y', () => menuActions.quickLook(), {
  scope: ScopeName.HOME
})
useHotkeys('command+i', () => menuActions.showInfo(), { scope: ScopeName.HOME })
useHotkeys('command+o', () => menuActions.open(), { scope: ScopeName.HOME })
useHotkeys(
  'command+c',
  (e) => {
    const isSelected = () => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT') {
        const input = target as HTMLInputElement
        return (input.selectionEnd ?? 0) - (input.selectionStart ?? 0) !== 0
      }
      return !window.getSelection()?.isCollapsed
    }
    // 未选中文本时，才拷贝
    if (!isSelected()) {
      menuActions.copy()
    }
  },
  { scope: ScopeName.HOME }
)
useHotkeys('command+shift+c', () => menuActions.copyName(), {
  scope: ScopeName.HOME
})
useHotkeys('command+option+c', () => menuActions.copyPath(), {
  scope: ScopeName.HOME
})
useHotkeys('command+f', () => focusInput(), { scope: ScopeName.HOME })

onStartTyping((e) => {
  if (isCurrentScope.value) {
    unselectText()
    focusInput()
    if (settingStore.isUseSubInput) {
      setSubInputValue(query.value + e.key)
    }
  }
})

onKeyDown(['Meta', 'ArrowRight'], (e) => {
  if (e.metaKey && e.key === 'ArrowRight') {
    // 只在列表模式有效
    if (!isListMode.value) return
    previewDrawer.value = !previewDrawer.value
  }
})

onKeyDown(['ArrowLeft', 'ArrowRight'], (e) => {
  if (!isCurrentScope.value) return
  if (e.metaKey || e.altKey || e.ctrlKey) return
  if (!settingStore.isUseSubInput) return

  const len = settingStore.enabledKindFilters.length
  if (e.key === 'ArrowRight') {
    const index = (searchKindIndex.value + 1) % len
    searchKind.value = settingStore.enabledKindFilters[index]
  } else {
    const index = (searchKindIndex.value - 1 + len) % len
    searchKind.value = settingStore.enabledKindFilters[index]
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
    closeContextMenu()
    // 对齐窗口的数据项
    fileListRef.value?.locateToView()
  }
  if (e.metaKey && '1' <= e.key && e.key <= '9') {
    fileListRef.value?.clearSelectedIndexes()
    fileListRef.value?.scrollToView(parseInt(e.key) - 1)
    if (settingStore.isOpenAsShortcutting) {
      menuActions.open()
    }
  }
})

const isShowListShortcuts = ref(false)
const windowFocus = useWindowFocus()
useKeyLongPress(
  'Meta',
  () => {
    if (!isCurrentScope.value) return
    // 只有窗口获得焦点才显示
    if (windowFocus.value) {
      isShowListShortcuts.value = true
    }
  },
  (e, isKeyUp) => {
    if (!isCurrentScope.value) return
    // 切换左右 ⌘ 键时不隐藏
    if (e.key !== 'Meta' || (isKeyUp && !e.metaKey)) {
      isShowListShortcuts.value = false
    }
  },
  500
)

useEventListener('click', () => {
  isShowListShortcuts.value = false
})

watch(windowFocus, () => {
  // 窗口失去焦点
  if (!windowFocus.value) {
    isShowListShortcuts.value = false
  }
})

const qlWin = createBrowserWindow('quicklook.html', {
  width: 0,
  height: 0,
  x: 1200,
  y: 80,
  show: false,
  autoHideMenuBar: true,
  webPreferences: {
    devTools: false
  }
})

function quickLook() {
  if (!fileInfo.value) return

  qlWin.show()
  qlWin.closeFilePreview()
  setTimeout(() => {
    qlWin.previewFile(fileInfo.value!.path, fileInfo.value!.name)
    qlWin.hide()
    showMainWindow()
  })
}

useHotkeys(
  'Space',
  (e) => {
    const target = e.target as HTMLElement
    if (['INPUT', 'AUDIO', 'VIDEO'].includes(target.tagName)) return
    e.preventDefault()
    quickLook()
  },
  { scope: ScopeName.HOME }
)

onBeforeUnmount(() => {
  qlWin.destroy()
})

const isInputQuery = ref(false)

function regexKeywordWith(payload: string) {
  const re = /^[ '\u2018\u2019]/
  return re.test(payload) ? payload.replace(re, '') : null
}

async function init(action: Action) {
  if (action.type !== 'text') router.replace('/')

  switch (action.type) {
    case 'files':
      tempDirectory.value = action.payload[0].path
      break
    case 'window':
      try {
        tempDirectory.value = await readCurrentFolderPath()
      } catch (err) {
        console.error(err)
        tempDirectory.value = getPath('desktop')
      }
      break
    case 'regex':
      const q = regexKeywordWith(action.payload)
      if (q !== null) {
        query.value = q
        isInputQuery.value = true
      } else if (await existsDir(action.payload)) {
        tempDirectory.value = action.payload
      }
      break
    case 'over':
      query.value = action.payload
      isInputQuery.value = true
      break
  }
}

const lastPushQuery = useLastState<string>()
let lastPushItems: MainPushItem[] = []
onMainPush?.(
  async (action: Action) => {
    const q = regexKeywordWith(action.payload as string)?.trimEnd()
    // 过滤空字符串和 `*`
    if (!q || /^\*+$/.test(q)) return []
    if (lastPushQuery.isEqualLast(q)) return lastPushItems

    const currentQuery = buildQuery(q, KindFilterModel.ANY, false, false)
    const limit = 6
    const directories = settingStore.getSearchScope(searchScopeId.value).paths
    if (import.meta.env.DEV) {
      console.log('[function] findPush', {
        query: currentQuery,
        directories: toRaw(directories),
        limit: limit + 1
      })
    }
    const arr = await findPush(currentQuery, directories, limit + 1)
    return (lastPushItems =
      arr.length > limit ? arr.slice(0, 5).concat({ text: '进入插件查看更多...', enter: true }) : arr)
  },
  (action) => {
    if (action.option.enter) {
      return true
    }
    if (action.option.title) {
      openFile(action.option.title)
    }
  }
)

function createSubInputAfterCheck() {
  if (!isCurrentScope.value) return

  if (settingStore.isUseSubInput) {
    setSubInput(
      (e) => {
        query.value = e.text
        handleQueryChange()
      },
      '搜索',
      true
    )
    setSubInputValue(query.value)
  }
}

onPluginEnter(async (action: Action) => {
  // 更新搜索范围
  commonStore.refreshDefaultSearchScopes()

  const lastQuery = query.value
  isInputQuery.value = false
  await init(action)
  focusInput()
  if (isInputQuery.value) {
    search(query.value)
    unselectText()
  } else {
    if (lastQuery) {
      selectText()
    }
  }

  if (isFindInTempScope.value) {
    query.value = ''
  }

  if (isShowRecent.value) {
    startRecentUsedSearch()
  }

  createSubInputAfterCheck()

  if (isShowFilesInTempScope.value) {
    listAll()
  }
})
onPluginOut(() => {
  if (isFindInTempScope.value) {
    resetSearch()
    query.value = ''
    tempDirectory.value = ''
  } else {
    killFind()
  }
  qlWin.hide()
})
</script>

<style lang="scss" scoped></style>
