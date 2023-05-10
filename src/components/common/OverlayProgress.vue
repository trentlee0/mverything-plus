<template>
  <div
    class="tw-absolute tw-left-0 tw-top-0 tw-flex tw-h-full tw-w-full tw-cursor-wait tw-items-center tw-justify-center"
    :style="{
      background: background
        ? background
        : dark
        ? 'rgba(0, 0, 0, 0.2)'
        : 'rgba(250, 250, 250, 0.4)'
    }"
  >
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    dark?: boolean
    background?: string
  }>(),
  {
    dark: false
  }
)
</script>

<style lang="scss" scoped></style>
