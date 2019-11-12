<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryIofo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true" style="font-family: '楷体'">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <!-- index 添加索引列 # 1 2 3··· -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配按钮" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryIofo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryIofo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户弹出的对话框 -->
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <!-- 双向绑定el-input里面数据更新 则el-form数据也随时更新 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮件" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDiaLogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮件" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDiaLogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDiaVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户 : {{userInfo.username}}</p>
        <p>当前的角色 : {{userInfo.role_name}}</p>
        <p>
          分配新角色 :
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDiaVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证密码的规则
    var checkMobile = (rule, value, cb) => {
      var regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取get查询参数
      queryIofo: {
        // 搜索关键字
        query: '',
        // 当前页数
        pagenum: 1,
        //当页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      // 共多少条
      total: 0,
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户的表单验证规则对象
      addFormRules: {
        // 必填项,长度验证
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度为3~10个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度为6 ~15个字符',
            trigger: 'blur'
          }
        ],
        //  第一个数据是否输入了邮箱 第二个是检验邮箱是否合法
        email: [
          { required: true, message: '请输入用户的邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户框的显示与隐藏  false为不显示
      editDiaLogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户的邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示和隐藏
      setRoleDiaVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已经选择的角色id值
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryIofo
      })
      //   console.log(res);
      // 数据获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      //数据获取成功之后 添加获得的数据
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryIofo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryIofo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关状态的改变 发生改变会传一个值userinfo进来
    async userStateChanged(userinfo) {
      // console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听添加用户对话的关闭事件
    addDialogClosed() {
      // 调用这个引用的方法 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加新用户
    addUser() {
      // valid 是一个boolead 值
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 隐藏对话框
        this.addDialogVisible = false
        //重新获取列表数据
        this.getUserList()
      })
    },
    // 点击修改按钮展示修改编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`users/` + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDiaLogVisible = true
    },
    // 监听修改用户对话框的关闭事件 重置表单
    editDialogClosed() {
      this.$http.editFormRef.resetFields()
    },
    // 给确定按钮加点击事件 修改用户并提交(预验证是否符合自定规则)
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid); 是一个boolead 值
        if (!valid) return false
        // 如果正确 则发起修改用户请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！')
        }
        // 关闭对话框
        this.editDiaLogVisible = false
        // 刷新数据列表 重新调用函数 得到用户列表
        this.getUserList()
        // 提交修改成功
        this.$message.success('更新用户数据成功！')
      })
    },
    // 根据id删除对应的用户信息
    async removeUserById(id) {
      // 弹框询问用户是否删除数据
      // 返回的是一个promise对象
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      // 如果用户点确定删除 返回一个字符串文本 confirm
      // 如果用户点取消删除 返回一个字符串文本 cancel
      // console.log(confirmResult);
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户信息失败！')
      }
      this.$message.success('删除用户信息成功！')
      this.getUserList()
    },
    // 点击 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 在展示对话框之前获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      // this.$message.success('获取角色列表成功！')
      console.log(res.data)
      this.rolesList = res.data
      this.setRoleDiaVisible = true
    },
    // 点击按钮 分配角色
    async saveRoleInfo() {
      // 如果没有点击 就是选择用户
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      // 发起请求 参数请求地址和请求体
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleDiaVisible = false
    },
    // 监听分配角色对话框的关闭事件
    // 就是清空选项框选择之后里面的值 ， 方便下一次选择
    setRoleDialogClosed() {
      // 把选项框里面的值重置
      this.selectedRoleId = ''
      // 把角色也要重置一下
      this.userInfo = {}
      // console.log(this.userInfo);
    }
  }
}
</script>

<style lang="less" scoped>
</style>