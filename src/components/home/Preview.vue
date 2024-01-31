<template>
  <div v-if="item" class="tw-h-full tw-w-full tw-overflow-hidden dark:tw-bg-neutral-900">
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
        :find-words="findWords"
        font-size="12px"
        :loading="loading"
        :size="item.size ?? 0"
        :partial-size="(item.readTextSize ?? 0) < (item.size ?? 0) ? item.readTextSize : undefined"
        :encoding="item.textEncoding"
      ></TextViewer>
      <div
        v-else-if="item.previewType === FilePreviewType.PICTURE"
        class="overflow-hidden tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-bg-neutral-50 dark:tw-bg-neutral-950"
        @wheel="handleWheelImage"
      >
        <v-img ref="imgRef" :src="`file://${item.path}`" :transition="false" :draggable="false" />
      </div>
      <div
        v-else-if="item.previewType === FilePreviewType.AUDIO"
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-px-1"
      >
        <audio
          ref="audioRef"
          class="tw-w-full tw-outline-current"
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
          ref="videoRef"
          class="tw-h-full tw-w-full tw-outline-current"
          :src="`file://${item.path}`"
          controls
          controlslist="nofullscreen"
        />
      </div>
      <FileThumbnail v-else :src="item.thumbnail"></FileThumbnail>
    </div>

    <div :style="{ height: `calc(${isPreview ? '45%' : '50%'})` }" class="tw-overflow-y-scroll">
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

        <FormItem v-if="item.tags?.length" label="标签">
          <template #default>
            <span
              v-for="(tag, index) in item.tags"
              :key="index"
              class="tw-mr-1 tw-rounded tw-bg-neutral-300 tw-px-1 tw-py-px tw-text-xs dark:tw-bg-neutral-600"
            >
              {{ tag }}
            </span>
          </template>
        </FormItem>
        <FormItem label="路径" :text="item.path" :tooltip="item.path" />
        <FormItem
          v-if="!isNull(item.size)"
          label="大小"
          :text="formatBytesToHuman(item.size)"
          :title="formatBytesToThousands(item.size)"
        />
        <FormItem
          v-if="item.previewType === FilePreviewType.FOLDER"
          label="项目数"
          :text="item.itemCount ?? 0"
        />
        <FormItem v-if="item.kind" label="种类">
          <template #default>
            <span :title="item.type">{{ item?.kind }}</span>
            <span v-if="item?.architectures" :title="item?.architectures.join(',')">
              ({{ formatArchitectures(item.architectures) }})
            </span>
          </template>
        </FormItem>
        <FormItem v-if="item.createDate" label="创建时间" :text="formatDatetime(item.createDate)" />
        <FormItem v-if="item.updateDate" label="修改时间" :text="formatDatetime(item?.updateDate)" />
        <FormItem v-if="item.usedDate" label="上次打开时间" :text="formatDatetime(item?.usedDate)" />
        <FormItem v-if="item.version" label="版本" :text="item?.version" />
        <FormItem v-if="item.copyright" label="版权">
          <template #default>
            <span>{{ item.copyright }}</span>
          </template>
        </FormItem>
        <FormItem v-if="item.pixelWidth" label="尺寸" :text="`${item.pixelWidth}×${item.pixelHeight}`" />
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
import {
  formatDatetime,
  formatBytesToHuman,
  formatBytesToThousands,
  formatArchitectures
} from '@/utils/strings'
import { FilePreviewType } from '@/constant'
import { ref, watch } from 'vue'
import isNull from 'lodash/isNull'
import { VImg } from 'vuetify/lib/components/index.mjs'
import debounce from 'lodash/debounce'

const props = withDefaults(
  defineProps<{
    item?: PreviewFileInfo
    findWords: string[]
    isPreview?: boolean
    loading?: boolean
  }>(),
  {
    isPreview: true,
    loading: false
  }
)

const imgRef = ref<ComponentRef<typeof VImg>>(null)
let delta = 1
const minRatio = 0.2
const maxRatio = 8
watch(
  () => props.item,
  () => {
    if (props.item?.previewType === FilePreviewType.PICTURE) {
      delta = 1
      setTimeout(() => {
        const imgEl = imgRef.value?.$el.querySelector('img') as HTMLImageElement
        imgEl.style.transform = ``
      })
    }
  }
)

const handleWheelImage = debounce(
  (e: WheelEvent) => {
    setTimeout(() => {
      const imgEl = imgRef.value?.$el.querySelector('img') as HTMLImageElement
      let del = delta + -e.deltaY / 500
      if (del >= maxRatio) del = maxRatio
      delta = Math.max(del, minRatio)
      imgEl.style.transform = `scale(${delta})`
    })
  },
  10,
  {
    leading: true,
    trailing: false
  }
)
</script>

<style lang="scss" scoped></style>
