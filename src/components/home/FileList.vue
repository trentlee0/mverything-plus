<template>
  <v-virtual-scroll
    ref="scrollRef"
    :items="items"
    :item-height="itemHeight"
    height="100%"
    class="tw-w-full"
    @scroll="handleScroll"
  >
    <template #default="{ item, index }: { item: BaseFileInfo, index: number }">
      <div
        class="tw-flex tw-w-full tw-cursor-pointer tw-select-none tw-items-center"
        @contextmenu="onContextMenu($event, index)"
        @mouseover="handleMouseEnter(index)"
        @click="handleItemClick(index, item)"
        @dblclick="contextActions.open"
        draggable="true"
        @dragstart="handleDragStart($event, index, item)"
      >
        <v-list-item
          width="100%"
          :height="itemHeight"
          lines="one"
          :color="selectedIndex === index ? 'blue' : ''"
          :active="selectedIndex === index"
        >
          <template #prepend>
            <v-avatar
              :image="getIcon(item)"
              :size="itemHeight - 10"
              :rounded="0"
            />
          </template>
          <template #title>
            <span class="tw-font-bold">
              <span
                v-if="item.nameHighlight"
                v-html="item.nameHighlight"
              ></span>
              <span v-else>
                {{ item.name }}
              </span>
            </span>
          </template>
          <template #subtitle>
            <div
              class="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap"
            >
              {{ item.path }}
            </div>
          </template>
          <template #append v-if="listMode">
            <div class="tw-w-7"></div>
            <div
              class="tw-font-mono tw-text-sm tw-text-neutral-500 dark:tw-text-neutral-300"
            >
              <div>{{ formatDatetime(item.updateDate ?? '') }}</div>
              <div v-show="item.size !== null" class="tw-text-right">
                {{ handleBytesToHuman(item.size ?? 0) }}
              </div>
            </div>
          </template>
        </v-list-item>
      </div>
    </template>
  </v-virtual-scroll>

  <FinderMenu
    ref="finderMenuRef"
    :actions="contextActions"
    :show-detail="listMode"
  ></FinderMenu>
</template>

<script lang="ts" setup>
import { useMouse } from '@/hooks/useMouse'
import { BaseFileInfo } from '@/models'
import { formatDatetime, handleBytesToHuman } from '@/utils/strings'
import { onKeyDown } from '@vueuse/core'
import { debounce } from 'lodash'
import { computed, ref } from 'vue'
import { VVirtualScroll } from 'vuetify/components'
import FinderMenu from './FinderMenu.vue'
import { useSettingStore } from '@/store'
import { getFileIcon, startDrag } from 'utools-api'
import { isLegalIndex } from '@/utils/collections'
import { reactive } from 'vue'

const { isMouseMove } = useMouse()
const settingStore = useSettingStore()

const finderMenuRef = ref<ComponentRef<typeof FinderMenu>>(null)

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
  return settingStore.isUseSystemFileIcon ? getFileIcon(item.path) : item.icon
}

const maxIndexInWindow = computed(() => props.displaySize - 1)

const emit = defineEmits<{
  (e: 'update:selectedIndex', index: number): void
  (e: 'openItem'): void
  (e: 'openItemInFinder'): void
  (e: 'showItemDetail'): void
  (e: 'quickLookItem'): void
  (e: 'copyItem'): void
  (e: 'copyItemName'): void
  (e: 'copyItemPath'): void
  (e: 'moveItemToTrash'): void
}>()

const contextActions = reactive({
  open: () => emit('openItem'),
  openInFinder: () => emit('openItemInFinder'),
  showDetail: () => emit('showItemDetail'),
  quickLook: () => emit('quickLookItem'),
  copy: () => emit('copyItem'),
  copyName: () => emit('copyItemName'),
  copyPath: () => emit('copyItemPath'),
  moveToTrash: () => emit('moveItemToTrash')
})

function onContextMenu(e: MouseEvent, index: number) {
  e.preventDefault()

  emit('update:selectedIndex', index)
  finderMenuRef.value?.showMenu(e.x, e.y)
}

function handleItemClick(index: number, item: BaseFileInfo) {
  emit('update:selectedIndex', index)
}

function handleMouseEnter(index: number) {
  if (!props.listMode || !isMouseMove.value) return
  emit('update:selectedIndex', index)
}

function handleDragStart(e: DragEvent, index: number, item: BaseFileInfo) {
  e.preventDefault()
  emit('update:selectedIndex', index)
  startDrag(item.path)
}

const firstIndexInWindow = ref(0)
const handleScroll = debounce((e: Event) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target as HTMLDivElement
  firstIndexInWindow.value = Math.round(scrollTop / props.itemHeight)
  if (scrollTop + clientHeight === scrollHeight) {
    console.log('scroll end')
  }
}, 30)

function locateTo(index: number) {
  scrollRef.value?.scrollToIndex(index)
}

let posInWindow = 0

function refreshPosition(index: number) {
  if (
    firstIndexInWindow.value <= index &&
    index < firstIndexInWindow.value + props.displaySize
  ) {
    posInWindow = index - firstIndexInWindow.value
  }
}

function incrementPosition() {
  return (
    (posInWindow = Math.min(posInWindow + 1, maxIndexInWindow.value)) ===
    maxIndexInWindow.value
  )
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
  if (
    selectedIndex >
    Math.min(
      firstIndexInWindow.value + maxIndexInWindow.value,
      props.items.length - 1
    )
  )
    return 1
  return 0
}

function scrollTo(index: number) {
  if (isLegalIndex(props.items, index)) {
    emit('update:selectedIndex', index)
    locateTo(index)
  }
}

onKeyDown(['Meta', 'ArrowUp', 'ArrowDown'], (e) => {
  if (!props.isKeystroke) return

  e.preventDefault()
  if (e.metaKey && e.key === 'Meta') return

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
  }
})
</script>

<style lang="scss" scoped>
.active {
  @apply tw-bg-blue-500 tw-text-white;
}
</style>
