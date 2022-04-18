<template>
  <van-tabs v-model:active="active" sticky swipeable @rendered="onClickTab"
            @change="perClick">
    <van-tab v-for="grade in grades" :name="grade.id" :title="grade.name">
      <div style="background-color:#ffffff;width: 100%;height:5px"></div>
      <img style="height: 150px;width: 100%" src="https://ucloudteach.obs.cn-north-4.myhuaweicloud.com/coursebanner.jpg"
           alt=""/>
      <van-dropdown-menu active-color="#1989fa">
        <van-dropdown-item @change="selectSubjectHandler" teleport="body" v-model="valueSubject"
                           :options="optionMap.get(grade.id)"/>
        <van-dropdown-item @change="selectSortHandler" teleport="body" v-model="valueSort" :options="optionSort"/>
      </van-dropdown-menu>
      <div v-if="courseMap.has(grade.id) && courseMap.get(grade.id).length!==0">
        <van-cell v-for="course in courseMap.get(grade.id)" :key="course.id">
          <div v-show="selectSubject===0 || selectSubject===course.subjectId">
            <router-link :to="'/course/content?courseId='+course.id" @click="toCourseHandle(course)">
              <van-card
                :desc="course.totalPeriod+'课时\t'+course.totalMember+'人在学'"
                style="--van-card-thumb-border-radius:3px;--van-card-thumb-size:110px;background-color: white;--van-card-desc-color:#989898"
              >
                <template #price>
                  <label style="color:#ee0a24;font-size:12px">¥{{course.price}}</label>
                </template>
                <template #footer>
                  <label style="font-size:12px;color:gray">讲师：{{course.teacher}}</label>
                </template>
                <template #thumb>
                  <img :src="course.cover" alt="" style="height: 80px;width: 106px"/>
                </template>
                <template #title>
                  <label style="font-size:15px;">{{ course.name }}</label>
                </template>
                <template #tags>
                  <van-tag plain type="danger">推荐</van-tag>
                  <br/>
                </template>
              </van-card>
            </router-link>
          </div>
        </van-cell>
      </div>
      <div v-else>
        <van-empty image-size="100px" description="暂无数据">
          <van-button round type="primary" class="bottom-button" @click="$router.go(0)">刷新</van-button>
        </van-empty>
      </div>
    </van-tab>
  </van-tabs>


</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import {
  Empty,
  Switch,
  DropdownMenu,
  DropdownItem,
  Button,
  Cell,
  Toast,
  Loading,
  Divider,
  Picker,
  Popup,
  Field,
  Col,
  Row,
  TreeSelect,
  Tabs,
  Tab,
  Card,
  Tag
} from 'vant';
import axios from "axios";
import {useRouter} from "vue-router";
import store from "@/store";


export default defineComponent({
  name: "Course",
  components: {
    [Picker.name]: Picker,
    [Popup.name]: Popup,
    [Field.name]: Field,
    [Col.name]: Col,
    [Row.name]: Row,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Card.name]: Card,
    [TreeSelect.name]: TreeSelect,
    [Divider.name]: Divider,
    [Tag.name]: Tag,
    [Loading.name]: Loading,
    [Toast.name]: Toast,
    [Cell.name]: Cell,
    [Button.name]: Button,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Switch.name]: Switch,
    [Empty.name]: Empty,
  },
  setup() {

    // 引入路由
    const router = useRouter();

    // 科目选择项map
    const optionMap = ref();
    optionMap.value = new Map();

    // 课程map
    const courseMap = ref();
    courseMap.value = new Map();

    // 筛选的科目
    const selectSubject = ref(0);

    // 筛选的排序方法
    const selectSort = ref('a');

    // 默认排序的数据
    const initCourseMap = ref();
    initCourseMap.value = new Map();

    // 排序后的数据
    const sortCourseMap = ref();
    sortCourseMap.value = new Map();


    // 根据年级id获取科目信息
    const loadSubject = (gradeId: any) => {
      axios.get("/api/common/subject/get", {params: {gradeId: gradeId}}).then((response) => {
        const data = response.data;
        if (data.success) {
          loadOption(gradeId, data.content);
        } else {
          Toast.fail('信息获取失败');
        }
      })
    }

    // 根据年级id获取课程信息
    const loadCourse = (gradeId: any) => {
      axios.get("/api/common/course/grade/course", {params: {gradeId: gradeId}}).then((response) => {
        const data = response.data;
        if (data.success) {
          initCourseMap.value.set(gradeId, data.content);
        } else {
          Toast.fail('信息获取失败');
        }
      })
      axios.get("/api/common/course/grade/course", {
        params: {
          gradeId: gradeId,
          sortField: "totalMember"
        }
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          sortCourseMap.value.set(gradeId, data.content);
        } else {
          Toast.fail('信息获取失败');
        }
      })
    }
    // 获取年级信息
    const grades = ref();
    const loadGrade = () => {
      axios.get("/api/common/grade/list").then((response) => {
        const data = response.data;
        if (data.success) {
          grades.value = data.content;
        }
      })
    }

    const valueSubject = ref(0);
    const valueSort = ref('a');

    const optionSort = [
      {text: '默认排序', value: 'a'},
      {text: '人气最高', value: 'b'},
    ];

    // 加载科目选择项
    const loadOption = (id: any, array: any) => {
      optionMap.value.set(id, [{text: '全部科目', value: 0}]);
      for (let i = 0; i < array.length; ++i) {
        optionMap.value.get(id).push({text: array[i].name, value: array[i].id})
      }
    }

    // 切换标签
    const onClickTab = (name: any) => {
      loadSubject(name);
      loadCourse(name);
    }

    // 每一次切换时
    const perClick = (name: any) => {
      valueSubject.value = 0;
      valueSort.value = 'a';
      selectSubject.value = 0;
      selectSort.value = 'a';
      courseMap.value = selectSort.value === 'a' ? initCourseMap.value : sortCourseMap.value;
    }

    const selectSubjectHandler = (value: any) => {
      selectSubject.value = value;
    }

    const selectSortHandler = (value: any) => {
      selectSort.value = value;
      courseMap.value = selectSort.value === 'a' ? initCourseMap.value : sortCourseMap.value;
    }

    // 将课程信息缓存进sessionStorage 以便在课程详情页无需再次查询信息
    const toCourseHandle = (course: any) => {
      store.commit('setCourse', course);
    }

    onMounted(() => {
      loadGrade();
    })

    return {
      grades,
      loadSubject,
      onClickTab,
      optionMap,
      valueSubject,
      valueSort,
      optionSort,
      courseMap,
      perClick,
      selectSubjectHandler,
      selectSubject,
      selectSortHandler,
      selectSort,
      toCourseHandle

    };
  }
})
</script>

<style scoped>

.bottom-button {
  width: 80px;
  height: 30px;
}
</style>
