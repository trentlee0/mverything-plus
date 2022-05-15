<template>
  <div>
    <div id="finder" style="position: absolute;height: 100%; width: 100%; background: #fafbfc">
      <div style="height: calc(100% - 40px); overflow: hidden;">
        <div style="float: left; height: 100%;" :style="{width: hasDetail ? '55%' : '100%'}">
          <vxe-table
            :context-menu="{body: {options: menus}}"
            :keyboard-config="{isArrow: true}"
            :loading="loading"
            :optimization="{scrollY: {gt: 1000, oSize: 10, rSize: 100}}"
            :show-header="false"
            height="100%"
            @cell-context-menu="cellClickEvent"
            @cell-dblclick="cellDClickEvent"
            @context-menu-click="menuClickEvent"
            @current-change="currentChangeEvent"
            highlight-current-row
            highlight-hover-row
            ref="xTable"
            style="background: #fafbfc"
            :row-config="{height: 120}"
            show-overflow="title"
            tabindex="0"
          >
            <vxe-table-column
              field="kMDItemContentType"
              width="50"
            >
              <template v-slot="{ row }">
                <img :src="settings.data.isUseSystemFileIcon ? getFileIcon(row.path) : row.icon" class="icon" />
              </template>
            </vxe-table-column>
            <vxe-table-column
              field="path"
            >
              <template v-slot="{ row }">
                <span class="name" style="font-size: medium; line-height: 25px;">{{ row.name }}</span> <br />
                <span class="path" style="font-size: small;">{{ row.path }}</span>
              </template>
            </vxe-table-column>
          </vxe-table>
        </div>

        <div
          id="detail"
          style="float:left; height: 100%; overflow: auto;"
          :style="{width: hasDetail ? '45%' : '0%'}"
        >
          <div v-if="hasDetail">
            <el-card v-if="enablePreview">
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
                <div style="padding: 0 5px; overflow: auto; background: #f5f5f5;">
                  <pre><code>{{ item.text }}</code></pre>
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
                  <span v-if="item.size > 1000000000">{{ numberFix(item.size / 1000000000, 2) }} GB</span>
                  <span v-else-if="item.size > 1000000">{{ numberFix(item.size / 1000000, 2) }} MB</span>
                  <span v-else-if="item.size > 1000">{{ numberFix(item.size / 1000, 2) }} KB</span>
                  <span v-else-if="item.size > 0">{{ item.size }} B</span>
                  <span v-else>无</span>
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
                <el-form-item label="使用时间" v-if="item.usedDate">
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
      </div>

      <div id="footer">
        <el-row
          align="middle"
          type="flex"
        >
          <el-col
            :span="4"
            style="padding-left: 15px;text-align: left"
          >
            <div
              @click="settingDrawer.open = true"
              class="setting-button"
              ref="settingButton"
              title="设置"
            >
              <i class="el-icon-s-tools"></i>
            </div>
            <div
              @click="tipDrawer.open = true"
              class="tip-button"
              ref="tipButton"
              title="提示"
            >
              <i class="el-icon-info"></i>
            </div>
          </el-col>

          <el-col :span="12">
            <div class="sort-button" style="margin-right: 15px;">
              <i v-show="sort.type === -1" title="升序" class="el-icon-arrow-up" @click="handleSortChange"></i>
              <i v-show="sort.type === 1" title="降序" class="el-icon-arrow-down" @click="handleSortChange"></i>
            </div>
            <el-radio-group
              @change="sortChangeEvent"
              class="radio-group"
              size="mini"
              v-model="sort.field"
            >
              <el-radio-button label="name">名称</el-radio-button>
              <el-radio-button label="size">大小</el-radio-button>
              <el-radio-button label="createDate">创建时间</el-radio-button>
              <el-radio-button label="updateDate">更新时间</el-radio-button>
            </el-radio-group>
          </el-col>

          <el-col :span="4">
            <div v-show="settings.data.isShowDetailPage">
              预览文件
              <el-switch
                v-model="enablePreview"
              >
              </el-switch>
            </div>
          </el-col>

          <el-col :span="4">
            <div id="total">共搜索到 {{ tableData.length }} 条</div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 设置界面 -->
    <el-drawer
      :before-close="settingDrawerCloseEvent"
      :direction="settingDrawer.direction"
      :show-close="false"
      :size="'370px'"
      :visible.sync="settingDrawer.open"
      style="height: 100%; width: 100%;"
    >
      <div
        class="clearfix"
        slot="title"
      >
        <span class="drawer-header">设置 Settings</span>
      </div>
      <Settings ref="settings" />
    </el-drawer>

    <!-- 提示界面 -->
    <el-drawer
      :direction="tipDrawer.direction"
      :show-close="false"
      :size="'360px'"
      :visible.sync="tipDrawer.open"
      style="height: 100%; width: 100%;"
    >
      <div
        class="clearfix"
        slot="title"
      >
        <span class="drawer-header">提示 Tips</span>
      </div>
      <Tips />
    </el-drawer>
  </div>
