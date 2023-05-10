<template>
  <div
    @click="
      emit(
        'update:modelValue',
        modelValue === SortTypeEnum.ASC ? SortTypeEnum.DESC : SortTypeEnum.ASC
      )
    "
  >
    <v-icon size="default" v-show="modelValue === SortTypeEnum.ASC">
      {{ mdiSortDescending }}
    </v-icon>
    <v-icon size="default" v-show="modelValue === SortTypeEnum.DESC">
      {{ mdiSortAscending }}
    </v-icon>
  </div>
</template>

<script lang="ts" setup>
import { SortTypeEnum } from '@/constant'
import { mdiSortDescending, mdiSortAscending } from '@mdi/js'

defineProps<{
  modelValue: SortTypeEnum
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SortTypeEnum): void
}>()
</script>

<style lang="scss" scoped></style>
