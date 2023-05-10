<template>
  <div
    class="tw-flex tw-w-full tw-items-center tw-p-5"
    :style="`height: ${height}`"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    height?: string
  }>(),
  {
    height: '50px'
  }
)
</script>

<style lang="scss" scoped></style>