</template>

<script>
import Handler from "./util/handler";
import Tools from "./util/tools";
import IconvLite from "iconv-lite";
import CharDetect from "chardet";

import { mapGetters } from "vuex";

import Tips from "./components/Tips";
import Settings from "./components/Setting";
import Detail from "./components/Detail";
import dayjs from "dayjs";
import CopyButton from "@/components/CopyButton";

export default {
  name: "Finder",
  components: {
    CopyButton,
    Settings,
    Tips,
    Detail
  },
  data() {
    return {
      isCopyShow: true,
      tableData: [],
      tableHeight: 550,
      loading: false,
      query: "",
      settingDrawer: {
        open: false,
        direction: "ltr"
      },
      tipDrawer: {
        open: false,
        direction: "ltr"
      },
      item: {},
      codeMirrorOption: {
        lineNumbers: true,
        lineWrapping: true,
        dragDrop: false,
        readOnly: "nocursor"
      },
      viewer: {
        images: []
      },
      viewerOptions: {
        inline: false,
        button: true,
        navbar: false,
        title: true,
        toolbar: true,
        tooltip: false,
        movable: false,
        zoomable: true,
        rotatable: true,
        scalable: true,
        transition: false,
        fullscreen: false,
        keyboard: false
      },
      tempDir: "",
      homeDir: "/",
      rootDir: "/",
      preview: {
        status: false,
        start: 0
      },
      sort: {
        field: "updateDate",
        type: 1
      },
      menus: [
        [
          {
            code: "open",
            name: "打开"
          },
          {
            code: "openInFinder",
            name: "在 Finder 中显示"
          }
        ],
        [
          {
            code: "copy",
            name: "复制"
          },
          {
            code: "copyFileName",
            name: "复制文件名"
          },
          {
            code: "copyFilePath",
            name: "复制文件路径"
          }
        ]
      ],
      keyboardEvent: {
        enter: true
      },
      enablePreview: false
    };
  },
  computed: {
    ...mapGetters({
      settings: "settings"
    }),
    hasDetail() {
      return this.settings.data.isShowDetailPage && Object.entries(this.item).length !== 0;
    }
  },
  mounted() {
    this.tableData = [];
    this.$refs.xTable.loadData(this.tableData);
    let tempPath = utools.getPath("temp");
    window.initTempPath(tempPath);

    const preview = utools.dbStorage.getItem("enablePreview");
    this.enablePreview = preview === null ? false : preview;

    let newSettings = Tools.databaseUpdate(this.settings);
    this.$store.commit("updateSettings", newSettings);
    utools.onPluginEnter(({ code, type, payload }) => {
      // 初始化
      this.initial(code, type, payload).then(() => {
        let timer = null;
        utools.setSubInput(({ text }) => {
          // 把输入更新到变量中
          this.query = text;
          // 当在文件夹中搜索时，显示全部文件
          if (this.tempDir !== "" && this.settings.data.isShowTempDirAllFiles) {
            clearTimeout(timer);
            if (!text) {
              this.searchAll();
              return;
            }
          }

          if (this.settings.data.isAutoSearch) {
            clearTimeout(timer);
            timer = setTimeout(() => {
              this.search(this.query);
            }, 500);
          }
        }, "搜索");

        // 把上次搜索的关键字设置到输入框中
        utools.setSubInputValue(this.query);
      });
    });
    utools.onPluginOut(() => {
      this.tempDir = "";
      this.reset();
      window.killMdfind();
    });
    // 绑定键盘事件
    document.addEventListener("keydown", this.keyDownEvent);
    document.addEventListener("click", this.clickEvent);
  },
  destroyed() {
    // 解绑键盘事件
    document.removeEventListener("keydown", this.keyDownEvent);
    document.removeEventListener("click", this.clickEvent);
  },
  methods: {
    getFileIcon(path) {
      return utools.getFileIcon(path);
    },
    initial(code, type, payload) {
      // 初始化找到用户目录
      this.homeDir = utools.getPath("home");
      return new Promise((resolve, reject) => {
        try {
          const h = this.$createElement;
          if (type === "files") {
            this.$notify({
              title: "当前搜索路径",
              message: h(
                "code",
                { style: "word-break: break-all" },
                payload[0].path
              ),
              duration: 3000
            });
            this.tempDir = payload[0].path;
            resolve();
          } else if (type === "window") {
            utools.readCurrentFolderPath().then(dir => {
              this.$notify({
                title: "当前搜索路径",
                message: h("code", { style: "word-break: break-all" }, dir),
                duration: 3000
              });
              this.tempDir = dir;
              resolve();
            }).catch(err => {
              // 报错选择桌面路径
              console.error(err);
              const dir = utools.getPath("desktop");
              this.$notify({
                title: "当前搜索路径",
                message: h("code", { style: "word-break: break-all" }, dir),
                duration: 3000
              });
              this.tempDir = dir;
              resolve();
            });
          } else if (type === "over") {
            this.query = payload;
            resolve();
          } else {
            resolve();
          }
        } catch (err) {
          reject(err);
          resolve();
        }
      });
    },
    // 重置
    reset() {
      // 清空结果表格
      this.tableData = [];
      this.$refs.xTable.loadData(this.tableData);
      this.item = {};
      // 关闭加载进度条
      this.loading = false;
    },
    searchAll() {
      this.search("* = *");
    },
    // 搜索
    search(query) {
      // 打开加载中进度条
      this.loading = true;

      // 如果搜索的关键字为空
      if (query === "") {
        this.reset();
        return;
      }

      let highFilter = "";
      if (query.length > 2) {
        let first = query.charAt(0);
        let second = query.charAt(1);
        if (first === " ") {
          highFilter = "F";
          if (second === " ") {
            highFilter = "f";
          }
        }
      }
      query = query.trim();

      let keyWord = "";
      // mdfind 默认关键字不处理
      if (query.indexOf("kind:") < 0 && query.indexOf("date:") < 0) {
        // 处理条件搜索关键字
        let keyIndex = query.indexOf(this.settings.data.searchKey);
        if (keyIndex > 0) {
          keyWord = query.substring(0, keyIndex);
          query = query.substring(keyIndex + 1, query.length);
        }

        // 如果搜索的关键字还是为空
        if (query.trim() === "") {
          this.reset();
          return;
        }
      }

      // 判断当前配置中设置的搜索起始目录
      let dir =
        this.tempDir === ""
          ? this.settings.data.searchRoot === "user"
            ? this.homeDir
            : this.rootDir
          : this.tempDir;
      // 判断当前配置设置的搜索模式
      let isOnlyName = !this.settings.data.isFindFileContent;
      // 搜索
      window.find(query, isOnlyName, dir, result => {
        if (this.$refs.xTable) {
          // 处理搜索结果
          this.tableData = Handler.handle(
            result,
            highFilter,
            keyWord,
            Tools.generateListToMap(this.settings.data.keyList, "key", "regex")
          );
          this.tableData = Handler.sort(
            this.tableData,
            this.sort.field,
            this.sort.type
          );

          // 加载搜索结果
          this.$refs.xTable.loadData(this.tableData);
          // 设置第一条结果的高亮
          this.$refs.xTable.setCurrentRow(this.tableData[0]);
          // 滚动到表格顶部
          this.$refs.xTable.scrollTo(this.tableData[0]);
        }
        // 结束加载中进度条
        this.loading = false;
      });
    },
    copyTextToClipBoard(text) {
      utools.copyText(text);
    },
    copyFileToClipBoard(path) {
      let extension = Tools.getExtension(path);
      if (extension === "png" || extension === "jpg" || extension === "jpeg") {
        utools.copyImage(path);
      } else {
        utools.copyFile(path);
      }
    },
    clickEvent(event) {
      if (this.settingDrawer.open || this.tipDrawer.open) return;
      utools.subInputFocus();
    },
    // 键盘事件
    keyDownEvent(event) {
      // 获取当前按下的键
      let keyCode = window.event ? event.keyCode : event.which;
      // 回车
      if (keyCode === 13) {
        if (this.keyboardEvent.enter) {
          // 开启加载中进度条
          this.loading = true;
          // 执行搜索
          this.search(this.query);
        }
      }
      // ⌘ F
      else if (keyCode === 70 && event.metaKey) {
        utools.subInputFocus();
      }
    },
    // 表格快捷菜单点击事件
    menuClickEvent({ menu, row }) {
      let code = menu.code;
      let path = row.path;
      let name = row.name;
      switch (code) {
        case "open":
          utools.shellOpenPath(path);
          break;
        case "openInFinder":
          utools.shellShowItemInFolder(path);
          break;
        case "copy":
          this.copyFileToClipBoard(path);
          break;
        case "copyFilePath":
          this.copyTextToClipBoard(path);
          break;
        case "copyFileName":
          this.copyTextToClipBoard(name);
          break;
      }
    },
    currentChangeEvent({ row }) {
      this.$refs.xTable.setCurrentRow(row);
      this.loadData(row);
    },
    sortChangeEvent(value) {
      this.loading = true;
      this.tableData = Handler.sort(
        this.tableData,
        this.sort.field,
        this.sort.type
      );
      // 加载搜索结果
      this.$refs.xTable.loadData(this.tableData);
      // 设置第一条结果的高亮
      this.$refs.xTable.setCurrentRow(this.tableData[0]);
      // 滚动到表格顶部
      this.$refs.xTable.scrollTo(this.tableData[0]);
      this.loading = false;
    },
    // 行单击事件
    cellClickEvent({ row }) {
      this.$refs.xTable.setCurrentRow(row);
      this.loadData(row);
    },
    // 行双击事件
    cellDClickEvent({ row }) {
      // 直接打开
      utools.shellOpenPath(row.path);
    },
    // 抽屉关闭事件
    settingDrawerCloseEvent(done) {
      let result = this.$refs.settings.save();
      if (result) {
        this.$message.success({
          message: "配置保存成功",
          duration: 1500
        });
        done();
        // 重新加载数据
        this.$refs.xTable.loadData(this.tableData);
      } else {
        this.$message.error("配置保存失败");
      }
      this.settingDrawer.open = false;
    },
    loadData(item) {
      if (item.path === this.item.path) {
        return;
      }
      this.item = item;
      if (this.item.type === "public.folder") {
        this.item.preview = "folder";
        window.readFileList(this.item.path, data => {
          this.item.files = data;
        });
        return;
      }
      let extension = Tools.getExtension(this.item.name);
      if (
        extension &&
        this.settings.data.fileExtension.indexOf(extension) > -1
      ) {
        this.item.preview = "text";
      } else if (
        extension &&
        this.settings.data.pictureExtension.indexOf(extension) > -1
      ) {
        this.item.preview = "picture";
      } else if (
        extension &&
        this.settings.data.videoExtension.indexOf(extension) > -1
      ) {
        this.item.preview = "video";
      } else if (
        extension &&
        this.settings.data.audioExtension.indexOf(extension) > -1
      ) {
        this.item.preview = "audio";
      }

      if (
        this.item.type === "public.plain-text" ||
        (this.item.preview && this.item.preview === "text")
      ) {
        if (this.enablePreview) {
          this.loadFileContent();
        }
      }

      if (!this.item.preview) {
        this.item.thumbnails = this.getFileIcon(this.item.path);
      }
    },
    numberFix(number, fixed) {
      return number.toFixed(fixed);
    },
    detailFolderTableDbClickEvent(row, column, event) {
      utools.shellOpenPath(this.item.path + "/" + row.name);
    },
    formatDatetime(date) {
      if (!date) return "";
      return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
    },
    handleSortChange() {
      this.sort.type = -this.sort.type;
      this.sortChangeEvent();
    },
    loadFileContent() {
      if (this.item && this.item.path) {
        window.readTextFile(this.item.path, data => {
          this.item.text = "加载中...";
          let encode = CharDetect.detect(data);
          this.item.text = IconvLite.decode(data, encode);
        });
      }
    }
  },
  watch: {
    tableData(newVal, oldVal) {
      if (newVal.length) {
        this.$refs.xTable.setCurrentRow(this.tableData[0]);
        this.loadData(this.tableData[0]);
      } else {
        this.item = {};
      }
    },
    enablePreview(newVal, oldVal) {
      if (newVal) {
        if (this.hasDetail) {
          this.loadFileContent();
        }
      }
      utools.dbStorage.setItem("enablePreview", newVal);
    }
  }
};
</script>

