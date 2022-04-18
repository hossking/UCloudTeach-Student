<template>
  <van-nav-bar
    title="个人中心"
    left-text="返回"
    left-arrow
    @click-left="$router.back()"
  />
  <br/>
  <div style="text-align: center;">
    <van-uploader :max-size="2000 * 1024" :after-read="afterRead" @oversize="onOversize" :before-read="beforeRead">
      <van-image
        round
        width="3rem"
        height="3rem"
        :src="pic"
      />
    </van-uploader>
  </div>

  <van-cell-group inset>
    <van-cell title="手机号" :value="info.phone"/>
    <br/>
    <van-form @submit="onSubmit">
      <van-field
        v-model="info.name"
        name="name"
        label="昵称"
        :is-link="writeVisible"
        :readonly="!writeVisible"
        input-align="right"
        :rules="[{ required: true, message: '请填写昵称', whitespace:true }]"
      />
      <br/>
      <van-field
        v-model="info.gender"
        readonly
        :is-link="writeVisible"
        input-align="right"
        :formatter="formatGender"
        label="性别"
        @click="writeVisible?popupVisible=true:popupVisible=false"
      />
    </van-form>
    <br/>
    <br/>
    <van-cell>
      <van-button v-show="!writeVisible" round block type="primary" @click="editHandle">编辑</van-button>
      <van-button v-show="writeVisible" round block type="primary" @click="saveInfo">保存</van-button>
      <br/>
      <van-button v-show="writeVisible" round block type="default" @click="cancelHandle">取消</van-button>
    </van-cell>
  </van-cell-group>
  <van-popup v-model:show="popupVisible" round position="bottom">
    <van-picker
      :columns="['男','女']"
      @cancel="popupVisible=false"
      @confirm="(val,index)=>{index===0?info.gender='true':info.gender='false';popupVisible=false}"
    />
  </van-popup>
</template>

<script lang="ts">
import {Image as VanImage, Uploader, NavBar, Cell, Button, Popup, Form, Field, Picker} from 'vant';
import {defineComponent, onMounted, ref} from "vue";
import store from "../store";
import axios from "axios";
import {Toast} from "vant";
import {useRoute} from "vue-router";

export default defineComponent({
  name: "MyInfo",
  components: {
    [Cell.name]: Cell,
    [Button.name]: Button,
    [Popup.name]: Popup,
    [Form.name]: Form,
    [Field.name]: Field,
    [Picker.name]: Picker,
    [NavBar.name]: NavBar,
    [Uploader.name]: Uploader,
    [VanImage.name]: VanImage,
  },
  setup() {

    // 检查登录状态
    const checkLogin = async () => {
      await axios.get("/api/user/auth/login/check").then((response) => {
        const data = response.data;
        if (!data.success) {
          Toast.fail(data.message);
        }
      })
    }

    // 从sessionStorage中取出个人信息
    const info = ref();
    info.value = {};
    const getInfo = async () => {
      await checkLogin();
      info.value = store.state.user;
      pic.value = info.value.headPic;
    }

    // 编辑模式状态
    const writeVisible = ref(false);
    // 弹出层显示状态
    const popupVisible = ref(false);

    // 编辑按钮动作
    const editHandle = () => {
      writeVisible.value = true;
    }

    // 格式化显示性别
    const formatGender = (val: string) => {
      if (val === '男' || val === '女') {
        return val;
      } else {
        return val === 'true' ? '男' : '女';
      }
    }

    // 取消按钮动作
    const cancelHandle = () => {
      window.location.reload();
    }

    const saveInfo = () => {
      if (!info.value.name || info.value.name === '') {
        Toast.fail('昵称不能为空');
        return;
      }
      axios.post("/api/user/info/save", {
        name: info.value.name,
        gender: info.value.gender === '男',
        headPic: info.value.headPic
      }).then((response) => {
        const data = response.data;
        if (data.success) {
          store.commit("setUser", info.value);
          Toast.success("信息修改成功");
          writeVisible.value = false;
        } else {
          Toast.fail(data.message);
        }
      })
    }


    // 图片上传功能
    const pic = ref();
    const afterRead = (file: any) => {
      file.status = 'uploading';
      file.message = '上传中...';
      // 此时可以自行将文件上传至服务器
      console.log(file);
      let params= new FormData()
      params.append('file',file.file)
      const config = {
        headers: {'Content-Type': 'multipart/form-data'}
      }
      axios.post("/api/user/upload/pic", params, config).then((response) => {
        const data = response.data;
        if (data.success) {
          pic.value = data.content;
          info.value.headPic = data.content;
          file.status = 'done';
          file.message = '上传成功';
          writeVisible.value = true;
        } else {
          file.status = 'error';
          file.message = '上传失败';
        }
      })
    };

    // 图片大小限制
    const onOversize = () => {
      Toast('图片大小不能超过2MB');
    };

    // 图片格式限制
    const beforeRead = (file:any)=>{
      if (file.type !== 'image/jpeg' && file.type!=='image/png') {
        Toast('请上传 jpg/png 格式图片');
        return false;
      }
      return true;
    }

    onMounted(() => {
      store.commit("setPage", useRoute().fullPath)
      getInfo();
    })
    return {
      info,
      popupVisible,
      editHandle,
      writeVisible,
      formatGender,
      cancelHandle,
      saveInfo,
      afterRead,
      pic,
      onOversize,
      beforeRead

    }

  }
})
</script>

<style scoped>

</style>
