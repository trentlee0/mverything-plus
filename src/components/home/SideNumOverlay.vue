<template>
  <div
    class="tw-absolute tw-right-6 tw-top-0 tw-z-10 tw-pl-0 tw-text-neutral-500 dark:tw-text-white"
  >
    <div
      v-for="i in itemCount"
      :key="i"
      :style="`height: ${itemHeight}px`"
      class="tw-flex tw-cursor-default tw-items-center tw-justify-center"
    >
      <div
        class="tw-rounded-md tw-bg-neutral-100/70 tw-px-3 tw-py-1 tw-shadow tw-backdrop-blur-sm dark:tw-bg-neutral-700/60"
      >
        {{ i % 10 }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  itemCount: number
  itemHeight: number
}>()
</script>

<style lang="scss" scoped></style>
