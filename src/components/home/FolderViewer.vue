<template>
  <div class="tw-relative tw-h-full tw-w-full tw-overflow-auto tw-px-5 tw-py-3">
    <OverlayProgress v-show="loading" :dark="isDark" />
    <div v-show="!loading">
      <FolderSubItem
        v-for="(file, index) in files"
        :key="file.name"
        :file="file"
        :dir-path="dirPath"
        :active="activeIndex === index"
        :isDiffStyle="index % 2 === 1"
        @click="handleActive(index)"
        @dblclick="handleDoubleClick(file.name)"
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
import { shellOpenPath } from 'utools-api'
import { ref, watch } from 'vue'
import { useDark } from '@/hooks/useDark'
import OverlayProgress from '@/components/common/OverlayProgress.vue'

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
  shellOpenPath(getFullPath(filename))
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
