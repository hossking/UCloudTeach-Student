<template>
  <div style="margin-top: 20%;">
    <h1 style="text-align: center;margin-bottom: 30px">用户登录</h1>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          required="true"
          name="phone"
          label="手机号"
          type="tel"
          placeholder="请输入手机号"
          maxlength="11"
          :rules="[{ required: true, message: '请填写手机号' }]"
        />
        <van-field
          v-model="password"
          required="true"
          type="password"
          name="password"
          label="密码"
          placeholder="密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
        <van-row>
          <van-col span="18"/>
          <van-col span="5">
            <router-link to="/passwd/reset">
              <div style="margin-top:3px;text-align:right;font-size:13px;color: grey">
                重置密码
              </div>
            </router-link>
          </van-col>
          <van-col span="1"/>
        </van-row>


      </van-cell-group>
      <div style="margin: 30px;">
        <van-button round block type="primary" native-type="submit">
          登录
        </van-button>
        <br/>
        <router-link to="/register">
          <van-button round block type="default">
            去注册
          </van-button>
        </router-link>
      </div>
    </van-form>
  </div>
</template>

<script lang="ts">
import {onMounted, ref} from 'vue';
import {defineComponent} from "vue";
import {Form, Field, CellGroup, Button, Col, Row, Toast, Dialog,} from 'vant'
import axios from "axios";
import store from "@/store";
import {useRouter} from "vue-router";

declare let TencentCaptcha: any;
declare let loadErrorCallback: any;
declare let hexMd5: any;
declare let KEY: any;

export default defineComponent({
  name: "Login",
  components: {
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    [Col.name]: Col,
    [Row.name]: Row,
    [Toast.name]: Toast,
    [Dialog.name]: Dialog,
  },
  setup() {
    // 存储输入的手机号和密码信息
    const phone = ref();
    const password = ref();

    const router = useRouter();

    // 点击提交触发
    const onSubmit = (values: any) => {
      try {
        // 手机号合法性校验
        const reg = new RegExp("^[1][3-9][0-9]{9}$");
        if (!reg.test(values.phone)) {
          Toast.fail('手机号不合法');
          return;
        }
        // 使用腾讯防水墙服务提供验证码功能
        let captcha1 = new TencentCaptcha('2089345195', (res: any) => {
          if (res.ret === 0) {
            axios.post("/api/user/auth/login", {
              phone: values.phone,
              password: hexMd5(values.password + KEY),
              ticket:res.ticket,
              randStr:res.randstr,
            }).then((response) => {
              const data = response.data;
              if (data.success) {
                console.log(data);
                // 保存用户信息至SessionStorage中
                store.commit("setUser", data.content);
                Dialog.alert({
                  message: '登录成功',
                  theme: 'round-button',
                  confirmButtonColor: '#1989fa',
                }).then(() => {
                  router.replace(store.state.page);
                });
              } else {
                Toast.fail(data.message);
              }
            })
          } else {
            Toast.fail("请校验后登录");
          }
        });
        captcha1.show();
      } catch (e) {
        console.log(e)
        loadErrorCallback();
      }
    };

    onMounted(()=>{
      const token = store.state.user.token;
      if (token) {
        window.location.href = "/mine";
      }
    })

    return {
      phone,
      password,
      onSubmit,
    }
  }
})
</script>

<style scoped>

</style>
