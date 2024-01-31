<template>
  <div class="tw-h-full tw-overflow-auto">
    <Header>
      <v-btn
        :icon="mdiClose"
        @click="router.replace('/')"
        size="46"
        color="transparent"
        :elevation="0"
      ></v-btn>
      <div class="tw-mx-3 tw-text-lg tw-font-bold">设置</div>
    </Header>

    <v-tabs v-model="tab" align-tabs="center" density="comfortable">
      <v-tab value="general">基本</v-tab>
      <v-tab value="filter">筛选</v-tab>
      <v-tab value="preview">预览</v-tab>
      <v-tab value="about">关于</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="general">
        <GeneralTab></GeneralTab>
      </v-window-item>
      <v-window-item value="filter">
        <FilterTab></FilterTab>
      </v-window-item>
      <v-window-item value="preview">
        <PreviewTab></PreviewTab>
      </v-window-item>
      <v-window-item value="about">
        <AboutTab></AboutTab>
      </v-window-item>
    </v-window>
  </div>
</template>

<script lang="ts" setup>
import { mdiClose } from '@mdi/js'
import Header from '@/components/common/Header.vue'
import GeneralTab from '@/components/setting/tabs/GeneralTab.vue'
import FilterTab from '@/components/setting/tabs/FilterTab.vue'
import PreviewTab from '@/components/setting/tabs/PreviewTab.vue'
import AboutTab from '@/components/setting/tabs/AboutTab.vue'
import { ref } from 'vue'
import { useHotkeysScope } from '@/hooks/useHotkeys'
import { ScopeName } from '@/constant'
import { onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { removeSubInput } from 'utools-api'

const router = useRouter()
const tab = ref<'general' | 'filter' | 'preview' | 'about'>('general')

const { setScope } = useHotkeysScope(ScopeName.SETTING)
onActivated(() => {
  setScope()
  removeSubInput()
})
</script>

<style lang="scss" scoped></style>
