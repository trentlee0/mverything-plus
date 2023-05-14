<template>
  <div
    class="tw-flex tw-h-4 tw-w-4 tw-overflow-hidden tw-rounded tw-bg-gray-200 dark:tw-bg-gray-500"
    @click="handleClickEvent"
  >
    <input
      class="tw-h-full tw-w-full tw-accent-blue-500 tw-outline-none"
      type="checkbox"
      v-model="modelValue"
      :hidden="!modelValue"
      @input="emit('input', $event)"
    />
  </div>
</template>

<script setup lang="ts">
const modelValue = defineModel()

function handleClickEvent(e: Event) {
  modelValue.value = (e.target as HTMLInputElement).checked
}

const emit = defineEmits<{
  input: [e: Event]
}>()
</script>

<style lang="scss" scoped></style>
