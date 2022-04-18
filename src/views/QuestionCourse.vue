<template>
  <van-nav-bar
    title="课后习题"
    left-text="返回"
    left-arrow
    @click-left="$router.back()"
  /><br/>
  <van-search
    v-model="fieldValue"
    shape="round"
    label="科目"
    readonly
    @click="show = true"
    background="white"
    placeholder="请选择科目"
  />
  <van-empty description="暂无相关课程习题" v-if="!courses && fieldValue"/>
  <van-empty description="请选择科目后查询习题" v-if="!courses && !fieldValue"/>
  <van-popup v-model:show="show" round position="bottom">
    <van-cascader
      v-model="cascaderValue"
      title="请选择科目信息"
      :options="options"
      swipeable
      @close="show = false"
      @finish="onFinish"
    />
  </van-popup>

  <van-collapse v-model="activeNames" v-for="course in courses" accordion>
    <van-collapse-item :name="course.id" size="large" @click="getQuestion(course.id)">
      <template #title>
        <van-icon name="star" color="#1989fa"/>&nbsp;<label style="font-size: 16px">{{ course.name }}</label>
      </template>
      <van-cell-group v-for="question in questions" :key="question.id" inset>
        <van-cell is-link clickable style="--van-cell-border-color:black"
                  @click="showQuestion=true;curQuestion=question;myAnswer=[]">
          <template #value>
            <van-tag round plain type="primary" v-if="question.type===0">单选题</van-tag>
            <van-tag round plain type="primary" v-if="question.type===4">多选题</van-tag>
            <van-tag round plain type="success" v-if="question.type===1">判断题</van-tag>
            <van-tag round plain type="warning" v-if="question.type===2">填空题</van-tag>
            <van-tag round plain color="purple" v-if="question.type===3">问答题</van-tag>
            &nbsp<label :innerHTML="question.content" class="van-multi-ellipsis--l2"></label>
          </template>
        </van-cell>
      </van-cell-group>
    </van-collapse-item>
  </van-collapse>
  <van-popup v-model:show="showQuestion" round position="bottom" style="height: 500px;" :closeable="true"
             @close="correctAnswer=null">
    <div style="margin:50px 15px 15px 15px;font-size:16px">
      <div>
        <label :innerHTML="curQuestion.content" style="font-size: 20px"></label>
      </div>
      <br/>
      <van-radio-group v-model="myAnswer[0]" v-if="curQuestion.type===0 || curQuestion.type===1">
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

      <van-checkbox-group v-model="myAnswer" v-if="curQuestion.type===4">
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
        v-model="myAnswer[0]"
        rows="1"
        autosize
        label="答案"
        type="textarea"
        placeholder="请输入你的答案"
        v-if="curQuestion.type===2 || curQuestion.type===3"
      />
      <br/><br/>
      <label v-if="correctAnswer" :innerHTML="'正确答案：'+correctAnswer"></label>
      <br/><br/>
      <van-button type="primary" round block @click="submitAnswer">提交</van-button>
    </div>
  </van-popup>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import {
  Empty,
  Checkbox,
  CheckboxGroup,
  Button,
  RadioGroup,
  Radio,
  Tag,
  NavBar,
  Search,
  Field,
  Cascader,
  Sticky,
  Toast,
  Cell,
  Icon,
  Popup,
  DropdownMenu,
  DropdownItem, Collapse, CollapseItem
} from 'vant';
import axios from "axios";
import store from "@/store";
import {useRoute} from "vue-router";

