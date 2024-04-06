<template>
  <v-virtual-scroll
    ref="scrollRef"
    :items="items"
    :item-height="itemHeight"
    height="100%"
    class="tw-w-full"
    @scroll="handleScroll"
  >
    <template #default="{ item, index }">
      <div
        class="tw-flex tw-w-full tw-select-none tw-items-center"
        @contextmenu="handleContextMenu($event, index)"
        @click="handleItemClick(index)"
        @dblclick="handleItemDoubleClick"
        draggable="true"
        @dragstart="handleItemDragStart($event, index)"
      >
        <v-list-item
          width="100%"
          :height="itemHeight"
          lines="one"
          variant="text"
          :base-color="isDark ? 'grey-lighten-5' : 'grey-darken-4'"
          :active="selectedIndex === index || hasSelected(index)"
        >
          <template #prepend>
            <v-avatar :image="getIcon(item)" :size="itemHeight - 10" :rounded="0" />
          </template>
          <template #title>
            <span class="tw-font-semibold">
              <span v-html="item.displayName"></span>
            </span>
          </template>
          <template #subtitle>
            <div class="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">
              <span v-html="item.displayPath"></span>
            </div>
          </template>
          <template #append v-if="listMode">
            <div class="tw-w-7"></div>
            <div class="tw-font-mono tw-text-sm tw-text-neutral-500 dark:tw-text-neutral-300">
              <div>{{ formatDatetime(item.updateDate) }}</div>
              <div class="tw-text-right" v-show="item.size !== null">
                {{ formatBytesToHuman(item.size ?? 0) }}
              </div>
            </div>
          </template>
        </v-list-item>
      </div>
    </template>
  </v-virtual-scroll>
</template>

<script lang="ts" setup>
import { BaseFileInfo } from '@/models'
import { formatDatetime, formatBytesToHuman } from '@/utils/strings'
import { onKeyDown, useKeyModifier } from '@vueuse/core'
import debounce from 'lodash/debounce'
import { computed, ref, watch, reactive } from 'vue'
import { VVirtualScroll } from 'vuetify/components'
import { useSettingStore } from '@/store'
import { startDrag } from 'utools-api'
import { SortedSet, isLegalIndex } from '@/utils/collections'
import { getFileIconBase64 } from '@/preload'
import { useDark } from '@/hooks/useDark'
import { useContextMenu } from '@/hooks/useContextMenu'
import { useEventListener } from '@/hooks/useEventListener'

const { isDark } = useDark()
const settingStore = useSettingStore()

const shiftState = useKeyModifier('Shift')
const metaState = useKeyModifier('Meta')

const scrollRef = ref<ComponentRef<typeof VVirtualScroll>>(null)

const props = withDefaults(
  defineProps<{
    items: Array<BaseFileInfo>
    itemHeight: number
    displaySize: number
    selectedIndex?: number
    listMode?: boolean
    isKeystroke?: boolean
  }>(),
  {
    selectedIndex: 0,
    listMode: false,
    isKeystroke: true
  }
)

function getIcon(item: BaseFileInfo) {
  return settingStore.isUseSystemFileIcon ? getFileIconBase64(item.path, item.type) : item.icon
}

const maxIndexInWindow = computed(() => props.displaySize - 1)

const emit = defineEmits<{
  'update:selectedIndex': [index: number]
  openItem: []
  openItemInFinder: []
  showItemInfo: []
  quickLookItem: []
  copyItem: []
  copyItemName: []
  copyItemPath: []
  moveItemToTrash: []
  openItems: []
  showItemInfos: []
  copyItems: []
  copyItemNames: []
  copyItemsPaths: []
}>()

const multipleMenuItems = reactive<MenuItem[]>([
  { label: '打开', click: () => emit('openItems') },
  { type: 'separator' },
  { label: '显示简介', click: () => emit('showItemInfos') },
  { type: 'separator' },
  { label: '拷贝', click: () => emit('copyItems') },
  { label: '拷贝名称', click: () => emit('copyItemNames') },
  { label: '拷贝路径', click: () => emit('copyItemsPaths') }
])
const singleMenuItems = reactive<MenuItem[]>([
  { label: '打开', click: () => emit('openItem') },
  { label: '在访达中显示', click: () => emit('openItemInFinder') },
  { type: 'separator' },
  { label: '显示简介', click: () => emit('showItemInfo') },
  { label: '快速查看', click: () => emit('quickLookItem') },
  { type: 'separator' },
  { label: '拷贝', click: () => emit('copyItem') },
  { label: '拷贝名称', click: () => emit('copyItemName') },
  { label: '拷贝路径', click: () => emit('copyItemPath') },
  { type: 'separator' },
  { label: '移到废纸篓', click: () => emit('moveItemToTrash') }
])
const { showMenu, closeMenu } = useContextMenu()

function isMultipleSelected(index: number) {
  return selectedSet.size() !== 1 && selectedSet.has(index)
}

useEventListener('keydown', (e) => {
  if (!['Shift', 'Meta', 'Alt', 'Control'].includes(e.key)) {
    closeMenu()
  }
})

function handleContextMenu(e: MouseEvent, index: number) {
  e.preventDefault()

  if (isMultipleSelected(index)) {
    showMenu(e, multipleMenuItems)
  } else {
    emit('update:selectedIndex', index)
    showMenu(e, singleMenuItems)
  }
}

