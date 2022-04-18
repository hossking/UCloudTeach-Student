<template>
  <van-nav-bar
    title="考试中心"
    left-text="返回"
    left-arrow
    @click-left="$router.back()"
  />
  <div style="text-align:center;margin-top:300px" v-if="showLoading">
    <van-loading type="spinner" />
  </div>
  <van-dropdown-menu active-color="#1989fa" v-if="papers">
    <van-dropdown-item @change="selectGradeHandler" teleport="body" :options="optionGrade" v-model="selectGrade"/>
  </van-dropdown-menu>
  <van-divider/>
  <van-empty description="暂无试卷信息" v-if="!showLoading && total===0"/>
  <van-list>
    <van-cell v-for="examRecord in papers" :key="examRecord.id">
      <router-link :to="'/paper/content?paperId='+examRecord.id">
        <van-row>
          <van-col span="1"/>
          <van-col span="22">
            <div style="font-size: 16px;color:black">{{ examRecord.name }}</div>
            <label style="color:#989898">
              <van-icon name="clock-o"/>
              {{ examRecord.examTime }}s
            </label>&nbsp;&nbsp;
            <label style="color:#989898">
              <van-icon name="medal-o"/>
              {{ examRecord.totalScore }}分
            </label>
            <br/>
          </van-col>
          <van-col span="1"/>
        </van-row>
        <van-row style="margin-top: 5px">
          <van-col span="1"/>
          <van-col span="8">
            <label style="text-align: left;color:#989898">共{{ examRecord.questionCount }}道题</label>
          </van-col>
          <van-col span="14">
            <label style="text-align: right;color:#989898">{{ examRecord.startDate }}至{{ examRecord.endDate }}</label>
          </van-col>
          <van-col span="1"/>
        </van-row>
      </router-link>
    </van-cell>
  </van-list>
  <van-sticky position="bottom" v-if="papers">
    <van-pagination style="background-color: white" v-model="page" :total-items="total" :items-per-page="size"
                    @change="changePage"/>
  </van-sticky>

</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import {NavBar,Empty,Loading,Sticky, Pagination, Toast, List, Cell, Row, Col, Divider, Icon, Popup, DropdownMenu, DropdownItem} from 'vant';
import axios from "axios";


export default defineComponent({
  name: "Exam",
  components: {
    [Pagination.name]: Pagination,
    [List.name]: List,
    [Cell.name]: Cell,
    [Row.name]: Row,
    [Col.name]: Col,
    [Divider.name]: Divider,
    [Icon.name]: Icon,
    [Popup.name]: Popup,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Sticky.name]: Sticky,
    [Loading.name]: Loading,
    [Empty.name]: Empty,
    [NavBar.name]: NavBar,
  },
  setup() {
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const showLoading = ref(true);

    // 获取试卷信息
    const papers = ref();
    const getExamPaper = () => {
      axios.get("/api/common/exam/get", {
        params: {
          page: page.value,
          size: size.value
        }
      }).then((response) => {
        showLoading.value = false;
        const data = response.data;
        if (data.success) {
          papers.value = data.content.list;
          total.value = data.content.total;
        } else {
          Toast.fail(data.message);
        }
      })
    }

    // 年级选择项map
    const optionGrade = ref();
    optionGrade.value = [];

    const selectGrade = ref();
    selectGrade.value = 0;

    // 获取年级信息
    const grades = ref();
    const loadGrade = async () => {
      await axios.get("/api/common/grade/list").then((response) => {
        const data = response.data;
        if (data.success) {
          grades.value = data.content;
        }
      })
    }

    // 加载年级选择项
    const loadOption = async () => {
      await loadGrade();
      optionGrade.value.push({text: '全部年级', value: 0});
      for (let i = 0; i < Object.keys(grades.value).length; ++i) {
        optionGrade.value.push({text: grades.value[i].name, value: grades.value[i].id})
      }
    }

    // 切换页码时
    const changePage = () => {
      getExamPaper();
    }

    // 筛选年级查找试卷信息
    const getPaperByGrade = (gradeId:any)=>{
      axios.get("/api/common/exam/get/grade", {
        params: {
          page: page.value,
          size: size.value,
          gradeId: gradeId
        }
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          papers.value = data.content.list;
          total.value = data.content.total;
        } else {
          Toast.fail(data.message);
        }
      })
    }

    const selectGradeHandler = (value: any) => {
      if (value===0) {
        getExamPaper();
      } else {
        getPaperByGrade(value);
      }
    }

    onMounted(() => {
      getExamPaper();
      loadOption();
    })

    return {
      page,
      size,
      total,
      papers,
      grades,
      optionGrade,
      selectGrade,
      changePage,
      selectGradeHandler,
      showLoading,

    }
  }
})
</script>

<style scoped>

</style>
