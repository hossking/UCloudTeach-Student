<template>

</template>

<script lang="ts">
import {defineComponent, onMounted} from "vue";
import {useRoute} from "vue-router";
import axios from "axios";
import {Dialog, Toast} from "vant";
import store from "@/store";


export default defineComponent({
  name: "PayStatus",
  components: {},
  setup() {

    const checkStatus = () => {
      if (!useRoute().query) {
        Toast.fail("非法访问");
        return;
      }
      console.log(useRoute().query);
      axios.get("/api/user/pay/check",{
        params: useRoute().query
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          Dialog.alert({
            message: '课程购买成功',
            theme: 'round-button',
            confirmButtonColor: '#1989fa',
          }).then(() => {
            const courseId = store.state.course.id;
            window.location.replace("/course/content?courseId="+courseId);
          });
        } else {
          Dialog.alert({
            message: '课程购买失败，请确认支付状态',
            theme: 'round-button',
            confirmButtonColor: '#c75450',
          }).then(() => {
            const courseId = store.state.course.id;
            window.location.replace("/course/content?courseId="+courseId);
          });
        }
      })
    }

    onMounted(() => {
      checkStatus();
    })

    return {}
  }
})
</script>

<style scoped>

</style>
