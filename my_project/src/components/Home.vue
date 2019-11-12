<template>
  <el-container class="hemo-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/eyes.png" alt />
        <span>海底捞后台管理系统</span>
      </div>
      <el-button type="info" @click="login">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 左边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 左边栏菜单区 -->
        <el-menu background-color="#545c64" text-color="#fff" active-text-color="#409EFF" 
        unique-opened :collapse="isCollapse" :collapse-transition="false" 
        router :default-active="activePath">
          <!-- 一级菜单 -->
          <!-- 给index绑定一个动态的值 按钮就不会同时打开了-->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单的文本区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" 
            :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <!-- 二级菜单的文本区 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右边栏主体内容 -->
      <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      iconsObj:{
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
      },
    // 是否折叠 false为不折叠
      isCollapse: false,
    // 被激活的链接地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    login() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList() {
      // 请求地址是api文档提供的menus 方法是get
      const { data: res } = await this.$http.get('menus')
    //  console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    // 点击按钮 折叠或展开
    toggleCollapse(){
        this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
        // console.log(activePath); 
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.hemo-container {
  height: 100%;
}
.el-header {
  background-color: rgb(70, 65, 65);
  display: flex;
  // 左右贴边对齐
  justify-content: space-between;
  padding-left: 4px;
  align-items: center;
  color: #fff;
  font-size: 22px;
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
  > div {
    display: flex;
    align-items: center;
    span {
      font-family: '楷体';
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #545c64;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #fff;
}

.iconfont {
    margin-right: 10px;
}

.toggle-button {
    background-color: rgb(55, 56, 70);
    font-size: 10px;
    line-height: 24px;
    color:#fff;
    text-align: center;
    letter-spacing: 0.5em;
    cursor: pointer;
}
.el-submenu__title span {
      font-family: '楷体';
      font-size: 16px
}
.el-button {
      font-family: '楷体';
      font-size: 16px
}
.el-menu-item span{
      font-family: '楷体';
}
.el-header button {
  // margin-left: 10px
}
</style>