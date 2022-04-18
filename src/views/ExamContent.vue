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
        </div>
      </van-swipe-item>
    </van-list>
  </van-swipe>
  <van-sticky position="bottom" style="text-align: center">
    <van-row style="font-size: 16px;">
      <van-col span="8"/>
      <van-col span="3" style="text-align:right;margin-right: 5px">
        <van-icon name="clock-o"/>
      </van-col>
      <van-col span="4" style="text-align: left;margin-top: -2px">
        <van-count-down ref="countDown" :time="time" format="mm:ss" @finish="finishCountDown"/>
      </van-col>
      <van-col span="8"/>
    </van-row><br/>
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
  CountDown,
  Row,
  Col,
  Swipe,
  SwipeItem,
  Empty,
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
import {useRoute, useRouter} from "vue-router";
import store from "@/store";

export default defineComponent({
  name: "ExamContent",
  components: {
    [CountDown.name]: CountDown,
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
    [Button.name]: Button,
    [Cell.name]: Cell,
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    [Field.name]: Field,
    [Empty.name]: Empty,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Row.name]: Row,
    [Col.name]: Col,
  },
  setup() {

    const route = useRoute();

    const router = useRouter();

    const swipe = ref();

    const questions = ref();

    const time = ref();
    time.value = 2000;

    const countDown = ref();

    const courseQuestion = ref();
    courseQuestion.value = new Map();
    // 获取题目信息
    const getQuestion = () => {
      axios.get("/api/user/exam/question/get", {
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

    const showQuestion = ref(false);
    const curQuestion = ref();


    const allAnswer = ref();
    allAnswer.value = {};

    const sortAnswer = () => {
      for (let i in questions.value) {
        if (typeof (allAnswer.value[questions.value[i].questionId]) !== 'string') {
          allAnswer.value[questions.value[i].questionId].sort();
        }
      }
    }

    const submit = async () => {
      await sortAnswer();
      axios.post("/api/user/exam/submit", {
        paperId: route.query.paperId,
        studentAnswer: JSON.stringify(allAnswer.value)
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          Dialog.alert({
            message: data.message
          }).then(() => {
            router.replace("/exam");
          })
        } else {
          Toast.fail(data.message)
          router.replace("/exam");
        }
      })
    }

    const submitAnswer = () => {
      if (Object.keys(allAnswer.value).length < Object.keys(questions.value).length) {
        Toast.fail("请完成所有题目后提交")
        return;
      } else {
        Dialog.confirm({
          message: '是否确认无误交卷？'
        }).then(() => {
          countDown.value.pause();
          submit();
        }).catch(() => {
          console.log("cancel")
        })
      }
    }

    const finishCountDown = () => {
      Dialog.alert({
        message: '考试时间到了,即将自动交卷！'
      })
      submit()
    }

    const getSurplus = () => {
      axios.get("/api/user/exam/time", {
        params: {
          paperId: route.query.paperId
        }
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          if (data.content > 0) {
            time.value = data.content * 1000;
          } else {
            Dialog.alert({
              message: '已超出规定考试时间，无法答题'
            }).then(() => {
              router.replace("/exam")
            })
          }
        } else {
          Toast.fail(data.message);
          router.replace("/exam")
        }
      })
    }

    const checkSubmit = () => {
      axios.get("/api/user/exam/submit/check", {
        params: {
          paperId: route.query.paperId
        }
      }).then((response) => {
        const data = response.data;
        if (!data.success) {
          Dialog.alert({
            message: '该试卷不可再查看'
          }).then(() => {
            router.replace("/exam")
          })
        } else {
          getSurplus();
          getQuestion();
        }
      })
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
        checkSubmit()
      }
    )

    return {
      questions,
      getQuestion,
      showQuestion,
      curQuestion,
      submitAnswer,
      swipe,
      allAnswer,
      time,
      finishCountDown,
      nextSwipe,
      countDown,
    }
  }
})
</script>

<style scoped>
</style>