function handleItemDragStart(e: DragEvent, index: number) {
  e.preventDefault()
  if (isMultipleSelected(index)) {
    const paths = selectedSet.getList().map((index) => props.items[index].path)
    startDrag(paths)
  } else {
    emit('update:selectedIndex', index)
    startDrag(props.items[index].path)
  }
}

function handleItemClick(index: number) {
  if (!shiftState.value && !metaState.value) {
    clearSelectedSet()
  }
  if (metaState.value) {
    if (selectedSet.isEmpty()) {
      selectedSet.add(props.selectedIndex)
      selectedSet.add(index)
      emit('update:selectedIndex', index)
    } else if (selectedSet.has(index)) {
      selectedSet.remove(index)
      if (selectedSet.isEmpty()) {
        selectedSet.add(0)
        emit('update:selectedIndex', 0)
      } else {
        emit('update:selectedIndex', selectedSet.last())
      }
    } else {
      selectedSet.add(index)
      emit('update:selectedIndex', index)
    }
  } else {
    emit('update:selectedIndex', index)
  }
}

function handleItemDoubleClick() {
  emit('openItem')
}

const firstIndexInWindow = ref(0)
const handleScroll = debounce((e: Event) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target as HTMLDivElement
  firstIndexInWindow.value = Math.round(scrollTop / props.itemHeight)
  if (import.meta.env.DEV && scrollTop + clientHeight === scrollHeight) {
    console.log('scroll end')
  }
}, 30)

function locateTo(index: number) {
  scrollRef.value?.scrollToIndex(index)
}

let posInWindow = 0

function refreshPosition(index: number) {
  if (firstIndexInWindow.value <= index && index < firstIndexInWindow.value + props.displaySize) {
    posInWindow = index - firstIndexInWindow.value
  }
}

function incrementPosition() {
  return (posInWindow = Math.min(posInWindow + 1, maxIndexInWindow.value)) === maxIndexInWindow.value
}

function decrementPosition() {
  return (posInWindow = Math.max(posInWindow - 1, 0)) === 0
}

/**
 * 定位到窗口最顶行
 */
function locateToStart(index: number) {
  posInWindow = 0
  locateTo(index)
}

/**
 * 定位到窗口最底行
 */
function locateToEnd(index: number) {
  posInWindow = maxIndexInWindow.value
  locateTo(Math.max(index - maxIndexInWindow.value, 0))
}

/**
 * 判断已选择行在可视窗口的上方（-1）、下方（1）、还是在里面（0）
 */
function compareSelected(selectedIndex: number) {
  if (selectedIndex < firstIndexInWindow.value) return -1
  if (selectedIndex > Math.min(firstIndexInWindow.value + maxIndexInWindow.value, props.items.length - 1))
    return 1
  return 0
}

function scrollTo(index: number) {
  if (isLegalIndex(props.items, index)) {
    emit('update:selectedIndex', index)
    locateTo(index)
  }
}

const selectedSet = reactive(new SortedSet<number>())

function clearSelectedSet() {
  selectedSet.clear()
}

function hasSelected(index: number) {
  return selectedSet.has(index)
}

function setSelectedRange(from: number, to: number) {
  if (from > to) {
    for (let i = from; i >= to; i--) {
      selectedSet.add(i)
    }
  } else {
    for (let i = from; i <= to; i++) {
      selectedSet.add(i)
    }
  }
}

watch(
  () => props.items,
  () => clearSelectedSet()
)

watch(
  () => props.selectedIndex,
  (newValue, oldValue) => {
    if (metaState.value) return
    if (shiftState.value) {
      if (selectedSet.isEmpty()) {
        setSelectedRange(oldValue, newValue)
      } else {
        const first = selectedSet.first()
        clearSelectedSet()
        setSelectedRange(first, newValue)
      }
    } else {
      clearSelectedSet()
      selectedSet.add(newValue)
    }
  }
)

onKeyDown(['Meta', 'ArrowUp', 'ArrowDown'], (e) => {
  if (!props.isKeystroke) return

  e.preventDefault()
  if (e.metaKey && e.key === 'Meta') return

  if (!shiftState.value) {
    clearSelectedSet()
  }

  if (e.metaKey) {
    return scrollTo(e.key === 'ArrowUp' ? 0 : props.items.length - 1)
  }

  refreshPosition(props.selectedIndex)

  let index
  if (e.key === 'ArrowUp') {
    index = Math.max(props.selectedIndex - 1, 0)
    emit('update:selectedIndex', index)

    if (decrementPosition()) {
      locateToStart(index)
    }
  } else {
    index = Math.min(props.selectedIndex + 1, props.items.length - 1)
    emit('update:selectedIndex', index)

    if (incrementPosition()) {
      locateToEnd(index)
    }
  }
  const compare = compareSelected(index)
  if (compare < 0) {
    locateToStart(index)
  } else if (compare > 0) {
    locateToEnd(index)
  }
})

defineExpose({
  locateTo,
  locateToView() {
    locateTo(firstIndexInWindow.value)
  },
  scrollToView(offset: number) {
    const index = firstIndexInWindow.value + offset
    if (isLegalIndex(props.items, index)) {
      emit('update:selectedIndex', index)
    }
  },
  clearSelectedIndexes() {
    clearSelectedSet()
  },
  getSelectedList() {
    return selectedSet.getList()
  }
})
</script>

<style lang="scss" scoped>
.active {
  @apply tw-bg-blue-500 tw-text-white;
}
</style>
