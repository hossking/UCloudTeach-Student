<template>
  <br/>
  <van-nav-bar title="优云教" fixed placeholder/>
  <div id="home">
    <van-swipe :autoplay="3000" style="text-align: center;margin-top: -15px;">
      <van-swipe-item v-for="swipe in swipes" :key="swipe.id">
        <router-link :to="swipe.url" v-if="swipe.url!=='' &&!swipe.type">
          <van-image :src="swipe.picUrl" alt="" style="width: 96%;" radius="6"/>
        </router-link>
        <a :href="swipe.url" v-if="swipe.url!=='' && !!swipe.type">
          <van-image :src="swipe.picUrl" alt="" style="width: 96%;" radius="6"/>
        </a>
      </van-swipe-item>
    </van-swipe>
    <van-grid clickable :column-num="4" :border="false">
      <van-grid-item v-for="grid in grids" :key="grid.id" @click="handleGrid(grid)">
        <img :src="grid.picUrl" alt=""/>
        <label>{{ grid.name }}</label>
      </van-grid-item>
    </van-grid>
    <h2 style="margin-left: 12px">推荐课程</h2>
    <van-divider />
    <van-list
      v-model:loading="loading"
      :finished="finished"
    >
      <van-cell v-for="course in courses" :key="course.id">
        <router-link :to="'/course/content?courseId='+course.id" @click="toCourseHandle(course)">
          <van-card
            :desc="course.totalPeriod+'课时\t'+course.totalMember+'人在学'"
            style="--van-card-thumb-border-radius:3px;--van-card-thumb-size:110px;background-color: white;--van-card-desc-color:#989898;"
          >
            <template #price>
              <label style="color:#ee0a24;font-size:12px">¥{{course.price}}</label>
            </template>
            <template #thumb>
              <img :src="course.cover" alt="" style="height: 80px;width: 106px"/>
            </template>
            <template #title>
              <label class="card-title">{{course.name}}</label>
            </template>
            <template #footer>
              <label style="font-size:12px;color:gray">讲师：{{course.teacher}}</label>
            </template>
            <template #tags>
              <van-tag plain type="danger">推荐</van-tag>
              <br/>
            </template>
          </van-card>
        </router-link>
        <van-divider />
      </van-cell>
    </van-list>
  </div>
</template>

<script lang="ts">
import {ref, defineComponent, onMounted} from 'vue';
import {
  Button,
  Swipe,
  SwipeItem,
  Icon,
  Grid,
  GridItem,
  Search,
  List,
  Divider,
  Card,
  Tag,
  Tab,
  Tabs,
  NavBar,
  Image as VanImage
} from 'vant';
import axios from "axios";
import {useRouter} from "vue-router";
import store from "@/store";

export default defineComponent({
  components: {
    [NavBar.name]: NavBar,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Button.name]: Button,
    [Icon.name]: Icon,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [Search.name]: Search,
    [List.name]: List,
    [Divider.name]: Divider,
    [Card.name]: Card,
    [Tag.name]: Tag,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [VanImage.name]: VanImage,
  },
  setup() {
    // 引入路由
    const router = useRouter();
    const loading = ref(false);
    const finished = ref(false);


    // 获取轮播图数据
    const swipes = ref();
    const loadSwipe = () => {
      axios.get("/api/common/swipe/list").then((response) => {
        const data = response.data;
        if (data.success) {
          swipes.value = data.content;
        }
      })
    }

    // 获取菜单项数据
    const grids = ref();
    const loadGrid = () => {
      axios.get("/api/common/grid/list").then((response) => {
        const data = response.data;
        if (data.success) {
          grids.value = data.content;
        }
      })
    }

    // 点击菜单项时跳转处理
    const handleGrid = (record: any) => {
      if (record.url && record.url !== '') {
        if (record.type) {
          window.location.href = record.url;
        } else {
          router.push(record.url);
        }
      }
    }

    // 获取热门课程信息
    const courses = ref();
    const loadCourse = () => {
      loading.value = false;
      axios.get("/api/common/course/hot").then((response) => {
        const data = response.data;
        if (data.success) {
          courses.value = data.content;
        }
      })
      finished.value = true;
    }

    // 将课程信息缓存进sessionStorage 以便在课程详情页无需再次查询信息
    const toCourseHandle = (course: any) => {
      store.commit('setCourse', course);
    }


    onMounted(() => {
      loadSwipe();
      loadGrid();
      loadCourse();
    });

    return {
      courses,
      loadCourse,
      finished,
      swipes,
      grids,
      handleGrid,
      toCourseHandle,

    };
  },
})
</script>
<style scoped>
#home {

}

img {
  width: 50%;
}
</style>
<style>
.card-title {
  font-size:16px;
}
</style>
