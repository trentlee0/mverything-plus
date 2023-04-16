<template>
  <div
    style="display: flex; justify-content: center; align-items: center; border-radius: 5px; overflow: hidden;"
    :style="{width: width, height: height, border: isInputFocus ? '2px solid grey' : '1px solid grey'}"
  >
    <Icon style="margin-left: 4px" name="magnify" :size="22" color="#808080"></Icon>
    <input
      ref="inputRef"
      class="search-input"
      type="text"
      :value="value"
      autofocus
      @input="$emit('input', $event.target.value)"
      placeholder="搜索"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<script>
import Icon from "@/components/Icon";

export default {
  name: "SearchInput",
  components: { Icon },
  props: {
    value: {
      type: String
    },
    isFocus: {
      type: Boolean
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String
    }
  },
  data() {
    return {
      isInputFocus: false
    };
  },
  methods: {
    selectText() {
      this.$nextTick(() => {
        const el = this.$refs.inputRef;
        el.selectionStart = 0;
        el.selectionEnd = el.value.length;
      });
    },
    focus() {
      this.$refs.inputRef.focus();
    },
    blur() {
      this.$refs.inputRef.blur();
    },
    handleFocus() {
      this.isInputFocus = true;
      this.$emit("update:isFocus", true);
    },
    handleBlur() {
      this.isInputFocus = false;
      this.$emit("update:isFocus", false);
    }
  }
};
</script>

<style scoped>
.search-input {
  width: 100%;
  height: 100%;
  text-decoration: none;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 0 5px;
}
</style>
