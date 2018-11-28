import Vue from 'vue'
import Router from 'vue-router'
import Info from '@/components/Info'
import Check from '@/components/Check'
import Show from '@/components/Show'

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
    },
    {
      path: '/show/:address',
      name: 'show',
      component: Show,
      props: true
    }
  ]
})
