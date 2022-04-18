<template>
  <div id="app">
    <the-header/>
    <router-view v-slot="{ Component }">
      <transition>
        <keep-alive>
          <component :is="Component" v-if="$route.meta.keepAlive" :key="$route.path"/>
        </keep-alive>
      </transition>
      <transition>
        <component :is="Component" v-if="!$route.meta.keepAlive" :key="$route.path+'normal'"/>
      </transition>
    </router-view>
    <the-footer v-if="!$route.meta.hiddenFooter"/>
  </div>
</template>

<script lang="ts">

import TheFooter from "@/components/TheFooter.vue";
import TheHeader from "@/components/TheHeader.vue";
import {defineComponent} from "vue";

export default defineComponent({
  components: {
    TheFooter,
    TheHeader
  }
})
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #ffffff;
}
</style>
<style>

.v-enter-from { /*过度进入时初始状态*/
  opacity: 0;
  transform: translateX(100px);
}

.v-enter-to, .v-leave-from { /*进入过度结束状态 & 过度结束离开初始状态*/
  opacity: 1;
  transform: translateX(0px);
}

.v-leave-to { /*过度结束状态*/
  opacity: 0;
  transform: translateX(-100px);
}

.v-enter-active, .v-leave-active { /*过度动效*/
  transition: all .2s ease;
  height: 1000px
}
</style>
