<template>
  <van-nav-bar
    title="学习记录"
    left-text="返回"
    left-arrow
    @click-left="$router.back()"
  /><br/>
  <div style="text-align:center;margin-top:300px" v-if="showLoading">
    <van-loading type="spinner"/>
  </div>
  <van-empty description="暂无学习记录" v-if="!showLoading && emptyStatus"/>
  <van-list>
    <van-cell v-for="courseRecord in courseRecords" :key="courseRecord.id">
      <label style="color:#989898;margin-left: 10px;">订单号: {{ courseRecord.id }}</label>
      <van-card
        style="--van-card-thumb-border-radius:3px;--van-card-thumb-size:110px;background-color: white;"
      >
        <template #price>
          <label style="color:#ee0a24;font-size:14px">¥{{ courseRecord.price }}</label>
        </template>
        <template #thumb>
          <img :src="courseRecord.cover" alt="" style="height: 80%;width: 100%"/>
        </template>
        <template #desc>
          <van-icon name="contact"/>&nbsp;
          <label style="color:#989898">{{ courseRecord.teacher }}</label>
          <div style="color:#989898;margin-top:8px;">
            <van-icon name="passed"/>&nbsp;
            已学{{ courseRecord.finishCourse }}节
          </div>
        </template>
        <template #title>
          <label style="font-size: 15px">{{ courseRecord.name }}</label><br/><br/>
        </template>
        <template #footer>
          <label style="color:#989898;margin-top:-10px">{{ courseRecord.joinTime }}</label><br/><br/>
        </template>
      </van-card>

      <div style="text-align: right;">
        <van-button size="small" plain hairline type="primary" @click="getCertificate(courseRecord.courseId)">
          证书领取 >
        </van-button>&nbsp;&nbsp;&nbsp;
        <router-link :to="'/course/content?courseId='+courseRecord.courseId">
          <van-button size="small" plain hairline type="primary">
            去学习 >
          </van-button>&nbsp;&nbsp;&nbsp;
        </router-link>
      </div>
      <van-divider/>
    </van-cell>
  </van-list>
  <van-popup v-model:show="showCertificate" position="bottom" style="height: 400px;">
    <h3 style="margin-left:10px;margin-right:10px">{{ sendWord }}</h3>
    <van-image
      width="90%"
      height="80%"
      :src="certificate"
      style="margin-left:10px;"
    />
  </van-popup>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import axios from "axios";
import {NavBar,Empty, Loading, Tag, Card, Divider, List, Toast, Icon, Button, Popup, Image as VanImage} from "vant";
import store from "@/store";
import {useRoute} from "vue-router";

export default defineComponent({
  name: "MyCourse",
  components: {
    [List.name]: List,
    [Divider.name]: Divider,
    [Card.name]: Card,
    [Tag.name]: Tag,
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Popup.name]: Popup,
    [VanImage.name]: VanImage,
    [Loading.name]: Loading,
    [Empty.name]: Empty,
    [NavBar.name]: NavBar,
  },
  setup() {
    const showLoading = ref(true);
    const emptyStatus = ref(false);

    // 检查登录状态
    const checkLogin = () => {
      axios.get("/api/user/auth/login/check").then((response) => {
        const data = response.data;
        if (!data.success) {
          Toast.fail(data.message);
        }
      })
    }

    const courseRecords = ref();
    const getRecords = () => {
      axios.get("/api/user/course/get").then((response) => {
        showLoading.value = false;
        const data = response.data;
        if (data.success) {
          if (data.content.length === 0) {
            emptyStatus.value = true;
          }
          courseRecords.value = data.content;
        } else {
          Toast.fail(data.message);
        }
      })
    }

    const showCertificate = ref(false);
    const certificate = ref();
    const sendWord = ref();
    const getCertificate = (courseId: any) => {
      axios.get("/api/user/course/certificate/get", {
        params: {
          courseId: courseId
        }
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          certificate.value = data.content.certificate;
          sendWord.value = data.content.sendWord;
          showCertificate.value = true;
        } else {
          Toast.fail(data.message);
        }
      })
    }

    onMounted(() => {
      store.commit("setPage", useRoute().fullPath)
      checkLogin();
      getRecords();
    })
    return {
      courseRecords,
      getCertificate,
      showCertificate,
      sendWord,
      certificate,
      showLoading,
      emptyStatus

    }

  }
})
</script>

<style scoped>
.card-title {
  font-size: 15px;
}
</style>
