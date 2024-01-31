<template>
  <div
    class="tw-select-none tw-overflow-hidden tw-rounded-md"
    :class="{ 'diff-line': isDiffStyle }"
    :tabindex="tabindex"
  >
    <div class="tw-flex tw-h-7 tw-items-center tw-px-3" :class="{ active: active }">
      <div class="tw-mr-2" v-if="file">
        <v-avatar :image="getIcon(file.name, file.isDirectory)" size="18" :rounded="0" />
      </div>
      <div
        class="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-text-base tw-font-semibold"
      >
        {{ file?.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ContentType } from '@/constant'
import { SimpleFileInfo } from '@/models'
import { getFileIconBase64 } from '@/preload'
import { useSettingStore } from '@/store'
import * as icons from '@/utils/icons'

const settingStore = useSettingStore()
const props = defineProps<{
  file?: SimpleFileInfo
  dirPath?: string
  active?: boolean
  isDiffStyle?: boolean
  tabindex?: number
}>()

function getFullPath(filename: string) {
  if (!props.dirPath) return ''
  return `${props.dirPath}/${filename}`
}

function getIcon(filename: string, isDirectory: boolean) {
  if (settingStore.isUseSystemFileIcon) {
    return getFileIconBase64(
      getFullPath(filename),
      isDirectory ? ContentType.DIRECTORY : ContentType.ITEM
    )
  }
  return icons.getFileIcon(getFullPath(filename), isDirectory)
}
</script>

<style lang="scss" scoped>
.active {
  @apply tw-bg-blue-600 tw-text-white;
}

.diff-line {
  @apply tw-bg-neutral-100 dark:tw-bg-neutral-800;
}
</style>
