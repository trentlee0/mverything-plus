<template>
  <el-tooltip class="item" v-model="isShow" manual content="已复制" placement="right">
    <el-button
      @click="copyTextToClipBoard(text)"
      type="text"
    >
      <slot></slot>
    </el-button>
  </el-tooltip>
</template>

<script>
export default {
  name: "CopyButton",
  props: {
    text: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      isShow: false
    };
  },
  methods: {
    copyTextToClipBoard(text) {
      utools.copyText(text);
      this.isShow = true;
      setTimeout(() => {
        this.isShow = false;
      }, 1500);
    }
  }
};
</script>

<style scoped>

</style>
