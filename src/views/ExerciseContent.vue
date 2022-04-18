<template>
  <van-swipe
    style="font-size: 20px;"
    height="680"
    :loop="false"
    indicator-color="white"
    :show-indicators="false"
    ref="swipe"
    :duration="100"
  >
    <van-list v-for="curQuestion in questions" :key="curQuestion.id">
      <van-swipe-item>
        <div style="text-align: center">第 {{ curQuestion.sort }} 题</div>
        <div style="text-align: center;font-size:15px;color:grey">({{ curQuestion.score }}分)</div>
        <div style="margin:50px 15px 15px 15px;font-size:16px">
          <div>
            <label :innerHTML="curQuestion.content" style="font-size: 20px"></label>
          </div>
          <br/>
          <van-radio-group v-model="allAnswer[curQuestion.questionId]"
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
                              v-if="curQuestion.type===4">
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

          <van-field
            v-model="allAnswer[curQuestion.questionId]"
            rows="1"
            autosize
            label="答案"
            type="textarea"
            placeholder="请输入你的答案"
            v-if="curQuestion.type===2 || curQuestion.type===3"
          />
          <br/><br/>
          <div v-if="correctAnswer">
            <h3>正确答案：</h3>
          </div>
          <div v-if="correctAnswer && (curQuestion.type===0||curQuestion.type===1||curQuestion.type===4)"
               :innerHTML="curQuestion.answerOption"></div>
          <div v-if="correctAnswer && (curQuestion.type===2||curQuestion.type===3)"
               :innerHTML="curQuestion.answerText"></div>
          <div v-if="correctAnswer">
            <h3>解析：</h3>
          </div>
          <div v-if="correctAnswer" :innerHTML="curQuestion.analysis"></div>
        </div>
      </van-swipe-item>
    </van-list>
  </van-swipe>
  <van-sticky position="bottom" style="text-align: center">
    <van-row>
      <van-col span="1"/>
      <van-col span="7">
        <van-button type="default" round @click="swipe.prev()" style="width: 96%;margin-bottom: 5px">上一题</van-button>
      </van-col>
      <van-col span="7">
        <van-button type="primary" round @click="submitAnswer" style="width: 96%;margin-bottom: 5px">提交</van-button>
      </van-col>
      <van-col span="7">
        <van-button type="default" round @click="nextSwipe" style="width: 96%;margin-bottom: 5px">下一题</van-button>
      </van-col>
      <van-col span="1"/>
    </van-row>
  </van-sticky>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import {
  Row,
  Col,
  Swipe,
  SwipeItem,
  Checkbox,
  CheckboxGroup,
  Button,
  RadioGroup,
  Radio,
  Field,
  Sticky,
  Toast,
  Cell,
  Icon,
  Dialog
} from 'vant';
import axios from "axios";
import {useRoute} from "vue-router";
import store from "@/store";

export default defineComponent({
  name: "ExerciseContent",
  components: {
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
    [Button.name]: Button,
    [Cell.name]: Cell,
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    [Field.name]: Field,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Row.name]: Row,
    [Col.name]: Col,
  },
  setup() {

    const route = useRoute();

    const swipe = ref();

    const questions = ref();

    const courseQuestion = ref();
    courseQuestion.value = new Map();

    // 获取题目信息
    const getQuestion = () => {
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

    const curQuestion = ref();

    const allAnswer = ref();
    allAnswer.value = {};

    const correctAnswer = ref();

    const submitAnswer = () => {
      if (Object.keys(allAnswer.value).length < Object.keys(questions.value).length) {
        Toast.fail("请完成所有题目后提交")
        return;
      }
      console.log(allAnswer.value);
      correctAnswer.value = true;
      swipe.value.swipeTo(0);
    }

    const nextSwipe = () => {
      if (swipe.value.state.active === Object.keys(questions.value).length - 1) {
        Dialog.alert({
          message: '这是最后一题了~~',
        })
      } else {
        swipe.value.next();
      }
    }

    onMounted(() => {
      store.commit("setPage", route.fullPath)
      getQuestion();
    })

    return {
      questions,
      getQuestion,
      curQuestion,
      submitAnswer,
      correctAnswer,
      swipe,
      allAnswer,
      nextSwipe,
    }
  }
})
</script>

<style scoped>
</style>
