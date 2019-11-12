<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 第一列 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 栅格系统布局组件 每一行24份 -->
            <!-- scope.row.children 放的一级权限 -->
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套 渲染 二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop' ,'vcenter']"
                  v-for="(item2 , i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <!-- visible boolean值 是否显示对话框 当为 true 时显示 Dialog -->
    <!-- default-expand-all 默认展开所有节点 -->
    <!-- show-checkbox 显示复选框 -->
    <!-- default-checked-keys 默认勾选的项 要赋值 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDiaVisible"
      width="50%"
      @close="setRightDiaVisibleClosed"
      >
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" 
      :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDiaVisible = false">取 消</el-button>
        <el-button type="primary"  @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有权限列表数据
      rolelist: [],
      // 控制分配对话框的显示与隐藏 true为显示
      setRightDiaVisible : false,
      // 所有权限的数据
      rightslist:[],
      //树形控件的属性绑定事件对象
      treeProps: {
          label: 'authName',
          children: 'children'
      },
      // 默认选中的节点id值数组 在后台看想默认几个就写几个
      // 要动态获取就要写方法
      defKeys:[],
      // 当前即将分配权限的角色id
      roleId : ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      // 发起请求
      const { data: res } = await this.$http.get('roles')
      // 判断请求
      // 若失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取请求列表失败')
      }
      // 若成功
      this.rolelist = res.data
      // console.log(this.rolelist);
    },
    // 根据id删除对应的权限按钮
    //  角色id 和 权限id 
    async removeRightById(role,rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        // 用catch捕获点击取消按钮行为
        return err
      })
      // 如果用户取消删除 //点取消按钮打印cencel文本 点确定按钮打印confirm文本
      console.log(confirmResult);
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      // 如果真的点击确定按钮要删除 
      // 发起ajax请求
      const { data : res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`) 
      if(res.meta.status !== 200){
        return this.$message.error('删除权限失败!')
      }
      // 删除成功则刷新页面(弊端 会关闭展开列表))
      // this.getRolesList()
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role){
      this.roleId = role.id
      // 发起请求
      const { data : res } = await this.$http.get('rights/tree')
      if(res.meta.status !== 200){
        return this.$message.error('获取权限数据失败!')
      }
      // 把获取到的权限数据保存到 data 中
      this.rightslist = res.data
      // console.log(this.rightslist)

      //递归获取三级节点id
      this.getLeafKeys(role,this.defKeys)

      this.setRightDiaVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id 并保存到dafKeys 数组中
    // node 定义节点判断是否为三级节点  arr保存数据
    // 递归 从后往前的一个过程
    getLeafKeys(node,arr) {
      // 如果当前node节点不包含children属性 则是三级节点 
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {  
        this.getLeafKeys(item,arr)
        // item获得的每一个数组对象
        // console.log(item);
        // id值
        // console.log(arr);      
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDiaVisibleClosed() {
      // 每次点完分配权限 关闭对话框后 重新赋值给这个数组
      this.defKeys = []
    },
    // 点击确认按钮 为角色分配权限
    // 自定义引用属性 ref  ...是展开符号  keys里面都是id值
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getCheckedKeys(),
      ]
      const idStr = keys.join(',')

      // 发起请求 请求地址和请求体
    const {data : res } = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
    // 发起请求之后判断一下
    if(res.meta.status !== 200){
      return this.$message.error('获取权限失败')
    }
    // 没有return 则请求成功了 提示请求成功了
    this.$message.success('获取权限成功了')
    // 重新刷新列表 并把对话框隐藏起来
    this.getRolesList()
    this.setRightDiaVisible = false
    }
    
    
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>