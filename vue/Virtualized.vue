<template>
  <div ref="container" class="container" @scroll="handleScroll($event)">
    <div class="placeholder" :style="{ height: listHeight + 'px' }"></div>
    <div class="list-wrapper" :style="{ transform: getTransform }">
      <div
        class="card-item"
        v-for="item in renderList"
        :key="item.index"
        ref="itemRefs"
        :data-index="item.index"
      >
        <span style="color: red"
          >{{ item.index }}
          <img width="200" :src="item.imgUrl" alt="" />
        </span>
        {{ item.value }}
      </div>
    </div>
  </div>
</template>
<!-- item 不定高度 虚拟列表 -->
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUpdated } from "vue";
const { listData, itemSize } = defineProps({
  // 列表数据
  listData: {
    type: Array,
    default: () => [],
  },
  // 预估item高度，不是真实item高度
  itemSize: {
    type: Number,
    default: 300,
  },
});

const container = ref(null);
const containerHeight = ref(0);
const start = ref(0);
const offset = ref(0);
const itemRefs = ref();
const positions = ref<
  {
    index: number;
    height: number;
    top: number;
    bottom: number;
  }[]
>([]);

const end = computed(() => start.value + renderCount.value);
const renderList = computed(() => listData.slice(start.value, end.value + 1));
const renderCount = computed(() => Math.ceil(containerHeight.value / itemSize));
const listHeight = computed(
  () => positions.value[positions.value.length - 1].bottom
);
const getTransform = computed(() => `translate3d(0,${offset.value}px,0)`);

watch(() => listData, initPosition, {
  immediate: true,
});

function handleScroll(e) {
  const scrollTop = e.target.scrollTop;
  start.value = getStart(scrollTop);
  offset.value = positions.value[start.value].top;
}

function getStart(scrollTop) {
  let left = 0;
  let right = positions.value.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (positions.value[mid].bottom === scrollTop) {
      return mid + 1;
    } else if (positions.value[mid].bottom < scrollTop) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return left;
}

function initPosition() {
  positions.value = [];
  listData.forEach((_item, index) => {
    positions.value.push({
      index,
      height: itemSize,
      top: index * itemSize,
      bottom: (index + 1) * itemSize,
    });
  });
}

function updatePosition() {
  itemRefs.value.forEach((el: HTMLElement) => {
    const index = +el.getAttribute("data-index");
    const realHeight = el.getBoundingClientRect().height;
    let diffVal = positions.value[index].height - realHeight;
    const curItem = positions.value[index];
    if (diffVal !== 0) {
      // 说明item的高度不等于预估值
      curItem.height = realHeight;
      curItem.bottom = curItem.bottom - diffVal;
      for (let i = index + 1; i < positions.value.length - 1; i++) {
        positions.value[i].top = positions.value[i].top - diffVal;
        positions.value[i].bottom = positions.value[i].bottom - diffVal;
      }
    }
  });
}

onMounted(() => {
  containerHeight.value = container.value.clientHeight;
});

onUpdated(() => {
  updatePosition();
});
</script>

<style scoped>
.container {
  height: 100%;
  overflow: auto;
  position: relative;
}

.placeholder {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.card-item {
  padding: 10px;
  color: #777;
  box-sizing: border-box;
  border-bottom: 1px solid #e1e1e1;
}
</style>
