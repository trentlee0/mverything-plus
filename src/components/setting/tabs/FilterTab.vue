<template>
  <v-sheet class="tw-p-5" color="transparent">
    <div class="tw-mx-1 tw-font-bold">类型筛选</div>
    <FlexTable>
      <HeaderRow>
        <v-col :cols="2">名称</v-col>
        <v-spacer />
        <v-col :cols="8">类型筛选规则</v-col>
        <v-spacer />
        <v-col :cols="1" class="tw-text-center">启用</v-col>
      </HeaderRow>

      <!-- 直接在 list 数组上改变元素顺序 -->
      <draggable
        :list="settingStore.kindFilters"
        @start="kindDrag = true"
        @end="kindDrag = false"
        ghost-class="ghost"
        :animation="200"
      >
        <transition-group :name="!kindDrag ? 'kind-list' : undefined">
          <BodyRow
            v-for="item in settingStore.kindFilters"
            :key="item.id"
            @dblclick="handleOpenKindDialog(item)"
            class="tw-border-t tw-bg-white dark:tw-border-t-neutral-700 dark:tw-bg-neutral-900"
          >
            <v-col :cols="2">
              {{ item.label }}
            </v-col>
            <v-spacer />
            <v-col :cols="8">
              <div class="tw-overflow-hidden tw-text-ellipsis">
                {{ item.value }}
              </div>
            </v-col>
            <v-spacer />
            <v-col :cols="1" class="tw-flex tw-items-center tw-justify-center">
              <div class="tw-flex tw-h-8 tw-items-center">
                <v-checkbox
                  v-model="item.enabled"
                  :disabled="item.id === KindFilterModel.ANY.id"
                  hide-details
                  density="compact"
                ></v-checkbox>
              </div>
            </v-col>
          </BodyRow>
        </transition-group>
      </draggable>
    </FlexTable>

    <v-btn variant="text" @click="handleOpenKindDialog()">新增</v-btn>

    <div class="tw-mx-1 tw-mt-8 tw-font-bold">正则筛选</div>
    <FlexTable>
      <HeaderRow>
        <v-col :cols="2">关键字</v-col>
        <v-spacer />
        <v-col :cols="8">正则表达式</v-col>
        <v-spacer />
        <v-col :cols="1" class="tw-text-center">操作</v-col>
      </HeaderRow>
      <BodyRow
        v-for="(item, index) in settingStore.keyList"
        :key="`${item.key}-${index}`"
        :active="index % 2 === 0"
      >
        <v-col :cols="2">{{ item.key }}</v-col>
        <v-spacer />
        <v-col :cols="8">
          <span class="tw-font-mono tw-text-sm">{{ item.regex }}</span>
        </v-col>
        <v-spacer />
        <v-col :cols="1" class="tw-flex tw-justify-center">
          <v-btn
            variant="text"
            color="error"
            density="compact"
            @click="handleRemoveRegex(index)"
          >
            删除
          </v-btn>
        </v-col>
      </BodyRow>
    </FlexTable>

    <v-btn variant="text" @click="regexDialog = true">新增</v-btn>
  </v-sheet>

  <v-dialog
    v-model="kindDialog"
    width="auto"
    @update:model-value="($event) => !$event && handleCloseKindDialog()"
  >
    <v-card width="400">
      <v-toolbar color="transparent">
        <v-btn icon @click="handleCloseKindDialog">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{ updatedKind ? '修改' : '新增' }}类型筛选
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="kindFormRef">
          <v-text-field
            v-model="kindForm.label"
            label="名称"
            density="compact"
            variant="outlined"
            :rules="kindRules.label"
            :autofocus="!isDisabledKind"
            :readonly="isDisabledKind"
          ></v-text-field>
          <v-textarea
            class="tw-font-mono"
            v-model.trim="kindForm.value"
            label="类型规则"
            density="compact"
            variant="outlined"
            :rules="kindRules.value"
            :readonly="isDisabledKind"
            placeholder="输入类型规则，多个类型用 `|` 分隔，排除用 `!`，以匹配文件类型"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-show="updatedKind"
          variant="text"
          color="error"
          @click="handleRemoveKind"
          :disabled="isDisabledKind"
        >
          删除
        </v-btn>
        <v-btn
          variant="text"
          @click="handleSaveKind"
          :disabled="isDisabledKind"
        >
          保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="regexDialog" width="auto">
    <v-card width="400">
      <v-toolbar color="transparent">
        <v-btn icon @click="handleCloseRegexDialog">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>新增正则筛选</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="regexFormRef">
          <v-text-field
            v-model="regexForm.key"
            label="关键字"
            density="compact"
            variant="outlined"
            :rules="regexRules.key"
            autofocus
          ></v-text-field>
          <v-textarea
            class="tw-font-mono"
            v-model.trim="regexForm.regex"
            label="正则表达式"
            placeholder="输入正则表达式，以匹配路径"
            density="compact"
            variant="outlined"
            :rules="regexRules.regex"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleAddRegex">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { mdiClose } from '@mdi/js'
