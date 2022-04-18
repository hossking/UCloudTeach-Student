<template>
  <div id="footer">
    <!-- 开启底部安全区适配 -->
    <van-number-keyboard safe-area-inset-bottom />
    <div style="height: 50px;"></div>
    <van-tabbar safe-area-inset-bottom="true" route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/course" icon="apps-o">学习</van-tabbar-item>
      <van-tabbar-item replace to="/question" icon="todo-list-o">题库</van-tabbar-item>
      <van-tabbar-item replace to="/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script lang="ts">
import { Tabbar, TabbarItem } from 'vant';
import {defineComponent} from "vue";

export default defineComponent({
  name: 'TheFooter',
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
  },
})
</script>

