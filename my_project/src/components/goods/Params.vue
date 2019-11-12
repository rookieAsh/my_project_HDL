<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert title="注意了，只可以修改第三级分类设置相关的参数" type="warning" :closable="false" show-icon></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col class="cat_col">
          <span class="spanParams">选择商品分类 :</span>
          <!-- 选择商品的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <template>
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <!-- 添加动态参数的面板 -->
          <el-tab-pane label="动态参数" name="many">
            <!-- 添加参数按钮 -->
            <el-button
              type="primary"
              size="mini"
              :disabled="isBtnDisabled"
              @click="addDialogVisible=true"
            >添加参数</el-button>
            <!-- 动态参数的表格 -->
            <el-table :data="manyTableDate" border stripe>
              <!-- 展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染tag标签 -->
                  <el-tag
                    @close="handleClose(i,scope.row)"
                    v-for="(item, i) in scope.row.attr_vals"
                    :key="i"
                    closable
                  >{{ item }}</el-tag>
                  <!-- 输入的文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <!-- 添加按钮 -->
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                  >+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column lable="参数名称" prop="attr_name"></el-table-column>
              <el-table-column lable="操作" prop="attr_name">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-edit"
                    @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button>
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    @click="removeParams(scope.row.attr_id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 添加静态参数的面板 -->
          <el-tab-pane label="静态属性" name="only">
            <!-- 添加属性按钮 -->
            <el-button
              type="primary"
              size="mini"
              :disabled="isBtnDisabled"
              @click="addDialogVisible=true"
            >添加属性</el-button>
            <el-table :data="onlyTableDate" border stripe>
              <!-- 展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染tag标签 -->
                  <el-tag
                    @close="handleClose(i,scope.row)"
                    v-for="(item, i) in scope.row.attr_vals"
                    :key="i"
                    closable
                  >{{ item }}</el-tag>
                  <!-- 输入的文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <!-- 添加按钮 -->
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                  >+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column lable="属性名称" prop="attr_name"></el-table-column>
              <el-table-column lable="操作" prop="attr_name">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-edit"
                    @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button>
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    @click="removeParams(scope.row.attr_id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加上参数的对话框 -->
      <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加上参数的对话框 -->
      <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 级联选择框双向绑定到的数据
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态属性的数据
      manyTableDate: [],
      // 静态属性的数据
      onlyTableDate: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改表单数据对象
      editForm: {},
      // 添加表单验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 调用这个函数,获得所有的商品分类
    this.getCateList()
  },
  methods: {
    //   获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败！')
      }
      this.catelist = res.data
    },
    // 级联选择框中的选中项变化，会触发这个函数
    handleChange() {
      this.getParamsDate()
    },
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsDate()
    },
    // 获得参数的列表数据
    async getParamsDate() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableDate = []
        this.onlyTableDate = []
        return
      }
      // 证明选中的是三级分类
      // 根据所选择分类的id 和当前所处的面板 获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示隐藏
        item.inputVisible = false
        // 文本框中的输出的值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableDate = res.data
      } else {
        this.onlyTableDate = res.data
      }
    },
    // 监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    async addParams() {
      // 预校验
      this.$refs.addFormRef.validate(vaild => {
        if (!vaild) return
      })
      const { data: res } = await this.$http.post(
        `categories/${this.cateId}/attributes`,
        {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        }
      )
      if (res.meta.status !== 201) {
        return this.$message.error('添加参数失败')
      }
      this.$message.success('添加参数成功')
      this.addDialogVisible = false
      this.getParamsDate()
    },
    // 点击按钮 展示修改的对话框
    async showEditDialog(attr_id) {
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 重置修改表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮 确定修改参数信息
    editParams() {
      // 先进行预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 预校验不过 则发起请求
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 如果失败了
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        // 如果成功了
        this.$message.success('修改参数成功！')
        this.getParamsDate()
        this.editDialogVisible = false
      })
    },
    // 根据id删除对应的参数项
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')

      // 删除的业务逻辑
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParamsDate()
    },
    // 文本框失去焦点 或这按下enter键
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //   如果没有return,则证明输入的内容 需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      //需要发起请求 保存到后台这次操作
      this.saveAttrVals(row)
    },
    // 将对attr_vals 的操作 保存到数据库
    async saveAttrVals(row) {
      //需要发起请求 保存到后台这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_vals: row.attr_vals.join(' '),
          attr_name: row.attr_name,
          attr_sel: row.attr_sel
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
    // 点击按钮 显示文本输入框
    showInput(row) {
      row.inputVisible = true
      // $nextTick 方法 ：当页面上的元素被重新渲染后 才会指定回调函数中的代码
      this.$nextTick(_ => {
        //   让文本框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的索引项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
      console.log(row)
      console.log( row.attr_vals)
    }
  },
  // 添加一个计算属性
  computed: {
    //  如果按钮需要被禁用,则返回true
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类id
    cateId() {
      // 选中了三级分类
      if (this.selectedCateKeys.length === 3) {
        // 返回最后一项 索引为2
        return this.selectedCateKeys[2]
      }
      // 证明没有选中 返回空
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.spanParams {
  font-size: 15px;
  margin-bottom: 15px;
}
.el-tag {
  margin: 8px;
}
.input-new-tag {
  width: 110x;
}
</style>