export default defineComponent({
  name: "QuestionCourse",
  components: {
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
    [Button.name]: Button,
    [Tag.name]: Tag,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [Cell.name]: Cell,
    [Icon.name]: Icon,
    [Popup.name]: Popup,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Sticky.name]: Sticky,
    [Cascader.name]: Cascader,
    [Field.name]: Field,
    [Search.name]: Search,
    [NavBar.name]: NavBar,
    [Empty.name]: Empty,
  },
  setup() {

    // 课程选择项
    const activeNames = ref();

    // 题目信息
    const questions = ref();

    // 用户答案信息
    const myAnswer = ref([]);

    // 课程题目相关
    const courseQuestion = ref();
    courseQuestion.value = new Map();

    // 获取题目信息
    const getQuestion = (courseId: any) => {
      if (courseQuestion.value.has(courseId)) {
        questions.value = courseQuestion.value.get(courseId);
      } else {
        axios.get("/api/common/question/get", {
          params: {
            courseId: courseId
          }
        }).then((response) => {
          const data = response.data;
          if (data.success) {
            questions.value = data.content.list;
            courseQuestion.value.set(courseId, data.content.list);
          } else {
            Toast.fail(data.message);
          }
        })
      }
    }

    // 弹出层显示题目
    const showQuestion = ref(false);
    // 标记当前选中题目
    const curQuestion = ref();

    // 科目信息筛选相关
    const show = ref(false);
    const fieldValue = ref('');
    const cascaderValue = ref('');
    const options = ref();
    options.value = [];

    // 年级键值对表
    let gradeMap = new Map();

    // 获取年级信息
    const loadGrade = async () => {
      await axios.get("/api/common/grade/list").then((response) => {
        const data = response.data;
        if (data.success) {
          const grades = data.content;
          if (grades) {
            for (let i = 0; i < grades.length; ++i) {
              options.value.push({text: grades[i].name, value: grades[i].id, children: []});
              gradeMap.set(grades[i].id, i);
            }
          }
        }
      })
    }
    // 获取科目信息
    const loadSubject = async () => {
      await loadGrade();
      await axios.get("/api/common/subject/list").then((response) => {
        const data = response.data;
        if (data.success) {
          const subjects = data.content;
          if (subjects) {
            for (let i = 0; i < subjects.length; ++i) {
              options.value[gradeMap.get(subjects[i].gradeId)].children.push({
                text: subjects[i].name,
                value: subjects[i].id
              });
            }
          }
        }
      })
    }

    // 加载年级-科目选择项
    const loadOptions = () => {
      loadSubject();

    }

    // 课程信息
    const courses = ref();

    // 科目-课程相关
    const subjectCourse = ref();
    subjectCourse.value = new Map();

    // 根据筛选信息获取课程信息
    const loadCourse = async (gradeId: any) => {
      await axios.get("/api/common/course/grade/course", {params: {gradeId: gradeId}}).then((response) => {
        const data = response.data;
        if (data.success) {
          const courses = data.content;
          if (courses) {
            for (let i = 0; i < courses.length; ++i) {
              if (subjectCourse.value.has(courses[i].subjectId)) {
                subjectCourse.value.get(courses[i].subjectId).push(courses[i]);
              } else {
                subjectCourse.value.set(courses[i].subjectId, [courses[i]]);
              }
            }
          }
        } else {
          Toast.fail(data.message);
        }
      })
    }

    // 全部选项选择完毕后，会触发 finish 事件【开始查询课程】
    const onFinish = async ({selectedOptions}: any) => {
      show.value = false;
      fieldValue.value = selectedOptions.map((option: any) => option.text).join('/');
      // 如果缓存中有则不访问接口获取
      if (subjectCourse.value.has(selectedOptions[1].value)) {
        courses.value = subjectCourse.value.get(selectedOptions[1].value);
      } else {
        await loadCourse(selectedOptions[0].value);
        courses.value = subjectCourse.value.get(selectedOptions[1].value);
      }
    };

    // 正确答案展示
    const correctAnswer = ref();
    const submitAnswer = () => {
      if (Object.keys(myAnswer.value).length < 1) {
        Toast.fail("请完成题目后提交")
        return;
      }
      axios.get("/api/user/question/answer/get",{
        params:{
          id: curQuestion.value.id
        }
      }).then((response)=>{
        const data = response.data;
        if (data.success) {
          if (curQuestion.value.type === 0 || curQuestion.value.type === 1 || curQuestion.value.type === 4) {
            correctAnswer.value = data.content.answerOption
          } else {
            correctAnswer.value = data.content.answerText;
          }
        } else {
          Toast.fail(data.message);
        }
      })

    }


    onMounted(() => {
      store.commit("setPage", useRoute().fullPath)
      loadOptions();
    })

    return {
      questions,
      options,
      show,
      fieldValue,
      cascaderValue,
      onFinish,
      activeNames,
      courses,
      getQuestion,
      showQuestion,
      curQuestion,
      myAnswer,
      submitAnswer,
      correctAnswer,
    }
  }
})
</script>

<style scoped>

</style>
