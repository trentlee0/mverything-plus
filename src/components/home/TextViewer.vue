<template>
  <div class="tw-relative tw-flex tw-h-full tw-w-full tw-flex-col">
    <div
      class="tw-absolute tw-right-1 tw-top-px tw-flex tw-rounded-md tw-bg-neutral-100/50 tw-px-px tw-text-sm tw-shadow tw-backdrop-blur-sm dark:tw-bg-neutral-700/50"
      v-if="elements?.length"
    >
      <div class="tw-flex">
        <div class="tw-w-4 tw-text-center">{{ currentIndex + 1 }}</div>
        <div class="tw-px-1 tw-font-mono">/</div>
        <div class="tw-w-4 tw-text-center">{{ elements.length }}</div>
      </div>
      <div class="tw-w-1"></div>
      <div>
        <v-icon @click="scrollUp">{{ mdiChevronUp }}</v-icon>
        <v-icon @click="scrollDown">{{ mdiChevronDown }}</v-icon>
      </div>
    </div>
    <div
      class="tw-w-full tw-flex-grow tw-overflow-auto tw-bg-neutral-50 dark:tw-bg-neutral-900"
      :style="`font-size: ${fontSize}`"
    >
      <pre
        class="tw-h-full"
      ><code ref="codeRef" class="tw-min-h-full tw-block tw-overflow-x-auto tw-p-3 tw-font-mono hljs">{{ text }}</code></pre>
    </div>

    <div
      class="tw-flex tw-w-full tw-flex-none tw-justify-between tw-border-t tw-border-neutral-200 tw-bg-neutral-100 tw-px-2 tw-py-px tw-text-xs dark:tw-border-neutral-700 dark:tw-bg-neutral-800"
    >
      <div class="tw-w-8/12 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">
        <span v-if="partialSize">
          <span>文件过大：{{ formatBytesToHuman(size) }}，</span>
          <span>仅读部分：{{ formatBytesToHuman(partialSize) }}</span>
        </span>
        <span v-else>文件大小：{{ formatBytesToHuman(size) }}</span>
      </div>
      <div class="tw-w-4/12 tw-text-right" v-show="encoding">
        {{ encoding }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatBytesToHuman } from '@/utils/strings'
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    findWords?: string[]
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

const codeRef = ref<Nullable<HTMLPreElement>>(null)
const elements = ref<NodeListOf<HTMLSpanElement>>()
const currentIndex = ref<number>(-1)

function handleFindTextChange(findTexts?: string[]) {
  if (!codeRef.value || !findTexts?.length) {
    elements.value = undefined
    currentIndex.value = -1
    return
  }
  codeRef.value.innerHTML = codeRef.value.innerHTML.replaceAll(
    new RegExp(findTexts.map((item) => `(${item})`).join('|'), 'ig'),
    (s) => `<span class="find-in-view">${s}</span>`
  )
  elements.value = codeRef.value.querySelectorAll<HTMLSpanElement>('.find-in-view')
  if (elements.value.length) {
    scrollToIndex(0)
  }
}

watch(
  () => props.findWords,
  (value) => {
    handleFindTextChange(value)
  }
)

function scrollToIndex(index: number, behavior?: ScrollBehavior) {
  if (!elements.value?.length) return
  if (index >= 0 && index < elements.value.length) {
    currentIndex.value = index
    elements.value.forEach((el) => el.classList.remove('active'))
    const el = elements.value[currentIndex.value]
    el.classList.add('active')
    el.scrollIntoView({ behavior })
  }
}

function scrollDown() {
  if (!elements.value) return
  const len = elements.value.length
  scrollToIndex((currentIndex.value + 1) % len, 'smooth')
}

function scrollUp() {
  if (!elements.value) return
  const len = elements.value.length
  scrollToIndex((currentIndex.value - 1 + len) % len, 'smooth')
}
</script>

<style lang="scss">
.find-in-view {
  background-color: yellow;
  color: black;

  &.active {
    background-color: orange;
  }
}
</style>
