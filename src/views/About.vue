<template>
  <van-nav-bar
    title="关于我们"
    left-text="返回"
    left-arrow
    @click-left="$router.back()"
  />
  <div style="text-align: center">
    <br/><br/>
    <h2>优云教在线教育平台</h2>
    <h2>Team：夏天真热</h2>
  </div>
</template>
<script lang="ts">
import {defineComponent} from "vue";
import {NavBar} from "vant";

export default defineComponent({
  name: "About",
  components: {
    [NavBar.name]: NavBar,
  },
})
</script>
