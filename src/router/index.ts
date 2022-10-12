import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {keepAlive: true},
  },
  {
    path: '/course',
    name: 'Course',
    component: () => import('@/views/Course.vue'),
    meta: {keepAlive: true},
  },
  {
    path: '/course/content',
    name: 'CourseContent',
    component: () => import('@/views/CourseContent.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/Mine.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/passwd/reset',
    name: 'PasswdReset',
    component: () => import('@/views/PasswdReset.vue'),
  },
  {
    path: '/mine/info',
    name: 'MyInfo',
    component: () => import('@/views/MyInfo.vue'),
  },
  {
    path: '/mine/course',
    name: 'MyCourse',
    component: () => import('@/views/MyCourse.vue'),
  },
  {
    path: '/mine/exam',
    name: 'MyExam',
    component: () => import('@/views/MyExam.vue'),
  },
  {
    path: '/pay/status',
    name: 'PayStatus',
    component: () => import('@/views/PayStatus.vue'),
    meta: {hiddenFooter: true},
  },
  {
    path: '/question',
    name: 'Question',
    component: () => import('@/views/Question.vue'),
  },
  {
    path: '/exam',
    name: 'Exam',
    component: () => import('@/views/Exam.vue'),
    meta: {keepAlive: true,hiddenFooter: true},
  },
  {
    path: '/paper/content',
    name: 'PaperContent',
    component: () => import('@/views/PaperContent.vue'),
    meta: {hiddenFooter: true},
  },
  {
    path: '/question/course',
    name: 'QuestionCourse',
    component: () => import('@/views/QuestionCourse.vue'),
    meta: {keepAlive: true},
  },
  {
    path: '/exam/content',
    name: 'ExamContent',
    component: () => import('@/views/ExamContent.vue'),
    meta: {hiddenFooter: true},
  },
  {
    path: '/exam/status',
    name: 'ExamStatus',
    component: () => import('@/views/ExamStatus.vue'),
    meta: {hiddenFooter: true},
  },
  {
    path: '/exercise/content',
    name: 'ExerciseContent',
    component: () => import('@/views/ExerciseContent.vue'),
    meta: {hiddenFooter: true},
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/live/content',
    name: 'LiveContent',
    component: () => import('@/views/LiveContent.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
