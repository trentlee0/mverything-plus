<template>
  <div
    @click="modelValue = modelValue === SortOrderEnum.ASC ? SortOrderEnum.DESC : SortOrderEnum.ASC"
  >
    <v-icon size="default" v-show="modelValue === SortOrderEnum.ASC" title="升序">
      {{ mdiSortDescending }}
    </v-icon>
    <v-icon size="default" v-show="modelValue === SortOrderEnum.DESC" title="降序">
      {{ mdiSortAscending }}
    </v-icon>
  </div>
</template>

<script lang="ts" setup>
import { SortOrderEnum } from '@/constant'
import { mdiSortDescending, mdiSortAscending } from '@mdi/js'

const modelValue = defineModel<SortOrderEnum>({ required: true })
</script>

<style lang="scss" scoped></style>
