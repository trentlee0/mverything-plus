<template>
  <select
    class="tw-rounded-md tw-px-2 tw-py-1 tw-outline-none"
    :value="modelValue"
    @input="handleInputEvent"
    style="appearance: auto"
  >
    <option
      v-for="item in items"
      :key="get(item, itemValue!)"
      :value="get(item, itemValue!)"
    >
      {{ get(item, itemLabel) }}
    </option>
  </select>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: any
    itemLabel?: string
    itemValue?: string
    items: Array<object>
  }>(),
  {
    itemLabel: 'label',
    itemValue: 'value'
  }
)

const map = new Map<any, object>()
props.items.forEach((item) => {
  map.set(get(item, props.itemValue), item)
})

function get(o: object, prop: string) {
  return Reflect.get(o, prop)
}

const emit = defineEmits<{
  (e: 'update:modelValue', val: number | string): void
  (e: 'select', item?: object): void
}>()
function handleInputEvent(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  if (typeof props.modelValue === 'number') {
    emit('update:modelValue', parseInt(value))
  } else {
    emit('update:modelValue', value)
  }
  emit('select', map.get(value))
}
</script>

<style lang="scss" scoped></style>
