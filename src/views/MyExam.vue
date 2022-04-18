<template>
  <van-nav-bar
    title="考试记录"
    left-text="返回"
    left-arrow
    @click-left="$router.back()"
  /><br/>
  <div style="text-align:center;margin-top:300px" v-if="showLoading">
    <van-loading type="spinner" />
  </div>
  <van-empty description="暂无考试信息" v-if="!showLoading && emptyStatus"/>
  <van-list>
    <van-cell v-for="examRecord in examRecords" :key="examRecord.id">
      <router-link :to="'/exam/status?paperId='+examRecord.paperId">
        <van-row>
          <van-col span="1"/>
          <van-col span="18">
            <div style="font-size: 16px;color:black">{{ examRecord.name }}</div>
            <br/>
            <label style="color:#989898">
              <van-icon name="clock-o"/>
              {{ examRecord.examTime }}s</label>&nbsp;&nbsp;
            <label v-if="examRecord.checkFlag" style="color:#989898">
              <van-icon name="passed"/>
              已批阅
            </label>
            <label v-if="!examRecord.checkFlag" style="color:#989898">
              未批阅
            </label>
            <br/>
            <br/>
          </van-col>
          <van-col span="4" style="text-align: center;color:#1989fa">
            <van-circle
              style="--van-circle-size:100%;margin-top:-8px"
              :current-rate="examRecord.score*100/examRecord.totalScore"
              layer-color="#ebedf0"
              :color="{'0%': '#3fecff','100%': '#6149f6'}"
            >
              <template #default>
                <br/>
                <div style="font-size: 10px;margin-top: 6px;">得分</div>
                <div style="font-size: 10px">{{ examRecord.score }}/{{ examRecord.totalScore }}</div>
              </template>
            </van-circle>
          </van-col>
          <van-col span="1"/>
        </van-row>
        <div style="text-align: right;margin-right: 10px;color:#989898">{{ examRecord.createTime }}</div>
      </router-link>
      <van-divider/>
      <br/><br/>
    </van-cell>
  </van-list>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import axios from "axios";
import {NavBar,Empty,Loading,Tag, Card, Divider, List, Toast, Icon, Col, Row, Circle} from "vant";
import store from "@/store";
import {useRoute} from "vue-router";

export default defineComponent({
  name: "MyExam",
  components: {
    [List.name]: List,
    [Divider.name]: Divider,
    [Card.name]: Card,
    [Tag.name]: Tag,
    [Icon.name]: Icon,
    [Col.name]: Col,
    [Row.name]: Row,
    [Circle.name]: Circle,
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

    const examRecords = ref();
    const getRecords = () => {
      axios.get("/api/user/exam/get").then((response) => {
        showLoading.value = false;
        const data = response.data;
        if (data.success) {
          if (data.content.length==0) {
            emptyStatus.value = true;
          }
          examRecords.value = data.content;
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
      examRecords,
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
