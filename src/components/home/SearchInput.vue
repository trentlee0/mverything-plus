<template>
  <div
    class="tw-cursor-text tw-overflow-hidden tw-rounded-md tw-border tw-border-neutral-400 tw-p-px tw-text-lg tw-transition hover:tw-border-neutral-500 dark:tw-border-neutral-600"
    :class="{ 'focus-class': isInputFocus }"
    @click="focus"
  >
    <div class="tw-flex tw-items-center" :style="{ width, height }">
      <div class="inner-class" :style="`height: ${height}`" v-if="$slots['prepend-inner']">
        <slot name="prepend-inner"></slot>
      </div>
      <input
        ref="inputRef"
        class="tw-flex-grow tw-outline-none"
        type="text"
        v-model="modelValue"
        autofocus
        :placeholder="placeholder"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div class="inner-class" :style="`height: ${height}`">
        <slot name="append-inner"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const modelValue = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    width?: string
    height?: string
    placeholder?: string
  }>(),
  {
    width: '100%',
    height: '32px',
    placeholder: '搜索'
  }
)

const isInputFocus = ref(false)

const inputRef = ref<ElementRef<HTMLInputElement>>(null)

function handleFocus() {
  isInputFocus.value = true
}

function handleBlur() {
  isInputFocus.value = false
  unselectText()
}

function focus() {
  if (!isInputFocus.value) inputRef.value?.focus()
}

function blur() {
  if (isInputFocus.value) inputRef.value?.blur()
}

function selectText() {
  if (!inputRef.value) return
  const el = inputRef.value
  el.selectionStart = 0
  el.selectionEnd = el.value.length
}

function unselectText() {
  if (!inputRef.value) return
  const el = inputRef.value
  el.selectionStart = el.value.length
  el.selectionEnd = el.value.length
}

defineExpose({
  isFocus() {
    return isInputFocus.value
  },
  focus,
  blur,
  selectText,
  unselectText
})
</script>

<style lang="scss" scoped>
.focus-class {
  @apply tw-border-2 tw-border-neutral-900 tw-p-0 dark:tw-border-neutral-200;
}

.inner-class {
  @apply tw-flex tw-items-center tw-px-2 tw-text-neutral-500;
}
</style>
