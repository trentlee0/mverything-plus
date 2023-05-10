<template>
  <v-sheet class="tw-px-5 tw-pb-5" color="transparent">
    <ShowBox :title="pluginName">
      <p>版本：{{ version }}</p>
      <p>开发者：{{ author }}</p>
      <p class="tw-flex tw-items-center">
        项目地址：
        <a
          class="tw-cursor-pointer tw-text-blue-500"
          @click="shellOpenExternal(homepage)"
          v-text="homepage"
        >
        </a>
      </p>
      <p class="tw-flex tw-items-center">
        帮助文档：
        <v-icon @click="shellOpenExternal(homepage + '#帮助')" size="small">
          {{ mdiHelpCircleOutline }}
        </v-icon>
      </p>
    </ShowBox>

    <ShowBox
      title="附：所有快捷键"
      subtitle="以下快捷键操作，都接近 Mac 默认的键盘快捷键。"
    >
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">操作</th>
            <th class="text-left">快捷键</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shortcut in shortcuts" :key="shortcut.action">
            <td>{{ shortcut.action }}</td>
            <td>{{ shortcut.keyboard }}</td>
          </tr>
        </tbody>
      </v-table>
    </ShowBox>
  </v-sheet>
</template>

<script lang="ts" setup>
import ShowBox from '@/components/common/ShowBox.vue'
import { ref } from 'vue'
import { shellOpenExternal } from 'utools-api'
import { pluginName, version, author, homepage } from '../../../../plugin.json'
import { mdiHelpCircleOutline } from '@mdi/js'

const shortcuts = ref([
  {
    action: '开始搜索（关闭自动搜索）',
    keyboard: '⏎'
  },
  {
    action: '输入框获得焦点',
    keyboard: '⌘ F'
  },
  {
    action: '显示详情 (列表模式)',
    keyboard: '→'
  },
  {
    action: '左切换类型筛选',
    keyboard: '⇧ ⌘ ['
  },
  {
    action: '右切换类型筛选',
    keyboard: '⇧ ⌘ ]'
  },
  {
    action: '打开文件',
    keyboard: '⌘ O, ⏎'
  },
  {
    action: '在访达中显示',
    keyboard: '⌘ ⏎'
  },
  {
    action: '复制文件',
    keyboard: '⌘ C'
  },
  {
    action: '复制文件名',
    keyboard: '⇧ ⌘ C'
  },
  {
    action: '复制文件路径',
    keyboard: '⌥ ⌘ C'
  },
  {
    action: '移到废纸篓',
    keyboard: '⌘ ⌫'
  },
  {
    action: '选中上一项',
    keyboard: '↑'
  },
  {
    action: '选中下一项',
    keyboard: '↓'
  },
  {
    action: '选中第一项',
    keyboard: '⌘ ↑'
  },
  {
    action: '选中最后一项',
    keyboard: '⌘ ↓'
  },
  {
    action: '选中、打开窗口第 x 项',
    keyboard: '⌘ 1...9'
  }
])
</script>

<style lang="scss" scoped>
code {
  @apply tw-rounded tw-bg-gray-100 tw-p-1 dark:tw-bg-gray-800;
}
</style>
