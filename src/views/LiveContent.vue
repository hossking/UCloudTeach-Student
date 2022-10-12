<template>
    <van-nav-bar
      title="课程详情"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    />
    <div id="player-test" class="player" v-if="videoVisible"></div>
    <div v-else>
      <img style="height: 185px; width: 100%" :src="courseDetail.cover" alt="" />
    </div>
    <van-tabs
      v-model:active="active"
      sticky
      swipeable
      @rendered="onClickTab"
      @change="perClick"
      color="#19b5fe"
    >
      <van-tab title="介绍">
        <van-list>
          <van-cell>
            <label style="font-size: 16px">{{ courseDetail.name }}</label
            ><br />
            <van-tag mark plain type="primary" size="medium"
              >{{ courseDetail.teacher }} 老师</van-tag
            >
            <br /><br />
            <label style="font-size: 12px; color: #9a9a9a"
              >{{ courseDetail.totalSection }}章节&nbsp&nbsp&nbsp</label
            >
            <label style="font-size: 12px; color: #9a9a9a"
              >{{ courseDetail.totalPeriod }}课时&nbsp&nbsp&nbsp</label
            >
            <label style="font-size: 12px; color: #9a9a9a"
              >{{ courseDetail.totalMember }}人在学</label
            >
          </van-cell>
          <van-cell>
            <h3>课程简介</h3>
            <label :innerHTML="courseDetail.description"></label>
            <h3>章节大纲</h3>
            <div v-for="section in sections" :key="section">
              <label style="font-size: 14px; color: #666666"
                >第 {{ section.section }} 章 {{ section.title }}</label
              >
            </div>
          </van-cell>
        </van-list>
      </van-tab>
      <van-tab title="目录">
        <van-collapse
          v-model="activeNames"
          v-for="section in sections"
          accordion
          @change="joinOps"
        >
          <van-collapse-item
            :title="'第' + section.section + '节 ' + section.title"
            :name="section.id"
            :is-link="false"
          >
            <van-list v-for="period in periodMap.get(section.id)">
              <van-cell>
                <label style="color: #666666" @click="changePeriod(period.id)"
                  >课时{{ period.period }} {{ period.title }}</label
                >
              </van-cell>
            </van-list>
          </van-collapse-item>
        </van-collapse>
      </van-tab>
      <van-tab title="评论">
        <van-list>
          <van-cell v-for="comment in comments" :key="comment.id">
            <van-row>
              <van-col span="1" />
              <van-col span="3">
                <div v-if="comment.studentId">
                  <van-image round :src="comment.headPic" />
                </div>
                <div v-else>
                  <van-image
                    round
                    src="https://ucloudteach-user.obs.cn-north-4.myhuaweicloud.com/initialHeadPic.jpg"
                  />
                </div>
              </van-col>
              <van-col span="14">
                <div v-if="comment.studentId">
                  <label>&nbsp;{{ comment.name }}</label
                  ><br />
                </div>
                <div v-else><label>&nbsp;管理员</label><br /></div>
                <label style="color: gray">{{ comment.createTime }}</label>
              </van-col>
              <van-col span="3">
                <van-tag v-show="comment.eliteFlag" color="orange" size="small"
                  >精华</van-tag
                >
              </van-col>
              <van-col span="3">
                <van-tag v-show="comment.topFlag" color="red" size="small"
                  >置顶</van-tag
                >
              </van-col>
              <van-col span="1" />
            </van-row>
            <van-row style="margin-top: 10px">
              <van-col span="1" />
              <van-col span="22">
                <label v-if="comment.replyId"
                  >回复
                  <label
                    v-if="commentMap.get(comment.replyId)"
                    style="color: cornflowerblue"
                  >
                    {{ commentMap.get(comment.replyId).name }}
                  </label>
                  :
                </label>
                <label style="font-size: 15px">{{ comment.content }}</label>
              </van-col>
              <van-col span="1" />
            </van-row>
            <br />
            <van-row>
              <van-col span="1" />
              <van-col span="4">
                <a
                  v-if="comment.studentId"
                  @click="showHandle(comment.id)"
                  style="color: dodgerblue"
                  >回复</a
                >
              </van-col>
              <van-col span="4">
                <a
                  v-if="comment.phone === userPhone"
                  @click="deleteComment(comment.id)"
                  style="color: orangered"
                  >删除</a
                >
              </van-col>
            </van-row>
          </van-cell>
        </van-list>
      </van-tab>
    </van-tabs>
    <van-popup
      v-model:show="showPopup"
      round
      position="bottom"
      style="height: 200px"
    >
      <van-field
        v-model="message"
        rows="4"
        autosize
        label="内容"
        type="textarea"
        maxlength="50"
        placeholder="请输入评论内容"
        show-word-limit
      />
      <div style="text-align: right; margin-top: 5px">
        <van-button type="primary" round @click="saveComment">发布</van-button>
      </div>
    </van-popup>
    <van-submit-bar
      label="价格："
      v-if="!joinStatus"
      button-type="primary"
      :price="courseDetail.price * 100"
      button-text="参与学习"
      @submit="joinCourse"
    />
    <van-submit-bar
      label=""
      v-else
      button-type="default"
      button-text="已参加"
      disabled
    />
    <van-submit-bar
      v-if="commentBtnVisible"
      label=""
      button-type="primary"
      button-text="发表评论"
      @click="showHandle(null)"
    />
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, ref } from "vue";
  import {
    NavBar,
    Image as VanImage,
    Collapse,
    CollapseItem,
    SubmitBar,
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
    Tag,
    Dialog,
    Icon,
  } from "vant";
  import axios from "axios";
  import { useRoute, useRouter } from "vue-router";
  import store from "@/store";
  
  declare let AgoraRTC: any;
  
  interface userIn {
    videoTrack: any;
    audioTrack: any;
    uid: any;
  }
  export default defineComponent({
    name: "LiveContent",
    components: {
      [Collapse.name]: Collapse,
      [CollapseItem.name]: CollapseItem,
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
      [Cell.name]: Cell,
      [Button.name]: Button,
      [DropdownMenu.name]: DropdownMenu,
      [DropdownItem.name]: DropdownItem,
      [Switch.name]: Switch,
      [Empty.name]: Empty,
      [SubmitBar.name]: SubmitBar,
      [VanImage.name]: VanImage,
      [Icon.name]: Icon,
      [NavBar.name]: NavBar,
    },
    setup() {
      // 路由
      const route = useRoute();
  
      // 视频展示状态 初始不展示 点击课时获取成功才显示
      const videoVisible = ref(false);
  
      // 视频url
      const videoUrl = ref();
  
      // 课程详情
      const courseDetail = ref({});
  
      // 课程参与状态
      const joinStatus = ref(false);
  
      // 评论信息
      const comments = ref();
  
      // 评论id-评论人信息 键值对
      let commentMap = new Map();
  
      // 弹出层状态
      const showPopup = ref(false);
  
      // 回复消息
      const message = ref();
  
      // 回复用户id
      const replyId = ref();
  
      // 当前用户phone
      const userPhone = ref("0");
      userPhone.value = store.state.user.phone;
  
      // 【章节id-课时信息】键值对
      let periodMap = new Map();
      const sections = ref();
      sections.value = [
        {
          id: 1,
          section: 1,
          title: "测试课时",
        },
        {
          id: 2,
          section: 2,
          title: "我测试",
        },
      ];
  
      // 获取章节信息
      const getSection = async (courseId: any) => {
        await axios
          .get("/api/common/course/section", {
            params: { courseId: courseId },
          })
          .then((response) => {
            const data = response.data;
            if (data.success) {
              const sectionData = data.content.list;
              sections.value = sectionData;
              for (let i = 0; i < sectionData.length; ++i) {
                periodMap.set(sectionData[i].id, []);
              }
            } else {
              Toast.fail("信息获取失败");
            }
          });
      };
  
      // 获取课时信息
      const getPeriod = async (courseId: any) => {
        await getSection(route.query.courseId);
        axios
          .get("/api/common/course/period", {
            params: { courseId: courseId },
          })
          .then((response) => {
            const data = response.data;
            // console.log(data);
            if (data.success) {
              const periods = data.content;
              if (periods !== null) {
                for (let i = 0; i < periods.length; ++i) {
                  periodMap.get(periods[i].sectionId).push(periods[i]);
                }
              }
            } else {
              Toast.fail("信息获取失败");
            }
          });
      };
  
      // 切换课时
      const changePeriod = (periodId: any) => {
        axios
          .get("/api/user/course/period/content", {
            params: { periodId: periodId },
          })
          .then((response) => {
            const data = response.data;
            if (data.success) {
              videoUrl.value = data.content.video;
              videoVisible.value = true;
            } else {
              Dialog({ message: data.message });
            }
          });
      };
  
      // 获取课程详情
      const getDetail = (courseId: any) => {
        const detail = store.state.course;
        if (detail.id !== courseId) {
          axios
            .get("/api/common/course/content", {
              params: { courseId: courseId },
            })
            .then((response) => {
              const data = response.data;
              if (data.success) {
                courseDetail.value = data.content;
                store.commit("setCourse", data.content);
              } else {
                Toast.fail(data.message);
              }
            });
        } else {
          courseDetail.value = detail;
        }
      };
  
      const activeNames = ref();
  
      joinStatus.value = true;
      // 检查课程参与状态
      const checkStatus = (courseId: any) => {
        axios
          .get("/api/user/course/check", { params: { courseId: courseId } })
          .then((response) => {
            const data = response.data;
            if (data.success) {
              joinStatus.value = !!data.content;
            } else {
              Toast.fail(data.message);
              useRouter().go(-1);
            }
          });
      };
  
      // 参与课程
      const joinCourse = () => {
        axios
          .post("/api/user/pay/create", {
            courseId: route.query.courseId,
          })
          .then((response) => {
            const data = response.data;
            if (data.success) {
              if (data.content === route.query.courseId) {
                Dialog.alert({
                  message: data.message,
                  theme: "round-button",
                  confirmButtonColor: "#1989fa",
                }).then(() => {
                  window.location.reload();
                });
              } else {
                const htmlData = data.content;
                const d = document.querySelector("body");
                if (d) {
                  d.innerHTML = htmlData;
                  document.forms[0].submit();
                }
              }
            } else {
              Toast.fail(data.message);
            }
          });
      };
  
      // 获取评论信息
      const getComment = () => {
        axios
          .get("/api/common/course/comment/get", {
            params: {
              page: 1,
              size: 10,
              courseId: route.query.courseId,
            },
          })
          .then((response) => {
            const data = response.data;
            if (data.success) {
              comments.value = data.content;
              if (data.content) {
                for (let i = 0; i < data.content.length; ++i) {
                  commentMap.set(data.content[i].id, data.content[i]);
                }
              }
            } else {
              Toast.fail(data.message);
            }
          });
      };
  
      // 切换标签
      const onClickTab = (name: any, title: any) => {
        if (title === "评论") {
          getComment();
        }
      };
  
      // 显示输入评论的弹出层
      const showHandle = (reply: any) => {
        if (!joinStatus.value) {
          Toast.fail("请在参与课程后评论");
          return;
        }
        showPopup.value = true;
        message.value = "";
        replyId.value = reply;
      };
  
      // 发表评论按钮状态
      const commentBtnVisible = ref(false);
      // 每一次切换时
      const perClick = (name: any, title: any) => {
        if (title === "评论") {
          commentBtnVisible.value = true;
        } else {
          commentBtnVisible.value = false;
        }
      };
  
      // 保存发表评论
      const saveComment = () => {
        if (!joinStatus.value) {
          Toast.fail("请在参与课程后评论");
          return;
        }
        axios
          .post("/api/user/course/comment/save", {
            courseId: route.query.courseId,
            replyId: replyId.value,
            content: message.value,
          })
          .then((response) => {
            const data = response.data;
            if (data.success) {
              Toast.success(data.message);
              getComment();
            } else {
              Toast.fail(data.message);
            }
            showPopup.value = false;
          });
      };
  
      // 用户删除评论
      const deleteComment = (id: any) => {
        Dialog.confirm({
          message: "是否确认删除该评论?",
        }).then(() => {
          axios
            .delete("/api/user/course/comment/delete/" + id)
            .then((response) => {
              const data = response.data;
              if (data.success) {
                Toast.success(data.message);
                getComment();
              } else {
                Toast.fail(data.message);
              }
            });
        });
      };
  
      // 声网SDK客户端
      const client = AgoraRTC.createClient({
        codec: "vp8",
        mode: "rtc",
      });
  
      const localTracks = {
        videoTrack: null,
        audioTrack: null,
      };
      let remoteUsers: Record<any, userIn> = {};
  
      const options: any = {
        // 声网appid
        appid: "xxx",
        token: "",
        channel: "",
        // 用户id
        uid: 90001,
      };
  
      //console.log(client);
  
      // 获取直播拉流token
      const fetchToken = () => {
        return new Promise(function (resolve) {
          axios
            .post(
              "/api/user/live/token/apply",
              {
                uid: options.uid,
                appId: options.appid,
                courseId: route.query.courseId,
                publish: false,
              },
              {
                headers: {
                  "Content-Type": "application/json; charset=UTF-8",
                },
              }
            )
            .then(function (response) {
              options.channel = response.data.content.channel;
              const token = response.data.content.token;
              console.log("token is " + token);
              resolve(token);
            })
            .catch(function (error) {
              console.log(error);
            });
        });
      };
  
      // 加入直播操作
      const joinOps = async () => {
        try {
          options.token = await fetchToken();
          await join();
        } catch (error) {
          console.error(error);
        } finally {
          console.log("错误了");
        }
      };
  
      // 执行拉流操作
      const join = async () => {
        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        const res = await client.join(
          options.appid,
          options.channel,
          options.token,
          0
        );
        console.log(res);
  
        // 收到 token-privilege-will-expire 回调时，从服务器重新申请一个 Token，并调用 renewToken 将新的 Token 传给 SDK
        client.on("token-privilege-will-expire", async function () {
          let token = await fetchToken();
          await client.renewToken(token);
        });
        // 收到 token-privilege-did-expire 回调时，从服务器重新申请一个 Token，并调用 join 重新加入频道
        client.on("token-privilege-did-expire", async function () {
          console.log("Fetching the new Token");
          let token = await fetchToken();
          console.log("Rejoining the channel with new Token");
          await client.join(options.appid, options.channel, token, 0);
        });
      };
  
      // 订阅频道
      const subscribe = async (user: userIn, mediaType: any) => {
        await client.subscribe(user, mediaType);
        console.log("subscribe success");
        if (mediaType === "video") {
          user.videoTrack.play("player-test");
          let ele = document.getElementsByClassName("agora_video_player");
          ele[0].setAttribute("controls", "true");
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      };
  
      const handleUserPublished = (user: userIn, mediaType: any) => {
        const id = user.uid;
        remoteUsers[id] = user;
        subscribe(user, mediaType);
        videoVisible.value = true;
      };
  
      const handleUserUnpublished = (user: userIn) => {
        const id = user.uid;
        delete remoteUsers[id];
        let ele = document.getElementsByClassName("agora_video_player");
        ele[0].remove();
        videoVisible.value = false;
      };
  
      // 离开频道
      const leave = async () => {
        // remove remote users and player views
        remoteUsers = {};
        let ele = document.getElementsByClassName("agora_video_player");
        ele[0].remove();
        // leave the channel
        await client.leave();
        console.log("client leaves channel success");
        videoVisible.value = false;
      };
  
      const leaveOps = () => {
        leave();
      };
  
      onMounted(() => {
        store.commit("setPage", useRoute().fullPath);
        if (route.query.courseId) {
          const courseId = route.query.courseId;
          getSection(courseId);
          getPeriod(courseId);
          getDetail(courseId);
          if (store.state.user && store.state.user.token) {
            checkStatus(courseId);
          }
        } else {
          useRouter().go(-1);
        }
      });
  
      return {
        onClickTab,
        perClick,
        sections,
        periodMap,
        activeNames,
        route,
        changePeriod,
        videoUrl,
        videoVisible,
        courseDetail,
        joinStatus,
        joinCourse,
        getComment,
        comments,
        commentMap,
        showPopup,
        showHandle,
        message,
        commentBtnVisible,
        replyId,
        saveComment,
        userPhone,
        deleteComment,
        joinOps,
        leaveOps,
      };
    },
  });
  </script>
  
  <style scoped>
  .player {
    width: 98%;
    height: 200px;
    margin-left: 1%;
  }
  
  @media (max-width: 340px) {
    .player {
      width: 98%;
      height: 200px;
      margin-left: 1%;
    }
  }
  </style>
  