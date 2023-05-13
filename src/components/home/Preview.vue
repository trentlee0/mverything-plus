<template>
  <div
    v-if="item"
    class="tw-h-full tw-w-full tw-overflow-hidden dark:tw-bg-neutral-900"
  >
    <div
      class="tw-flex tw-w-full tw-items-center tw-justify-center"
      :style="{ height: isPreview ? '55%' : '50%' }"
    >
      <FileThumbnail v-if="!isPreview" :src="item.thumbnail"></FileThumbnail>
      <FolderViewer
        v-else-if="item.previewType === FilePreviewType.FOLDER"
        :dir-path="item.path"
        :files="item.files ?? []"
      ></FolderViewer>
      <TextViewer
        v-else-if="item.previewType === FilePreviewType.TEXT"
        :text="item.fileText"
        font-size="12px"
        :loading="loading"
        :size="item.size ?? 0"
        :partial-size="
          (item.readTextSize ?? 0) < (item.size ?? 0)
            ? item.readTextSize
            : undefined
        "
        :encoding="item.textEncoding"
      ></TextViewer>
      <div
        v-else-if="item.previewType === FilePreviewType.PICTURE"
        class="tw-flex tw-h-full tw-w-full tw-justify-center tw-px-1"
      >
        <v-img :src="`file://${item.path}`" transition="" />
      </div>
      <div
        v-else-if="item.previewType === FilePreviewType.AUDIO"
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-px-1"
      >
        <audio
          ref="audioPlayer"
          class="tw-w-full"
          :src="`file://${item.path}`"
          controls
          controlslist="nodownload"
        />
      </div>
      <div
        v-else-if="item.previewType === FilePreviewType.VIDEO"
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-bg-black tw-px-1"
      >
        <video
          ref="videoPlayer"
          class="tw-h-full tw-w-full"
          :src="`file://${item.path}`"
          controls
          controlslist="nofullscreen"
          muted
        />
      </div>
      <FileThumbnail v-else :src="item.thumbnail"></FileThumbnail>
    </div>

    <div
      :style="{ height: `calc(${isPreview ? '45%' : '50%'})` }"
      class="tw-overflow-y-scroll"
    >
      <v-card-text class="tw-text-base">
        <FormItem
          class="tw-text-center tw-text-xl tw-font-bold"
          :text="item.name"
          split-symbol=""
          :label-cols="0"
          :text-cols="12"
          :tooltip="item.name"
          :tooltip-delay="1000"
        />

        <div class="tw-h-5"></div>

        <FormItem :text="item.path" :tooltip="item.path" :tooltip-delay="200">
          <template #label>
            <v-tooltip
              v-model="showTooltip"
              location="top"
              text="已复制"
              theme="light"
              :open-on-hover="false"
            >
              <template #activator="{ props }">
                <span
                  class="tw-cursor-pointer"
                  @click="handlePathClick(item?.path)"
                  v-bind="props"
                  v-text="'路径'"
                />
              </template>
            </v-tooltip>
          </template>
        </FormItem>
        <FormItem
          v-if="!isNull(item.size)"
          label="大小"
          :text="handleBytesToHuman(item.size)"
        />
        <FormItem
          v-if="item.previewType === FilePreviewType.FOLDER"
          label="项目数"
          :text="item.itemCount ?? 0"
        />
        <FormItem label="种类" :text="item?.kind" />
        <FormItem
          v-if="item.createDate"
          label="创建时间"
          :text="formatDatetime(item.createDate)"
        />
        <FormItem
          v-if="item.updateDate"
          label="修改时间"
          :text="formatDatetime(item?.updateDate)"
        />
        <FormItem
          v-if="item.usedDate"
          label="上次打开时间"
          :text="formatDatetime(item?.usedDate)"
        />
        <FormItem
          v-if="item.pixelWidth"
          label="尺寸"
          :text="`${item.pixelWidth}×${item.pixelWidth}`"
        />
        <FormItem label="类型树" v-show="item.typeTree.length">
          <template #default>
            <div
              v-for="typeItem in item.typeTree"
              :key="typeItem"
              class="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap"
              :title="typeItem"
            >
              {{ typeItem }}
            </div>
          </template>
        </FormItem>
      </v-card-text>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormItem from '@/components/common/FormItem.vue'
import FileThumbnail from './FileThumbnail.vue'
import FolderViewer from './FolderViewer.vue'
import TextViewer from './TextViewer.vue'
import { PreviewFileInfo } from '@/models'
import { formatDatetime, handleBytesToHuman } from '@/utils/strings'
import { FilePreviewType } from '@/constant'
import { copyText, createBrowserWindow } from 'utools-api'
import { onMounted, ref } from 'vue'
import { isNull } from 'lodash'

withDefaults(
  defineProps<{
    item?: PreviewFileInfo
    isPreview?: boolean
    loading?: boolean
  }>(),
  {
    isPreview: true,
    loading: false
  }
)

const showTooltip = ref(false)
function handlePathClick(path?: string) {
  if (!path) return
  showTooltip.value = true
  copyText(path)
  setTimeout(() => (showTooltip.value = false), 800)
}
</script>

<style lang="scss" scoped></style>
