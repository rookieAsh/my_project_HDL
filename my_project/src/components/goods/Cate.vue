<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <!--data 表格各行数据 -->
      <!-- 表格各列的配置  lable标题 prop属性-->
      <!-- selection-type 隐藏复选按钮 -->
      <!-- expand-type 隐藏展开按钮 -->
      <!-- show-index 显示序号 -->
      <!-- index-text 数据索引的名称 -->
      <!-- border 显示纵向边框 -->
      <!-- show-row-hover 鼠标悬停的时候是否显示高亮效果 -->
      <tree-table
        class="treetable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效的模板 -->
        <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
            <i class="el-icon-error" v-else  style="color: red;"></i>
        </template>

        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作模板 -->
        <!-- scope 来接收作用域中的数据 -->
        <template slot="opt" slot-scope="">
            <el-button size="mini" type="primary" icon="el-icon-edit">搜索</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="querInfo.pagenum"
            :page-sizes="[2, 3, 5, 8]"
            :page-size="querInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
        >
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称 :" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类 :">
                <!-- options 用来指定数据源 -->
                <el-cascader
                    v-model="selectedKeys"
                    :options="parentCateList"
                    :props="cascaderProps"
                    @change="parentCateChanged" 
                    clearable
                    >
                </el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
//组件的行为区域
export default {
  // 所有数据节点
  data() {
    return {
      // 涉及到分页了 这是查询条件
      querInfo: {
        type: 3,
        // 当前页
        pagenum: 1,
        // 每页显示的个数
        pagesize: 5
      },
      // 商品分类的数据列表 默认为空
      catelist: [],
      total: 0,
      columns: [
        //   第一列
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        // 自定义第二列
        {
          label: '是否有效',
          prop: 'deleted',
        //   表示将当前列定义为模板列
          type:'template',
        //   当前模板列定义的名称
          template :'isok'
        },
        {
          label:'排序',
        //   表示将当前列定义为模板列
          type:'template',
        //   当前模板列定义的名称
          template :'order'
        },
        {
        // 标题
          label:'操作',
        //   表示将当前列定义为模板列
          type:'template',
        //   当前模板列定义的名称
          template :'opt'
        }
      ],
    //   控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false ,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        //   父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加的一级分类
        cat_level: 0
      },
    //   添加分类表单的验证规则对象
      addCateFormRules:{
          cat_name: [
              { required: true, message: '请输入分类名称',trigger:'blur'}
          ]
      },
      //   父级(一级和二级)分类列表数据
      parentCateList: [],
    //   指定级联选择器的配置对象
      cascaderProps: {
          // 选中的那个值
          value : 'cat_id',
          //   自己看到的值
          label : 'cat_name',
          //   父子嵌套的那个属性
          children : 'children',
          checkStrictly: false,
          expandTrigger:"hover" 
      },
    //   选中的父级分类的id数组
      selectedKeys:[]
    }
  },
  // 生命周期函数
  created() {
    // 发起请求 在methods里面定义方法
    this.getCateList()
  },
  // 定义所有的事件处理函数
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      console.log(res.data)
      //   把数据列表赋值给catelist
      this.catelist = res.data.result
      //   把数据总条数赋值给total
      this.total = res.data.total
    },
    // 监听 pagesize 的改变  每页显示多少个
    handleSizeChange(newSize){
        this.querInfo.pagesize = newSize
        this.getCateList()
    },
    // 监听 pagenum 的改变 显示当前页
    handleCurrentChange(newPage){
        this.querInfo.pagenum = newPage
        this.getCateList()
    },
    // 点击按钮 展示添加分类的对话框
    showAddCateDialog(){
        // 先获取父级的分类的数据列表
        this.getParentCateList()
        // 再展示出对话框
        this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList(){
      const { data:res } = await this.$http.get('categories',
        {params: {type : 2} })
      if(res.meta.status !== 200) {
          return this.$message.error('获取父级分类数据失败！')
      }
    //   获取的是后天的数据 是一个数组
    //   console.log(res.data);
      this.parentCateList = res.data
    },
    parentCateChanged(){
      // this.seletedKeys 我们往输入框里面输入的值,数组中的length
      // 大于0则证明选中了父级的分类,反之没有选中
      if(this.selectedKeys.length > 0){
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
        this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return 
      }else{
        // 父级分类的id
        this.addCateForm.cat_id = 0,
        // 为当前分类的等级赋值
        this.addCateForm.cat_level= 0
      }     
    },
    // 点击确定按钮,添加新的分类
    addCate(){
      // 回调函数 拿到校验的结果
      this.$refs.addCateFormRef.validate(async valid => {
        // 如果预校验没通过则返回
        if(!valid) return
        // 如果通过了 发起请求
        const {data:res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status !== 201){
          return this.$message.error('添加分类失败!')
        }
        this.$message.success('添加分类成功!')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭，重置数据
    addCateDialogClosed(){
      // 表单的引用  里面有重置方法
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.Cat_level = 0
      this.addCateForm.Cat_pid = 0
    }
  }
}
</script>

<style lang="less" scope>
.el-cascader {
    width: 100%;
}
.treetable {
    margin-top: 15px;
    font-size: 20px;
    font-family: "楷体";
}
</style>