<template>
  <div id="container">
    <el-card body-style="{padding: 5px}">
      <div
        class="clearfix"
        slot="header"
      >
        <b>基本</b>
      </div>
      <el-form
        class="setting-form"
        ref="settingForm"
      >
        <el-form-item label="是否搜索文件内容">
          <el-switch v-model="settings.data.isFindFileContent"></el-switch>
        </el-form-item>
        <el-form-item label="搜索范围">
          <el-select v-model="settings.data.searchRoot">
            <el-option
              label="~ (家目录)"
              value="user"
            ></el-option>
            <el-option
              label="/ (根目录)"
              value="root"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否自动搜索">
          <el-tooltip class="item" effect="dark" content="开启后，将在输入文本 0.5 秒后自动搜索" placement="right">
            <div style="float: right; cursor: default;">
              *
            </div>
          </el-tooltip>
          <el-switch v-model="settings.data.isAutoSearch"></el-switch>
        </el-form-item>
        <el-form-item label="是否展示全部文件">
          <el-tooltip class="item" effect="dark" content="仅在'在此文件夹中搜索'中生效" placement="right">
            <div style="float: right; cursor: default;">
              *
            </div>
          </el-tooltip>
          <el-switch v-model="settings.data.isShowFilesInTempDir"></el-switch>
        </el-form-item>
        <el-form-item label="是否使用系统文件图标">
          <el-switch v-model="settings.data.isUseSystemFileIcon"></el-switch>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card body-style="{padding: 5px}">
      <div
        class="clearfix"
        slot="header"
      >
        <b>快捷搜索</b>
        <el-button
          @click="addKeySearch"
          style="float: right; padding: 3px 0"
          type="text"
        >
          添加
        </el-button>
      </div>
      <el-table
        :data="settings.data.keyList"
        size="small"
        style="width: 100%"
      >
        <el-table-column
          label="关键词"
          prop="key"
          width="70"
        >
          <template slot-scope="scope">
            <code>{{ scope.row.key }}</code>
          </template>
        </el-table-column>
        <el-table-column
          label="正则表达式"
          prop="regex"
        >
          <template slot-scope="scope">
            <code>{{ scope.row.regex }}</code>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="50"
        >
          <template slot-scope="scope">
            <el-button
              @click="removeKeySearch(scope.row)"
              size="small"
              type="text"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card body-style="{padding: 5px}">
      <div
        class="clearfix"
        slot="header"
      >
        <b>预览</b>
        <el-popover
          placement="top"
          title="说明"
          trigger="hover"
          width="350"
        >
          <i
            class="el-icon-info"
            slot="reference"
            style="float: right; padding: 3px 0"
          ></i>
          <div>
            很多文本文件(如代码)在 macOS 中并不会被识别为同一个类型, 基于此插件决定把后缀名交由用户决定, 将自己常用的文本文件定义为在这里, 即可对其进行预览, 图片亦是如此
            <b>(注: 图片, 音频和视频格式需谷歌浏览器标签原生支持, 否则无法显示)</b>.
          </div>
        </el-popover>
      </div>
      <el-form
        class="preview-form"
        label-position="top"
        ref="previewForm"
      >
        <el-form-item label="文本文件后缀名">
          <el-input
            placeholder="文本文件后缀名"
            v-model="settings.data.fileExtension"
          ></el-input>
        </el-form-item>
        <el-form-item label="图片文件后缀名">
          <el-input
            placeholder="图片文件后缀名"
            v-model="settings.data.pictureExtension"
          ></el-input>
        </el-form-item>
        <el-form-item label="视频文件后缀名">
          <el-input
            placeholder="视频文件后缀名"
            v-model="settings.data.videoExtension"
          ></el-input>
        </el-form-item>
        <el-form-item label="音频文件后缀名">
          <el-input
            placeholder="音频文件后缀名"
            v-model="settings.data.audioExtension"
          ></el-input>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Tools from "../util/tools";

export default {
  name: "Setting",
  computed: {
    ...mapGetters({
      settings: "settings"
    })
  },
  mounted() {
  },
  methods: {
    save() {
      // 判断设置中的_rev是否为空
      if (this.settings._rev === "") {
        // 新增配置到数据库
        let result = utools.db.put({
          _id: this.settings._id,
          data: this.settings.data
        });
        if (result.error) {
          return false;
        }
        // 更新_rev
        this.$store.commit("updateSettingsRev", result.rev);
      } else {
        // 更新数据库中的配置
        let result = utools.db.put(this.settings);
        if (result.error) {
          return false;
        }
        // 更新_rev
        this.$store.commit("updateSettingsRev", result.rev);
      }
      return true;
    },
    addKeySearch() {
      let keyList = this.settings.data.keyList;
      this.$prompt("规则格式: <code>关键词&正则表达式</code>", "添加快捷搜索规则", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /.+&.+/,
        inputErrorMessage: "规则格式不正确",
        dangerouslyUseHTMLString: true
      }).then(({ value }) => {
        let separatorIndex = value.indexOf("&");
        let key = value.substring(0, separatorIndex);
        let regex = value.substring(separatorIndex + 1);
        let keySearch = {
          key: key,
          regex: regex
        };
        let index = Tools.findIndexInList(keyList, keySearch.key, "key");
        if (index > -1) {
          this.$confirm(
            "发现重复的关键词: " + keySearch.key + " , 是否要覆盖 ?",
            "注意",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
          ).then(() => keyList.splice(index, 1));
        }
        keyList.push(keySearch);
        this.$store.commit("updateSettingsKeyList", keyList);
        this.$message({
          type: "success",
          message: "添加成功!"
        });
      });
    },
    removeKeySearch(row) {
      let keyList = this.settings.data.keyList;
      this.$confirm("确认删除快捷搜索: " + row.key, "不可恢复", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let index = Tools.findIndexInList(keyList, row.key, "key");
        if (index > -1) {
          keyList.splice(index, 1);
        }
        this.$store.commit("updateSettingsKeyList", keyList);
        this.$message({
          type: "success",
          message: "删除成功!"
        });
      });
    }
  }
};
</script>

<style scoped>
#container .el-card {
  margin: 10px;
}

.setting-form {
  padding-left: 20px;
}
</style>
