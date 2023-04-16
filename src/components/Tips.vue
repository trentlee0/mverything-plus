<template>
  <div id="container">
    <el-card>
      <div
        class="clearfix"
        slot="header"
      >
        <b>快捷键</b>
      </div>

      <el-table
        :data="keyboardTableData"
        stripe
        border
        size="small"
        style="width: 100%">
        <el-table-column
          prop="action"
          width="80"
          label="操作">
        </el-table-column>
        <el-table-column
          prop="keyboard"
          label="快捷键">
        </el-table-column>
      </el-table>

    </el-card>
    <el-card>
      <div
        class="clearfix"
        slot="header"
      >
        <b>mdfind 命令</b>
      </div>
      <p>
        本插件是基于 <code>mdfind</code> 命令构建。因此，可使用 <code>mdfind</code> 命令提供的 <i>query expression</i>。
      </p>
      <p>部分关键字如下，使用：<code class="code-style">关键字 搜索文本</code>。两种关键字可组合使用，用空格隔开。</p>
      <p>
        Spotlight 关键字<br />
        <small>限制文档类型</small>
      </p>
      <el-table
        :data="spotlightTableData"
        stripe
        border
        size="small"
        style="width: 100%">
        <el-table-column
          prop="desc"
          width="80"
          label="类型">
        </el-table-column>
        <el-table-column
          prop="keyword"
          label="关键字">
        </el-table-column>
      </el-table>

      <p>
        日期关键字<br />
        <small>限制文件时间</small>
      </p>
      <el-table
        :data="dateTableData"
        stripe
        border
        size="small"
        style="width: 100%">
        <el-table-column
          prop="desc"
          width="80"
          label="时间">
        </el-table-column>
        <el-table-column
          prop="keyword"
          label="关键字">
        </el-table-column>
      </el-table>

      <p>
        更多其它用法参考:
        <a href="" @click="openUrl('https://ss64.com/osx/mdfind.html')">
          https://ss64.com/osx/mdfind.html
        </a>
      </p>
    </el-card>
    <el-card body-style="{padding: 10px}">
      <div
        class="clearfix"
        slot="header"
      >
        <b>快捷搜索</b>
      </div>
      <p>快捷搜索即对结果类型进行简单过滤, 使用方法为在搜索时加上前缀: <code class="code-style">key:搜索文本</code>。</p>
      <p>
        详细使用见 Mverything 插件主页:
        <a href="" @click="openUrl('https://yuanliao.info/d/595/13')">
          https://yuanliao.info/d/595/13
        </a>
      </p>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Tips",
  data() {
    return {
      keyboardTableData: [
        {
          action: "开始搜索",
          keyboard: "⏎"
        },
        {
          action: "输入框获得焦点",
          keyboard: "⌘ F"
        },
        {
          action: "显示详情 (列表模式)",
          keyboard: "→"
        },
        {
          action: "左右切换类型筛选",
          keyboard: "⇧ ⌘ [ 或 ]"
        },
        {
          action: "打开文件",
          keyboard: "⌘ O"
        },
        {
          action: "在访达中显示",
          keyboard: "⌘ ⏎"
        },
        {
          action: "复制文件",
          keyboard: "⌘ C"
        },
        {
          action: "复制文件名",
          keyboard: " ⌥ ⌘ C"
        },
        {
          action: "复制文件路径",
          keyboard: "⇧ ⌘ C"
        },
        {
          action: "选中显示窗口第 X 条数据",
          keyboard: "⌘ 0-9"
        },
        {
          action: "选中顶部第一条数据",
          keyboard: "⌘ T"
        }
      ],
      spotlightTableData: [
        {
          desc: "音频/音乐",
          keyword: "kind:audio, kind:music"
        },
        {
          desc: "文件夹",
          keyword: "kind:folder, kind:folders"
        },
        {
          desc: "字体",
          keyword: "kind:font, kind:fonts"

        },
        {
          desc: "图片",
          keyword: "kind:image, kind:images"
        },
        {
          desc: "视频",
          keyword: "kind:movie, kind:movies"
        },
        {
          desc: "PDF",
          keyword: "kind: pdf, kind:pdfs"
        }
      ],
      dateTableData: [
        {
          desc: "今天",
          keyword: "date:today"
        },
        {
          desc: "昨天",
          keyword: "date:yesterday"
        },
        {
          desc: "这周",
          keyword: "date:this week"
        },
        {
          desc: "这月",
          keyword: "date:this month"
        },
        {
          desc: "这年",
          keyword: "date:this year"
        }
      ]
    };
  },
  methods: {
    openUrl(url) {
      utools.shellOpenExternal(url);
    }
  }
};
</script>

<style scoped>
#container {
  overflow-y: auto;
}

.el-card {
  margin: 10px;
}

.code-style {
  background: #F3F4F5;
  padding: 4px;
  border-radius: 3px;
}
</style>
