// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueSocketio from 'vue-socket.io'
import SocketIO from 'socket.io-client'
import store from './store'
import host from './api/config.js'

Vue.use(new VueSocketio({
    debug: true,
    connection: SocketIO(host.nowHost())
}))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
