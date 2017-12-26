// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Buefy from 'buefy'
import jwtDecode from 'jwt-decode'
import App from './App'
import router from './router'
import {LOG_IN} from './store/mutation-types'
import store from './store'
import 'buefy/lib/buefy.css'

Vue.use(Buefy, {
  defaultIconPack: 'fa'})

Vue.config.productionTip = false

store.commit(LOG_IN, localStorage.getItem('evotetoken') ? jwtDecode(localStorage.getItem('evotetoken')) : null)

router.beforeEach((to, from, next) => {
  if (to.matched.some(route => route.meta.requiresAuth)) {
    if (!store.getters.user) {
      next({
        path: '/login'
      })
    } else next()
  } else next()
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
