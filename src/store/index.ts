import {createStore} from 'vuex';

declare let SessionStorage: any;
const COURSE = "COURSE";
const USER = "USER";
const PAGE = "PAGE";

const store = createStore({
  state: {
    course: SessionStorage.get(COURSE) || {},
    user: SessionStorage.get(USER) || {},
    page: SessionStorage.get(PAGE) || "/"
  },
  mutations: {
    setCourse(state, course) {
      state.course = course;
      SessionStorage.set(COURSE, course);
    },
    setUser(state, user) {
      state.user = user;
      SessionStorage.set(USER, user);
    },
    setPage(state, page) {
      state.page = page;
      SessionStorage.set(PAGE, page);
    }
  },
  actions: {},
  modules: {}
})
export default store;
