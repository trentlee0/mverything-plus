<template>
  <v-sheet class="tw-p-5" color="transparent">
    <v-checkbox
      label="搜索文件内容"
      v-model="settingStore.isFindFileContent"
      density="comfortable"
      hide-details
    ></v-checkbox>
    <v-checkbox
      label="自动开始搜索"
      v-model="settingStore.isAutoSearch"
      density="comfortable"
      hide-details
    ></v-checkbox>
    <v-checkbox
      label="“在此文件夹中搜索”展示全部文件"
      v-model="settingStore.isShowFilesInTempDir"
      density="comfortable"
      hide-details
    ></v-checkbox>

    <v-checkbox
      label="在选择类型筛选时展示全部文件"
      v-model="settingStore.isShowFilesInKind"
      density="comfortable"
      hide-details
    ></v-checkbox>

    <v-checkbox
      label="使用 uTools 内置搜索框"
      v-model="settingStore.isUseSubInput"
      density="comfortable"
      hide-details
    ></v-checkbox>

    <Subheader title="搜索范围">
      <template #append>
        <div class="tw-my-3 tw-flex tw-items-center">
          <SelectBox
            class="tw-w-48 tw-bg-neutral-100 dark:tw-bg-neutral-800"
            v-model="settingStore.searchRoot"
            :items="settingStore.allSearchScopes"
            item-label="label"
            item-value="id"
          />
          <div class="tw-ml-3 tw-cursor-pointer" @click="directoryDialog = true">
            <v-icon>{{ mdiViewHeadline }}</v-icon>
          </div>
        </div>
      </template>
    </Subheader>

    <Subheader title="文件图标">
      <template #append>
        <v-radio-group v-model="settingStore.isUseSystemFileIcon" hide-details>
          <v-radio label="默认图标" :value="false"></v-radio>
          <v-radio label="系统图标" :value="true"></v-radio>
        </v-radio-group>
      </template>
    </Subheader>

    <Subheader>搜索高亮</Subheader>
    <v-checkbox
      label="开启高亮"
      v-model="settingStore.nameHighlight.enabled"
      density="comfortable"
      hide-details
    ></v-checkbox>
    <div class="tw-ml-2 tw-mt-3 tw-w-1/2" v-if="settingStore.nameHighlight.enabled">
      <v-row no-gutters>
        <v-col>
          <v-textarea
            label="高亮样式"
            variant="outlined"
            :model-value="settingStore.nameHighlight.style"
            @change="settingStore.nameHighlight.style = $event.target.value"
            hide-details
            rows="2"
          ></v-textarea>
        </v-col>
        <v-col class="tw-flex tw-items-center">
          <div class="tw-pl-5 tw-text-base">
            <span>搜索</span>
            <span :style="settingStore.nameHighlight.style">高亮文本</span>
            <span>示例</span>
          </div>
        </v-col>
      </v-row>
    </div>

    <Subheader>
      <template #default> 当按下快捷键 <span class="tw-font-bold">⌘ 1...9</span> 时 </template>
      <template #append>
        <v-radio-group v-model="settingStore.isOpenAsShortcutting" hide-details>
          <v-radio label="仅选中项目" :value="false"></v-radio>
          <v-radio label="选中并打开" :value="true"></v-radio>
        </v-radio-group>
      </template>
    </Subheader>
  </v-sheet>

  <v-dialog v-model="directoryDialog" width="auto">
    <v-card width="500">
      <v-toolbar color="transparent">
        <v-btn icon @click="directoryDialog = false">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>搜索范围列表</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <FlexTable>
          <HeaderRow>
            <v-col :cols="3">名称</v-col>
            <v-spacer />
            <v-col :cols="6">目录路径</v-col>
            <v-spacer />
            <v-col :cols="2" class="tw-text-left">操作</v-col>
          </HeaderRow>
          <BodyRow
            v-for="(dir, index) in settingStore.allSearchScopes"
            :key="dir.id"
            :active="index % 2 === 0"
            :class="{ 'tw-text-neutral-700 dark:tw-text-neutral-200': !checkMutableScope(dir) }"
          >
            <v-col :cols="3">
              <div
                class="tw-rounded-md tw-border tw-border-transparent focus-within:tw-border-neutral-400"
              >
                <input
                  class="tw-w-full tw-text-ellipsis tw-rounded-md tw-p-1 tw-outline-none"
                  v-model.lazy="dir.label"
                  placeholder="输入名称"
                  :title="!checkMutableScope(dir) ? dir.label : undefined"
                  :disabled="!checkMutableScope(dir)"
                />
              </div>
            </v-col>
            <v-spacer />
            <v-col :cols="6" class="tw-overflow-hidden">
              <div
                v-for="(path, index) in dir.paths"
                :key="`${path}-${index}`"
                class="tw-w-full tw-cursor-default tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-text-sm"
                v-title
              >
                {{ getDisplayPath(path) }}
              </div>
            </v-col>
            <v-spacer />
            <v-col :cols="2" class="tw-flex tw-justify-center">
              <div v-if="checkMutableScope(dir)">
                <v-btn variant="text" density="compact" @click="handleAddDirectory(dir, index)">
                  添加
                </v-btn>
                <v-btn
                  variant="text"
                  color="error"
                  density="compact"
                  @click="handleRemoveDirectory(dir, index)"
                >
                  删除
                </v-btn>
              </div>
            </v-col>
          </BodyRow>
        </FlexTable>
        <v-card-actions>
          <v-btn @click="handleCreateDirectory">新增</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import Subheader from '@/components/common/Subheader.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import { useSettingStore } from '@/store'
import { nanoid } from 'nanoid'
import { showOpenDialog } from 'utools-api'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { SearchScopeModel } from '@/models'
import { getBasename } from '@/preload'
import { getDisplayPath } from '@/utils/handler'
import HeaderRow from '@/components/setting/table/HeadRow.vue'
import BodyRow from '@/components/setting/table/BodyRow.vue'
import FlexTable from '@/components/setting/table/FlexTable.vue'
import { mdiClose, mdiViewHeadline } from '@mdi/js'

const toast = useToast()
const settingStore = useSettingStore()

const directoryDialog = ref(false)

function showDirectoryDialog() {
  const paths = showOpenDialog({
    properties: ['openDirectory', 'multiSelections']
  })
  return paths ?? []
}

function handleCreateDirectory() {
  const paths = showDirectoryDialog()
  if (paths.length) {
    try {
      const dir = new SearchScopeModel(nanoid(10), getBasename(paths[0]), paths)
      settingStore.searchScopes.push(dir)
    } catch (e) {
      toast.error(e + '')
    }
  }
}

function checkMutableScope(dir: SearchScopeModel) {
  return SearchScopeModel.defaultSearchScopes().findIndex((item) => item.id === dir.id) === -1
}

function handleAddDirectory(dir: SearchScopeModel, index: number) {
  const paths = showDirectoryDialog()
  if (paths.length) {
    try {
      dir.paths.push(...paths)
    } catch (e) {
      toast.error(e + '')
    }
  }
}

function handleRemoveDirectory(dir: SearchScopeModel, index: number) {
  try {
    if (dir.id === settingStore.searchRoot) {
      toast.error('当前搜索范围已被选择，不能删除！')
    } else {
      if (confirm('确定要删除吗？')) {
        settingStore.removeSearchScope(index)
      }
    }
  } catch (e) {
    toast.error(e + '')
  }
}
</script>

<style lang="scss" scoped></style>
