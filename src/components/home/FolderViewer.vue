<template>
  <div class="tw-relative tw-h-full tw-w-full tw-overflow-auto tw-px-5 tw-py-3">
    <OverlayProgress v-show="loading" :dark="isDark" />
    <div v-show="!loading">
      <FolderSubItem
        class="tw-outline-none"
        v-for="(file, index) in files"
        :key="file.name"
        :file="file"
        :dir-path="dirPath"
        :active="activeIndex === index"
        :isDiffStyle="index % 2 === 1"
        :tabindex="0"
        @click="handleActive(index)"
        @dblclick="handleDoubleClick(file.name)"
        @contextmenu="handleRightClick($event, index, file.name)"
        draggable="true"
        @dragstart="handleDragStart($event, index, file.name)"
        @focus="handleActive(index)"
        @blur="handleActive(files.length)"
      />
      <FolderSubItem
        v-for="(i, index) in Math.max(0, maxLine - files.length)"
        :key="i"
        :isDiffStyle="(files.length + index) % 2 === 1"
        @click="handleActive(files.length + index)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FolderSubItem from './FolderSubItem.vue'
import { SimpleFileInfo } from '@/models'
import { copyText, hideMainWindow, shellShowItemInFolder, startDrag } from 'utools-api'
import { ref, watch } from 'vue'
import { useDark } from '@/hooks/useDark'
import OverlayProgress from '@/components/common/OverlayProgress.vue'
import { openFile } from '@/preload'
import { useContextMenu } from '@/hooks/useContextMenu'
import { copyFromPath } from '@/utils/common'

const { showMenu } = useContextMenu()

const maxLine = ref(8)
const props = defineProps<{
  dirPath: string
  files: Array<SimpleFileInfo>
  loading?: boolean
}>()

function getFullPath(filename: string) {
  if (!props.dirPath) return ''
  return `${props.dirPath}/${filename}`
}

function handleDoubleClick(filename: string) {
  openFile(getFullPath(filename))
}

function handleRightClick(e: MouseEvent, index: number, filename: string) {
  handleActive(index)
  const path = getFullPath(filename)
  showMenu(e, [
    { label: '打开', click: () => openFile(path) },
    { label: '在访达中显示', click: () => shellShowItemInFolder(path) },
    { type: 'separator' },
    {
      label: '拷贝',
      click: () => {
        copyFromPath(path)
        hideMainWindow()
      }
    },
    {
      label: '拷贝名称',
      click: () => {
        copyText(filename)
        hideMainWindow()
      }
    },
    {
      label: '拷贝路径',
      click: () => {
        copyText(path)
        hideMainWindow()
      }
    }
  ])
}

function handleDragStart(e: DragEvent, index: number, filename: string) {
  e.preventDefault()
  handleActive(index)
  startDrag(getFullPath(filename))
}

const activeIndex = ref<number>()
function handleActive(index: number) {
  if (props.files && index < props.files.length) {
    activeIndex.value = index
  } else {
    activeIndex.value = undefined
  }
}

watch(
  () => props.files,
  () => {
    activeIndex.value = undefined
  }
)

const { isDark } = useDark()
</script>

<style lang="scss" scoped></style>
