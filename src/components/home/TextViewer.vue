<template>
  <div class="tw-relative tw-flex tw-h-full tw-w-full tw-flex-col">
    <div
      class="tw-w-full tw-flex-grow tw-overflow-auto tw-bg-neutral-50 dark:tw-bg-neutral-900"
      :style="`font-size: ${fontSize}`"
    >
      <pre
        class="tw-h-full"
      ><code class='tw-min-h-full tw-block tw-overflow-x-auto tw-p-3'>{{ text }}</code></pre>
    </div>

    <div
      class="tw-flex tw-w-full tw-flex-none tw-justify-between tw-border-t tw-border-neutral-200 tw-bg-neutral-100 tw-px-2 tw-py-px tw-text-xs dark:tw-border-neutral-700 dark:tw-bg-neutral-800"
    >
      <div
        class="tw-w-8/12 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap"
      >
        <span v-if="partialSize">
          文件过大：<span>{{ handleBytesToHuman(size) }}，</span>
          仅读部分：<span>{{ handleBytesToHuman(partialSize) }}</span>
        </span>
        <span v-else>文件大小：{{ handleBytesToHuman(size) }}</span>
      </div>
      <div class="tw-w-4/12 tw-text-right" v-show="encoding">
        {{ encoding }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { handleBytesToHuman } from '@/utils/strings'

withDefaults(
  defineProps<{
    text?: string
    fontSize?: string
    encoding?: string
    size: number
    partialSize?: number
  }>(),
  {
    fontSize: '12px'
  }
)
</script>

<style lang="scss" scoped></style>
