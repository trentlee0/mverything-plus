<template>
  <select
    class="tw-rounded-md tw-px-2 tw-py-1 tw-outline-none"
    :value="modelValue"
    @input="handleInputEvent"
    style="appearance: auto"
  >
    <option
      v-for="item in items"
      :key="getProp(item, itemValue)"
      :value="getProp(item, itemValue)"
    >
      {{ getProp(item, itemLabel) }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { toMap } from '@/utils/collections'

const modelValue = defineModel<string | number>()

const {
  itemLabel = 'label',
  itemValue = 'value',
  items
} = defineProps<{
  itemLabel?: string
  itemValue?: string
  items: Array<object>
}>()

const map = toMap<any, object>(items, (item) => getProp(item, itemValue))

function getProp(o: object, prop: string) {
  return Reflect.get(o, prop)
}

const emit = defineEmits<{
  select: [item?: object]
}>()
function handleInputEvent(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  if (typeof modelValue.value === 'number') {
    modelValue.value = parseInt(value)
  } else {
    modelValue.value = value
  }
  emit('select', map.get(value))
}
</script>

<style lang="scss" scoped></style>
