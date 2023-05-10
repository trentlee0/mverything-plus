<template>
  <div
    class="tw-relative tw-h-full tw-w-full tw-overflow-auto tw-bg-neutral-50 dark:tw-bg-neutral-900"
    :style="`font-size: ${fontSize}`"
  >
    <pre
      class="tw-h-full"
    ><code class="tw-min-h-full tw-block tw-overflow-x-auto tw-p-3">{{ text }}</code></pre>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    text?: string
    fontSize?: string
  }>(),
  {
    fontSize: '12px'
  }
)
</script>

<style lang="scss" scoped></style>
