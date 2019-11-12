import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入图标文件
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入插件
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'


import axios from 'axios'   
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截
axios.interceptors.request.use(config => {
  // 为请求头对象添加 token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须返回 
  return config
})
Vue.prototype.$http = axios
Vue.use(ElementUI)
Vue.config.productionTip = false

// 将富文本编辑器 注册为全局可用的组件
Vue.use(VueQuillEditor)

// 定义一个全局的时间过滤器 filter 过滤器的意思
// dateFormat 过滤器的名字 originVal 形参接收数据
Vue.filter('dateFormat', function(originVal){
    const dt = new Date(originVal)
    const y = dt.getFullYear()
    // padStart 规定两位数 不足两位补0
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
// 注册全局可用的组件
Vue.component('tree-table',TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
