<template>
  <div class="tw-flex tw-w-full tw-justify-center">
    <div class="tw-h-44 tw-w-44">
      <v-img :src="src" cover />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ src?: string }>()
</script>

<style lang="scss" scoped></style>
