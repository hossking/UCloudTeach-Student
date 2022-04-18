<template>
  <van-nav-bar
    title="详情"
    left-text="返回"
    left-arrow
    @click-left="$router.back()"
  />
  <div style="text-align: center;font-size:20px;margin-top: 20px">
    {{ examPaper.name }}
  </div>
  <br/><br/><br/>
  <div style="font-size: 15px;margin-left: 10px">
    <div>
      试卷满分：{{ examPaper.totalScore }} 分
    </div>
    <br/>
    <div>
      考试期限：{{ examPaper.startDate }} 至 {{ examPaper.endDate }}
    </div>
    <br/>
    <div>
      考试时长：{{ examPaper.examTime }} 秒
    </div>
    <br/>
    <div>
      机器判题：
      <label v-if="examPaper.autoCheck">是</label>
      <label v-else>否</label>
    </div>
    <br/>
    <div>
      备注信息：{{ examPaper.remark }}
    </div>
    <br/>
  </div>
  <div style="margin-left: 10px;margin-right: 10px;margin-top: 150px;">
    <van-row>
      <van-col span="11">
        <van-button v-if="!joinStatus" round block type="primary" @click="startExam">
          开始考试
        </van-button>
        <van-button v-if="joinStatus" round block type="primary" @click="getDetail">
          查看详情
        </van-button>
      </van-col>
      <van-col span="1"/>
      <van-col span="11">
        <van-button round block type="primary" @click="startExercise">
          练习模式
        </van-button>
      </van-col>
    </van-row>
  </div>

</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import {NavBar,Sticky, Toast, Icon, Button, Col, Row, Dialog} from 'vant';
import axios from "axios";
import {useRoute, useRouter} from "vue-router";
import store from "@/store";

export default defineComponent({
  name: "PaperContent",
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    [Button.name]: Button,
    [NavBar.name]: NavBar,
  },
  setup() {
    const examPaper = ref();
    examPaper.value = {};
    const route = useRoute();
    const router = useRouter();
    const joinStatus = ref();

    const getExamPaper = () => {
      axios.get("/api/common/exam/get", {
        params: {
          id: route.query.paperId
        }
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          examPaper.value = data.content.list[0];
        } else {
          Toast.fail(data.message);
        }
      })
    }


    const startExam = () => {
      Dialog.confirm({
        message:
          '确认参加本次考试吗',
      }).then(() => {
        axios.post("/api/user/exam/create", {
          paperId: route.query.paperId
        }).then((response) => {
          const data = response.data;
          if (data.success) {
            router.replace("/exam/content?paperId=" + route.query.paperId)
          } else {
            Dialog.alert({
              message: data.message,
            }).then(() => {
              window.location.reload();
            }).catch(() => {
              console.log("cancel")
            });
          }
        })
      })
    }

    const startExercise = () => {
      router.replace("/exercise/content?paperId=" + route.query.paperId)
    }

    const getDetail = ()=>{
      router.push("/exam/status?paperId="+examPaper.value.id);
    }
    onMounted(() => {
      store.commit("setPage", route.fullPath)
      getExamPaper();
      axios.get("/api/user/exam/check", {
        params: {
          id: route.query.paperId
        }
      }).then((response) => {
        const data = response.data;
        joinStatus.value = !data.success;
      })
    })

    return {
      examPaper,
      startExam,
      startExercise,
      joinStatus,
      getDetail
    }
  }
})
</script>

<style scoped>

</style>
