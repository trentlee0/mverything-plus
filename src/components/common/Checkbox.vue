<template>
  <div
    class="tw-flex tw-h-4 tw-w-4 tw-overflow-hidden tw-rounded tw-bg-gray-200 dark:tw-bg-gray-500"
    @click="handleClickEvent"
  >
    <input
      class="tw-h-full tw-w-full tw-accent-blue-500 tw-outline-none"
      type="checkbox"
      :checked="modelValue"
      :hidden="!modelValue"
      @input="emits('input', $event)"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue?: boolean }>(), {
  modelValue: false
})

const emits = defineEmits(['update:value', 'input'])

const handleClickEvent = (e: any) => {
  emits('update:value', e.target.checked)
}
</script>

<style lang="scss" scoped></style>
