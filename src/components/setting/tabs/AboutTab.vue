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
      title="所有快捷键"
      subtitle="以下所有快捷键操作，都接近 Mac 默认的键盘快捷键。"
    >
      <div class="tw-font-bold">搜索页</div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left tw-w-2/3">操作</th>
            <th class="text-left tw-w-1/3">快捷键</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shortcut in searchShortcuts" :key="shortcut.action">
            <td>{{ shortcut.action }}</td>
            <td>{{ shortcut.keyboard }}</td>
          </tr>
        </tbody>
      </v-table>

      <div class="tw-mt-5 tw-font-bold">右键菜单</div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left tw-w-2/3">操作</th>
            <th class="text-left tw-w-1/3">快捷键</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shortcut in menuShortcuts" :key="shortcut.action">
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
import { reactive } from 'vue'
import { shellOpenExternal } from 'utools-api'
import { pluginName, version, author, homepage } from '../../../../public/plugin.json'
import { mdiHelpCircleOutline } from '@mdi/js'

const searchShortcuts = reactive([
  {
    action: '开始搜索（关闭自动搜索）',
    keyboard: '⏎'
  },
  {
    action: '搜索框获得焦点',
    keyboard: '⌘ F'
  },
  {
    action: '显示详情（列表模式）',
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

const menuShortcuts = reactive([
  {
    action: '打开文件',
    keyboard: '⌘ O, ⏎'
  },
  {
    action: '在访达中显示',
    keyboard: '⌘ ⏎'
  },
  {
    action: '显示简介',
    keyboard: '⌘ I'
  },
  {
    action: '快速查看',
    keyboard: 'Space'
  },
  {
    action: '拷贝文件',
    keyboard: '⌘ C'
  },
  {
    action: '拷贝名称',
    keyboard: '⇧ ⌘ C'
  },
  {
    action: '拷贝路径',
    keyboard: '⌥ ⌘ C'
  },
  {
    action: '移到废纸篓',
    keyboard: '⌘ ⌫'
  }
])
</script>

<style lang="scss" scoped>
code {
  @apply tw-rounded tw-bg-gray-100 tw-p-1 dark:tw-bg-gray-800;
}
</style>
