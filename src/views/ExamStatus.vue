<template>
  <van-nav-bar
    title="详情"
    left-text="返回"
    left-arrow
    @click-left="$router.back()"
  />
  <van-empty v-if="!showRes" description="该试卷暂未批阅，请耐心等候"/>

  <div style="text-align: center;margin-top: 80px" v-if="showRes">
    <h2>{{exams.name}}</h2><br/>
    <van-circle
      style="--van-circle-size:140px"
      :current-rate="score"
      layer-color="#ebedf0"
      :color="{'0%': '#3fecff','100%': '#6149f6'}"
    >
      <template #default>
        <div v-if="exams" style="margin-top: 40px">
          <label>得分/总分</label>
          <h2>{{ exams.score }} / {{ exams.totalScore }}</h2>
        </div>
      </template>
    </van-circle>
    <div v-if="exams">
      <br/>
      <van-row>
        <van-col span="2"/>
        <van-col span="8">
          <label style="font-size: 15px">用时: {{ exams.examTime }} 秒</label>
        </van-col>
        <van-col span="4"/>
        <van-col span="8">
          <label style="font-size: 15px">正确率: {{ Number(exams.rightCount / exams.questionCount * 100).toFixed(1) }}
            %</label>
        </van-col>
        <van-col span="2"/>
      </van-row>
    </div>
    <van-row style="margin-top: 50px;">
      <van-col span="4"/>
      <van-col span="16">
        <van-button round block type="primary" @click="showPopup=true">
          题目解析
        </van-button>
      </van-col>
      <van-col span="4"/>
    </van-row>
  </div>
  <van-popup
    v-model:show="showPopup"
    round
    position="bottom"
    style="height: 500px;"
    :closeable="true">
    <van-swipe
      style="font-size: 20px;margin-top: 10px"
      height="500"
      :loop="false"
      indicator-color="white"
      :show-indicators="false"
      ref="swipe"
      :duration="100"
    >
      <van-list v-for="curQuestion in questions" :key="curQuestion.id">
        <van-swipe-item>
          <div style="text-align: center">第 {{ curQuestion.sort }} 题</div>
          <div style="margin:50px 15px 15px 15px;font-size:16px">
            <div>
              <label :innerHTML="curQuestion.content" style="font-size: 20px"></label>
            </div>
            <br/>
            <van-radio-group v-model="allAnswer[curQuestion.questionId]" disabled
                             v-if="curQuestion.type===0 || curQuestion.type===1">
              <van-radio name="A" v-if="curQuestion.type===0 || curQuestion.type===1">
                <div>A:{{ JSON.parse(curQuestion.options)['A'] }}</div>
              </van-radio>
              <br/>
              <van-radio name="B" v-if="curQuestion.type===0 || curQuestion.type===1">
                <div>B:{{ JSON.parse(curQuestion.options)['B'] }}</div>
              </van-radio>
              <br/>
              <van-radio name="C" v-if="curQuestion.type===0">
                <div>C:{{ JSON.parse(curQuestion.options)['C'] }}</div>
              </van-radio>
              <br/>
              <van-radio name="D" v-if="curQuestion.type===0">
                <div>D:{{ JSON.parse(curQuestion.options)['D'] }}</div>
              </van-radio>
              <br/>
            </van-radio-group>

            <van-checkbox-group v-model="allAnswer[curQuestion.questionId]"
                                v-if="curQuestion.type===4" disabled>
              <van-checkbox name="A" shape="square">
                <div>A:{{ JSON.parse(curQuestion.options)['A'] }}</div>
              </van-checkbox>
              <br/>
              <van-checkbox name="B" shape="square">
                <div>B:{{ JSON.parse(curQuestion.options)['B'] }}</div>
              </van-checkbox>
              <br/>
              <van-checkbox name="C" shape="square">
                <div>C:{{ JSON.parse(curQuestion.options)['C'] }}</div>
              </van-checkbox>
              <br/>
              <van-checkbox name="D" shape="square">
                <div>D:{{ JSON.parse(curQuestion.options)['D'] }}</div>
              </van-checkbox>
              <br/>
            </van-checkbox-group>
            <div v-if="curQuestion.type===2 || curQuestion.type===3">
              <h3>你的答案：</h3>{{allAnswer[curQuestion.questionId]}}
            </div>
            <label v-if="curQuestion.type===0||curQuestion.type===1||curQuestion.type===4"
                   :innerHTML="'<h3>正确答案：</h3>'+curQuestion.answerOption"></label>
            <label v-if="curQuestion.type===2||curQuestion.type===3"
                   :innerHTML="'<h3>正确答案：</h3>'+curQuestion.answerText"></label>
            <div v-if="correctAnswer" :innerHTML="'<h3>解析：</h3>'+curQuestion.analysis"></div>
          </div>
        </van-swipe-item>
      </van-list>
    </van-swipe>
  </van-popup>

</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import {
  NavBar,
  Circle,
  Row,
  Col,
  Empty,
  Button,
  Popup,
  Swipe,
  SwipeItem,
  Cell,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup, Toast
} from "vant";
import axios from "axios";
import {useRoute} from "vue-router";
import store from "@/store";


export default defineComponent({
  name: "ExamStatus",
  components: {
    [Circle.name]: Circle,
    [Row.name]: Row,
    [Col.name]: Col,
    [Empty.name]: Empty,
    [Button.name]: Button,
    [Popup.name]: Popup,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Cell.name]: Cell,
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
    [NavBar.name]: NavBar,
  },
  setup() {

    const route = useRoute();

    const score = ref();

    const exams = ref();

    const showRes = ref(false);

    const showPopup = ref(false);

    const allAnswer = ref();
    allAnswer.value = {};

    const getExamInfo = () => {
      axios.get("/api/user/exam/res/get", {
        params: {
          paperId: route.query.paperId
        }
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          if (data.content.checkFlag) {
            showRes.value = true;
            allAnswer.value = JSON.parse(data.content.studentAnswer)
            exams.value = data.content;
            score.value = data.content.score / data.content.totalScore * 100
          }
        }
      })
    }

    const questions = ref();

    const getQuestion = ()=>{
      axios.get("/api/user/exam/exercise/get", {
        params: {
          id: route.query.paperId
        }
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          questions.value = data.content;
        } else {
          Toast.fail(data.message);
        }
      })
    }


    onMounted(() => {
      store.commit("setPage", useRoute().fullPath)
      getExamInfo();
      getQuestion();
    })

    return {
      score,
      exams,
      showRes,
      showPopup,
      questions,
      allAnswer
    }
  }
})
</script>

<style scoped>

</style>
