<template>
  <div style="text-align: center;margin-top:20px">
    <van-image
      round
      width="3.5rem"
      height="3.5rem"
      :src="info.headPic"
    />
  </div>
  <div style="text-align: center;margin-top: 5px">
    <label style="font-size: 18px;">{{ info.name }}</label>
  </div>
  <van-divider/>

  <van-cell-group inset>
    <van-cell title="个人中心" is-link to="/mine/info"/>
    <br/>
    <van-cell title="学习记录" is-link to="/mine/course"/>
    <br/>
    <van-cell title="考试记录" is-link to="/mine/exam"/>
    <br/>
    <van-cell title="关于我们" is-link to="/about"/>
    <br/>
    <van-cell>
      <van-button round block type="danger" @click="logout">退出</van-button>
    </van-cell>
  </van-cell-group>

</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import axios from "axios";
import {Toast, Image as VanImage, Cell, CellGroup, Divider, Button, Dialog} from 'vant'
import store from "@/store";
import {useRoute} from "vue-router";


export default defineComponent({
  name: "Mine",
  components: {
    [Toast.name]: Toast,
    [VanImage.name]: VanImage,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Divider.name]: Divider,
    [Button.name]: Button,
    [Dialog.name]: Dialog,
  },
  setup() {
    const checkLogin = async () => {
      await axios.get("/api/user/auth/login/check").then((response) => {
        const data = response.data;
        if (!data.success) {
          Toast.fail(data.message);
        }
      })
    }

    const info = ref({});

    const getInfo = async () => {
      await checkLogin();
      info.value = store.state.user;
    }

    // 退出登录
    const logout = () => {
      Dialog.confirm({
        title: '退出登录',
        message: '您确认要退出登录吗?',
      })
        .then(() => {
          axios.get("/api/user/auth/logout").then((response) => {
            const data = response.data;
            if (data.success) {
              store.commit('setUser', {});
              window.location.href = "/";
            } else {
              Toast.fail(data.message);
            }
          })
        })
        .catch(() => {
          console.log("cancel");
        });
    }

    onMounted(() => {
      store.commit("setPage", useRoute().fullPath)
      getInfo();
    })
    return {
      info,
      logout,
    }
  }
})
</script>

<style scoped>

</style>
