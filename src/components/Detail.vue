<template>
  <div class="container">
    <div v-if="item">
      <transition
        name="animate__animated animate__bounce"
        enter-active-class="animate__fadeIn"
        leave-active-class="animate__fadeOut"
      >
        <el-card v-if="isShowPreview">
          <el-table
            :data="item.files"
            :max-height="400"
            @row-dblclick="detailFolderTableDbClickEvent"
            empty-text="文件夹为空"
            size="mini"
            stripe
            v-if="item.preview === 'folder'"
          >
            <el-table-column
              label="文件夹内容 (双击打开)"
              prop="name"
            ></el-table-column>
          </el-table>
          <div
            style="text-align: center"
            v-else-if="item.preview === 'picture'"
          >
            <el-image
              :src="item.path"
              style="max-width: 100%"
            ></el-image>
          </div>
          <div v-else-if="item.preview === 'text'">
            <div style="border: #f5f5f5 solid 2px; padding: 0 7px;overflow: auto; background: #fcfcfc;">
              <transition
                name="animate__animated animate__bounce"
                enter-active-class="animate__fadeIn"
                leave-active-class="animate__fadeOut"
              >
                <pre><code>{{ item.text }}</code></pre>
              </transition>
            </div>
          </div>
          <div v-else-if="item.preview === 'video'">
            <video
              :src="item.path"
              controls
              muted
              ref="videoPlayer"
              style="width: 100%"
            />
          </div>
          <div v-else-if="item.preview === 'audio'">
            <audio
              :src="item.path"
              controls
              ref="audioPlayer"
              style="width: 100%"
            />
          </div>
          <div
            style="text-align: center"
            v-else
          >
            <el-image
              :src="item.thumbnails"
              style="max-width: 100%;margin-bottom: 5px"
              v-if="item.thumbnails !== ''"
            ></el-image>
            <span v-else>暂无预览</span>
          </div>
        </el-card>
      </transition>
      <el-card body-style="{padding: 5px}">
        <el-form
          :show-message="false"
          label-position="left"
          label-width="70px"
          size="mini"
        >
          <el-form-item label="文件名">
            <div class="wrap" style="font-size: large; font-weight: bold;">
              {{ item.name }}
              <CopyButton :text="item.name">复制</CopyButton>
            </div>
          </el-form-item>
          <el-form-item label="路径">
            <div class="wrap">
              {{ item.path }}
              <CopyButton :text="item.path">复制</CopyButton>
            </div>
          </el-form-item>
          <el-form-item
            label="大小"
            v-show="item.size"
          >
            <span v-text="handleByteSize(item.size) || '无'"></span>
          </el-form-item>
          <el-form-item
            label="子文件数"
            v-show="item.count"
          >{{ item.count }}
          </el-form-item>
          <el-form-item label="类型">
            <div :title="item.type">{{ item.kind }}</div>
          </el-form-item>
          <el-form-item label="创建时间">
            <div>{{ formatDatetime(item.createDate) }}</div>
          </el-form-item>
          <el-form-item label="更新时间">
            <div>{{ formatDatetime(item.updateDate) }}</div>
          </el-form-item>
          <el-form-item label="打开时间" v-if="item.usedDate">
            <div>{{ formatDatetime(item.usedDate) }}</div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <div
      v-else
      style="display: flex; height: 100%; justify-content: center; align-items: center;"
    >
      <div>暂无预览</div>
    </div>
  </div>
</template>

<script>
import CopyButton from "@/components/CopyButton";
import Tools from "@/util/tools";

export default {
  name: "Detail",
  components: { CopyButton },
  props: {
    item: {
      type: Object
    },
    isShowPreview: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    detailFolderTableDbClickEvent(row, column, event) {
      utools.shellOpenPath(this.item.path + "/" + row.name);
    },
    formatDatetime(date) {
      return Tools.formatDatetime(date);
    },
    handleByteSize(size) {
      return Tools.handleBytesToHuman(size);
    }
  }
};
</script>

<style scoped>
.container {
  height: 100%;
  overflow-y: auto;
}

.container .el-card {
  margin: 6px;
}

.wrap {
  word-break: break-all;
}
</style>
