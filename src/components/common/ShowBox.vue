<template>
  <div class="tw-p-3">
    <div class="tw-mb-1 tw-text-lg tw-font-bold">{{ title }}</div>
    <div class="tw-mb-1 tw-text-base">{{ subtitle }}</div>
    <slot>
      <div class="tw-text-base">
        {{ content }}
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string
  subtitle?: string
  content?: string
}>()
</script>

<style lang="scss" scoped></style>
