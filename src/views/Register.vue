<template>
  <div style="margin-top: 20%;">
    <h1 style="text-align: center;margin-bottom: 30px">用户注册</h1>
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
      </van-cell-group>
      <van-cell-group inset>
        <van-field
          v-model="authCode"
          center
          clearable
          required="true"
          label="验证码"
          name="authCode"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button size="small" :type="btnVisible?'primary':'default'" round @click="sendMsg"
                        :disabled="!btnVisible">
              <van-count-down ref="countDown" :time="splitTime" format="ss 秒后" v-show="!btnVisible"
                              @finish="btnVisible=true"/>
              <label v-show="btnVisible">发送验证码</label>
            </van-button>
          </template>
        </van-field>
      </van-cell-group>
      <div style="margin: 30px;">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
        <br/>
        <router-link to="/login">
          <van-button round block type="default">
            去登录
          </van-button>
        </router-link>
      </div>
    </van-form>
  </div>
</template>

<script lang="ts">
import {onMounted, ref} from 'vue';
import {defineComponent} from "vue";
import {Form, Field, CellGroup, Button, Col, Row, Toast, Dialog, CountDown,} from 'vant'
import axios from "axios";
import store from "@/store";

declare let TencentCaptcha: any;
declare let loadErrorCallback: any;
declare let hexMd5: any;
declare let KEY: any;

export default defineComponent({
  name: "Register",
  components: {
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    [Col.name]: Col,
    [Row.name]: Row,
    [Toast.name]: Toast,
    [Dialog.name]: Dialog,
    [CountDown.name]: CountDown,
  },

  setup() {
    // 存储输入的手机号/密码/验证码信息
    const phone = ref();
    const password = ref();
    const authCode = ref();

    // 倒计时参数
    const splitTime = ref(0);
    // 倒计时实例
    const countDown = ref();
    // 发送按钮可见性
    const btnVisible = ref(true);

    // 请求发送短信验证码
    const sendMsg = () => {
      try {
        // 手机号合法性校验
        const reg = new RegExp("^[1][3-9][0-9]{9}$");
        if (!reg.test(phone.value)) {
          Toast.fail('手机号不合法');
          return;
        }
        // 使用腾讯防水墙服务提供验证码功能
        let captcha1 = new TencentCaptcha('2089345195', (res: any) => {
          if (res.ret === 0) {
            Dialog.confirm({
              message: '确认向手机号 ' + phone.value + ' 发送验证码?',
            }).then(() => {
              axios.get("/api/user/auth/code/request", {params: {phone: phone.value}}).then((response) => {
                const data = response.data;
                if (data.success) {
                  Toast.success(data.message);
                } else {
                  Toast.fail(data.message);
                }
              })
              splitTime.value = 60000;
              countDown.value.reset();
              btnVisible.value = false;
            }).catch(() => {
              console.log("cancel");
            });
          } else {
            Toast.fail("请校验后重试");
          }
        });
        captcha1.show();
      } catch (e) {
        console.log(e)
        loadErrorCallback();
      }

    }
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
            axios.post("/api/user/auth/register", {
              phone: values.phone,
              password: hexMd5(values.password + KEY),
              authCode: values.authCode,
              ticket: res.ticket,
              randStr: res.randstr,
            }).then((response) => {
              const data = response.data;
              if (data.success) {
                console.log(data);
                Dialog.alert({
                  message: '注册成功',
                }).then(() => {
                  window.location.href = "/login"
                });
              } else {
                Toast.fail(data.message);
              }
            })
          } else {
            Toast.fail("请校验后注册");
          }
        });
        captcha1.show();
      } catch (e) {
        console.log(e)
        loadErrorCallback();
      }
    };

    onMounted(() => {
      const token = store.state.user.token;
      if (token) {
        window.location.href = "/mine";
      }
    })

    return {
      phone,
      password,
      authCode,
      onSubmit,
      sendMsg,
      splitTime,
      btnVisible,
      countDown,
    }
  }
})
</script>

<style scoped>

</style>
