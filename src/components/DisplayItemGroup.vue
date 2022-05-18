<template>
  <div class="container">
    <div
      class="item"
      :class="{active: selectedIndex === index}"
      v-for="(item, index) in items"
      :key="index"
      @click="clickEvent({item, index})"
      :title="item.title"
    >
      <Icon :name="item.icon" :size="20" color="#808080"></Icon>
    </div>
  </div>
</template>

<script>
import Icon from "@/components/Icon";

export default {
  name: "DisplayItemGroup",
  components: { Icon },
  props: {
    items: {
      type: Array,
      default: []
    },
    selectedIndex: {
      type: Number,
      default: 0
    }
  },
  methods: {
    clickEvent({ item, index }) {
      this.$emit("itemChange", { item, index });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  border-radius: 4px;
  width: 80px;
  height: 30px;
  transition: 40ms;
}

.container:hover {
  background: #DDDFE5;
}

.container:hover .active {
  background: #bfbfbf;
}

.item {
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  text-align: center;
  line-height: 30px;
  width: 40px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.active {
  background: #d9d9d9;
}
</style>
