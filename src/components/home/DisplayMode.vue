<template>
  <v-item-group class="item-group" v-model="modelValue" mandatory>
    <div class="tw-flex">
      <div v-for="item in items">
        <v-item :value="item.value">
          <template #default="{ isSelected, toggle }">
            <div
              :class="{ active: isSelected }"
              class="tw-rounded-md tw-px-3 tw-py-1"
              @click="toggle"
            >
              <v-icon size="default">{{ item.icon }}</v-icon>
            </div>
          </template>
        </v-item>
        <div class="tw-h-full tw-w-1"></div>
      </div>
    </div>
  </v-item-group>
</template>

<script lang="ts" setup>
interface DisplayModeItem {
  value: string | number
  title: string
  icon: string
}

const modelValue = defineModel<string | number>({ required: true })

defineProps<{
  items: Array<DisplayModeItem>
}>()
</script>

<style lang="scss" scoped>
.item-group {
  .active {
    @apply tw-bg-neutral-200 dark:tw-bg-neutral-700;
  }

  &:hover .active {
    @apply tw-bg-neutral-300 dark:tw-bg-neutral-600;
  }
}
</style>
