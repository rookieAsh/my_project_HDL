// 导入组件
import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import GoodsList from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)
// 路由规则
const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home', component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        // 指定路径 加 要渲染的组件
        { path: '/categories', component: Cate},
        { path: '/params', component: Params },
        { path: '/goods',component: GoodsList},
        { path: '/goods/add',component: Add},
        { path: '/orders',component: Order},
        { path: '/reports',component: Report}
      ]
    }
  ]
})

// const router = new VueRouter({
//   routes
// })
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径 form代表从哪个路径跳转而来
  // next() 是一个函数，表示放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // console.log(tokenStr);
  if (!tokenStr) return next('/login')
  next()
})

// 暴露路由
export default router
