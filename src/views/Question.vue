<template>
  <div style="background-color: #f7f7f7;height:700px;text-align: center">
    <van-image
      radius="10"
      width="94%"
      height="110px"
      src="https://ucloudteach-user.obs.cn-north-4.myhuaweicloud.com/Snipaste_2021-11-30_21-38-10.jpg"
    />
    <br/><br/>
    <van-grid center direction="horizontal" clickable :column-num="2" :border="true" :gutter="10">
      <van-grid-item to="/question/course">
        <van-icon name="https://ucloudteach-user.obs.cn-north-4.myhuaweicloud.com/aftercourse.png" size="32"/>
        <label style="font-size: 14px">课后习题</label>
      </van-grid-item>
      <van-grid-item to="/exam">
        <van-icon name="https://ucloudteach-user.obs.cn-north-4.myhuaweicloud.com/kaoshizhongxin2.png" size="32"/>
        <label style="font-size: 14px">考试中心</label>
      </van-grid-item>
      <van-grid-item to="/mine/exam">
        <van-icon name="https://ucloudteach-user.obs.cn-north-4.myhuaweicloud.com/myexam.png" size="32"/>
        <label style="font-size: 14px">我的考试</label>
      </van-grid-item>
    </van-grid>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {Icon, Grid, GridItem,Image as VanImage} from "vant";

export default defineComponent({
  name: "Question",
  components: {
    [Icon.name]: Icon,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [VanImage.name]: VanImage,

  },
  setup() {

  }
})
</script>

<style scoped>

</style>
