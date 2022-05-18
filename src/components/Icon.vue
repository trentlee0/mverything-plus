<template>
  <svg-icon
    type="mdi"
    :size="size"
    :path="realIcon"
    :style="{color: color}"
  ></svg-icon>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import fontIcon from "@/util/fontIcon";

export default {
  name: "Icon",
  components: {
    SvgIcon
  },
  props: {
    name: {
      type: String,
      default: ""
    },
    size: {
      type: [String, Number],
      default: 24
    },
    color: {
      type: String,
      default: ""
    }
  },
  computed: {
    realIcon() {
      return fontIcon[this.name];
    }
  }
};
</script>

<style scoped>

</style>
