<template>
  <div id="page">
    <div id="finder">
      <el-tabs
        v-model="currentKind"
        @tab-click="filterKindChangeEvent"
        style="background: #fafbfc;line-height: 30px; height: 29px; overflow: hidden; border-bottom: #fafbfc solid 1px;"
        type="border-card"
        @keydown.native.capture="handleTabKeydownEvent"
      >
        <el-tab-pane
          :label="value"
          :name="key"
          v-for="(value, key, index) of filterKinds"
          :key="index" />
      </el-tabs>

      <div id="finder-main">
        <div
          id="main-list"
          :style="{width: listWidth}"
          v-loading="loading"
        >
          <vxe-table
            class="list-table"
            :context-menu="{body: {options: menus}}"
            :keyboard-config="{isArrow: true}"
            :show-header="false"
            height="100%"
            auto-resize
            @cell-context-menu="cellClickEvent"
            @cell-dblclick="cellDClickEvent"
            @context-menu-click="menuClickEvent"
            @current-change="currentChangeEvent"
            highlight-current-row
            @cell-mouseenter="mouseEnterTableEvent"
            ref="xTable"
            :row-config="{height: rowHeight}"
            empty-text=""
            show-overflow
            tabindex="0"
          >
            <template #empty>
              <div style="display: flex; justify-content: center; align-items: center;">
                <el-empty :image="emptyImage" description=" "></el-empty>
              </div>
            </template>
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
              type="html"
            >
              <template v-slot="{ row }">
                <div>
                  <el-row
                    type="flex"
                    align="center"
                    style="padding: 5px 0; user-select: none;"
                    :style="{height: rowHeight + 'px'}"
                  >
                    <el-col
                      :span="listFileNamePathItemWidth"
                      style="text-align: left;"
                    >
                      <div class="name">{{ row.name }}</div>
                      <div class="path">
                        {{ row.path }}
                      </div>
                    </el-col>
                    <el-col
                      :span="listFileDateSizeItemWidth"
                      style="text-align: right;"
                      v-show="isListMode"
                    >
                      <div style="font-size: medium;">
                        {{ formatDatetime(row.updateDate) }}
                      </div>
                      <div style="font-size: small; margin-top: 5px;">
                        {{ handleByteSize(row.size) }}
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </template>
            </vxe-table-column>
          </vxe-table>
        </div>

        <div
          id="main-detail"
          :style="{width: detailWidth}"
          v-if="isPreviewMode"
        >
          <Detail :item="item" :is-show-preview="enablePreviewContent"></Detail>
        </div>
      </div>

      <div id="footer">
        <el-row
          align="middle"
          type="flex"
        >
          <el-col
            :span="3"
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
              title="帮助"
            >
              <i class="el-icon-question"></i>
            </div>
          </el-col>

          <el-col :span="4">
            <div
              style="overflow: hidden; text-overflow: ellipsis;white-space:nowrap;"
              :title="currentDir"
            >
              {{ currentDir }}
            </div>
          </el-col>

          <el-col :span="4">
            <div class="sort-button" style="margin-right: 15px;">
              <i v-show="sort.type === -1" title="升序" class="el-icon-caret-top" @click="handleSortChange"></i>
              <i v-show="sort.type === 1" title="降序" class="el-icon-caret-bottom" @click="handleSortChange"></i>
            </div>
            <el-dropdown @command="sortChangeEvent" style="cursor: pointer;">
              <span style="user-select: none;" v-text="sortCommands[sort.field]"></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(title, command) in sortCommands"
                  :key="command"
                  :command="command"
                >
                  {{ title }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>

          <el-col :span="5" style="display: flex;justify-content: center;">
            <DisplayItemGroup
              :items="displayItems"
              :selected-index="displayItemIndex"
              @itemChange="displayItemChangeEvent"
            ></DisplayItemGroup>
          </el-col>

          <el-col :span="3">
            <div v-show="isPreviewMode" style="user-select: none;">
              预览内容
              <el-switch
                v-model="enablePreviewContent"
              >
              </el-switch>
            </div>
          </el-col>

          <el-col :span="5" style="display: flex; justify-content: center;">
            <div id="total">共搜索到 {{ tableData.length }} 条</div>
          </el-col>
        </el-row>
      </div>
    </div>

    <el-dialog
      :visible.sync="deleteDialog.show"
      @close="deleteDialogCloseEvent"
      title="提示"
      width="300px"
    >
      <span>是否将文件移到废纸篓?</span>
      <span
        class="dialog-footer"
        slot="footer"
      >
        <el-button
          @click="deleteDialog.show = false"
          size="mini"
        >
          取 消
        </el-button>
        <el-button
          @click="deleteFile(deleteDialog.file)"
          size="mini"
          type="primary"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>

    <!-- 预览界面 -->
    <el-drawer
      class="drawer"
      :direction="detailDrawer.direction"
      :show-close="false"
      :size="'52%'"
      :visible.sync="detailDrawer.open"
      :with-header="false"
    >
      <Detail :item="item"></Detail>
    </el-drawer>

    <!-- 设置界面 -->
    <el-drawer
      class="drawer"
      :before-close="settingDrawerCloseEvent"
      :direction="settingDrawer.direction"
      :show-close="false"
      :size="'370px'"
      :visible.sync="settingDrawer.open"
    >
      <div
        class="clearfix"
        slot="title"
      >
        <span class="drawer-header">设置 Settings</span>
      </div>
      <Settings ref="settings" />
    </el-drawer>

    <!-- 帮助界面 -->
    <el-drawer
      class="drawer"
      :direction="tipDrawer.direction"
      :show-close="false"
      :size="'360px'"
      :visible.sync="tipDrawer.open"
    >
      <div
        class="clearfix"
        slot="title"
      >
        <span class="drawer-header">帮助 Help</span>
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
import CopyButton from "@/components/CopyButton";
import DisplayItemGroup from "@/components/DisplayItemGroup";
import Detail from "@/components/Detail";

import emptyImage from "@/assets/empty_inbox.svg";

export default {
  name: "Finder",
  components: {
    Detail,
    DisplayItemGroup,
    CopyButton,
    Settings,
    Tips
  },
  data() {
    return {
      tableData: [],
      rowHeight: 48,
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
      detailDrawer: {
        open: false,
        direction: "rtl"
      },
      item: {},
      tempDir: "",
      homeDir: "/",
      rootDir: "/",
      sort: {
        field: "updateDate",
        type: 1
      },
      menus: [
        [
          {
            code: "detail",
            name: "显示详情"
          }
        ],
        [
          {
            code: "open",
            name: "打开"
          },
          {
            code: "openInFinder",
            name: "在访达中显示"
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
        ],
        [
          {
            code: "delete",
            name: "删除"
          }
        ]
      ],
      deleteDialog: {
        show: false,
        file: null
      },
      enablePreviewContent: false,
      isMouseMove: false,
      mouseMoveTimer: null,
      sortCommands: {
        name: "名称",
        size: "大小",
        createDate: "创建时间",
        updateDate: "更新时间"
      },
      displayItems: [
        { code: "list", title: "列表模式", icon: "formatListBulleted" },
        { code: "preview", title: "预览模式", icon: "viewWeekOutline" }
      ],
      displayItemIndex: 0,
      detailDrawerTimer: null,
      isOverEnter: false,
      filterKinds: {
        "no": "不筛选",
        "image": "图片",
        "audio": "音频",
        "movie": "视频",
        "pdf": "PDF",
        "Word": "Word",
        "Excel": "Excel",
        "PowerPoint": "PPT"
      },
      currentKind: "no",
      currentKindIndex: 0,
      currentKindChangeTimer: null
    };
  },
  computed: {
    ...mapGetters({
      settings: "settings"
    }),
    isNotEmptyDetail() {
      return this.isPreviewMode && Object.entries(this.item).length !== 0;
    },
    isPreviewMode() {
      return this.displayItems[this.displayItemIndex].code === "preview";
    },
    isListMode() {
      return this.displayItems[this.displayItemIndex].code === "list";
    },
    listWidth() {
      return this.isNotEmptyDetail ? "55%" : "100%";
    },
    computedRowHeight() {
      return this.rowHeight + 1;
    },
    detailWidth() {
      return this.isNotEmptyDetail ? "45%" : "0%";
    },
    listFileNamePathItemWidth() {
      return this.isNotEmptyDetail ? 24 : 19;
    },
    listFileDateSizeItemWidth() {
      return this.isNotEmptyDetail ? 0 : 5;
    },
    isListAllFiles() {
      return this.tempDir !== "" && this.settings.data.isShowFilesInTempDir;
    },
    currentDir() {
      return this.tempDir === ""
        ? this.settings.data.searchRoot === "user"
          ? this.homeDir
          : this.rootDir
        : this.tempDir;
    },
    isNoFilter() {
      return this.currentKind === "no";
    },
    emptyImage() {
      return emptyImage;
    }
  },
  mounted() {
    this.tableData = [];
    this.reloadTableData();

    const preview = utools.dbStorage.getItem("enablePreviewContent");
    this.enablePreviewContent = preview === null ? true : preview;
    const displayIndex = utools.dbStorage.getItem("displayItemIndex");
    this.displayItemIndex = displayIndex === null ? 1 : displayIndex;

    let newSettings = Tools.databaseUpdate(this.settings);
    this.$store.commit("updateSettings", newSettings);
    utools.onPluginEnter(({ code, type, payload }) => {
      // 初始化
      this.initial(code, type, payload).then(() => {
        let timer = null;
        utools.setSubInput(({ text }) => {
          // 去除右边空格后，与之前查询相同不处理
          if (this.query !== "" && this.trimRight(text) === this.query && this.tableData.length) return;
          // 把输入更新到变量中
          this.query = text;
          // 搜索内容为空，当在文件夹中搜索时，显示全部文件
          if (this.isListAllFiles) {
            clearTimeout(timer);
            if (!this.query) {
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

        // 进入在文件夹中搜索，显示全部文件
        if (this.isListAllFiles) {
          clearTimeout(timer);
          this.searchAll();
        }

        // 把上次搜索的关键字设置到输入框中
        if (this.tempDir === "") {
          utools.setSubInputValue(this.query);
          utools.subInputSelect();
        } else {
          this.query = "";
        }
      });
    });
    utools.onPluginOut(() => {
      this.tempDir = "";
      this.reset();
      this.currentKind = "no";
      this.currentKindIndex = 0;
      this.detailDrawer.open = false;
    });
    // 绑定键盘事件
    document.addEventListener("keydown", this.keyDownEvent);
    document.addEventListener("mousemove", this.mouseMoveEvent);
  },
  destroyed() {
    // 解绑键盘事件
    document.removeEventListener("keydown", this.keyDownEvent);
    document.removeEventListener("mousemove", this.mouseMoveEvent);
  },
  methods: {
    // 阻止 Tab 的默认键盘事件
    handleTabKeydownEvent(event) {
      event.preventDefault();
      event.stopPropagation();
      this.keyDownEvent(event);
    },
    filterKindChangeEvent(tab, event) {
      this.currentKindIndex = parseInt(tab.index);
    },
    // 切换显示模式
    mouseMoveEvent() {
      clearTimeout(this.mouseMoveTimer);
      this.isMouseMove = true;
      this.mouseMoveTimer = setTimeout(() => {
        this.isMouseMove = false;
      }, 100);
    },
    mouseEnterTableEvent(e) {
      // 预览模式不处理
      if (this.isPreviewMode) return;
      // 只有鼠标在移动才触发高亮
      if (this.isMouseMove) {
        this.currentChangeEvent(e);
      }
    },
    displayItemChangeEvent({ item, index }) {
      this.displayItemIndex = index;
      this.reloadTableData();
      // 当前在预览模式，加载文件内容
      if (this.isListMode) {
        this.loadFileContent();
      }
    },
    initial(code, type, payload) {
      // 初始化找到用户目录
      this.homeDir = utools.getPath("home");
      return new Promise((resolve, reject) => {
        try {
          if (type === "files") {
            this.tempDir = payload[0].path;
            resolve();
          } else if (type === "window") {
            utools.readCurrentFolderPath().then(dir => {
              this.tempDir = dir;
              resolve();
            }).catch(err => {
              // 报错选择桌面路径
              console.error(err);
              this.tempDir = utools.getPath("desktop");
              resolve();
            });
          } else if (type === "over") {
            this.query = payload;
            this.isOverEnter = true;
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
      this.reloadTableData();
      window.killMdfind();
      this.item = {};
      // 关闭加载进度条
      this.loading = false;
    },
    trimRight(str) {
      return str.replace(/(\s*$)/g, "");
    },
    searchAll() {
      this.search(this.isNoFilter ? "* = *" : "");
    },
    // 搜索
    search(query) {
      // 打开加载中进度条
      this.loading = true;

      // 如果搜索的关键字为空
      if (query === "" && this.isNoFilter) {
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
        if (query.trim() === "" && this.isNoFilter) {
          this.reset();
          return;
        }
      }

      // 判断当前配置中设置的搜索起始目录
      let dir = this.currentDir;
      // 判断当前配置设置的搜索模式
      let isOnlyName = !this.settings.data.isFindFileContent;

      const realQuery = this.isNoFilter ? query : `kind:${this.currentKind} ${query}`;

      // 搜索
      window.find(realQuery, isOnlyName, dir, result => {
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
          this.reloadTableData();
        }
        // 结束加载中进度条
        this.loading = false;
      });
    },
    deleteFile(file) {
      window.deleteFile(file.path).then(() => {
        this.$refs.xTable.remove(file);
        this.deleteDialog.show = false;
        this.$message.success("删除成功");
      });
    },
    showDeleteDialog() {
      this.deleteDialog.file = this.$refs.xTable.getCurrentRow();
      if (this.tableData.length === 0 || this.deleteDialog.file === null) {
        return;
      }
      this.deleteDialog.show = true;
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
    // 键盘事件
    keyDownEvent(event) {
      // 获取当前按下的键
      let keyCode = window.event ? event.keyCode : event.which;
      // 打开设置、帮助页面、删除窗口不执行
      if (keyCode !== 27 && (this.settingDrawer.open || this.tipDrawer.open) || this.deleteDialog.show) {
        return;
      }

      // 回车
      if (keyCode === 13 && !event.metaKey) {
        // 开启加载中进度条
        this.loading = true;
        // 执行搜索
        this.search(this.query);
      }
      // ⌘ F
      else if (keyCode === 70 && event.metaKey) {
        utools.subInputFocus();
      }
      // ⌘ O
      else if (keyCode === 79 && event.metaKey) {
        if (this.item && this.item.path) {
          utools.shellOpenPath(this.item.path);
        }
      }
      // ⌘ ⏎
      else if (keyCode === 13 && event.metaKey) {
        if (this.item && this.item.path) {
          utools.shellShowItemInFolder(this.item.path);
        }
      }
      // →
      else if (keyCode === 39 && !event.metaKey) {
        if (!this.settingDrawer.open && !this.tipDrawer.open) {
          // 在列表模式才处理
          if (this.isListMode) {
            clearTimeout(this.detailDrawerTimer);
            this.detailDrawerTimer = setTimeout(() => {
              this.showDetailDrawer();
            }, 100);
          }
        }
      }
      // ⌘ C
      else if (keyCode === 67 && event.metaKey && !event.altKey && !event.shiftKey) {
        const selectionText = document.getSelection().toString();
        // 如果有选中文本，优先处理复制文本
        if (selectionText) {
          this.copyTextToClipBoard(selectionText);
        } else {
          if (this.item && this.item.path) {
            this.copyFileToClipBoard(this.item.path);
            this.showCopySuccessMsg("文件");
          }
        }
      }
      // ⇧ ⌘ C
      else if (keyCode === 67 && event.metaKey && event.shiftKey) {
        if (this.item && this.item.path) {
          this.copyTextToClipBoard(this.item.path);
          this.showCopySuccessMsg("文件路径");
        }
      }
      // ⌥ ⌘ C
      else if (keyCode === 67 && event.metaKey && event.altKey) {
        if (this.item && this.item.path) {
          this.copyTextToClipBoard(this.item.name);
          this.showCopySuccessMsg("文件名");
        }
      }
      // ⌘ 1 ~ 9
      else if (49 <= keyCode && keyCode <= 57 && event.metaKey) {
        this.scrollToRowInTableView(keyCode - 49);
      }
      // ⌘ 0
      else if (keyCode === 48 && event.metaKey) {
        this.scrollToRowInTableView(9);
      }
      // ⌘ T
      else if (keyCode === 84 && event.metaKey) {
        this.scrollToTop();
      }
      // ESC
      else if (keyCode === 27) {
        if (this.settingDrawer.open) this.settingDrawer.open = false;
        if (this.tipDrawer.open) this.tipDrawer.open = false;
        if (this.detailDrawer.open) this.detailDrawer.open = false;
        event.stopPropagation();
      }
      // ⇧ ⌘ ]
      else if (keyCode === 221 && event.metaKey && event.shiftKey) {
        const kinds = Object.keys(this.filterKinds);
        let index = (this.currentKindIndex + 1) % kinds.length;
        this.currentKindIndex = index;
        this.currentKind = kinds[index];
      }
      // ⇧ ⌘ [
      else if (keyCode === 219 && event.metaKey && event.shiftKey) {
        const kinds = Object.keys(this.filterKinds);
        let index = this.currentKindIndex - 1;
        if (index === -1) index = kinds.length - 1;
        this.currentKindIndex = index;
        this.currentKind = kinds[index];
      }
    },
    // 表格快捷菜单点击事件
    menuClickEvent({ menu, row }) {
      let code = menu.code;
      let path = row.path;
      let name = row.name;
      switch (code) {
        case "detail":
          this.showDetailDrawer();
          break;
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
        case "delete":
          this.showDeleteDialog();
          break;
      }
    },
    // 滚动到可视窗口指定偏移行
    scrollToRowInTableView(offset = 0) {
      const scroller = this.$refs.xTable.getVirtualScroller();
      const index = Math.floor(scroller.scrollTop / this.computedRowHeight);
      if (offset === 0) {
        this.$refs.xTable.scrollTo(0, index * this.computedRowHeight);
      }
      if (index + offset < this.tableData.length) {
        this.$refs.xTable.setCurrentRow(this.tableData[index + offset]);
      }
    },
    deleteDialogCloseEvent() {
      utools.subInputFocus();
    },
    currentChangeEvent({ row }) {
      this.$refs.xTable.setCurrentRow(row);
      this.loadData(row);
      utools.subInputFocus();
    },
    reloadTableData() {
      this.$refs.xTable.loadData(this.tableData);
    },
    sortChangeEvent(value) {
      if (value) this.sort.field = value;
      this.loading = true;
      this.tableData = Handler.sort(
        this.tableData,
        this.sort.field,
        this.sort.type
      );
      // 加载搜索结果
      this.reloadTableData();
      // 滚动到表格顶部
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
        this.reloadTableData();
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
        // 预览模式并且打开'预览内容'，或者列表模式，才加载文件
        if (this.isPreviewMode && this.enablePreviewContent || this.isListMode) {
          this.loadFileContent();
        }
      }

      if (!this.item.preview) {
        this.item.thumbnails = this.getFileIcon(this.item.path);
      }
    },
    showDetailDrawer() {
      if (this.detailDrawer.open) {
        this.detailDrawer.open = false;
        utools.subInputFocus();
      } else {
        this.detailDrawer.open = true;
        utools.subInputBlur();
      }
    },
    detailFolderTableDbClickEvent(row, column, event) {
      utools.shellOpenPath(this.item.path + "/" + row.name);
    },
    formatDatetime(date) {
      return Tools.formatDatetime(date);
    },
    handleSortChange() {
      this.sort.type = -this.sort.type;
      this.sortChangeEvent();
    },
    scrollToTop() {
      // 滚动到表格顶部
      this.$refs.xTable.scrollTo(0, 0);
      if (this.tableData.length) {
        // 设置第一条结果的高亮
        this.$refs.xTable.setCurrentRow(this.tableData[0]);
        this.loadData(this.tableData[0]);
      }
    },
    loadFileContent() {
      if (this.item && this.item.path) {
        window.readTextFile(this.item.path, data => {
          this.item.text = "加载中...";
          let encode = CharDetect.detect(data);
          this.item.text = IconvLite.decode(data, encode);
        });
      }
    },
    getFileIcon(path) {
      return utools.getFileIcon(path);
    },
    handleByteSize(size) {
      return Tools.handleBytesToHuman(size);
    },
    showCopySuccessMsg(detail) {
      this.$message({
        message: `已复制${detail ? detail : ""}`,
        type: "success"
      });
    }
  },
  watch: {
    tableData(newVal) {
      if (newVal.length) {
        setTimeout(() => {
          this.scrollToTop();
        }, 50);

        if (this.isOverEnter || this.tempDir !== "" || this.currentKind !== "no") {
          // 解决横向滚动条问题
          this.$refs.xTable.recalculate(true);
          this.isOverEnter = false;
        }
      } else {
        this.item = {};
      }
    },
    enablePreviewContent(newVal) {
      // 打开预览内容，才加载文件内容
      if (newVal && this.isPreviewMode) {
        this.loadFileContent();
      }
      utools.dbStorage.setItem("enablePreviewContent", newVal);
    },
    displayItemIndex(newVal) {
      utools.dbStorage.setItem("displayItemIndex", newVal);
    },
    isListMode(newVal) {
      // 控制菜单
      for (let menu of this.menus) {
        if (menu[0].code === "detail") {
          menu[0].visible = newVal;
          break;
        }
      }
    },
    currentKind() {
      utools.subInputFocus();
      this.$nextTick(() => {
        // 表格获得焦点
        document.querySelector(".list-table").focus();
      });
      clearTimeout(this.currentKindChangeTimer);
      this.currentKindChangeTimer = setTimeout(() => {
        // 在不筛选选项卡中并且没有搜索词，列出所有文件
        if (this.isNoFilter && this.query === "" && this.isListAllFiles) {
          this.searchAll();
        } else {
          this.search(this.query);
        }
      }, 300);
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

#finder {
  position: absolute;
  height: 100%;
  width: 100%;
  background: #fff;
}

#finder-main {
  height: calc(100% - 70px);
  overflow: hidden;
}

#main-list {
  float: left;
  height: 100%;
}

#main-detail {
  float: left;
  height: 100%;
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
  font-size: 17px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.path {
  color: #a0a0a0;
  cursor: default;
  user-select: none;
  font-size: 14px;
  line-height: 17px;
  overflow: hidden;
  text-overflow: ellipsis;
}

#footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 30px;
  text-align: center;
  padding: 6px 5px 5px;
  background: #fafafa;
  user-select: none;
}

.drawer-header {
  font-size: 1.5em;
  font-weight: bold;
}

.filter-items-group {
  display: flex;
  height: 25px;
  font-size: 14px;
  line-height: 25px;
  background-color: #FAFAFA;
}

.filter-items-group:hover {
  background: #DDDFE5;
}

.filter-item {
  color: #808080;
  padding: 0 2px;
  border-right: #ccc solid 1px;
  cursor: pointer;
}


.filter-item-active {
  background: #D9D9D9;
}

.filter-item-active {
  background: #C0BFBF;
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

.drawer {
  height: 100%;
  width: 100%;
}


/* 修改 ElementUI 默认样式 */
/deep/ .el-tabs__item {
  height: 30px;
  line-height: 30px;
}

/deep/ .el-tabs__nav-scroll {
  background: #FAFAFA;
}

/deep/ .el-tabs--border-card {
  border-top: 0;
  border-right: solid #fff 1px;
  border-left: solid #fff 1px;
}

/deep/ .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  background: #f0f0f0;
  border-right: solid #fff 1px;
  border-left: solid #fff 1px;
}
</style>

<style>
body {
  overflow-x: hidden;
}

.el-drawer.rtl,
.el-drawer.ltr {
  overflow: auto;
}

.el-drawer {
  outline: none;
}
</style>
