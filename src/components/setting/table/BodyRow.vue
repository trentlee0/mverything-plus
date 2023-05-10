<template>
  <v-row
    class="tw-px-2 tw-py-1"
    align="center"
    no-gutters
    :class="{ 'active-class': active }"
  >
    <slot></slot>
  </v-row>
</template>

<script lang="ts" setup>
defineProps<{
  active?: boolean
}>()
</script>

<style lang="scss" scoped>
.active-class {
  @apply tw-rounded-md tw-bg-neutral-50 dark:tw-bg-neutral-800;
}
</style>