import { KeyRegexItem, KindFilterModel } from '@/models'
import { useSettingStore } from '@/store'
import { isIllegalIndex, isLegalIndex } from '@/utils/collections'
import cloneDeep from 'lodash/cloneDeep'
import { reactive } from 'vue'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { VForm } from 'vuetify/components'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import HeaderRow from '@/components/setting/table/HeadRow.vue'
import BodyRow from '@/components/setting/table/BodyRow.vue'
import FlexTable from '@/components/setting/table/FlexTable.vue'
import { nanoid } from 'nanoid'

const toast = useToast()
const settingStore = useSettingStore()

// ================== Kind ==================

const kindDrag = ref(false)
const kindDialog = ref(false)
const kindForm = reactive({
  label: '',
  value: ''
})
const kindRules = reactive({
  label: [(v: string) => !!v || '名称不为空'],
  value: [(v: string) => !!v || '类型规则不为空']
})

const kindFormRef = ref<ComponentRef<typeof VForm>>(null)

function handleCloseKindDialog() {
  kindDialog.value = false
  kindFormRef.value?.reset()
}

const isDisabledKind = ref(false)
const updatedKind = ref<KindFilterModel>()

function handleRemoveKind() {
  if (confirm('确定要删除吗？')) {
    const index = settingStore.kindFilters.findLastIndex(
      (item) => item.id === updatedKind.value?.id
    )
    if (isLegalIndex(settingStore.kindFilters, index)) {
      try {
        settingStore.kindFilters.splice(index, 1)
      } catch (err) {
        toast.error(err + '')
      }
    }
    handleCloseKindDialog()
  }
}

async function handleSaveKind() {
  if (!(await kindFormRef.value?.validate())?.valid) return

  try {
    if (updatedKind.value) {
      // update
      updatedKind.value.label = kindForm.label
      updatedKind.value.value = kindForm.value
    } else {
      // add
      const kind = new KindFilterModel(
        nanoid(10),
        kindForm.label,
        kindForm.value
      )
      settingStore.kindFilters.push(kind)
    }
    handleCloseKindDialog()
  } catch (err) {
    toast.error(err + '')
  }
}

function handleOpenKindDialog(kind?: KindFilterModel) {
  if (kind) {
    kindForm.label = kind.label
    kindForm.value = kind.value

    isDisabledKind.value =
      KindFilterModel.DEFAULT_KINDS.findIndex((item) => item.id === kind.id) !==
      -1
    updatedKind.value = kind
  } else {
    isDisabledKind.value = false
    updatedKind.value = undefined
  }

  kindDialog.value = true
}

// ================== Regex ==================

const regexDialog = ref(false)
const regexForm = reactive<KeyRegexItem>({
  key: '',
  regex: ''
})
const regexRules = reactive({
  key: [(v: string) => !!v || '关键字不为空'],
  regex: [(v: string) => !!v || '正则表达式不为空']
})

const regexFormRef = ref<ComponentRef<typeof VForm>>(null)

function handleCloseRegexDialog() {
  regexDialog.value = false
  regexFormRef.value?.reset()
}

async function handleAddRegex() {
  if (!(await regexFormRef.value?.validate())?.valid) return

  try {
    const index = settingStore.keyList.findIndex(
      (item) => item.key === regexForm.key
    )
    if (index !== -1) {
      if (!confirm('当前关键字已存在，是否覆盖它？')) return
      settingStore.keyList[index].regex = regexForm.regex
    } else {
      settingStore.keyList.push(cloneDeep(regexForm))
    }
    handleCloseRegexDialog()
  } catch (err) {
    toast.error(err + '')
  }
}

function handleRemoveRegex(index: number) {
  if (confirm('确定要删除吗？')) {
    try {
      if (isLegalIndex(settingStore.keyList, index)) {
        settingStore.keyList.splice(index, 1)
      }
    } catch (e) {
      toast.error(e + '')
    }
  }
}
</script>

<style lang="scss" scoped>
.ghost {
  @apply tw-bg-neutral-100 dark:tw-bg-neutral-800;
}

.kind-list-move {
  transition: transform 0.5s;
}
</style>
