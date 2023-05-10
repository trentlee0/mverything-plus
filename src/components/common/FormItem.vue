<template>
  <v-row no-gutters>
    <v-col :cols="labelCols" class="tw-text-right">
      <slot name="front">
        <slot name="label">
          <span>{{ label }}</span>
        </slot>
        <span>{{ splitSymbol }}</span>
      </slot>
    </v-col>
    <v-col :cols="textCols">
      <slot>
        <div class="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">
          <v-tooltip
            v-if="tooltip"
            :text="tooltip"
            location="top"
            :open-delay="tooltipDelay"
            theme="light"
          >
            <template #activator="{ props }">
              <span v-bind="props">{{ text }}</span>
            </template>
          </v-tooltip>
          <span v-else :title="title">{{ text }}</span>
        </div>
      </slot>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    label?: string
    labelCols?: number
    text?: any
    textCols?: number
    splitSymbol?: string
    tooltip?: string
    title?: string
    tooltipDelay?: number
  }>(),
  {
    labelCols: 4,
    textCols: 8,
    splitSymbol: '：'
  }
)
</script>

<style lang="scss" scoped></style>