<style scoped>
.vxe-table:focus {
  outline: none;
}

.vxe-table::before,
.vxe-table::after {
  height: 0px;
}

.icon {
  width: 33px;
  height: 33px;
  padding-right: 10px;
}

.name {
  color: #000000c4;
  cursor: default;
  user-select: none;
}

.path {
  color: #a0a0a0;
  cursor: default;
  user-select: none;
}

#footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 40px;
  background: #fafbfc;
}

.setting-form {
  padding-left: 20px;
}

#setting .el-card,
#detail .el-card {
  margin: 10px;
}

.gap {
  padding-left: 2px;
  padding-right: 2px;
}

.drawer-header {
  font-size: 1.5em;
  font-weight: bold;
}

.wrap {
  word-break: break-all;
}

.setting-button,
.tip-button,
.sort-button {
  display: inline-block;
  margin-left: 12px;
  margin-right: 12px;
  cursor: pointer;
  color: #808080;
}

.el-col {
  padding-top: 5px;
  text-align: center;
}
</style>
<style>
.detail-drawer .el-dialog__wrapper {
  pointer-events: none;
}

.detail-drawer .el-dialog__wrapper .el-drawer.rtl {
  pointer-events: all;
}

.el-drawer.ltr,
.el-drawer.rtl {
  overflow-y: auto;
}
</style>

