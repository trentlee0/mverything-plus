<template>
  <v-app>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </v-app>
</template>

<script setup lang="ts">
import { useDark } from '@/hooks/useDark'
import { onBeforeMount } from 'vue'

const { autoDark } = useDark()

autoDark()

onBeforeMount(() => {
  // 隐藏滚动条
  window.document.documentElement.style.overflowY = 'hidden'
})
</script>

<style lang="scss">
#app {
  @apply tw-h-screen tw-w-screen;
}

$toast: 'Vue-Toastification';
.#{$toast}__toast {
  &-body.custom-toast-body-class {
    font-size: medium;
  }
}
</style>
