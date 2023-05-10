<template>
  <div
    class="tw-flex tw-w-fit tw-items-center tw-justify-center tw-overflow-hidden tw-rounded-md hover:tw-bg-neutral-100 dark:hover:tw-bg-neutral-800"
    :style="{ height }"
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
    height: '30px'
  }
)
</script>

<style lang="scss" scoped></style>
