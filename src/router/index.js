import Vue from 'vue'
import Router from 'vue-router'
import Info from '@/components/Info'
import Check from '@/components/Check'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'info',
      component: Info
    },
    {
      path: '/check',
      name: 'check',
      component: Check
    }
  ]
})
