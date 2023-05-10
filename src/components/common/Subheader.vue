<template>
  <div class="tw-ml-2 tw-mt-7">
    <div class="tw-text-neutral-500 dark:tw-text-neutral-400">
      <slot>{{ title }}</slot>
    </div>
    <slot name="append"></slot>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string
}>()
</script>

<style lang="scss" scoped></style>
